# BanNano — Clasificador de calidad de frutas con aprendizaje profundo

> Proyecto de la asignatura **Aprendizaje Computacional** de la Universidad de Córdoba.
> Autores: **Keyner Ramírez** y **Mary Hoyos**.

## ¿Qué es BanNano?

BanNano es una aplicación web que recibe una fotografía de una fruta o verdura y responde si está **fresca** o **dañada**, mostrando además la **zona de la imagen** en la que el modelo se basó para decidir. Está pensada como una herramienta de apoyo al control de calidad en cadenas de producción, supermercados, centros de acopio o plantas de empaque, donde la inspección visual humana es costosa, lenta y subjetiva.

El nombre viene de *banano* (la fruta con la que empezamos a experimentar) y de la idea de construir algo **nano** en tamaño pero útil en alcance: un sistema pequeño, portable y abierto, entrenado con datos públicos y servido desde la nube.

## Enlaces del proyecto

| Recurso | Enlace |
|---|---|
| Aplicación web desplegada | https://ban-nano.vercel.app/ |
| Cuaderno de entrenamiento (Google Colab) | https://colab.research.google.com/drive/1A9Zw_6VRBJwnzsvfOY17whX1SJGhqLPO |
| Dataset público utilizado (Kaggle) | https://www.kaggle.com/datasets/ulnnproject/food-freshness-dataset |
| API en Hugging Face Spaces (Docker) | https://mkartux-bannano.hf.space |
| Modelo entrenado (Hugging Face Hub) | https://huggingface.co/mKartux/BanNano-model |
| Dataset de correcciones (Hugging Face) | https://huggingface.co/datasets/mKartux/fruit-quality-feedback |
| Repositorio de código | https://github.com/isKarTuX/BanNano |

## 1. Planteamiento del problema

En la industria alimentaria, separar fruta fresca de fruta podrida es una tarea crítica: una fruta dañada que llega al consumidor representa un riesgo sanitario, y descartar fruta que sí está fresca genera pérdidas económicas. Esta separación suele hacerse de forma manual, lo cual es:

- **Lenta:** una persona puede revisar decenas de frutas por minuto como máximo.
- **Subjetiva:** dos inspectores pueden no coincidir sobre el mismo lote.
- **Costosa:** requiere personal entrenado y rotación constante.
- **Difícil de escalar:** en temporadas altas el volumen se multiplica.

BanNano propone una primera solución automática basada en visión por computadora. El usuario toma una foto con su celular o sube una imagen desde el computador, y el sistema entrega en pocos segundos:

1. La **clase predicha** (qué fruta es y si está fresca o podrida).
2. La **confianza** de la predicción.
3. Un **mapa de calor** que resalta la zona de la imagen que el modelo consideró decisiva, en el caso de las frutas dañadas.

## 2. Metodología

El proyecto sigue la metodología **CRISP-DM** (Cross-Industry Standard Process for Data Mining), tal como lo solicita el lineamiento de la asignatura. Las seis fases se documentan en el cuaderno de Colab y se resumen a continuación:

1. **Comprensión del problema.** Revisión bibliográfica sobre control de calidad automatizado de frutas y selección del enfoque de clasificación de imágenes.
2. **Comprensión de los datos.** Exploración del dataset público elegido, conteo de imágenes por clase, revisión visual de muestras y detección de imágenes duplicadas o corruptas.
3. **Preparación de los datos.** Limpieza, partición en entrenamiento, validación y prueba, aplicación de técnicas de aumento de datos y normalización específica del modelo elegido.
4. **Modelado.** Entrenamiento de un modelo de **transfer learning** con EfficientNetV2-S preentrenado en ImageNet, en tres fases progresivas (cabeza, ajuste fino, refuerzo de clases débiles).
5. **Evaluación.** Cálculo de accuracy, precision, recall, F1, matriz de confusión y revisión visual de los errores.
6. **Despliegue.** Empaquetado del modelo, construcción de una API y de una interfaz web, publicación de la aplicación y del cuaderno en repositorios públicos.

## 3. Datos

Se utiliza el dataset público **"Food Freshness Dataset"** del usuario `ulnnproject` en Kaggle, que contiene más de 3.000 imágenes organizadas en **13 frutas o verduras** y **dos estados por cada una**: fresca y podrida. Esto da un total de **26 clases** de salida.

Las 13 frutas y verduras soportadas son: manzana, banano, pimentón, melón amargo, ají o chile, zanahoria, pepino, mango, okra, naranja, papa, fresa y tomate.

El dataset se dividió en 70% para entrenamiento, 15% para validación y 15% para prueba. La división se hace **antes** del aumento de datos para evitar que una misma imagen original aparezca en particiones distintas.

> **Nota honesta sobre los datos:** algunas clases tienen más imágenes que otras, lo que produce un desbalance. Para mitigarlo se usaron pesos balanceados por clase y un sobre-muestreo selectivo en la fase final del entrenamiento. Aun así, el modelo tiene mejor rendimiento en las clases con más datos. Además, el dataset solo distingue entre fruta fresca y fruta podrida: **no incluye etiquetas del tipo de daño** (moho, herida, mancha, etc.). Esta es una de las principales limitaciones del proyecto y se aborda con más detalle en la sección de limitaciones.

## 4. Modelo

Se eligió **EfficientNetV2-S** como arquitectura base por tres razones:

- Logra resultados competitivos en clasificación de imágenes con datasets pequeños.
- Admite una función de preprocesamiento específica que se respeta en el backend.
- Se puede exportar a formatos portables (`.keras` y `.tflite`).

El entrenamiento se dividió en **tres fases** para ir refinando el modelo de manera progresiva:

1. **Fase 1 — Entrenamiento de la cabeza.** Solo se entrena la cabeza densa final; la base EfficientNet se mantiene congelada. Sirve para que la cabeza aprenda a interpretar las características extraídas por EfficientNet para nuestras 26 clases.
2. **Fase 2 — Ajuste fino.** Se descongelan las últimas 50 capas del backbone y se entrena todo con una tasa de aprendizaje mucho menor. Esto especializa el modelo en frutas sin destruir el conocimiento previo.
3. **Fase 3 — Refuerzo de clases débiles.** A partir del análisis de la matriz de confusión, se identificaron cinco clases con menor recall y se les dio más datos y un ajuste adicional con 75 capas descongeladas.

El cuaderno de Colab documenta cada fase en detalle, incluyendo la elección de hiperparámetros, las técnicas de regularización usadas (data augmentation, label smoothing, dropout, regularización L2) y la justificación de cada decisión.

### 4.1 Resultados de evaluación

Sobre el conjunto de prueba, el modelo alcanza aproximadamente un **94% de accuracy**, con valores de precision, recall y F1 cercanos al 92-93% en promedio, y variaciones entre clases. El reporte de clasificación completo y la matriz de confusión se generan en el bloque 11 del cuaderno de Colab.

### 4.2 Explicabilidad con Grad-CAM

Para que el sistema no sea una "caja negra", se incorporó **Grad-CAM**, una técnica de inteligencia artificial explicable que muestra qué zonas de la imagen activaron la decisión del modelo. Cuando se detecta una fruta dañada, se superpone un mapa de calor (rojo = alta influencia, azul = baja influencia) sobre la imagen original, de modo que el usuario pueda verificar visualmente si el modelo está mirando la zona donde realmente está el daño. El mapa de calor no se muestra para frutas frescas, donde no tiene sentido buscar "zona de daño".

## 5. Arquitectura de la solución

El sistema se compone de tres piezas que se comunican por HTTP, más dos servicios externos de almacenamiento:

```
┌──────────────────────┐    HTTP    ┌──────────────────────┐
│  Frontend (Vercel)   │ ─────────► │  Backend (HF Space)  │
│  React + Vite + PWA  │            │  FastAPI + TF 2.18   │
└──────────────────────┘            └──────────┬───────────┘
                                                │
                              descarga modelo   │   sube correcciones
                                                ▼
                              ┌──────────────────┴──────────────────┐
                              ▼                                     ▼
                  ┌──────────────────────┐           ┌──────────────────────┐
                  │  Hugging Face Hub    │           │  Hugging Face Data-  │
                  │  (modelo .keras)     │           │  sets (feedback)     │
                  └──────────────────────┘           └──────────────────────┘
```

- **Frontend (este repositorio, carpeta `frontend/`).** Aplicación web en React + Vite + TailwindCSS, con estética retro 8-bit, modo claro/oscuro, historial local de predicciones y soporte para instalación como aplicación progresiva. Desplegada en Vercel.
- **Backend (este repositorio, carpetas `backend/` y `hf-space/`).** API en FastAPI que carga el modelo entrenado, recibe imágenes, las preprocesa, devuelve la predicción y, cuando corresponde, genera el mapa de calor. La misma API expone un endpoint para recibir correcciones del usuario. Desplegada en Hugging Face Spaces como contenedor Docker.
- **Hugging Face Hub.** Aloja el modelo entrenado (`.keras`) y el dataset donde se acumulan las correcciones de los usuarios.
- **Cuaderno de Colab.** Contiene el código de entrenamiento, evaluación y exportación del modelo. No es necesario para usar la aplicación: queda como material académico de referencia.

## 6. Cómo ejecutar el proyecto en local

El proyecto tiene tres partes que se pueden levantar de forma independiente. Para una demostración rápida es suficiente con el **backend** y el **frontend**.

### 6.1 Requisitos previos

- **Python 3.11** o superior.
- **Node.js 18** o superior y npm.
- Una cuenta gratuita en Hugging Face y un token personal con permisos de escritura, si se quiere probar el ciclo de feedback.

### 6.2 Backend

```bash
# 1. Entrar a la carpeta del backend
cd backend

# 2. Crear y activar un entorno virtual
python -m venv .venv
# En Windows:
.venv\Scripts\activate
# En macOS / Linux:
source .venv/bin/activate

# 3. Instalar dependencias
pip install -r requirements.txt

# 4. Configurar variables de entorno
#    Copiar el archivo de ejemplo y editarlo con tus valores:
cp .env.example .env
#    Las variables mínimas son HF_TOKEN, HF_MODEL_REPO y HF_DATASET_REPO.
#    Si no tienes el modelo .keras local, basta con HF_MODEL_REPO para
#    que el backend lo descargue automáticamente al arrancar.

# 5. Levantar el servidor
uvicorn main:app --host 0.0.0.0 --port 8000
```

El servidor quedará disponible en `http://localhost:8000`. La documentación interactiva de la API se puede consultar en `http://localhost:8000/docs`.

### 6.3 Frontend

```bash
# 1. Entrar a la carpeta del frontend
cd frontend

# 2. Instalar dependencias
npm install

# 3. Crear el archivo de variables de entorno (opcional)
#    Si lo omites, la app intentará conectarse a http://localhost:8000
echo "VITE_API_URL=http://localhost:8000" > .env

# 4. Levantar el servidor de desarrollo
npm run dev
```

La aplicación quedará disponible en `http://localhost:5173`.

### 6.4 Despliegue en Hugging Face Spaces

La carpeta `hf-space/` contiene una versión lista para desplegar como Space de tipo Docker. Los pasos resumidos son:

1. Crear un Space nuevo en https://huggingface.co/new-space eligiendo el SDK **Docker**.
2. Subir el contenido de `hf-space/` (`app.py`, `Dockerfile`, `requirements.txt`).
3. Configurar las variables `HF_TOKEN`, `HF_MODEL_REPO` y `HF_DATASET_REPO` en la pestaña **Settings** del Space.
4. Esperar a que se construya la imagen. Al terminar, el Space quedará accesible en una URL del estilo `https://<usuario>-<nombre>.hf.space`.

## 7. Cómo usar la aplicación

La aplicación está diseñada para ser utilizada por cualquier persona, sin conocimientos técnicos. El flujo es el siguiente:

1. **Abrir la página** en el celular o computador (`https://ban-nano.vercel.app/`).
2. **Subir una imagen** de la fruta usando el botón de la cámara o arrastrando un archivo. Se admiten formatos comunes (JPG, PNG, WEBP) de hasta 10 MB.
3. **Presionar "Analizar fruta"**. La primera vez puede tardar algunos segundos si el modelo aún no está cargado en memoria.
4. **Revisar el resultado.** Se muestra la clase predicha, la confianza como una barra de experiencia y, si la fruta está dañada, el mapa de calor.
5. **Confirmar o corregir** la predicción. Si la predicción es correcta se envía una confirmación; si no, se puede elegir la etiqueta verdadera en un selector con las 26 clases. En ambos casos la imagen con la etiqueta se sube al dataset de feedback de Hugging Face para futuros reentrenamientos.

Adicionalmente, la aplicación guarda un historial local de las últimas predicciones (solo en el navegador del usuario, nunca en un servidor) y permite instalar la web como aplicación progresiva en el celular.

### 7.1 Ejemplo de uso de la API directamente

```bash
# Predicción
curl -X POST http://localhost:8000/predict \
  -F "file=@mi_fruta.jpg"

# Feedback (corrección)
curl -X POST http://localhost:8000/feedback \
  -F "file=@mi_fruta.jpg" \
  -F "correct_label=Fresh_FreshApple"
```

## 8. Limitaciones

Ser transparentes sobre las limitaciones del proyecto es tan importante como mostrar sus logros. Estas son las reconocidas:

- **Solo dos estados por fruta.** El modelo distingue entre fresca y podrida, pero **no identifica el tipo de daño** (moho, herida, mancha, etc.). Esto se debe a que el dataset público usado no incluye esas etiquetas.
- **13 frutas o verduras únicamente.** El sistema no reconoce frutas que no estén en el dataset. Para añadir más sería necesario reentrenar.
- **Dependencia de las condiciones de la foto.** El modelo fue entrenado con imágenes de frutas aisladas sobre fondos relativamente limpios. Fotos con sombras fuertes, varias frutas mezcladas o la fruta parcialmente oculta generan predicciones menos confiables.
- **Dataset pequeño.** Con alrededor de 3.000 imágenes para 26 clases, el modelo tiene margen de mejora. Se compensa con aumento de datos y transfer learning, pero no alcanza la robustez de un sistema entrenado con cientos de miles de imágenes.
- **Errores de predicción en producción.** El modelo alcanza aproximadamente un 94% de accuracy, lo que significa que alrededor de 1 de cada 20 imágenes puede clasificarse de forma incorrecta. En particular:
  - Algunas frutas visualmente similares (por ejemplo, manzana fresca con un golpe y naranja fresca) se confunden entre sí.
  - Ocasionalmente, frutas frescas con iluminación extraña oclusiones se clasifican como podridas, lo que es un falso positivo desde el punto de vista del usuario (una falsa alarma).
  - En sentido contrario, algunas frutas claramente podridas pero con apariencia uniforme pueden clasificarse como frescas, lo que es un falso negativo y resulta más grave en un contexto de control de calidad.
- **Una sola arquitectura probada.** Por restricciones de tiempo, solo se entrenó EfficientNetV2-S. No se hizo una comparación formal con ResNet, DenseNet, MobileNet u otras arquitecturas.
- **Reentrenamiento manual.** El sistema recibe correcciones de los usuarios y las acumula en un dataset, pero **no se reentrena automáticamente**. Cuando hay suficientes correcciones nuevas, alguien debe descargar el dataset, combinarlo con el original, reentrenar el modelo y republicarlo.
- **Sin validación de "esto no es una fruta".** Si se sube una foto de un objeto que no es una fruta, el sistema igual devuelve la clase con mayor probabilidad, que será alguna de las 26 conocidas. No hay una capa de "rechazo" para imágenes fuera de dominio.
- **Costo de infraestructura.** El backend con TensorFlow necesita varios gigabytes de RAM y se beneficia de una GPU. La capa gratuita de Hugging Face Spaces funciona, pero la inferencia en CPU es más lenta. El primer arranque del backend también tarda más, porque descarga el modelo `.keras` de Hugging Face.

## 9. Estructura del repositorio

```text
BanNano/
├── backend/                  # API FastAPI principal
│   ├── main.py               # Endpoints /predict, /feedback, /health
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example          # Plantilla de variables de entorno
├── hf-space/                 # Versión de la API lista para HF Spaces
│   ├── app.py                # Espejo de backend/main.py
│   ├── Dockerfile
│   ├── requirements.txt
│   └── README.md             # README específico del Space
├── frontend/                 # Aplicación web
│   ├── src/                  # Componentes, hooks, lógica de UI
│   ├── public/               # Recursos estáticos
│   ├── package.json
│   └── vite.config.ts
├── scripts/                  # Utilidades para reentrenar o publicar el modelo
│   ├── retrain_model.py
│   └── upload_to_hf.py
├── .gitignore
├── README.md                 # Este archivo
├── slides.md                 # Guion de la presentación
└── feedback.md               # Co-evaluación recibida y mejoras aplicadas
```

Los cuadernos de trabajo locales, los modelos entrenados (`.keras`, `.tflite`) y los documentos intermedios de redacción no se suben al repositorio. La versión canónica del cuaderno está en Google Colab (enlace arriba) y la del modelo en Hugging Face Hub (enlace arriba).

## 10. Autores

- **Keyner Ramírez** — modelo, entrenamiento, despliegue del backend.
- **Mary Hoyos** — diseño de la interfaz, integración frontend-backend, documentación.

Trabajo realizado en la **Universidad de Córdoba**, en el marco de la asignatura **Aprendizaje Computacional**.

## 11. Licencia y agradecimientos

El código de este repositorio se publica con fines académicos. El dataset utilizado pertenece a su autor original en Kaggle (ver enlace en la sección de datos) y se usa citando la fuente. Agradecemos a la comunidad de TensorFlow, Hugging Face, React y FastAPI, cuyas herramientas hicieron posible este proyecto.
