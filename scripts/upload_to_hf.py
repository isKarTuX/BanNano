"""
BanNano — Subir Modelo a Hugging Face Hub
=========================================
Sube el modelo .keras a tu repositorio de Hugging Face.

Uso:
    python scripts/upload_to_hf.py \
        --repo-id mkartux/BanNano \
        --model ./model_new/fruit_classifier.keras \
        --token $HF_TOKEN

Requisitos:
    pip install huggingface_hub>=0.24
"""

import argparse
import os
import json
from pathlib import Path
from datetime import datetime

try:
    from huggingface_hub import HfApi, create_repo, upload_file, hf_hub_download
except ImportError:
    print("Instala huggingface_hub: pip install huggingface_hub>=0.24")
    raise


def ensure_repo_exists(repo_id: str, token: str, private: bool = False):
    api = HfApi(token=token)
    try:
        api.repo_info(repo_id=repo_id, repo_type="model")
        print(f"Repo existente: https://huggingface.co/{repo_id}")
    except Exception:
        print(f"Creando repo: {repo_id}")
        create_repo(repo_id, repo_type="model", private=private, token=token)
        print(f"Repo creado: https://huggingface.co/{repo_id}")


def upload_model(repo_id: str, model_path: str, token: str):
    if not os.path.exists(model_path):
        print(f"Error: Modelo no encontrado en {model_path}")
        return

    print(f"Subiendo modelo a {repo_id}...")
    upload_file(
        path_or_fileobj=model_path,
        path_in_repo="fruit_classifier.keras",
        repo_id=repo_id,
        repo_type="model",
        token=token,
    )
    print("  fruit_classifier.keras subido")

    # Metadata si existe
    meta_path = os.path.join(os.path.dirname(model_path), "model_metadata.json")
    if os.path.exists(meta_path):
        upload_file(
            path_or_fileobj=meta_path,
            path_in_repo="model_metadata.json",
            repo_id=repo_id,
            repo_type="model",
            token=token,
        )
        print("  model_metadata.json subido")

    # README
    readme = generate_readme(model_path)
    readme_tmp = "/tmp/README.md"
    with open(readme_tmp, "w", encoding="utf-8") as f:
        f.write(readme)
    upload_file(
        path_or_fileobj=readme_tmp,
        path_in_repo="README.md",
        repo_id=repo_id,
        repo_type="model",
        token=token,
    )
    print("  README.md subido")

    print(f"\nListo: https://huggingface.co/{repo_id}")


def generate_readme(model_path: str) -> str:
    meta = {}
    meta_path = os.path.join(os.path.dirname(model_path), "model_metadata.json")
    if os.path.exists(meta_path):
        with open(meta_path) as f:
            meta = json.load(f)

    classes_md = "\n".join(f"- `{c}`" for c in meta.get('class_names', []))

    return f"""---
tags:
  - tensorflow
  - keras
  - image-classification
  - fruits
  - food-quality
  - grad-cam
  - efficientnet
license: mit
---

# BanNano — Clasificador de Calidad de Frutas

Modelo de deep learning para clasificar frutas como frescas o podridas.

## Características

- **Arquitectura:** {meta.get('architecture', 'EfficientNetV2-S')}
- **Clases:** {meta.get('num_classes', 26)} (13 frutas × 2 estados)
- **Input:** {meta.get('input_shape', [224, 224, 3])}
- **Preprocesamiento:** `{meta.get('preprocessing', 'efficientnet_v2.preprocess_input')}`

## Clases soportadas

{classes_md}

## Links

- App: [bannano.vercel.app](https://bannano.vercel.app)
- GitHub: [isKarTuX/BanNano](https://github.com/isKarTuX/BanNano)

---
*Actualizado: {datetime.now().strftime("%Y-%m-%d %H:%M")}*
"""


def main():
    parser = argparse.ArgumentParser(description='Sube modelo a Hugging Face')
    parser.add_argument('--repo-id', required=True, help='Repo ID')
    parser.add_argument('--model', required=True, help='Ruta al .keras')
    parser.add_argument('--token', default=os.getenv('HF_TOKEN'), help='HF Token')
    parser.add_argument('--private', action='store_true')
    parser.add_argument('--verify', action='store_true', help='Verificar descarga')
    args = parser.parse_args()

    if not args.token:
        print("Error: Define HF_TOKEN (env o --token)")
        return

    ensure_repo_exists(args.repo_id, args.token, args.private)
    upload_model(args.repo_id, args.model, args.token)

    if args.verify:
        print("\nVerificando descarga...")
        try:
            path = hf_hub_download(
                repo_id=args.repo_id,
                filename="fruit_classifier.keras",
                repo_type="model",
                token=args.token,
            )
            mb = os.path.getsize(path) / 1e6
            print(f"  OK: {mb:.1f} MB")
        except Exception as e:
            print(f"  Error: {e}")


if __name__ == '__main__':
    main()
