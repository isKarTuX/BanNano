# BanNano — Guion de presentación (5 a 7 minutos)

> **Cómo usar este guion.** Cada diapositiva incluye:
> - **Título** sugerido.
> - **Contenido** en viñetas, pensado para que un agente de IA genere la diapositiva (por ejemplo, en Gamma, Marp, Reveal.js o Canva).
> - **Notas del orador**, que es lo que se dice en voz alta.
> - **Tiempo** aproximado que se debe dedicar.
>
> La estructura sigue el orden pedido por el profesor: **problema, datos, modelo, demo en vivo y lecciones aprendidas**.

---

## Diapositiva 1 — Portada

**Título:** BanNano: control de calidad de frutas con aprendizaje profundo

**Contenido:**
- Universidad de Córdoba — Aprendizaje Computacional
- Autores: Keyner Ramírez y Mary Hoyos
- Fecha de la presentación
- Enlace a la app: https://ban-nano.vercel.app/

**Notas del orador (≈15 segundos):**
> "Buenos días / Buenas tardes. Somos Keyner Ramírez y Mary Hoyos y vamos a presentar BanNano, un clasificador de calidad de frutas basado en deep learning. La aplicación está desplegada en este enlace, pueden abrirla en su celular ahora si quieren probarla en vivo."

**Sugerencia visual:** Logo de la app, fondo con la estética retro 8-bit, nombres de los autores y el enlace en grande.

---

## Diapositiva 2 — El problema

**Título:** ¿Por qué automatizar la inspección de frutas?

**Contenido:**
- La inspección manual de fruta fresca vs. podrida es **lenta, subjetiva y costosa**.
- Una fruta podrida que llega al consumidor es un **riesgo sanitario**.
- Descartar fruta que sí estaba fresca es una **pérdida económica**.
- Necesitamos un sistema rápido, consistente y de bajo costo que sirva de apoyo al inspector humano.

**Notas del orador (≈30 segundos):**
> "El problema de fondo es que separar fruta fresca de fruta podrida en una planta de empaque o en un supermercado hoy se hace a ojo, persona por persona. Eso es lento, depende del criterio de cada inspector y, en temporadas altas, no escala. Queríamos construir una primera versión de un sistema que automatice esa primera revisión: el usuario toma una foto, el sistema responde en segundos si la fruta está fresca o dañada, y le muestra por qué."

**Sugerencia visual:** Imágenes lado a lado de inspección manual vs. cámara inspeccionando fruta. Idealmente una foto real, no solo iconos.

---

## Diapositiva 3 — Nuestra solución

**Título:** ¿Qué hace BanNano?

**Contenido:**
- Recibe una foto de una fruta o verdura.
- Devuelve la **clase predicha** y la **confianza**.
- Para frutas dañadas, muestra un **mapa de calor** sobre la zona que el modelo consideró decisiva.
- El usuario puede **confirmar o corregir** la predicción; esa corrección alimenta un dataset para futuros reentrenamientos.
- Funciona desde el celular, sin instalar nada.

**Notas del orador (≈30 segundos):**
> "BanNano hace tres cosas. Primero, clasifica la imagen en una de 26 clases: 13 frutas o verduras por dos estados, fresca o podrida. Segundo, muestra un mapa de calor que explica qué zona de la imagen miró el modelo para decidir. Tercero, deja al usuario confirmar o corregir la predicción, y esa corrección se guarda para mejorar el sistema con el uso."

**Sugerencia visual:** Captura de pantalla de la app con una predicción real, señalando la barra de confianza y el mapa de calor.

---

## Diapositiva 4 — Los datos

**Título:** Dataset: 13 frutas, dos estados cada una

**Contenido:**
- Fuente: **Food Freshness Dataset** de Kaggle (autor `ulnnproject`).
- ≈ 3.000 imágenes, **26 clases** en total.
- Frutas y verduras: manzana, banano, pimentón, melón amargo, ají, zanahoria, pepino, mango, okra, naranja, papa, fresa, tomate.
- División: 70% entrenamiento, 15% validación, 15% prueba.
- Se aplicaron técnicas de aumento de datos y normalización específica del modelo.
- **Limitación importante:** el dataset solo tiene dos estados por fruta, no distingue tipo de daño (moho, herida, mancha, etc.).

**Notas del orador (≈45 segundos):**
> "Trabajamos con un dataset público de Kaggle, con alrededor de tres mil imágenes de trece frutas o verduras en dos estados: fresca y podrida. Eso nos da 26 clases. Dividimos en 70, 15 y 15 por ciento para entrenar, validar y probar. Aplicamos aumento de datos y la normalización específica de EfficientNetV2. Y aquí quiero ser honesto: el dataset solo distingue dos estados por fruta, no viene con etiquetas de tipo de daño. Eso lo vamos a retomar en la diapositiva de limitaciones, porque es una de las decisiones más importantes que tomamos."

**Sugerencia visual:** Gráfico de barras con la cantidad de imágenes por clase. Resaltar el desbalance entre clases mayoritarias y minoritarias.

---

## Diapositiva 5 — El modelo

**Título:** EfficientNetV2-S con transfer learning

**Contenido:**
- Arquitectura base: **EfficientNetV2-S** preentrenada en ImageNet.
- Cabeza personalizada: *GlobalAveragePooling → BatchNorm → Dense(512) → Dropout(0.4) → Dense(26)*.
- Función de pérdida: *Categorical Crossentropy* con *label smoothing* = 0.1.
- Optimizador: *Adam* con tasas de aprendizaje distintas por fase.
- Métrica principal: **accuracy**, complementada con *precision*, *recall*, *F1* y matriz de confusión.

**Notas del orador (≈45 segundos):**
> "Elegimos EfficientNetV2-S como arquitectura base porque en la literatura reciente funciona bien con datasets pequeños y se puede portar a otros formatos. Le añadimos una cabeza densa con normalización, dropout y regularización L2 para evitar sobreajuste. Usamos label smoothing para que el modelo no se vuelva demasiado seguro de sus respuestas. La métrica principal es accuracy, pero reportamos precision, recall y F1 por clase, porque en problemas desbalanceados el accuracy solo engaña."

**Sugerencia visual:** Diagrama simple de la arquitectura: una caja con EfficientNetV2-S y otra caja con la cabeza densa. A la derecha, una mini-tabla con las métricas finales.

---

## Diapositiva 6 — Entrenamiento en 3 fases

**Título:** Tres fases para refinar el modelo progresivamente

**Contenido:**
- **Fase 1 — Cabeza.** Solo se entrena la cabeza densa, con la base congelada. Sirve para que la cabeza aprenda a interpretar las características de EfficientNet.
- **Fase 2 — Ajuste fino.** Se descongelan las últimas 50 capas del backbone y se entrena con una tasa de aprendizaje muy baja.
- **Fase 3 — Refuerzo.** Se identifican las clases con menor recall en la matriz de confusión y se les da más datos y un ajuste extra con 75 capas descongeladas.

**Notas del orador (≈45 segundos):**
> "No entrenamos una sola vez. Lo hicimos en tres fases. Primero, solo entrenamos la cabeza con la base congelada, para que aprendiera a leer las 26 clases sin destruir el conocimiento de ImageNet. Después descongelamos las últimas 50 capas del backbone para que se especialice en frutas. Y por último, mirando la matriz de confusión, vimos que algunas clases frescas tenían menos recall, y les dimos más datos y un ajuste adicional. Esto demuestra que iteramos sobre los errores en lugar de quedarnos con el primer modelo bueno."

**Sugerencia visual:** Tres bloques horizontales, uno por fase, con un diagrama de qué capas están congeladas (azul) y cuáles se entrenan (verde) en cada una.

---

## Diapositiva 7 — Resultados

**Título:** Resultados en el conjunto de prueba

**Contenido:**
- **Accuracy global:** ≈ 94%.
- **Precision, recall, F1 promedio:** entre 92% y 93%.
- Las clases con más datos (manzana, naranja, banano) tienen mejor rendimiento.
- Las clases minoritarias (okra, melón amargo) son las que más margen de mejora tienen.
- La **matriz de confusión** muestra que los errores más comunes son entre frutas visualmente similares.

**Notas del orador (≈30 segundos):**
> "Después de las tres fases, el modelo logra alrededor de 94% de accuracy en el conjunto de prueba, que son imágenes que el modelo nunca vio durante el entrenamiento. Precision, recall y F1 promedian entre 92 y 93 por ciento. Donde más margen de mejora hay es en las clases minoritarias. Los errores más comunes son confusiones entre frutas que se parecen mucho, como manzana fresca con naranja fresca, lo cual tiene sentido visualmente."

**Sugerencia visual:** Mini matriz de confusión (puede ser una imagen pequeña). Gráfico de barras con accuracy por clase. Nada muy denso: la idea es mostrar tendencia, no agotar al público.

---

## Diapositiva 8 — Demo en vivo

**Título:** Demo: lo abrimos y lo probamos

**Contenido:**
- Abrir https://ban-nano.vercel.app/ en el navegador del computador o del celular.
- Subir una imagen de ejemplo (o tomar foto con la cámara).
- Mostrar:
  - La predicción.
  - La barra de confianza.
  - El mapa de calor (si la fruta está dañada).
  - La opción de confirmar o corregir.
- Si falla la conexión, mostrar una captura de pantalla previamente grabada.

**Notas del orador (≈90 segundos):**
> "Ahora vamos a la parte más divertida: lo abrimos. Yo ya tengo la página abierta, voy a subir esta foto de un banano. La app valida el tamaño, la envía al backend, el backend la procesa con el modelo y devuelve la predicción. Aquí vemos que dice 'Banano Fresco' con una confianza de... 97%. Como la predicción es correcta, la confirmamos y se guarda en el dataset de feedback. Ahora subo una imagen de una manzana con una zona oscura: el sistema la marca como 'Manzana Podrida' y aquí está el mapa de calor, podemos ver que la zona roja coincide con la parte dañada de la manzana. Esa es la explicabilidad que pedía el lineamiento."

**Sugerencia visual:** No incluir imagen en la diapositiva. Es un momento para mostrar la app funcionando. Tener a mano 3-4 imágenes de ejemplo, una fresca, una podrida y un par ambiguas.

**Plan B si falla internet:** Capturas de pantalla con la flecha señalando cada elemento, en un PDF de respaldo, o un video corto grabado del flujo completo.

---

## Diapositiva 9 — Lecciones aprendidas

**Título:** Lo que aprendimos haciendo este proyecto

**Contenido:**
- Iterar vale más que entrenar una sola vez. La **fase 3** nació de mirar la matriz de confusión.
- El **preprocesamiento importa**: usar `preprocess_input` de EfficientNet en vez de dividir entre 255 fue una corrección crítica.
- La **explicabilidad no es opcional**: Grad-CAM obligó a entender qué miraba el modelo y expuso errores.
- El **feedback loop** convierte al sistema en uno que mejora con el uso, no solo en el entrenamiento inicial.
- **CRISP-DM** fue una guía útil para no saltarnos pasos.

**Notas del orador (≈45 segundos):**
> "Si tuviera que quedarme con cinco lecciones: primero, iterar sobre los errores vale más que entrenar una sola vez y dar el modelo por bueno. Segundo, el preprocesamiento no es un detalle: un preprocess_input mal puesto baja el accuracy de manera dramática, y eso nos costó medio día. Tercero, Grad-CAM no es un adorno, es lo que nos permitió entender por qué el modelo se equivocaba. Cuarto, el feedback loop convierte al sistema en algo que mejora con el uso, y eso es lo que hace que un proyecto de ML se sostenga en el tiempo. Y quinto, la metodología CRISP-DM nos sirvió para no saltarnos pasos."

**Sugerencia visual:** Lista numerada con íconos pequeños al lado de cada lección. Nada más en esta diapositiva, está bien respirar.

---

## Diapositiva 10 — Limitaciones y trabajo futuro

**Título:** Lo que no pudimos hacer (y por qué)

**Contenido:**
- No distinguimos el **tipo de daño** (moho, herida, mancha) porque el dataset público no trae esas etiquetas.
- El sistema **no se reentrena solo** con el feedback: hoy el ciclo es manual.
- El modelo puede equivocarse con frutas parcialmente ocluidas, mal iluminadas o fuera de las 13 clases soportadas.
- Solo se probó **una arquitectura** (EfficientNetV2-S); no se hizo comparación A/B con ResNet o MobileNet.
- **Trabajo futuro:** clasificación multi-etiqueta de daño, automatización del reentrenamiento, validación de "esto no es una fruta", pruebas en dispositivo móvil con el modelo `.tflite`.

**Notas del orador (≈30 segundos):**
> "Ser honestos sobre lo que no pudimos hacer también es parte del trabajo. No distinguimos tipo de daño porque el dataset no venía con esas etiquetas. El reentrenamiento con feedback hoy es manual. El modelo se puede equivocar con fotos en condiciones muy distintas a las del entrenamiento. Y solo probamos una arquitectura, por restricción de tiempo. Estos son los siguientes pasos naturales del proyecto."

**Sugerencia visual:** Tabla de dos columnas: "Hoy" y "Trabajo futuro". Mantener el texto corto, máximo cinco renglones por columna.

---

## Diapositiva 11 — Cierre

**Título:** Gracias

**Contenido:**
- Aplicación: https://ban-nano.vercel.app/
- Cuaderno en Colab, modelo y dataset en Hugging Face (todo en el README).
- Contacto: Keyner Ramírez y Mary Hoyos — Universidad de Córdoba.
- "¿Preguntas?"

**Notas del orador (≈15 segundos):**
> "Con esto terminamos. Todo el código, el cuaderno, el modelo y el dataset están enlazados en el README del repositorio. Estamos atentos a preguntas. Gracias."

**Sugerencia visual:** Misma estética retro 8-bit de la portada. Un emoji o ícono de "?" grande. Fondo limpio.

---

## Resumen de tiempos

| Diapositiva | Tiempo |
|---|---|
| 1. Portada | 15 s |
| 2. El problema | 30 s |
| 3. Nuestra solución | 30 s |
| 4. Los datos | 45 s |
| 5. El modelo | 45 s |
| 6. Entrenamiento en 3 fases | 45 s |
| 7. Resultados | 30 s |
| 8. Demo en vivo | 90 s |
| 9. Lecciones aprendidas | 45 s |
| 10. Limitaciones y trabajo futuro | 30 s |
| 11. Cierre | 15 s |
| **Total** | **≈ 6 minutos** |

Quedan 1 a 2 minutos de colchón para imprevistos (carga de la app, preguntas antes de la diapositiva 11).

---

## Identidad visual de BanNano (para que el agente de IA replique la estética)

> Esta sección documenta los colores, fuentes, logo y estilo de la aplicación desplegada, extraídos directamente del código de `frontend/src/index.css`, `frontend/tailwind.config.ts` y `frontend/public/banano-icon.svg`. Si le pasas esta sección al agente de IA junto con el guion, las diapositivas deberían verse **muy parecidas** a la app real.

### Logo

El logo es un **banano pixel-art de 32×32 px** (`frontend/public/banano-icon.svg`), con esta paleta interna:

| Color | Hex | Uso |
|---|---|---|
| Amarillo principal | `#F2C84B` | Cuerpo del banano |
| Amarillo claro | `#FFF29B` | Brillo del lado izquierdo |
| Amarillo oscuro | `#9A7B31` | Sombra y detalles |
| Marrón oscuro | `#4A3600` | Base del tallo |
| Marrón | `#6E5200` | Tallo |
| Marrón claro | `#C18F5B` | Tallo |
| Blanco | `#E5E5E5` | Reflejos |
| Gris claro | `#B2B2B2` | Sombras suaves |

Se renderiza con `image-rendering: pixelated` para que no se vea borroso al agrandarse. En la app aparece dentro de un cuadrado con borde pixel de 2 px.

**Para las slides:** el logo puede ir en la esquina superior izquierda de la portada, en la esquina del footer, o como marca de agua sutil al 10-15% de opacidad en el fondo.

### Paleta de colores (modo claro)

Es la paleta por defecto de la app. Es la que mejor se ve en proyector.

| Token | Hex | Significado | Uso |
|---|---|---|---|
| `--background` | `#ede9f5` | Fondo principal | Fondo de las slides |
| `--foreground` | `#3d3c4f` | Texto principal | Títulos y cuerpo |
| `--card` | `#ffffff` | Fondo de tarjetas | Cajas, bloques de contenido |
| `--primary` | `#8a79ab` | Lila/morado | Acento, títulos, íconos principales |
| `--secondary` | `#dfd9ec` | Lavanda claro | Fondos secundarios, hovers suaves |
| `--accent` | `#e6a5b8` | Rosa suave | Acentos cálidos, decoraciones |
| `--border` | `#cec9d9` | Gris lila | Bordes de tarjetas, separadores |
| `--muted` | `#dcd9e3` | Gris lavanda | Texto secundario, fondos apagados |
| `--muted-foreground` | `#6b6880` | Gris oscuro | Subtítulos, leyendas |
| **Salud buena (verde)** | `#77b8a1` | Verde agua | Estados positivos, fruta fresca |
| **Salud mala (rojo)** | `#d95c5c` | Rojo coral | Estados negativos, fruta podrida |
| `--destructive` | `#d95c5c` | Rojo coral | Errores, alertas |
| Chart amarillo | `#f0c88d` | Mostaza | Gráficos |
| Chart azul | `#a0bbe3` | Azul cielo | Gráficos |
| Sombra dura | `#3d3c4f` | Casi negro | Sombras planas (4 px sólido) |

### Paleta de colores (modo oscuro)

Para referencia, por si quieres una variante nocturna de las slides.

| Token | Hex |
|---|---|
| `--background` | `#1a1823` |
| `--foreground` | `#e0ddef` |
| `--card` | `#232030` |
| `--primary` | `#a995c9` |
| `--accent` | `#f2b8c6` |
| `--border` | `#302c40` |
| Sombra | `#0a0814` |

### Tipografía

La app usa **4 familias** de Google Fonts. Para las slides, basta con las dos primeras.

| Familia | Estilo | Uso en la app | Uso recomendado en slides |
|---|---|---|---|
| **Press Start 2P** | Pixel-art 8-bit | Títulos (`font-pixel`), logo, badges | **Títulos de diapositiva** y nombres propios |
| **VT323** | Mono retro terminal | Cuerpo, párrafos, descripciones | **Cuerpo, viñetas, subtítulos** |
| Lora | Serif suave | Acerca de (texto largo) | No usar en slides |
| Geist | Sans moderno | Fallback | No usar en slides |

Pesos y tamaños aproximados:

- **Título de slide:** Press Start 2P, 36-44 pt, color `--foreground` (`#3d3c4f`) o `--primary` (`#8a79ab`).
- **Subtítulo:** VT323, 24-28 pt, color `--muted-foreground` (`#6b6880`).
- **Viñetas:** VT323, 20-24 pt, color `--foreground` (`#3d3c4f`).
- **Texto pequeño (footer, autores):** VT323, 14-18 pt.

### Estilo de los componentes

Lo que hace única a la estética de BanNano es esto, en una línea: **bordes de 2 px sólidos, esquinas 100% rectas, sombras planas de 4 px sin difuminado, paleta lavanda con acentos verde y rojo**.

Detallado:

- **Bordes.** Todos los elementos con borde son de **2 px sólidos** color `--border` (`#cec9d9`). Nunca usar `border-radius`: todas las esquinas son rectas (`border-radius: 0px` en todo el sistema).
- **Sombras.** Sombras tipo "pixel drop shadow": `4px 4px 0px 0px var(--pixel-shadow-color)`. Es decir, **sin difuminado**, completamente planas, desplazadas 4 px hacia abajo y a la derecha. Tamaños definidos: `shadow-pixel-sm` (2 px), `shadow-pixel` y `shadow-pixel-md` (4 px), `shadow-pixel-lg` (6 px).
- **Botones.** Rectangulares, con borde 2 px y sombra 4 px. Al pasar el mouse se "levantan" 1 px (más sombra). Al presionarlos se "hunden" 2 px (menos sombra). El efecto se ve como botones físicos de los 80.
- **Tarjetas (cards).** Fondo blanco (`--card`), borde 2 px gris lila, sombra 4 px. Al hacer hover la sombra crece 1 px.
- **Barra de confianza (XP bar).** Es el detalle más distintivo: en vez de mostrar "94.7%" como un número, la confianza se ve como una **barra de experiencia de videojuego** que se va llenando con animación. Al llegar al 100% aparece un mensaje emergente "MAX CONFIANZA!".
- **Indicadores de salud.**
  - Verde `#77b8a1` para fruta fresca.
  - Rojo `#d95c5c` para fruta podrida.
  - Se usan con fondo translúcido al 15% y borde al 50% del mismo color.
- **Texto pixel (headings).** Las clases `font-pixel` aplican Press Start 2P con `line-height: 1.6` y `letter-spacing: -0.04em` (ligeramente compactado).
- **Selección de texto.** Al seleccionar texto, el fondo se vuelve color `--primary` y el texto blanco.
- **Scrollbar.** Scrollbar personalizada, 10 px de ancho, con track color `--muted` y thumb color `--primary`, ambos con borde 2 px.

### Animaciones características

| Animación | Qué hace | Dónde se ve |
|---|---|---|
| `pixel-pulse` | Opacidad alterna 1 ↔ 0.5 cada 2 s | Íconos de carga |
| `pixel-bounce` | Sube y baja 4 px con pasos discretos | Botón "Analizar fruta" mientras carga |
| `pixel-shake` | Sacudida horizontal de ±2 px | Errores de validación |
| `float` | Flota 6 px arriba y abajo, 3 s | Logo en el hero |
| `slide-up` | Entra desde abajo 8 px | Tarjetas de resultado |
| `scale-in` | Crece de 0.95 a 1.0 | Resultado de predicción |
| `shimmer` | Brillo deslizante | Botón mientras carga |
| `theme-reveal` | Onda circular que sale del click al cambiar tema | Toggle claro/oscuro |
| `pulse-glow` | Glow rosa en el easter egg "UWU" | Easter egg |
| `float-up` | Pétalos de flores que suben | Decoración de flores |
| `sway` | Flores que se mecen 4 s | Decoración de flores |

Para las slides, basta con usar **slide-up** o **scale-in** en la transición entre diapositivas. No recargar demasiado.

### Iconografía

La app usa **Lucide React** (`lucide-react`). Los íconos que más aparecen son:

- `Brain` (modelo, predicciones)
- `Database` (datos, datasets)
- `Github` (enlace al repo)
- `Sparkles` (notificaciones, carga)
- `Heart` (autoría "by MyK")
- `Code2` (enlace al Colab)
- `FolderOpen` (enlace al dataset)
- `User` (autores)
- `ExternalLink` (todos los enlaces externos)

Línea fina, 1.5-2 px de grosor, color `--primary` o `--muted-foreground`.

### Elementos distintivos de la app que vale la pena replicar

- **Header sticky** con logo + nombre "BanNano" + subtítulo "IA . CALIDAD . FRUTAS" + badge "by MyK" con un corazón + botón de tema. Esquinas rectas, borde inferior 2 px.
- **Hero central** con el logo en grande flotando, título "Analiza tus frutas con IA", subtítulo descriptivo, y una pequeña línea decorativa con un rombo al centro.
- **Lista de frutas soportadas** en una grilla de chips con colores por familia (verdes para frescas, rojos para podridas).
- **Barra decorativa** debajo del hero: dos líneas horizontales separadas por un rombo rotado 45° color `--primary`.
- **Footer con tres bloques** ("Modelo", "Autores", "Recursos") en grid. Los recursos son cuatro chips: Repo, HF Hub, Colab, Dataset.
- **Cursor parpadeante** después de los títulos con la clase `cursor-blink` (un guión bajo `_` que parpadea).
- **Selector con `>` como viñeta** en las listas (clase `pixel-list`), en vez del típico punto.

### Cómo se ve la app en una imagen (para el agente)

Para que el agente tenga una referencia visual, la app luce así:

- **Fondo general:** lavanda muy claro (`#ede9f5`).
- **Contenido principal:** tarjetas blancas con borde gris-lila, sombra dura morada-oscura, esquinas 100% rectas.
- **Acentos:** lila (`#8a79ab`) en títulos, iconos y elementos interactivos. Verde (`#77b8a1`) en resultados positivos. Rojo (`#d95c5c`) en resultados negativos.
- **Tipografía:** Press Start 2P para títulos cortos (sensación de videojuego 8-bit), VT323 para el resto (sensación de terminal retro).
- **Sensación general:** una consola de videojuegos de los 80-90 modernizada. No es "minimalista blanca", es "retro con cariño".

---

## Prompt sugerido para un agente de IA que genere las diapositivas

Si se quiere usar un agente (por ejemplo Gamma, Marp, Reveal.js o SlidesGPT) para convertir este guion en diapositivas reales, se le puede pasar algo como:

```
A partir del archivo slides.md (que está adjunto) genera una presentación
de 11 diapositivas en español, replicando la identidad visual de BanNano
documentada en la sección "Identidad visual de BanNano" del mismo archivo.

Reglas de estilo:
- Fondo de cada slide: #ede9f5 (lavanda claro).
- Títulos: tipografía pixel-art tipo "Press Start 2P", tamaño 36-44 pt,
  color #3d3c4f o #8a79ab.
- Cuerpo y viñetas: tipografía monoespaciada retro tipo "VT323", 20-24 pt,
  color #3d3c4f.
- Tarjetas o bloques de contenido: fondo blanco #ffffff, borde sólido
  2 px color #cec9d9, sombra dura sin difuminado 4 px 4 px color #3d3c4f,
  esquinas 100% rectas (border-radius 0).
- Acento principal: lila #8a79ab. Verde #77b8a1 para mensajes positivos,
  rojo #d95c5c para mensajes negativos.
- Logo: un banano pixel-art amarillo (#F2C84B) con borde cuadrado y sombra
  dura. Aparece en la portada y como marca de agua sutil al 10-15%.
- En la última diapositiva incluye el enlace https://ban-nano.vercel.app/
  y los nombres de los autores (Keyner Ramírez y Mary Hoyos).

Reglas de contenido:
- Cada diapositiva debe tener únicamente el título y los puntos en viñetas
  que aparecen en "Contenido" en el guion. No agregues texto que no esté
  en el guion.
- Mantén la duración total entre 5 y 7 minutos.
- Idioma: español.
```

Esto reduce el riesgo de que el agente "alucine" contenido que no escribimos y, sobre todo, fija con precisión los colores y la tipografía para que la presentación se vea como la app.
