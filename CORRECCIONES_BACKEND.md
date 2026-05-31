# 🛠️ CORRECCIONES BACKEND — `main.py` FastAPI
> Guía completa de todos los problemas encontrados y sus soluciones exactas.

---

## ❗ PROBLEMA 1 (CRÍTICO) — Grad-CAM falla con modelo anidado

**Causa:** `_find_last_conv_layer()` busca `Conv2D` en `model.layers` directamente, pero EfficientNetV2 es un sub-modelo anidado. Las capas Conv2D están adentro del sub-modelo, no en el nivel raíz. La función actual **encuentra la última capa de la cabeza, no la del backbone**.

**Síntoma:** Heatmaps incorrectos, a veces error `gradients are None`.

### ❌ Código actual (incorrecto)

```python
def _find_last_conv_layer(model: tf.keras.Model) -> tf.keras.layers.Layer:
    last_conv = None
    for layer in model.layers:
        if isinstance(layer, tf.keras.layers.Conv2D):
            last_conv = layer
        elif hasattr(layer, 'layers'):
            nested = _find_last_conv_layer(layer)
            if nested is not None:
                last_conv = nested
    ...
    return last_conv
```

### ✅ Código corregido

```python
def _find_efficientnet_submodel(model: tf.keras.Model):
    """Extrae el sub-modelo EfficientNet del modelo principal."""
    for layer in model.layers:
        if 'efficientnet' in layer.name.lower():
            return layer
    # Fallback: segunda capa (después de Input)
    return model.layers[1]


def _find_last_conv_layer(model: tf.keras.Model):
    """
    Encuentra la última capa Conv2D DENTRO del backbone EfficientNet.
    Devuelve (base_model, last_conv_layer_name).
    """
    base_model = _find_efficientnet_submodel(model)
    last_conv_name = None
    for layer in reversed(base_model.layers):
        if 'conv' in layer.name.lower():
            last_conv_name = layer.name
            break
    if last_conv_name is None:
        raise ValueError("No se encontró capa Conv en el backbone EfficientNet.")
    return base_model, last_conv_name
```

---

## ❗ PROBLEMA 2 (CRÍTICO) — Grad-CAM: construcción incorrecta del grad_model

**Causa:** El grad_model actual intenta usar `last_conv_layer.output` directamente como output, pero esa capa pertenece al sub-modelo anidado, no al modelo raíz. TensorFlow no puede trazar el grafo correctamente así.

### ❌ Código actual (incorrecto)

```python
def make_gradcam_heatmap(img_array, model, last_conv_layer, pred_index=None):
    grad_model = tf.keras.models.Model(
        inputs=model.inputs,
        outputs=[last_conv_layer.output, model.output],   # ← FALLA con modelo anidado
    )
    with tf.GradientTape() as tape:
        conv_outputs, predictions = grad_model(img_array)
        ...
```

### ✅ Código corregido completo

```python
def make_gradcam_heatmap(
    img_array: np.ndarray,
    model: tf.keras.Model,
    pred_index: Optional[int] = None,
) -> np.ndarray:
    """
    Grad-CAM compatible con EfficientNetV2 anidado dentro de modelo Functional.
    img_array: (1, 224, 224, 3) ya procesado con preprocess_input.
    """
    base_model, last_conv_name = _find_last_conv_layer(model)

    # Sub-modelo que extrae activaciones conv y salida del backbone
    grad_submodel = tf.keras.Model(
        inputs=base_model.input,
        outputs=[
            base_model.get_layer(last_conv_name).output,
            base_model.output
        ]
    )

    img_tensor = tf.cast(img_array, tf.float32)

    with tf.GradientTape() as tape:
        # Pasar por capas previas al backbone (ignorar InputLayer)
        x = img_tensor
        for layer in model.layers:
            if layer == base_model:
                break
            if 'InputLayer' not in layer.__class__.__name__:
                x = layer(x)

        # Extraer conv outputs y salida del backbone
        conv_outputs, base_outputs = grad_submodel(x)
        tape.watch(conv_outputs)

        # Pasar por la cabeza clasificadora
        base_idx = model.layers.index(base_model)
        x_top = base_outputs
        for layer in model.layers[base_idx + 1:]:
            x_top = layer(x_top)

        if pred_index is None:
            pred_index = int(tf.argmax(x_top[0]))
        class_channel = x_top[:, pred_index]

    grads = tape.gradient(class_channel, conv_outputs)
    if grads is None:
        raise RuntimeError("Grad-CAM: gradients are None.")

    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
    heatmap = conv_outputs[0] @ pooled_grads[..., tf.newaxis]
    heatmap = tf.squeeze(heatmap)
    heatmap = tf.maximum(heatmap, 0)
    max_val = tf.reduce_max(heatmap)
    if max_val > 0:
        heatmap = heatmap / max_val

    return heatmap.numpy()
```

---

## ❗ PROBLEMA 3 (CRÍTICO) — Firma de `make_gradcam_heatmap` en `/predict`

Después de corregir la función, la llamada en el endpoint `/predict` también debe actualizarse para no pasar `last_conv` como argumento.

### ❌ Código actual

```python
model, last_conv = load_model()
# ...
heatmap = make_gradcam_heatmap(
    model_input, model, last_conv, pred_class_idx   # ← last_conv ya no va aquí
)
```

### ✅ Código corregido

```python
model, _ = load_model()   # last_conv ya no se usa externamente
# ...
heatmap = make_gradcam_heatmap(model_input, model, pred_class_idx)
```

Y en `load_model`, simplificar la firma de retorno:

```python
def load_model() -> tf.keras.Model:
    global _model
    if _model is not None:
        return _model
    # ... lógica de carga ...
    _model = tf.keras.models.load_model(model_path, compile=False)
    logger.info("Modelo cargado. Output shape: %s", _model.output_shape)
    return _model
```

---

## ❗ PROBLEMA 4 (CRÍTICO) — `preprocess_image` usa `cv2.COLOR_BGR2RGB` pero aplica `preprocess_input` sobre array en orden correcto

El flujo actual es correcto en `main.py`, pero hay que verificar que **nunca se divida por 255** en ningún punto. Revisar la función:

### ✅ Verificar que `preprocess_image` esté así (ya está bien, solo confirmar):

```python
def preprocess_image(file_bytes: bytes) -> tuple[np.ndarray, np.ndarray]:
    nparr        = np.frombuffer(file_bytes, np.uint8)
    original_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if original_bgr is None:
        raise ValueError("Invalid image file.")
    original_bgr = _resize_if_needed(original_bgr)

    rgb       = cv2.cvtColor(original_bgr, cv2.COLOR_BGR2RGB)
    resized   = cv2.resize(rgb, IMG_SIZE)
    # ✅ CORRECTO: preprocess_input, NO /255
    model_input = tf.keras.applications.efficientnet_v2.preprocess_input(
        resized.astype(np.float32)
    )
    model_input = np.expand_dims(model_input, axis=0)
    return original_bgr, model_input
```

---

## ❗ PROBLEMA 5 — `load_model` debe cargar `.keras`, no `.h5`

Si el modelo fue exportado desde el nuevo notebook como `fruit_classifier.keras`, asegurarse de que `MODEL_PATH` apunte al archivo correcto.

```python
# En .env o en el código:
MODEL_PATH = "./model/fruit_classifier.keras"   # ← .keras, no .h5
```

Si el archivo es `.h5` de weights solamente (no modelo completo), **no funcionará** con `tf.keras.models.load_model`. El nuevo notebook exporta el modelo completo en `.keras`.

---

## ❗ PROBLEMA 6 — `startup_event` usa API deprecada en versiones recientes de FastAPI

```python
# ❌ Deprecado en FastAPI >= 0.93
@app.on_event("startup")
async def startup_event():
    ...

# ✅ Correcto
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    try:
        load_model()
        logger.info("Modelo pre-cargado en startup.")
    except Exception as e:
        logger.warning("Modelo no disponible en startup: %s", e)
    yield
    # Shutdown (opcional)

app = FastAPI(
    title="Fruit Quality Classifier API",
    lifespan=lifespan,
    ...
)
```

---

## 📋 `main.py` COMPLETO CORREGIDO

Reemplaza tu `main.py` con este:

```python
"""
Fruit Quality Classifier — FastAPI Backend v2
=============================================
CORRECCIONES v2:
- Grad-CAM compatible con EfficientNetV2 anidado
- Firma make_gradcam_heatmap simplificada
- lifespan en lugar de on_event deprecado
- Logs mejorados
"""

import os, io, base64, uuid, logging
from typing import Optional
from contextlib import asynccontextmanager

import numpy as np
from PIL import Image as PILImage
import cv2
import tensorflow as tf
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("fruit-api")

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
CLASS_LABELS: list[str] = [
    "Fresh_FreshApple", "Fresh_FreshBanana", "Fresh_FreshBellpepper",
    "Fresh_FreshBittergroud", "Fresh_FreshCapciscum", "Fresh_FreshCarrot",
    "Fresh_FreshCucumber", "Fresh_FreshMango", "Fresh_FreshOkara",
    "Fresh_FreshOrange", "Fresh_FreshPotato", "Fresh_FreshStrawberry",
    "Fresh_FreshTomato", "Rotten_RottenApple", "Rotten_RottenBanana",
    "Rotten_RottenBellpepper", "Rotten_RottenBittergroud", "Rotten_RottenCapsicum",
    "Rotten_RottenCarrot", "Rotten_RottenCucumber", "Rotten_RottenMango",
    "Rotten_RottenOkra", "Rotten_RottenOrange", "Rotten_RottenPotato",
    "Rotten_RottenStrawberry", "Rotten_RottenTomato",
]
IMG_SIZE: tuple[int, int] = (224, 224)

# ---------------------------------------------------------------------------
# Model Loading
# ---------------------------------------------------------------------------
_model: Optional[tf.keras.Model] = None


def load_model() -> tf.keras.Model:
    global _model
    if _model is not None:
        return _model

    model_path   = os.getenv("MODEL_PATH", "./model/fruit_classifier.keras")
    hf_model_repo = os.getenv("HF_MODEL_REPO", "")

    if hf_model_repo and not os.path.exists(model_path):
        logger.info("Descargando modelo desde HuggingFace Hub: %s", hf_model_repo)
        from huggingface_hub import hf_hub_download
        model_path = hf_hub_download(
            repo_id=hf_model_repo,
            filename="fruit_classifier.keras",
            token=os.getenv("HF_TOKEN"),
        )

    if not os.path.exists(model_path):
        raise FileNotFoundError(
            f"Modelo no encontrado en {model_path}. "
            "Descarga el .keras exportado desde Colab y ponlo en backend/model/"
        )

    logger.info("Cargando modelo: %s", model_path)
    _model = tf.keras.models.load_model(model_path, compile=False)
    logger.info("Modelo cargado. Output shape: %s", _model.output_shape)
    return _model


# ---------------------------------------------------------------------------
# Grad-CAM — CORREGIDO para modelo anidado EfficientNetV2
# ---------------------------------------------------------------------------
def _find_efficientnet_submodel(model: tf.keras.Model):
    """Extrae el sub-modelo EfficientNet del modelo principal."""
    for layer in model.layers:
        if 'efficientnet' in layer.name.lower():
            return layer
    return model.layers[1]  # Fallback


def _find_last_conv_layer(model: tf.keras.Model):
    """Retorna (base_model, last_conv_layer_name) buscando dentro del backbone."""
    base_model     = _find_efficientnet_submodel(model)
    last_conv_name = None
    for layer in reversed(base_model.layers):
        if 'conv' in layer.name.lower():
            last_conv_name = layer.name
            break
    if last_conv_name is None:
        raise ValueError("No se encontró capa Conv en el backbone.")
    return base_model, last_conv_name


def make_gradcam_heatmap(
    img_array: np.ndarray,
    model: tf.keras.Model,
    pred_index: Optional[int] = None,
) -> np.ndarray:
    """
    Grad-CAM compatible con EfficientNetV2 anidado.
    img_array: (1, 224, 224, 3), ya con preprocess_input aplicado.
    """
    base_model, last_conv_name = _find_last_conv_layer(model)

    grad_submodel = tf.keras.Model(
        inputs=base_model.input,
        outputs=[
            base_model.get_layer(last_conv_name).output,
            base_model.output,
        ]
    )

    img_tensor = tf.cast(img_array, tf.float32)

    with tf.GradientTape() as tape:
        x = img_tensor
        for layer in model.layers:
            if layer == base_model:
                break
            if 'InputLayer' not in layer.__class__.__name__:
                x = layer(x)

        conv_outputs, base_outputs = grad_submodel(x)
        tape.watch(conv_outputs)

        base_idx = model.layers.index(base_model)
        x_top    = base_outputs
        for layer in model.layers[base_idx + 1:]:
            x_top = layer(x_top)

        if pred_index is None:
            pred_index = int(tf.argmax(x_top[0]))
        class_channel = x_top[:, pred_index]

    grads = tape.gradient(class_channel, conv_outputs)
    if grads is None:
        raise RuntimeError("Grad-CAM: gradients are None.")

    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
    heatmap      = conv_outputs[0] @ pooled_grads[..., tf.newaxis]
    heatmap      = tf.squeeze(heatmap)
    heatmap      = tf.maximum(heatmap, 0)
    max_val      = tf.reduce_max(heatmap)
    if max_val > 0:
        heatmap = heatmap / max_val

    return heatmap.numpy()


def superimpose_heatmap(
    original_img: np.ndarray,
    heatmap: np.ndarray,
    alpha: float = 0.5,
    colormap: int = cv2.COLORMAP_JET,
) -> np.ndarray:
    heatmap_resized = cv2.resize(heatmap, (original_img.shape[1], original_img.shape[0]))
    heatmap_uint8   = np.uint8(255 * heatmap_resized)
    heatmap_color   = cv2.applyColorMap(heatmap_uint8, colormap)
    return cv2.addWeighted(original_img, 1.0 - alpha, heatmap_color, alpha, 0)


# ---------------------------------------------------------------------------
# Image Helpers
# ---------------------------------------------------------------------------
def img_to_base64(img: np.ndarray, fmt: str = ".jpg") -> str:
    success, buffer = cv2.imencode(fmt, img)
    if not success:
        raise ValueError("No se pudo codificar la imagen.")
    return base64.b64encode(buffer).decode("utf-8")


def preprocess_image(file_bytes: bytes) -> tuple[np.ndarray, np.ndarray]:
    """
    Preprocesa imagen para el modelo.
    SIEMPRE usa efficientnet_v2.preprocess_input — nunca /255.
    """
    nparr        = np.frombuffer(file_bytes, np.uint8)
    original_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if original_bgr is None:
        raise ValueError("Imagen inválida — no se pudo decodificar.")

    original_bgr = _resize_if_needed(original_bgr)

    rgb         = cv2.cvtColor(original_bgr, cv2.COLOR_BGR2RGB)
    resized     = cv2.resize(rgb, IMG_SIZE)
    model_input = tf.keras.applications.efficientnet_v2.preprocess_input(
        resized.astype(np.float32)  # preprocess_input espera [0, 255] → devuelve [-1, 1]
    )
    model_input = np.expand_dims(model_input, axis=0)
    return original_bgr, model_input


def _resize_if_needed(img: np.ndarray, max_dim: int = 1024) -> np.ndarray:
    h, w = img.shape[:2]
    if max(h, w) > max_dim:
        scale    = max_dim / max(h, w)
        new_w, new_h = int(w * scale), int(h * scale)
        return cv2.resize(img, (new_w, new_h))
    return img


# ---------------------------------------------------------------------------
# Lifespan (reemplaza @app.on_event deprecado)
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        load_model()
        logger.info("Modelo pre-cargado en startup.")
    except Exception as e:
        logger.warning("Modelo no disponible en startup: %s", e)
    yield


# ---------------------------------------------------------------------------
# FastAPI App
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Fruit Quality Classifier API v2",
    description="Clasificador de frutas con Grad-CAM para detección de descomposición",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------
@app.get("/health")
async def health():
    try:
        model = load_model()
        return {
            "status": "ok",
            "model_loaded": True,
            "num_classes": model.output_shape[-1],
            "model_name": model.name,
        }
    except Exception as e:
        return JSONResponse(
            status_code=503,
            content={"status": "error", "model_loaded": False, "detail": str(e)},
        )


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(400, "El archivo debe ser una imagen (JPEG, PNG, etc.).")

    contents = await file.read()

    try:
        original_bgr, model_input = preprocess_image(contents)
    except ValueError as e:
        raise HTTPException(400, str(e))

    try:
        model = load_model()
    except Exception as e:
        raise HTTPException(503, f"Modelo no disponible: {e}")

    predictions    = model.predict(model_input, verbose=0)
    preds_flat     = predictions[0]
    pred_class_idx = int(np.argmax(preds_flat))
    confidence     = float(preds_flat[pred_class_idx])
    class_name     = CLASS_LABELS[pred_class_idx]
    original_b64   = img_to_base64(original_bgr)

    response: dict = {
        "class_name"       : class_name,
        "confidence"       : round(confidence, 6),
        "all_probabilities": [round(float(p), 6) for p in preds_flat],
        "image_base64"     : original_b64,
        "is_fresh"         : class_name.startswith("Fresh_"),
    }

    if not class_name.startswith("Fresh_"):
        try:
            heatmap      = make_gradcam_heatmap(model_input, model, pred_class_idx)
            superimposed = superimpose_heatmap(original_bgr, heatmap)
            response["heatmap_base64"] = img_to_base64(superimposed)
            logger.info("Grad-CAM generado para clase: %s", class_name)
        except Exception as e:
            logger.warning("Grad-CAM falló para %s: %s", class_name, e)

    logger.info(
        "Predicción: %s (%.2f%%, fresh=%s)",
        class_name, confidence * 100, response["is_fresh"]
    )
    return JSONResponse(content=response)


@app.post("/feedback")
async def feedback(
    file: UploadFile = File(...),
    correct_label: str = Form(...),
):
    if correct_label not in CLASS_LABELS:
        raise HTTPException(
            400, f"Label inválido '{correct_label}'. Debe ser una de las 26 clases conocidas."
        )

    hf_token = os.getenv("HF_TOKEN")
    repo_id  = os.getenv("HF_DATASET_REPO")

    if not hf_token or not repo_id:
        raise HTTPException(
            503, "Feedback no configurado. Define HF_TOKEN y HF_DATASET_REPO."
        )

    contents = await file.read()
    ext      = "jpg"
    if file.filename and "." in file.filename:
        ext = file.filename.rsplit(".", 1)[-1].lower()
        if ext not in ("jpg", "jpeg", "png"):
            ext = "jpg"

    image_id      = str(uuid.uuid4())
    path_in_repo  = f"data/{correct_label}/{image_id}.{ext}"

    try:
        from huggingface_hub import HfApi
        api = HfApi(token=hf_token)
        api.upload_file(
            path_or_fileobj=contents,
            path_in_repo=path_in_repo,
            repo_id=repo_id,
            repo_type="dataset",
        )
        logger.info("Feedback subido: %s → %s", image_id, correct_label)
    except Exception as e:
        logger.error("Error subiendo feedback: %s", e)
        raise HTTPException(500, f"Fallo al subir feedback: {str(e)}")

    return {"status": "ok", "image_id": image_id, "label": correct_label}
```

---

## 🗂️ Estructura de archivos recomendada

```
backend/
├── main.py                  ← Este archivo corregido
├── model/
│   └── fruit_classifier.keras   ← Exportado desde Bloque BONUS del notebook
├── requirements.txt
└── .env
```

### `requirements.txt`

```
fastapi==0.111.0
uvicorn[standard]==0.30.1
python-multipart==0.0.9
tensorflow==2.16.1
opencv-python-headless==4.9.0.80
pillow==10.3.0
numpy==1.26.4
python-dotenv==1.0.1
huggingface_hub==0.24.5
```

### `.env`

```env
MODEL_PATH=./model/fruit_classifier.keras
HF_TOKEN=hf_xxxxxxxxxxxxxxxxxxxx
HF_DATASET_REPO=tu-usuario/fruit-feedback-dataset
# Dejar vacío HF_MODEL_REPO si ya tienes el .keras local:
HF_MODEL_REPO=
```

---

## ✅ Checklist final antes de desplegar

- [ ] Modelo exportado como `.keras` completo (estructura + pesos) desde el notebook
- [ ] `MODEL_PATH` en `.env` apunta a `fruit_classifier.keras`
- [ ] `main.py` usa la versión corregida de `make_gradcam_heatmap`
- [ ] `main.py` usa `lifespan` en lugar de `@app.on_event`
- [ ] Verificar con `curl http://localhost:8000/health` que devuelve `model_loaded: true`
- [ ] Probar `/predict` con una imagen de fruta podrida y verificar que `heatmap_base64` existe en la respuesta

---

## 🔍 Comando para probar localmente

```bash
# Levantar el backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Health check
curl http://localhost:8000/health

# Test de predicción
curl -X POST http://localhost:8000/predict \
  -F "file=@/ruta/a/tu/fruta.jpg" | python show_top3.py
```
