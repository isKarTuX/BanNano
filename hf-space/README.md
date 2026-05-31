---
title: FruitScan - Clasificador de Frutas
emoji: 🍌
colorFrom: green
colorTo: yellow
sdk: docker
app_port: 7860
pinned: false
---

# FruitScan — Fruit Quality Classifier API

Clasificador de frutas frescas vs podridas usando **EfficientNetV2** + **TensorFlow** con visualizacion **Grad-CAM**.

## Endpoints

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| `GET` | `/health` | Estado del modelo (cargado, clases) |
| `POST` | `/predict` | Clasifica imagen (multipart `file`) |
| `POST` | `/feedback` | Envia correccion de etiqueta |

### POST `/predict`

```bash
curl -X POST https://mkartux-bannano.hf.space/predict \
  -F "file=@manzana.jpg"
```

Respuesta:
```json
{
  "class_name": "Fresh_FreshApple",
  "confidence": 0.9876,
  "is_fresh": true,
  "all_probabilities": [...],
  "image_base64": "...",
  "heatmap_base64": "..."
}
```

### POST `/feedback`

```bash
curl -X POST https://mkartux-bannano.hf.space/feedback \
  -F "file=@manzana.jpg" \
  -F "correct_label=Rotten_RottenApple"
```

## Dataset de feedback

Las correcciones enviadas se almacenan en:
[mKartux/fruit-quality-feedback](https://huggingface.co/datasets/mKartux/fruit-quality-feedback)

## Modelo

EfficientNetV2 entrenado en 26 clases (13 frutas x 2 estados fresh/rotten).

**Repo del modelo:** [mKartux/BanNano-model](https://huggingface.co/mKartux/BanNano-model)

## Frontend

Proximamente en Vercel.

## Secrets requeridos

Configurar en [Settings > Repository secrets](https://huggingface.co/spaces/mKartux/BanNano/settings):

- `HF_TOKEN` — Token de escritura de HF
- `HF_DATASET_REPO` — `mKartux/fruit-quality-feedback`
- `HF_MODEL_REPO` — `mKartux/BanNano-model`
