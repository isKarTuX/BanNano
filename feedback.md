# Co-evaluación y mejoras aplicadas

> Este documento recoge la **co-evaluación** que recibimos de otros equipos durante la Fase 5 del proyecto, más las **mejoras concretas** que el equipo de BanNano aplicó (o decidió no aplicar, con su justificación) a partir de esos comentarios.
>
> La co-evaluación consistió en probar la aplicación desplegada en https://ban-nano.vercel.app/ con imágenes propias, registrar los aciertos y los errores, y dejar un feedback escrito. A continuación se consolida lo más relevante.

---

## 1. Contexto de la evaluación

- **Equipos evaluadores:** dos equipos compañeros de la asignatura (identificados como *Equipo A* y *Equipo B* para preservar el anonimato, según las indicaciones del profesor).
- **Fecha:** durante la última semana de la fase 5.
- **Qué probaron:** la aplicación web desplegada en Vercel, principalmente el flujo de subir una imagen y obtener la predicción, y en algunos casos el envío de feedback.
- **Imágenes usadas:** fotos propias tomadas con celulares, descargadas de bancos de imágenes libres, y unas pocas imágenes de la galería de sus propios proyectos.

---

## 2. Lo que los evaluadores resaltaron como positivo

| Aspecto | Comentario textual resumido |
|---|---|
| **Demostración en vivo** | "La app abre rápido y la interfaz es intuitiva, incluso para alguien que no la ha visto antes." |
| **Mapa de calor** | "El Grad-CAM sobre la imagen fue lo que más me gustó. Se entiende perfectamente por qué el modelo clasificó la fruta como dañada." |
| **Traducción al español** | "Ver la etiqueta en español, con color verde para fresca y rojo para podrida, es un detalle muy útil." |
| **Historial local** | "Me parece muy bueno que se guarde el historial en el navegador, podemos revisar las predicciones anteriores." |
| **Documentación** | "El README y los documentos de soporte están muy completos. Se nota que le dedicaron tiempo." |

---

## 3. Problemas detectados en la co-evaluación

> Esta es la parte más útil del ejercicio. Anotamos cada problema con un ejemplo concreto, no como crítica, sino como insumo para mejorar.

### 3.1 Errores del modelo en imágenes reales

Los evaluadores identificaron tres tipos principales de error. Para ser precisos con la terminología, adoptamos la convención usada en el documento de preguntas frecuentes del proyecto:

- **Falso positivo (falsa alarma):** el modelo dice *podrida* cuando la fruta está *fresca*.
- **Falso negativo (falsa aceptación):** el modelo dice *fresca* cuando la fruta está *podrida*. Este es el error más grave en un contexto real de control de calidad, porque una fruta dañada pasaría como apta para el consumidor.

#### a) Falsos positivos: frutas frescas marcadas como podridas

Este fue el error más reportado por ambos equipos. Casos concretos:

- Un **banano** con manchas marrones pequeñas típicas de la maduración natural fue clasificado como `Rotten_RottenBanana` con una confianza del 78%. Para un humano es claramente un banano maduro pero fresco.
- Una **manzana** con un golpe lateral (magulladura, no pudrición) salió como `Rotten_RottenApple` con 71%. El golpe no es putrefacción, pero el modelo no distingue.
- Un **tomate** con un color anaranjado irregular y una pequeña grieta superficial, que estaba perfectamente sano por dentro, fue clasificado como `Rotten_RottenTomato` con 64%.
- Una **naranja** con la cáscara ligeramente rugosa (variedad normal) salió como podrida con 58%.

> **Interpretación honesta:** estos errores se deben a que el dataset público usado para entrenar el modelo solo tiene dos estados por fruta y los anotadores del dataset parecen haber incluido dentro de la clase *podrida* cualquier fruta que se vea "rara", incluyendo golpes, manchas de sol o simplemente madurez avanzada. El modelo aprendió esa definición amplia de "podrido" y la aplica en producción.

#### b) Falsos negativos: frutas podridas clasificadas como frescas

Menos frecuentes, pero más preocupantes:

- Una **fresa** claramente con moho blanco en un costado fue clasificada como `Fresh_FreshStrawberry` con 52% (apenas por encima del azar). El área de moho ocupaba una porción pequeña de la imagen.
- Un **pimentón** con una zona blanda y oscurecida en la base salió como fresco con 67%.

> **Interpretación honesta:** el modelo se equivoca más en frutas podridas cuando la zona dañada es pequeña, está en un borde de la imagen o tiene un color similar al fondo. Esto es consistente con lo observado en la matriz de confusión del entrenamiento: las clases con menor recall eran justamente las que tenían mayor variabilidad interna.

#### c) Confusiones entre frutas visualmente similares

- Manzana roja vs. **naranja sanguina** o tomate rojo maduro: en imágenes con fondo blanco, los tres se confunden.
- Pimentón rojo vs. **tomate rojo** pequeño: se observaron al menos dos intercambios.
- Mango vs. **melón amargo** en fotos de baja resolución.

### 3.2 Problemas de experiencia de uso

- **Tiempo de la primera carga.** La primera vez que se abre la app, la primera inferencia tarda entre 6 y 9 segundos (el modelo se está descargando desde Hugging Face). Los evaluadores sugirieron mostrar un mensaje más explícito de "cargando modelo" la primera vez.
- **Sin vista previa antes de subir.** En celular, la imagen seleccionada aparece en miniatura pero no se puede ampliar para confirmar que es la foto correcta antes de analizar.
- **El feedback loop se siente "abrupto".** Cuando el usuario presiona "No, corregir", aparece un selector con las 26 clases en inglés (etiquetas internas del modelo), lo cual puede confundir a quien no sabe los nombres técnicos.
- **El historial solo guarda en el navegador.** Un evaluador limpió la caché y perdió todas las predicciones. Sugirió permitir exportar el historial.

### 3.3 Problemas técnicos y de despliegue

- **CORS abierto en el backend.** En la configuración actual el backend acepta peticiones desde cualquier origen. Para un proyecto académico está bien, pero se reconoció como deuda técnica.
- **Sin rate limiting.** Un evaluador subió 30 imágenes en menos de un minuto y la app siguió respondiendo, pero esto podría ser un problema en producción.
- **El modelo no es perfecto con frutas ocluidas.** Fotos con la mano sosteniendo la fruta, o con varias frutas juntas, bajan mucho la confianza.

---

## 4. Recomendaciones de los evaluadores

Síntesis de las recomendaciones más repetidas:

1. **Mostrar un mensaje explícito** durante la primera carga del modelo, indicando que es un proceso de una sola vez.
2. **Traducir también el selector de corrección** al español, o mostrar nombre de la fruta en español con la etiqueta técnica entre paréntesis.
3. **Documentar en la UI** los casos en los que el modelo suele fallar, para que el usuario no confíe ciegamente en él.
4. **Añadir un botón para exportar el historial** como archivo CSV o JSON.
5. **Marcar visualmente** cuando la confianza está por debajo de un umbral (por ejemplo, menor a 70%) para que el usuario sepa que debe tomar el resultado con cautela.

---

## 5. Mejoras aplicadas por el equipo

A partir de la co-evaluación, decidimos cuáles sugerencias incorporar antes de la entrega final y cuáles dejar para una versión futura. El criterio fue: si la mejora se podía hacer en pocas horas y agregaba valor real al producto, se incorporaba; si requería un reentrenamiento o un cambio grande de arquitectura, se documentaba como trabajo futuro.

### 5.1 Mejoras incorporadas (o en proceso)

| Mejora | Estado | Detalle |
|---|---|---|
| Aviso explícito de primera carga del modelo | Documentado para siguiente iteración | Se reconoció como importante, pero requiere ajustar la lógica del frontend para detectar el primer request. Se priorizó para una versión 2. |
| Sección "Limitaciones" visible en la app | **Hecho** | La sección "Acerca de" del frontend ya incluye una subsección de limitaciones que menciona explícitamente los falsos positivos en frutas con golpes o manchas, y los falsos negativos en frutas con daño pequeño. |
| Mensaje de "confianza baja" cuando aplica | **Hecho** | Cuando la confianza está por debajo del 70%, la tarjeta de resultado muestra un aviso adicional: "Confianza baja. Se recomienda verificar manualmente." |
| Mejorar el selector de feedback | **Hecho** | El selector de corrección ahora muestra el nombre de la fruta en español, con la etiqueta técnica en inglés entre paréntesis y en tamaño más pequeño. |
| Exportar el historial | Documentado para siguiente iteración | Se evaluó la complejidad y se decidió que requiere un refactor del hook `usePredictionHistory`. Se priorizó para después de la entrega. |
| Documentar honestamente los errores en el README | **Hecho** | La sección de **Limitaciones** del README incluye ejemplos concretos de falsos positivos y falsos negativos, y aclara que el modelo aprendió una definición amplia de "podrido" del dataset público. |
| CORS restringido a los orígenes necesarios | Documentado para siguiente iteración | El backend sigue con CORS abierto por simplicidad académica, pero la sección de limitaciones lo menciona como deuda técnica a corregir en una versión productiva. |

### 5.2 Mejoras que se decidieron dejar como trabajo futuro

- **Reentrenamiento con dataset que distinga tipos de daño.** Requiere conseguir o etiquetar un dataset multi-clase, lo cual excede el alcance del proyecto. Se documenta en el README y en la presentación.
- **Automatizar el reentrenamiento a partir del feedback.** Se mantuvo el ciclo manual porque, en este momento del proyecto, las correcciones acumuladas no son suficientes para justificar un reentrenamiento y no hay infraestructura de MLOps configurada.
- **Comparación A/B con otras arquitecturas (ResNet, MobileNet, etc.).** Por tiempo, no se hizo.
- **Versión móvil con el modelo `.tflite`.** El modelo está exportado pero no desplegado en producción. Sería un siguiente paso natural.

---

## 6. Reflexión final del equipo

> La co-evaluación fue útil porque nos obligó a mirar el sistema desde los ojos de alguien que lo ve por primera vez. Los errores que ellos detectaron, sobre todo los falsos positivos en frutas con golpes o manchas de maduración, son exactamente los que ya habíamos visto en la matriz de confusión, pero que habíamos subestimado a la hora de comunicar el desempeño del modelo. Aprendimos que decir "94% de accuracy" sin contexto es engañoso: en el contexto real, ese 6% restante incluye casos donde el sistema descarta fruta buena o aprueba fruta mala, y eso tiene impacto económico y sanitario.
>
> Incorporamos las mejoras que pudimos en el tiempo disponible y dejamos las demás claramente documentadas como trabajo futuro, en línea con el principio de ser honestos sobre lo que sí está hecho y lo que todavía no.

---

## 7. Quiénes aportaron feedback

- Equipo A (co-evaluadores, asignatura Aprendizaje Computacional, Universidad de Córdoba).
- Equipo B (co-evaluadores, asignatura Aprendizaje Computacional, Universidad de Córdoba).

A ambos, gracias por el tiempo y la honestidad de sus comentarios.
