# BanNano — Documentación Técnica Completa del Proyecto

**Control de Calidad de Frutas en Tiempo Real mediante Visión por Computadora**

> **Asignatura:** Aprendizaje Computacional  
> **Profesor:** Oswaldo Vélez Lanngs, PhD  
> **Institución:** Universidad de Córdoba, Colombia  
> **Autores:** Keyner Ramírez, Mary Hoyos  
> **Repositorio:** [github.com/isKarTuX/BanNano](https://github.com/isKarTuX/BanNano)  
> **Demo en línea:** [mkartux-bannano.hf.space](https://mkartux-bannano.hf.space)  

---

## Tabla de Contenidos

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Metodología CRISP-DM Adaptada](#2-metodología-crisp-dm-adaptada)
   - 2.1 [Comprensión del Problema](#21-comprensión-del-problema)
   - 2.2 [Comprensión de los Datos](#22-comprensión-de-los-datos)
   - 2.3 [Preparación de los Datos](#23-preparación-de-los-datos)
   - 2.4 [Modelado](#24-modelado)
   - 2.5 [Evaluación](#25-evaluación)
   - 2.6 [Despliegue](#26-despliegue)
3. [Arquitectura del Sistema](#3-arquitectura-del-sistema)
4. [Flujo de Datos Completo](#4-flujo-de-datos-completo)
5. [Backend — FastAPI y Modelo](#5-backend--fastapi-y-modelo)
   - 5.1 [Carga del Modelo](#51-carga-del-modelo)
   - 5.2 [Preprocesamiento de Imágenes](#52-preprocesamiento-de-imágenes)
   - 5.3 [Predicción y Grad-CAM](#53-predicción-y-grad-cam)
   - 5.4 [Endpoints de la API](#54-endpoints-de-la-api)
6. [Frontend — React + Vite](#6-frontend--react--vite)
   - 6.1 [Comunicación con el Backend](#61-comunicación-con-el-backend)
   - 6.2 [Componentes Principales](#62-componentes-principales)
7. [Integración con Hugging Face](#7-integración-con-hugging-face)
8. [Tecnologías y Justificación](#8-tecnologías-y-justificación)
9. [Métricas y Resultados](#9-métricas-y-resultados)
10. [Limitaciones y Trabajo Futuro](#10-limitaciones-y-trabajo-futuro)
11. [Creatividad y Extras](#11-creatividad-y-extras)

---

## 1. Resumen Ejecutivo

**BanNano** es un sistema inteligente de visión por computadora diseñado para clasificar frutas y verduras en estado **fresco** o **podrido/dañado** a partir de una imagen fotográfica. El proyecto responde al objetivo principal del curso de Aprendizaje Computacional: desarrollar una aplicación que combine adquisición de datos, entrenamiento de modelos, análisis crítico de desempeño y despliegue interactivo mediante una interfaz web moderna.

La solución consta de tres componentes desacoplados:

1. **Modelo de Deep Learning:** Red neuronal convolucional basada en **EfficientNetV2-S** con transfer learning desde ImageNet, entrenada para clasificar 26 categorías (13 tipos de frutas × 2 estados de calidad).
2. **Backend (API):** Servidor **FastAPI** en Python que expone endpoints REST para predicción, explicabilidad (Grad-CAM) y retroalimentación de usuarios.
3. **Frontend (PWA):** Aplicación web **React + TypeScript + Vite** con estética retro 8-bit, capaz de funcionar como Progressive Web App (PWA) instalable en dispositivos móviles.

El sistema está desplegado en producción: el backend opera dentro de un **Docker container en Hugging Face Spaces**, mientras que el frontend está alojado en **Vercel**. Además, el proyecto integra un **bucle de retroalimentación (feedback loop)** que almacena correcciones de usuarios en un dataset de Hugging Face para futuros reentrenamientos.

---

## 2. Metodología CRISP-DM Adaptada

El proyecto sigue una metodología inspirada en **CRISP-DM** (Cross Industry Standard Process for Data Mining), adaptada específicamente para problemas de clasificación de imágenes y sistemas inteligentes basados en visión por computadora. Cada etapa responde directamente a los lineamientos establecidos por el profesor.

---

### 2.1 Comprensión del Problema

#### Definición del Problema
El desperdicio de alimentos es un problema global que afecta cadenas de producción, supermercados, centros de acopio y exportadores. La inspección manual de frutas es **subjetiva, lenta, costosa y propensa a errores humanos** (fatiga, inconsistencias entre inspectores, variaciones horarias).

BanNano automatiza este proceso mediante visión por computadora, clasificando automáticamente:

- **Frutas sanas (Fresh):** 13 categorías de frutas y verduras en buen estado.
- **Frutas defectuosas (Rotten):** Las mismas 13 frutas en estado de descomposición, daño mecánico, manchas o pudrición.

El sistema **no distingue el tipo específico de defecto** (moho, herida, cicatriz, deformación), sino que determina binariamente si la fruta está dañada o sana, acompañado de una medida de confianza. Esta decisión simplifica el problema de clasificación mientras mantiene utilidad práctica para la industria.

#### Contexto de Aplicación
El sistema fue diseñado pensando en escenarios reales:

| Escenario | Beneficio |
|-----------|-----------|
| **Supermercados** | Inspección rápida en recepción de mercancía, reducción de devoluciones. |
| **Centros de acopio** | Clasificación automatizada por lotes antes de empaque. |
| **Plantas de empaque** | Control de calidad en línea antes del sellado. |
| **Cadenas de exportación** | Cumplimiento de estándares fitosanitarios (evita reembarques costosos). |
| **Cultivos agrícolas** | Identificación temprana de fruta no comercializable en campo. |

#### Requisitos del Sistema
Se definieron objetivos medibles desde el inicio:

| Métrica | Objetivo | Justificación |
|---------|----------|---------------|
| **Accuracy** | > 90% | Nivel aceptable para reducir inspección manual en al menos 80% de los casos. |
| **Precision** | > 90% | Minimizar falsos positivos (rechazar fruta sana). |
| **Recall** | > 90% | Minimizar falsos negativos (aceptar fruta podrida). |
| **F1-Score** | > 90% | Balance entre precision y recall en dataset multiclase. |
| **Tiempo de inferencia** | < 2 segundos | Experiencia de usuario fluida en web/móvil. |
| **Robustez** | Alta | Funcionar ante variaciones de iluminación y ángulo. |

#### Evaluación de Soluciones Existente
Se investigaron aplicaciones similares y datasets públicos:

- **Limitaciones actuales:** La mayoría de sistemas comerciales son costosos (hardware especializado), no explican sus decisiones (caja negra) o están cerrados a retroalimentación.
- **Oportunidad:** Explicabilidad (Grad-CAM) + bucle de feedback + despliegue web accesible desde cualquier dispositivo.

---

### 2.2 Comprensión de los Datos

#### Recolección
Se utilizó el dataset público **"Food Freshness Dataset"** de Kaggle (autor: `ulnnproject`), que contiene imágenes de frutas y verduras clasificadas en dos carpetas principales: `Fresh/` y `Rotten/`.

#### Descripción del Dataset
- **Tamaño total:** ~3,000+ imágenes etiquetadas (después de limpieza).
- **Clases:** 26 (13 frutas × 2 estados).
- **Formato:** JPG y PNG.
- **Resolución:** Variable (se estandarizó a 224×224).
- **Variabilidad:** Diferentes ángulos, fondos, iluminaciones y distancias.

#### Análisis Exploratorio (EDA)
Se realizó un EDA exhaustivo en el notebook de entrenamiento:

```
CLASE                           IMÁGENES    %       BARRA
═════════════════════════════════════════════════════════════
Fresh_FreshBanana                 2,000   7.1%   ████████████████████
Fresh_FreshApple                  1,950   6.9%   ███████████████████
Rotten_RottenBanana             1,900   6.7%   ███████████████████
...
Rotten_RottenOkra                   320   1.1%   ███
═════════════════════════════════════════════════════════════
TOTAL                            ~3,000
```

**Preguntas respondidas durante el EDA:**
- **¿Hay clases dominantes?** Sí. Bananas y manzanas tienen más muestras que okra o pimentón. Se aplicó balanceo.
- **¿Algunos defectos son difíciles de distinguir?** Sí. Las manzanas y naranjas podridas confunden al modelo con las frescas en ciertas condiciones de luz.
- **¿Existe ruido visual importante?** Sí. Se encontraron imágenes duplicadas, archivos corruptos y etiquetas incorrectas que fueron depuradas.

#### Calidad de los Datos
| Problema | Acción Tomada |
|----------|---------------|
| Imágenes duplicadas | Hash perceptual + eliminación de duplicados exactos. |
| Archivos corruptos | Intento de decodificación con PIL; fallidos → descartados. |
| Etiquetas incorrectas | Revisión manual de muestras aleatorias. |
| Desbalance de clases | Undersampling a ~2,000 por clase + class weights. |

#### División de Datos
Se aplicó un **split estratificado** para mantener proporciones de clases:

| Split | Porcentaje | Imágenes (aprox.) |
|-------|-----------|-------------------|
| **Entrenamiento** | 70% | ~2,100 |
| **Validación** | 15% | ~450 |
| **Prueba** | 15% | ~450 |

---

### 2.3 Preparación de los Datos

#### Preprocesamiento
Todas las imágenes pasaron por un pipeline estandarizado:

1. **Redimensionamiento:** `224×224` píxeles (tamaño de entrada de EfficientNetV2).
2. **Decodificación:** `tf.image.decode_image` con 3 canales (RGB).
3. **Normalización:** `tf.keras.applications.efficientnet_v2.preprocess_input` → escala píxeles al rango **[-1, 1]**. **Nunca se usó `/255`** porque eso rompe la coherencia con los pesos preentrenados de ImageNet.

#### Data Augmentation
Se aplicó aumento de datos **solo en el set de entrenamiento** para mejorar generalización y reducir overfitting:

| Transformación | Parámetros | Justificación |
|----------------|------------|---------------|
| **Flip horizontal** | Aleatorio | Simula diferentes orientaciones de cámara. |
| **Flip vertical** | Aleatorio | Frutas pueden estar en cualquier posición. |
| **Zoom aleatorio** | Crop 85%–100% | Simula distancias variables de captura. |
| **Brillo** | `±25%` | Robustez ante iluminación deficiente. |
| **Contraste** | `0.75x – 1.25x` | Diferentes condiciones de luz ambiental. |
| **Saturación** | `0.7x – 1.3x` | Cámaras móviles con diferentes perfiles de color. |
| **Hue (tono)** | `±0.05` | Pequeñas variaciones de balance de blancos. |

#### Balanceo de Clases
Dado el desbalance natural del dataset (algunas frutas tienen más muestras que otras), se aplicaron tres estrategias combinadas:

1. **Undersampling:** Se limitó cada clase a un máximo de 2,000 imágenes para evitar que clases mayoritarias dominen el gradiente.
2. **Class Weights:** Se calcularon pesos inversamente proporcionales a la frecuencia de cada clase usando `sklearn.utils.class_weight.compute_class_weight` con estrategia `'balanced'`.
3. **Oversampling selectivo:** Clases con menos de 100 muestras se duplicaron antes del split.

---

### 2.4 Modelado

#### Construcción del Modelo
Se eligió **EfficientNetV2-S** como backbone por su excelente relación **precisión/eficiencia computacional**. A diferencia de ResNet o VGG, EfficientNetV2 utiliza bloques MBConv con atención squeeze-and-excitation y convoluciones factorizadas, lo que lo hace más rápido y liviano sin sacrificar capacidad de representación.

**Arquitectura completa:**

```
Input (224, 224, 3)
    │
    ├──> EfficientNetV2-S (include_top=False, weights='imagenet')
    │       └── Feature Maps (7, 7, 1280)
    │
    ├──> GlobalAveragePooling2D
    │
    ├──> BatchNormalization  ← Estabiliza activaciones
    │
    ├──> Dropout(0.4)        ← Regularización fuerte
    │
    ├──> Dense(512, relu, L2=1e-4)  ← Capa intermedia con regularización
    │
    ├──> BatchNormalization
    │
    ├──> Dropout(0.3)
    │
    └──> Dense(26, softmax)  ← 26 clases de salida
```

**Justificación de cada capa añadida:**
- **BatchNormalization:** Normaliza las activaciones de la capa anterior, acelerando la convergencia y reduciendo la covarianza interna.
- **Dropout (0.4 y 0.3):** Desactiva neuronas aleatoriamente durante el entrenamiento, forzando al modelo a no depender de características espurias. El valor 0.4 es alto porque la cabeza tiene muchos parámetros entrenables frente a pocas épocas de fine-tuning.
- **L2 Regularization (1e-4):** Penaliza pesos grandes, evitando que la cabeza sobreajuste al dataset pequeño.
- **Dense(512):** Dimensión intermedia suficiente para capturar relaciones no lineales entre las 1,280 características del backbone y las 26 clases, sin ser tan grande como para sobreajustar.

#### Entrenamiento en Dos Fases
Se siguió una estrategia de **transfer learning clásica** con fine-tuning conservador:

**Fase 1: Entrenamiento de la Cabeza (HEAD)**
- **Épocas:** 20
- **Backbone:** Congelado (`trainable=False`)
- **Optimizador:** Adam, LR = 1e-3
- **Pérdida:** CategoricalCrossentropy con `label_smoothing=0.1`
- **Objetivo:** Aprender clasificación usando características genéricas de ImageNet.

**Fase 2: Fine-Tuning Conservador**
- **Épocas:** 40 (máximo, con EarlyStopping)
- **Backbone:** Se descongelan solo las **últimas 50 capas** del EfficientNet.
- **Optimizador:** Adam, LR = 2e-5 (muy bajo para no destruir pesos preentrenados)
- **Pérdida:** CategoricalCrossentropy con `label_smoothing=0.1` (consistente con Fase 1)

**¿Por qué 50 capas y no 100?** En la versión anterior se descongelaron 100 capas y el modelo sufrió **catastrophic forgetting** (olvido de características genéricas de bajo nivel). Reducir a 50 capas permitió ajustar solo las representaciones de alto nivel (texturas, formas de frutas) mientras se preservaban los filtros de bordes y colores aprendidos en ImageNet.

**Callbacks utilizados:**
- `ModelCheckpoint`: Guarda el mejor modelo según `val_accuracy`.
- `EarlyStopping`: Detiene si no hay mejora en 10 épocas (fine-tuning).
- `ReduceLROnPlateau`: Reduce LR a la mitad si la validación se estanca.
- `TensorBoard`: Logging de métricas para visualización.

#### Hiperparámetros Clave

| Hiperparámetro | Valor | Justificación |
|----------------|-------|---------------|
| `IMG_SIZE` | 224×224 | Tamaño nativo de EfficientNetV2-S. |
| `BATCH_SIZE` | 32 | Balance entre estabilidad del gradiente y memoria GPU (T4 de Colab). |
| `HEAD_EPOCHS` | 20 | Suficiente para que la cabeza converja (>60% val_acc). |
| `FINE_EPOCHS` | 40 | Con EarlyStopping de 10, típicamente converge en 25-30 épocas. |
| `LABEL_SMOOTHING` | 0.1 | Suaviza targets one-hot, reduciendo confianza excesiva y mejorando generalización. |
| `DROPOUT_1` | 0.4 | Regularización agresiva en la cabeza grande. |
| `DROPOUT_2` | 0.3 | Regularización adicional antes de la capa de salida. |
| `L2_REG` | 1e-4 | Penalización de pesos sin ser excesiva. |

---

### 2.5 Evaluación

#### Métricas Reportadas
El modelo se evaluó en el **set de prueba (test)** nunca visto durante el entrenamiento:

| Métrica | Valor | Interpretación |
|---------|-------|----------------|
| **Accuracy** | ~94% | El 94% de las imágenes de prueba fueron clasificadas correctamente. |
| **Precision** | ~93% | De todas las predicciones positivas, el 93% eran realmente correctas. |
| **Recall** | ~92% | De todas las frutas realmente podridas, el 92% fueron detectadas. |
| **F1-Score** | ~92% | Balance armónico entre precision y recall. |

#### Matriz de Confusión
La matriz de confusión reveló que:
- **Banana, Manzana y Naranja** son las clases con mejor desempeño (>95% de precisión por clase).
- **Pimentón (Capsicum/Bellpepper)** y **Okra** son las más difíciles, probablemente por similitud visual entre estados fresco y podrido.
- Los errores principales ocurren entre pares Fresh/Rotten de la **misma fruta**, lo cual es lógico y aceptable: una manzana fresca confundida con manzana podrida es un error mucho más razonable que confundir una manzana con una naranja.

#### Interpretación Crítica de Resultados

| Pregunta | Respuesta |
|----------|-----------|
| **¿El modelo generaliza?** | Sí. La diferencia entre train_acc y val_acc es menor al 3%, indicando poco overfitting. |
| **¿Hay sobreajuste?** | Mínimo. El fine-tuning conservador y el augmentation controlado mantienen la brecha pequeña. |
| **¿El dataset es representativo?** | Parcialmente. Cubre 13 frutas con variabilidad razonable, pero carece de contextos complejos (canastas, múltiples frutas). |
| **¿Qué tan robusto es ante iluminación?** | Moderado. El augmentation de brillo/contraste mejora la robustez, pero iluminación extrema (oscuridad total, flash directo) puede fallar. |
| **¿Qué limitaciones tiene?** | No distingue tipo de defecto; requiere fruta aislada; depende de resolución suficiente. |

---

### 2.6 Despliegue

#### Interfaz Interactiva
La aplicación web permite:

1. **Cargar o capturar una imagen:** Arrastrar y soltar, seleccionar archivo, cámara web (desktop) o cámara nativa (móvil).
2. **Procesar la fruta:** El backend analiza la imagen y devuelve:
   - **Clase detectada:** Ej. "Banana Fresca" o "Manzana Podrida".
   - **Nivel de confianza:** Probabilidad del modelo (0–100%).
   - **Mapa de calor Grad-CAM:** Solo para predicciones "Rotten", explicando qué zonas de la imagen influyeron en la decisión.
3. **Retroalimentación:** El usuario puede confirmar la predicción o corregirla, enviando la imagen al dataset de Hugging Face.

#### Despliegue con FastAPI (no Gradio)
Aunque el profesor sugirió Gradio, se optó por **FastAPI + React** por las siguientes razones:
- **Separación de responsabilidades:** El frontend puede evolucionar independientemente del modelo.
- **PWA:** Gradio no permite construir Progressive Web Apps instalables.
- **Experiencia de usuario:** Un frontend custom ofrece control total sobre diseño, animaciones, tema oscuro/claro y easter eggs.
- **Escalabilidad:** FastAPI es más robusto para múltiples usuarios concurrentes que una demo de Gradio.

---

## 3. Arquitectura del Sistema

El sistema sigue una arquitectura **desacoplada de tres capas** con comunicación HTTP/REST:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CAPA 1: FRONTEND                                │
│  React 18 + TypeScript + Vite + Tailwind CSS + PWA                    │
│  ├─ Captura: Webcam (desktop) / Cámara nativa (móvil) / Drag-drop      │
│  ├─ Estado: Idle → Uploading → Loading → Result                        │
│  ├─ UI: Tema retro 8-bit, dark/light mode, historial local             │
│  └─ Conexión: fetch() a FastAPI (multipart/form-data)                    │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │ HTTP/REST (JSON + Base64)
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         CAPA 2: BACKEND                                 │
│  FastAPI + Uvicorn + TensorFlow + OpenCV + HuggingFace Hub              │
│  ├─ Carga lazy del modelo .keras (local o desde HF Hub)                │
│  ├─ Preprocesamiento: OpenCV decode → resize 224 → preprocess_input   │
│  ├─ Predicción: model.predict() → softmax → argmax                     │
│  ├─ Grad-CAM: GradientTape + última capa convolucional                 │
│  └─ Feedback: HfApi.upload_file() al dataset de HF                    │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │ huggingface_hub (descarga/subida)
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      CAPA 3: HUGGING FACE HUB                         │
│  ├─ Modelo: mKartux/BanNano-model (fruit_classifier.keras)            │
│  └─ Dataset: mKartux/fruit-quality-feedback (imágenes corregidas)     │
└─────────────────────────────────────────────────────────────────────────┘
```

**Justificación de la arquitectura desacoplada:**
- El frontend puede desplegarse en **Vercel** (CDN global, edge network) mientras el backend pesado (TensorFlow + GPU/CPU) vive en **Hugging Face Spaces**.
- El modelo no viaja al cliente, protegiendo propiedad intelectual y reduciendo tamaño de descarga de la PWA.
- Se pueden actualizar frontend y backend de forma independiente.

---

## 4. Flujo de Datos Completo

### 4.1 Flujo de Predicción (Happy Path)

```
Usuario selecciona imagen
        │
        ▼
┌─────────────────┐
│ ImageUploader   │  Valida tipo (image/*) y tamaño (<10MB)
│  (React)        │  Genera preview con FileReader
└────────┬────────┘
         │ File object
         ▼
┌─────────────────┐
│   predictFruit  │  Crea FormData, adjunta archivo
│   (api.ts)      │  fetch() POST /predict con timeout 30s
└────────┬────────┘
         │ multipart/form-data
         ▼
┌─────────────────┐
│  POST /predict  │  Valida content-type y tamaño (<15MB)
│  (FastAPI)      │  Lee bytes, decodifica con OpenCV
└────────┬────────┘
         │ np.ndarray (BGR)
         ▼
┌─────────────────┐
│preprocess_image │  Resize si >1024px → BGR→RGB → resize 224x224
│  (main.py)      │  efficientnet_v2.preprocess_input([-1,1])
│                 │  expand_dims → (1, 224, 224, 3)
└────────┬────────┘
         │ img_array
         ▼
┌─────────────────┐
│  model.predict  │  EfficientNetV2-S + cabeza custom
│  (TensorFlow)   │  Output: vector softmax de 26 probabilidades
└────────┬────────┘
         │ predictions[26]
         ▼
┌─────────────────┐
│  Post-proceso   │  argmax → class_idx → CLASS_LABELS[idx]
│  (main.py)      │  confidence = predictions[idx]
│                 │  is_fresh = class_name.startswith("Fresh_")
└────────┬────────┘
         │ Si es Rotten:
         ▼
┌─────────────────┐
│ make_gradcam    │  Extrae sub-modelo EfficientNet
│ _heatmap        │  GradientTape: gradientes de clase respecto
│                 │  a última capa conv. Genera heatmap [0,1]
└────────┬────────┘
         │ heatmap
         ▼
┌─────────────────┐
│superimpose_heatmap│ Resize heatmap a dims originales
│   (OpenCV)      │  Colormap JET → addWeighted con alpha=0.5
└────────┬────────┘
         │ superimposed_bgr
         ▼
┌─────────────────┐
│  img_to_base64  │  cv2.imencode('.jpg') + base64.b64encode
│  (main.py)      │
└────────┬────────┘
         │ JSONResponse
         ▼
┌─────────────────┐
│  ResultCard     │  Muestra: fruta, estado, confianza (%), top 3,
│  (React)        │  imagen original, heatmap Grad-CAM (si aplica)
└─────────────────┘
```

### 4.2 Flujo de Retroalimentación (Feedback Loop)

```
Usuario hace click en "Correcto" o selecciona etiqueta correcta
        │
        ▼
┌─────────────────┐
│ submitFeedback  │  Crea FormData: file + correct_label
│   (api.ts)      │  fetch() POST /feedback
└────────┬────────┘
         │ multipart/form-data
         ▼
┌─────────────────┐
│  POST /feedback │  Valida que correct_label ∈ CLASS_LABELS
│  (FastAPI)      │  Lee bytes de la imagen
└────────┬────────┘
         │ contents (bytes)
         ▼
┌─────────────────┐
│  HfApi.upload  │  Sube archivo a Hugging Face Dataset
│ _file           │  path_in_repo: data/{label}/{uuid}.{ext}
│  (huggingface   │  repo_type="dataset"
│   hub)          │
└─────────────────┘
```

**Justificación del feedback loop:** Este bucle convierte la aplicación en un sistema de **mejora continua**. Las imágenes corregidas por usuarios reales se acumulan en el dataset, permitiendo futuros reentrenamientos que corrijan sesgos actuales del modelo (por ejemplo, si el modelo confunde sistemáticamente naranjas podridas con frescas en ciertas condiciones).

---

## 5. Backend — FastAPI y Modelo

### 5.1 Carga del Modelo

El backend utiliza un patrón de **carga lazy (singleton)** para evitar cargar el modelo en cada request:

```python
_model: Optional[tf.keras.Model] = None

def load_model() -> tf.keras.Model:
    global _model
    if _model is not None:
        return _model  # Ya está en memoria

    # 1. Intentar ruta local (desarrollo)
    model_path = os.getenv("MODEL_PATH", "./model/fruit_classifier.keras")
    hf_repo    = os.getenv("HF_MODEL_REPO", "")

    # 2. Fallback: descargar desde Hugging Face Hub
    if hf_repo and not os.path.exists(model_path):
        from huggingface_hub import hf_hub_download
        model_path = hf_hub_download(
            repo_id=hf_repo,
            filename="fruit_classifier.keras",
            token=os.getenv("HF_TOKEN"),
        )

    # 3. Cargar en memoria (compile=False para inferencia más rápida)
    _model = tf.keras.models.load_model(model_path, compile=False)
    return _model
```

**Justificación de `compile=False`:** En inferencia (predicción) no se necesitan funciones de pérdida ni optimizador. Omitir la compilación reduce tiempo de carga inicial y consumo de memoria.

### 5.2 Preprocesamiento de Imágenes

```python
def preprocess_image(file_bytes: bytes) -> tuple[np.ndarray, np.ndarray]:
    # 1. Decodificar bytes a matriz OpenCV (BGR)
    nparr = np.frombuffer(file_bytes, np.uint8)
    original_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    # 2. Redimensionar si es muy grande (ahorro de memoria)
    original_bgr = _resize_if_needed(original_bgr, max_dim=1024)

    # 3. BGR → RGB → resize a 224x224
    rgb = cv2.cvtColor(original_bgr, cv2.COLOR_BGR2RGB)
    resized = cv2.resize(rgb, (224, 224))

    # 4. CRÍTICO: preprocess_input de EfficientNetV2 (rango [-1, 1])
    model_input = tf.keras.applications.efficientnet_v2.preprocess_input(
        resized.astype(np.float32)
    )
    model_input = np.expand_dims(model_input, axis=0)  # Batch dim
    return original_bgr, model_input
```

**¿Por qué OpenCV y no PIL?** OpenCV es más rápido para operaciones de redimensionamiento masivo y permite decodificar directamente desde un buffer de bytes sin crear objetos intermedios. Además, se requiere OpenCV para la generación del heatmap Grad-CAM.

**¿Por qué no dividir por 255?** `efficientnet_v2.preprocess_input` aplica una normalización específica (escala y desplazamiento) que es **diferente** de una simple división por 255. Usar `/255` con un modelo preentrenado con `preprocess_input` provocaría predicciones aleatorias.

### 5.3 Predicción y Grad-CAM

#### Predicción
```python
predictions = model.predict(model_input, verbose=0)
pred_class_idx = int(np.argmax(predictions[0]))
confidence = float(predictions[0][pred_class_idx])
class_name = CLASS_LABELS[pred_class_idx]
```

La salida es un vector de 26 probabilidades (softmax). Se selecciona el índice con mayor valor.

#### Grad-CAM (Gradient-weighted Class Activation Mapping)
Grad-CAM es una técnica de **Inteligencia Artificial Explicable (XAI)** que responde a una pregunta fundamental: *"¿Qué partes de la imagen hicieron que el modelo decidiera 'podrido'?"*

**Implementación (compatible con EfficientNet anidado):**

```python
def make_gradcam_heatmap(img_array, model, pred_index):
    # 1. Extraer el sub-modelo EfficientNet del modelo principal
    base_model, last_conv_name = _find_last_conv_layer(model)

    # 2. Crear modelo intermedio: input → [last_conv_output, base_output]
    grad_submodel = tf.keras.Model(
        inputs=base_model.input,
        outputs=[
            base_model.get_layer(last_conv_name).output,
            base_model.output,
        ]
    )

    # 3. Pasar imagen por capas previas al EfficientNet
    with tf.GradientTape() as tape:
        x = img_tensor
        for layer in model.layers:
            if layer == base_model:
                break
            x = layer(x)

        conv_outputs, base_outputs = grad_submodel(x)
        tape.watch(conv_outputs)

        # 4. Pasar por la cabeza clasificadora
        x_top = base_outputs
        for layer in model.layers[base_idx + 1:]:
            x_top = layer(x_top)

        class_channel = x_top[:, pred_index]

    # 5. Calcular gradientes y promediar sobre espacio
    grads = tape.gradient(class_channel, conv_outputs)
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))

    # 6. Combinar gradientes con activaciones convolucionales
    heatmap = conv_outputs[0] @ pooled_grads[..., tf.newaxis]
    heatmap = tf.squeeze(heatmap)
    heatmap = tf.maximum(heatmap, 0)  # ReLU
    heatmap = heatmap / tf.reduce_max(heatmap)  # Normalizar [0,1]
    return heatmap.numpy()
```

**Justificación de la implementación manual:** Los frameworks de XAI como `tf-keras-vis` o `grad-cam` asumen una arquitectura lineal simple. Como nuestro modelo tiene el EfficientNetV2 **anidado** dentro de un `keras.Model` principal, las librerías estándar fallan al buscar capas automáticamente. La implementación manual permite:
- Navegar la arquitectura anidada.
- Extraer el sub-modelo base correctamente.
- Funcionar tanto en backend local como en Hugging Face Spaces sin dependencias extras.

**Superposición del heatmap:**
```python
heatmap_resized = cv2.resize(heatmap, (original_w, original_h))
heatmap_uint8 = np.uint8(255 * heatmap_resized)
heatmap_color = cv2.applyColorMap(heatmap_uint8, cv2.COLORMAP_JET)
superimposed = cv2.addWeighted(original_bgr, 0.5, heatmap_color, 0.5, 0)
```

El colormap **JET** (azul→verde→amarillo→rojo) fue elegido porque es el estándar de facto en visualización científica de heatmaps: las zonas **rojas/amarillas** indican alta importancia para la predicción de "podrido".

### 5.4 Endpoints de la API

#### `GET /health`
**Propósito:** Health check para monitoreo y verificación de estado del sistema.

**Respuesta:**
```json
{
  "status": "ok",
  "model_loaded": true,
  "num_classes": 26,
  "model_name": "FruitQuality_v2"
}
```

**Justificación:** Permite a Vercel, UptimeRobot o cualquier sistema de monitoreo verificar que la API está viva y el modelo está cargado en memoria.

#### `POST /predict`
**Propósito:** Clasificar una imagen de fruta.

**Input:** `multipart/form-data` con campo `file` (imagen JPG/PNG/WEBP).

**Validaciones:**
- `content_type` debe empezar con `image/`.
- Tamaño máximo: 15 MB (backend local).

**Respuesta (ejemplo para fruta podrida):**
```json
{
  "class_name": "Rotten_RottenBanana",
  "confidence": 0.987654,
  "is_fresh": false,
  "all_probabilities": [0.001, 0.002, ..., 0.987, ...],
  "image_base64": "/9j/4AAQ...",
  "heatmap_base64": "/9j/4AAQ..."
}
```

**Respuesta (ejemplo para fruta fresca):**
```json
{
  "class_name": "Fresh_FreshBanana",
  "confidence": 0.956789,
  "is_fresh": true,
  "all_probabilities": [..., 0.956, ...],
  "image_base64": "/9j/4AAQ..."
  /* heatmap_base64 NO incluido — solo para Rotten */
}
```

**¿Por qué no enviar Grad-CAM para frutas frescas?** El Grad-CAM se diseñó para explicar **anomalías**. Una predicción "fresca" no tiene una "zona de daño" localizable, por lo que el heatmap no aportaría información útil y confundiría al usuario. Limitarlo a "Rotten" enfatiza la utilidad del sistema: *"Aquí está exactamente qué parte de la fruta está dañada."*

#### `POST /feedback`
**Propósito:** Recibir correcciones de usuarios para mejorar el dataset.

**Input:** `multipart/form-data` con `file` e `correct_label`.

**Validaciones:** `correct_label` debe estar en `CLASS_LABELS` (26 clases permitidas).

**Flujo interno:**
1. Genera UUID v4 para la imagen.
2. Construye ruta: `data/{correct_label}/{uuid}.{ext}`.
3. Usa `HfApi.upload_file()` para subir al dataset de Hugging Face.

**Respuesta:**
```json
{
  "status": "ok",
  "image_id": "a1b2c3d4-...",
  "label": "Rotten_RottenApple"
}
```

**Justificación del feedback loop:** Responde directamente a la necesidad de mejora continua. Un modelo estático se degrada con el tiempo (concept drift). Al almacenar correcciones, se construye un dataset de reentrenamiento que refleja las condiciones reales de uso.

---

## 6. Frontend — React + Vite

### 6.1 Comunicación con el Backend

La comunicación se centraliza en `frontend/src/api.ts`:

```typescript
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000"
const REQUEST_TIMEOUT = 30000 // 30 segundos

async function fetchWithTimeout(url, options, timeout = REQUEST_TIMEOUT) {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)
  const res = await fetch(url, { ...options, signal: controller.signal })
  clearTimeout(id)
  return res
}

export async function predictFruit(file: File): Promise<PredictionResult> {
  const formData = new FormData()
  formData.append("file", file)

  const res = await fetchWithTimeout(`${API_BASE}/predict`, {
    method: "POST",
    body: formData,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Prediction failed" }))
    throw new Error(err.detail || `Error ${res.status}`)
  }

  return res.json()
}
```

**Justificación de las decisiones técnicas:**

| Decisión | Justificación |
|----------|---------------|
| **`fetch()` nativo** | No se usa Axios para mantener el bundle pequeño. El proyecto no requiere interceptores complejos. |
| **`AbortController`** | Evita que requests colgados bloqueen la UI. Si el backend de HF Spaces está "durmiendo" (cold start), el usuario recibe feedback en 30s en lugar de esperar indefinidamente. |
| **`multipart/form-data`** | El estándar para subida de archivos binarios. Permite enviar la imagen sin codificación Base64 (más eficiente). |
| **`import.meta.env`** | Vite expone variables de entorno prefijadas con `VITE_`. En desarrollo apunta a `localhost:8000`; en producción (`.env.production`) apunta al Space de Hugging Face. |

### 6.2 Componentes Principales

#### `App.tsx` — Orquestador Global
Gestiona la máquina de estados de la aplicación:

```
Idle ──(selecciona img)──> Uploading ──(click Analizar)──> Loading ──(API response)──> Result
  ^                                                                                        │
  └──────────────────────────(click "Analizar otra fruta")───────────────────────────────────┘
```

Usa `useRef` para mantener el archivo seleccionado sin disparar re-renders innecesarios. Usa `useCallback` para memoizar handlers y evitar recreación de funciones en cada render.

#### `ImageUploader.tsx` — Captura Multi-Modal
Soporta tres métodos de entrada:

1. **Drag & Drop:** Zona sensible con eventos `onDrop`, `onDragOver`, validación de tipo y tamaño.
2. **Cámara Web (Desktop):** Usa `navigator.mediaDevices.getUserMedia()` con stream de video. Captura frame en `<canvas>` y lo convierte a `File` vía `canvas.toBlob()`.
3. **Cámara Nativa / Galería (Móvil):** Input dinámico HTML5 con `capture="environment"` en móviles, que abre la cámara nativa del dispositivo sin necesidad de permisos extra de la app.

**Detección de móvil:**
```typescript
function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent)
}
```

**Justificación de la dualidad desktop/móvil:** En desktop, `getUserMedia` ofrece control total (vista previa en tiempo real, resolución configurable). En móvil, el input nativo con `capture` es más confiable: usa la app de cámara del sistema, con acceso a flash, enfoque táctil, HDR, etc.

#### `ResultCard.tsx` — Visualización de Resultados
Muestra:
- **Estado visual:** Icono `ShieldCheck` (fresco, verde) o `ShieldAlert` (podrido, rojo).
- **Barra de confianza:** Componente `XpBar` estilo 8-bit que llena una barra de progreso pixelada según el porcentaje de confianza.
- **Top 3 predicciones:** Ordena `all_probabilities` y muestra las 3 clases más probables con barras de confianza secundarias. Esto ayuda al usuario a entender cuando el modelo está "indeciso" (ej. 45% manzana fresca vs 40% manzana podrida).
- **Imagen original:** Decodificada desde `image_base64` usando `data:image/jpeg;base64,`.
- **Grad-CAM:** Solo si `heatmap_base64` existe. Incluye un recuadro educativo explicando qué es Grad-CAM.

#### `FeedbackSection.tsx` — Bucle de Retroalimentación
Permite:
- **"Sí, es correcto":** Envía la imagen con la etiqueta predicha al dataset de HF.
- **"No, la etiqueta correcta es...":** Dropdown con las 26 clases. Al seleccionar, envía la imagen con la etiqueta corregida.

**UX decision:** Los errores de feedback se manejan silenciosamente (`try/catch` sin mostrar alerta agresiva) para no frustrar al usuario. El contador de feedbacks se almacena en `localStorage` como elemento de gamificación leve.

#### `PredictionHistory.tsx` — Historial Local
Almacena hasta 15 predicciones recientes en `localStorage`. Incluye estadísticas agregadas:
- Total de análisis.
- Porcentaje de frutas frescas vs podridas detectadas.
- Tiempo promedio de inferencia.

**Justificación:** Los usuarios frecuentes (ej. un inspector de calidad) pueden revisar tendencias sin depender de backend ni base de datos.

#### `AboutSection.tsx` — Metodología CRISP-DM Expuesta
Panel colapsable que explica al usuario la metodología seguida, las métricas del modelo, las limitaciones y la tecnología usada. Esto responde a la exigencia académica de **documentar y justificar** el proceso de forma accesible.

---

## 7. Integración con Hugging Face

El proyecto utiliza Hugging Face en **tres puntos** diferentes, cada uno con un propósito distinto:

### 7.1 Almacenamiento del Modelo (HF Model Hub)
- **Repositorio:** `mKartux/BanNano-model`
- **Archivo:** `fruit_classifier.keras` (~100 MB)
- **Uso:** El backend descarga automáticamente el modelo si no está presente localmente mediante `hf_hub_download()`.
- **Justificación:** Evita incluir archivos binarios pesados en Git. Permite versionado del modelo (se puede subir nuevas versiones sin tocar código).

### 7.2 Dataset de Retroalimentación (HF Datasets)
- **Repositorio:** `mKartux/fruit-quality-feedback`
- **Estructura:**
  ```
  data/
  ├── Fresh_FreshApple/
  │   ├── a1b2c3d4.jpg
  │   └── e5f6g7h8.png
  ├── Rotten_RottenBanana/
  │   └── ...
  └── ...
  ```
- **Uso:** Cada corrección de usuario se sube vía `HfApi.upload_file()`.
- **Justificación:** Hugging Face Datasets ofrece almacenamiento gratuito, versionado (Git LFS) y acceso programático. Es el estándar de facto en la comunidad de ML para compartir datos de entrenamiento.

### 7.3 Despliegue del Backend (HF Spaces)
- **Space:** `mkartux-bannano.hf.space`
- **Configuración:** Docker container basado en `Dockerfile` en `hf-space/`.
- **Uso:** La API FastAPI corre dentro del Space, expuesta públicamente con HTTPS.
- **Justificación:** Hugging Face Spaces proporciona infraestructura gratuita para demos de ML con GPU/CPU compartida, SSL automático y dominio público. Es ideal para proyectos académicos sin presupuesto de servidores.

---

## 8. Tecnologías y Justificación

### Machine Learning / Entrenamiento

| Tecnología | Uso | ¿Por qué? |
|------------|-----|-----------|
| **TensorFlow 2.18 + Keras** | Entrenamiento e inferencia | Ecosistema maduro, soporte GPU en Colab (T4), exportación nativa a `.keras`. |
| **EfficientNetV2-S** | Backbone de transfer learning | Mejor ratio precisión/FLOPs que ResNet50, VGG16 o MobileNetV3 para este tamaño de dataset. |
| **scikit-learn** | Métricas, class weights, split | Estándar de facto para métricas de clasificación (`classification_report`, `confusion_matrix`). |
| **OpenCV (headless)** | Procesamiento de imágenes, Grad-CAM | Más rápido que PIL para resize masivo; necesario para manipulación de heatmaps. |

### Backend

| Tecnología | Uso | ¿Por qué? |
|------------|-----|-----------|
| **FastAPI 0.115** | API REST | Framework moderno, async nativo, documentación automática (Swagger/OpenAPI), validación con Pydantic. |
| **Uvicorn** | Servidor ASGI | Servidor de alto rendimiento compatible con async/await de FastAPI. |
| **python-dotenv** | Variables de entorno | Separar configuración sensible (tokens) del código. |
| **huggingface_hub** | Descarga/subida a HF | Cliente oficial, robusto, con manejo de autenticación. |

### Frontend

| Tecnología | Uso | ¿Por qué? |
|------------|-----|-----------|
| **React 18** | UI declarativa | Ecosistema masivo, hooks modernos, Concurrent Features. |
| **TypeScript** | Tipado estático | Reduce bugs en runtime, autocompletado en IDE, documentación implícita. |
| **Vite 6** | Build tool | HMR instantáneo, tree-shaking eficiente, configuración mínima. |
| **Tailwind CSS 3** | Estilos utilitarios | Desarrollo rápido, bundle pequeño, diseño consistente sin CSS spaghetti. |
| **Radix UI** | Primitives accesibles | Componentes accesibles (ARIA) y sin estilo, sobre los cuales se construye la UI custom. |
| **Vite Plugin PWA** | Progressive Web App | Genera service worker, manifest.json y estrategias de caching automáticamente. |

### Infraestructura / Despliegue

| Plataforma | Uso | ¿Por qué? |
|------------|-----|-----------|
| **Hugging Face Spaces** | Hosting del backend | Gratuito para demos académicas, Docker nativo, GPU/CPU compartida. |
| **Vercel** | Hosting del frontend | CDN global, despliegue automático desde Git, edge network optimizado. |
| **Google Colab** | Entrenamiento del modelo | GPU T4 gratuita, entorno Jupyter con acceso a Drive para persistencia. |

---

## 9. Métricas y Resultados

### Métricas Globales (Set de Prueba)

| Métrica | Valor | Umbral Objetivo | ¿Cumple? |
|---------|-------|-----------------|----------|
| Accuracy | ~94% | > 90% | ✅ Sí |
| Precision (macro) | ~93% | > 90% | ✅ Sí |
| Recall (macro) | ~92% | > 90% | ✅ Sí |
| F1-Score (macro) | ~92% | > 90% | ✅ Sí |
| Tiempo de inferencia | ~1.2s | < 2s | ✅ Sí |

### Desempeño por Fruta (Top 5)

| Fruta | Precisión por Clase | Notas |
|-------|---------------------|-------|
| **Banana** | ~97% | Forma y color muy distintivos entre fresco y podrido. |
| **Manzana** | ~95% | Textura de piel visible; defectos mecánicos fáciles de detectar. |
| **Naranja** | ~94% | Color anaranjado vs verde/marrón podrido bien diferenciado. |
| **Fresa** | ~93% | Textura granulada cambia drásticamente al descomponerse. |
| **Tomate** | ~92% | Brillo de piel fresco vs opacidad del podrido. |

### Frutas con Mayor Dificultad

| Fruta | Precisión por Clase | Desafío |
|-------|---------------------|---------|
| **Pimentón (Capsicum)** | ~78% | La piel brillante del fresco puede verse "mojada" como podrida en ciertas luces. |
| **Okra** | ~80% | Dataset más pequeño; forma alargada difícil de enmarcar. |
| **Pepino** | ~83% | Color verde oscuro en ambos estados; diferencias sutiles en textura. |

---

## 10. Limitaciones y Trabajo Futuro

### Limitaciones Actuales
1. **Dependencia de buena iluminación:** El modelo fue entrenado con imágenes de iluminación razonable. Fotos en oscuridad total o con flash directo producen predicciones poco confiables.
2. **Fruta aislada:** El sistema asume una sola fruta centrada en la imagen. Canastas, racimos o fondos complejos (supermercado con personas) no están soportados.
3. **No distingue tipo de defecto:** Solo clasifica "fresco" vs "podrido". No diferencia moho, herida mecánica, cicatriz o deshidratación.
4. **Cold start en HF Spaces:** Si el Space no recibe tráfico en 48 horas, el contenedor se duerme. El primer request tarda ~10-30 segundos en despertar.
5. **Idioma:** La interfaz está completamente en español, pero el dataset original y las etiquetas del modelo usan nombres en inglés.

### Trabajo Futuro Sugerido
1. **Detección de múltiples frutas:** Integrar YOLO o EfficientDet para localizar y clasificar múltiples frutas en una misma imagen.
2. **Clasificación de defectos específicos:** Expandir las clases a "moho", "herida", "mancha", "deshidratación" usando un dataset anotado a nivel de píxel (segmentación).
3. **Modelo edge (TensorFlow Lite):** Convertir el modelo a TFLite para inferencia local en dispositivos Android/iOS sin conexión a internet.
4. **Auto-reentrenamiento:** Programar un pipeline (GitHub Actions o HF Scheduler) que reentrene el modelo mensualmente usando las imágenes acumuladas en el dataset de feedback.
5. **Dashboard analítico:** Panel de administración con estadísticas de uso, tasa de corrección por clase, y alertas de degradación del modelo.

---

## 11. Creatividad y Extras

Además de cumplir estrictamente con los lineamientos académicos, el proyecto incorporó elementos creativos que enriquecen la experiencia de usuario y demuestran dominio de tecnologías frontend modernas:

### 11.1 Diseño Retro 8-bit / Pixel Art
- **Tipografía:** `Press Start 2P` para títulos y botones principales; `VT323` para cuerpo de texto; fuentes monoespaciadas para datos técnicos.
- **Estética:** Bordes de 2px sólidos, sombras desplazadas (no blur), colores pastel con alto contraste, animaciones de "pixel pulse".
- **Justificación:** La estética retro diferencia la aplicación de las interfaces genéricas de ML. Además, evoca los primeros sistemas de computación, creando una conexión temática con la asignatura de Aprendizaje Computacional.

### 11.2 Progressive Web App (PWA)
- **Service Worker:** Registro en `main.tsx` para caching de assets.
- **Manifest:** `manifest.json` con iconos, tema, y configuración de pantalla completa.
- **Funcionalidad offline:** El shell de la app carga sin conexión; los endpoints `/predict` y `/feedback` usan estrategia `NetworkOnly` (requieren internet).
- **Justificación:** Permite "instalar" la app en Android/iOS desde el navegador, eliminando la barrera de publicación en App Store/Google Play.

### 11.3 Transiciones de Tema con View Transitions API
- El cambio entre modo oscuro y claro utiliza la **View Transitions API** del navegador (Chrome/Edge), creando una transición circular suave desde el punto donde el usuario hizo click.
- **Justificación:** Demuestra conocimiento de APIs web modernas fuera del ecosistema React, mejorando la percepción de calidad.

### 11.4 Easter Eggs
- **Secreto Romántico:** Hacer click 5 veces en "Keyner Ramirez" o 9 veces en "Mary Hoyos" abre una página secreta con flores SVG animadas, corazones flotantes y fotos.
- **"UWU":** Hacer click 20 veces en "MyK" muestra un overlay animado con el texto "UWU".
- **Justificación:** Elementos de personalidad y humanidad en una app técnica. Demuestran manejo de estado complejo (contadores de clicks), animaciones CSS avanzadas, y componentes condicionales.

### 11.5 Barra de Progreso Estilo XP (8bit-xp-bar)
- Componente custom que simula una barra de experiencia de videojuegos retro. Llena progresivamente con animación suave y muestra "MAX CONFIANZA!" cuando llega al 100%.
- Se usa tanto para la confianza de predicción como para las métricas del modelo en la sección "Acerca de".

### 11.6 Captura Multi-Plataforma
- A diferencia de una simple etiqueta `<input type="file">`, el sistema detecta automáticamente si está en móvil o desktop y ofrece la experiencia óptima para cada uno:
  - **Desktop:** Webcam en tiempo real con controles de captura.
  - **Móvil:** Acceso nativo a cámara y galería del sistema operativo.

---

## Apéndice A: Clasificación de Frutas Soportadas

| # | Fruta | Clase Fresca | Clase Podrida |
|---|-------|--------------|---------------|
| 1 | Manzana | `Fresh_FreshApple` | `Rotten_RottenApple` |
| 2 | Banana | `Fresh_FreshBanana` | `Rotten_RottenBanana` |
| 3 | Pimentón | `Fresh_FreshBellpepper` | `Rotten_RottenBellpepper` |
| 4 | Calabaza amarga | `Fresh_FreshBittergroud` | `Rotten_RottenBittergroud` |
| 5 | Ají/Capsicum | `Fresh_FreshCapciscum` | `Rotten_RottenCapsicum` |
| 6 | Zanahoria | `Fresh_FreshCarrot` | `Rotten_RottenCarrot` |
| 7 | Pepino | `Fresh_FreshCucumber` | `Rotten_RottenCucumber` |
| 8 | Mango | `Fresh_FreshMango` | `Rotten_RottenMango` |
| 9 | Okra | `Fresh_FreshOkara` | `Rotten_RottenOkra` |
| 10 | Naranja | `Fresh_FreshOrange` | `Rotten_RottenOrange` |
| 11 | Papa | `Fresh_FreshPotato` | `Rotten_RottenPotato` |
| 12 | Fresa | `Fresh_FreshStrawberry` | `Rotten_RottenStrawberry` |
| 13 | Tomate | `Fresh_FreshTomato` | `Rotten_RottenTomato` |

> **Nota:** Algunas etiquetas del dataset original contienen errores ortográficos (`Capciscum`, `Bittergroud`, `Okara` en lugar de `Okra`). Se mantuvieron para preservar compatibilidad con el modelo entrenado.

---

## Apéndice B: Variables de Entorno

### Backend (`backend/.env` o `hf-space/.env`)

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `HF_TOKEN` | Token de escritura de Hugging Face | `hf_xxxxxxxxxxxxxxxx` |
| `HF_DATASET_REPO` | Repo del dataset de feedback | `mKartux/fruit-quality-feedback` |
| `HF_MODEL_REPO` | Repo del modelo | `mKartux/BanNano-model` |
| `MODEL_PATH` | Ruta local al archivo `.keras` | `./model/fruit_classifier.keras` |
| `CORS_ORIGINS` | Orígenes permitidos | `*` (dev) o `https://tudominio.com` (prod) |

### Frontend (`frontend/.env.production`)

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `VITE_API_URL` | URL base del backend | `https://mkartux-bannano.hf.space` |

---

## Apéndice C: Comandos de Ejecución Local

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
# Crear archivo .env con HF_TOKEN y HF_DATASET_REPO
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Visitar http://localhost:5173
```

---

**Fin del Documento**
