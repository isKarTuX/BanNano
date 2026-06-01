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
# Model Loading (soporta múltiples versiones)
# ---------------------------------------------------------------------------
_model: Optional[tf.keras.Model] = None
_model_metadata: dict = {}


def load_model() -> tf.keras.Model:
    global _model, _model_metadata
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

    # Cargar metadata si existe
    meta_path = os.path.join(os.path.dirname(model_path), "model_metadata.json")
    if os.path.exists(meta_path):
        import json
        with open(meta_path) as f:
            _model_metadata = json.load(f)
        logger.info("Metadata cargada: %s", _model_metadata.get('model_name', 'unknown'))

    return _model


# ---------------------------------------------------------------------------
# Grad-CAM — CORREGIDO para modelo anidado EfficientNetV2
# ---------------------------------------------------------------------------
def _find_efficientnet_submodel(model: tf.keras.Model):
    """Extrae el sub-modelo EfficientNet del modelo principal."""
    for layer in model.layers:
        if 'efficientnet' in layer.name.lower():
            return layer
    return model.layers[1]


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
        resized.astype(np.float32)
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

# CORS: no usar allow_credentials=True con allow_origins=["*"] — los navegadores lo rechazan.
# En produccion, reemplazar los origins por los dominios reales del frontend.
_origins = os.getenv("CORS_ORIGINS", "*").split(",")
if _origins == ["*"]:
    _allow_credentials = False
else:
    _allow_credentials = True

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=_allow_credentials,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------
@app.get("/")
async def root():
    return {
        "app": "Fruit Quality Classifier API v2",
        "docs": "/docs",
        "health": "/health",
        "predict": "/predict",
    }


@app.get("/health")
async def health():
    try:
        model = load_model()
        return {
            "status": "ok",
            "model_loaded": True,
            "num_classes": model.output_shape[-1],
            "model_name": model.name,
            "model_version": _model_metadata.get("model_name", "unknown"),
            "architecture": _model_metadata.get("architecture", "unknown"),
        }
    except Exception as e:
        return JSONResponse(
            status_code=503,
            content={"status": "error", "model_loaded": False, "detail": str(e)},
        )


@app.get("/model-info")
async def model_info():
    """Devuelve metadata del modelo cargado."""
    try:
        model = load_model()
        return {
            "name": _model_metadata.get("model_name", model.name),
            "architecture": _model_metadata.get("architecture", "EfficientNetV2-S"),
            "num_classes": model.output_shape[-1],
            "class_names": CLASS_LABELS,
            "input_shape": _model_metadata.get("input_shape", [224, 224, 3]),
            "preprocessing": _model_metadata.get("preprocessing", "efficientnet_v2.preprocess_input"),
            "size_mb": _model_metadata.get("size_mb", None),
        }
    except Exception as e:
        raise HTTPException(503, f"Modelo no disponible: {e}")


MAX_FILE_SIZE = 15 * 1024 * 1024  # 15 MB

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(400, "El archivo debe ser una imagen (JPEG, PNG, etc.).")

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(413, f"Imagen demasiado grande. Maximo {MAX_FILE_SIZE // (1024*1024)}MB.")

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
    except ImportError:
        raise HTTPException(
            500, "huggingface_hub no instalado. Ejecuta: pip install huggingface_hub"
        )
    except Exception as e:
        logger.error("Error subiendo feedback: %s", e)
        raise HTTPException(500, f"Fallo al subir feedback: {str(e)}")

    return {"status": "ok", "image_id": image_id, "label": correct_label}
