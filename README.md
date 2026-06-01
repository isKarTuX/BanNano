# BanNano

BanNano es un proyecto de aprendizaje computacional desarrollado en la Universidad de Córdoba para clasificar frutas como frescas o podridas a partir de una imagen. La solución combina un frontend web, un backend en FastAPI y un despliegue auxiliar en Hugging Face Spaces.

## Propósito

El sistema permite subir una imagen de una fruta, obtener una predicción de calidad y visualizar una explicación tipo Grad-CAM sobre las zonas que más influyeron en la decisión del modelo. Además, incorpora un flujo de feedback para corregir predicciones y alimentar un dataset de mejora continua.

## Características

- Clasificación entre fruta fresca y fruta dañada.
- Visualización de Grad-CAM para explicar la predicción.
- Interfaz web con estilo retro e intuitivo.
- API para predicción y retroalimentación.
- Integración con Hugging Face para modelo y dataset de feedback.

## Arquitectura

- Frontend: aplicación React + Vite ubicada en [frontend/](frontend).
- Backend: API FastAPI ubicada en [backend/](backend).
- Space: despliegue alternativo para la API en [hf-space/](hf-space).
- Modelo: archivo `.keras` exportado desde el entrenamiento y cargado localmente o desde Hugging Face.

## Estructura del repositorio

```text
BanNano/
├── backend/
├── frontend/
├── hf-space/
├── FrutasProyecto_CORREGIDO.ipynb
└── README.md
```

## Requisitos

- Python 3.11 o superior.
- Node.js 18 o superior.
- Un archivo de modelo `fruit_classifier.keras` disponible en `backend/model/` o publicado en Hugging Face.

## Ejecución local

### 1. Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

El backend lee variables desde un archivo `.env` local. Un ejemplo está en [backend/.env.example](backend/.env.example).

Variables principales:

```env
MODEL_PATH=./model/fruit_classifier.keras
HF_TOKEN=tu_token_de_huggingface
HF_DATASET_REPO=tu_usuario/fruit-quality-feedback
HF_MODEL_REPO=tu_usuario/BanNano-model
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Si deseas apuntar el frontend a otro backend, ajusta [frontend/.env.production](frontend/.env.production).

## Despliegue

### Hugging Face Spaces

El directorio [hf-space/](hf-space) contiene una versión lista para despliegue con Docker. Allí la API expone los endpoints:

- `GET /health`
- `POST /predict`
- `POST /feedback`

### Frontend

El frontend está preparado para desplegarse en Vercel o en cualquier plataforma compatible con Vite.

## Modelo y feedback

- Modelo base: EfficientNetV2 entrenado para 26 clases, correspondientes a 13 frutas en estado fresh y rotten.
- Explicabilidad: Grad-CAM para interpretar la decisión del modelo.
- Retroalimentación: las correcciones se envían a un dataset de Hugging Face para futuras mejoras.

## Autores

- Keyner Ramire
- Mary Hoyos

## Contexto académico

Este trabajo fue realizado como parte de una actividad de aprendizaje computacional de la Universidad de Córdoba.

## Notas

- No subas archivos `.env` ni modelos pesados al repositorio.
- El archivo [hf-space/.env](hf-space/.env) debe permanecer fuera de git.
- El notebook contiene salidas y material de experimentación del entrenamiento; si deseas una versión más limpia para publicación, se puede depurar después.