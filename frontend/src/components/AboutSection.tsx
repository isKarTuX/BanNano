import { useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { XpBar } from "@/components/ui/8bit-xp-bar"
import {
  Brain,
  Zap,
  Star,
  Info,
  ChevronDown,
  ChevronUp,
  Trophy,
  Gamepad2,
  Target,
  Database,
  Cpu,
  BarChart3,
  Rocket,
  AlertTriangle,
  Layers,
  Lightbulb,
  FlaskConical,
} from "lucide-react"
import { cn } from "@/lib/utils"

const TOP_FRUITS = [
  { name: "Banana", accuracy: 97, icon: "\uD83C\uDF4C" },
  { name: "Manzana", accuracy: 95, icon: "\uD83C\uDF4E" },
  { name: "Naranja", accuracy: 94, icon: "\uD83C\uDF4A" },
  { name: "Fresa", accuracy: 93, icon: "\uD83C\uDF53" },
  { name: "Tomate", accuracy: 92, icon: "\uD83C\uDF45" },
]

const CRISP_STEPS = [
  {
    title: "1. Comprension del Problema",
    icon: Target,
    color: "text-chart-1",
    content:
      "El desperdicio de alimentos es un problema global. En cadenas de produccion, supermercados y centros de acopio, la inspeccion manual de frutas es lenta, subjetiva y costosa. BanNano busca automatizar este proceso mediante vision por computadora, reduciendo perdidas y estandarizando el control de calidad.",
  },
  {
    title: "2. Comprension de los Datos",
    icon: Database,
    color: "text-chart-2",
    content:
      "Dataset de Kaggle con mas de 3,000 imagenes de 13 frutas/verduras en dos estados: frescas y danadas. Las imagenes presentan variabilidad en iluminacion, angulos y fondos. Se realizo EDA para identificar desbalance de clases y limpieza de etiquetas erroneas.",
  },
  {
    title: "3. Preparacion de Datos",
    icon: FlaskConical,
    color: "text-chart-3",
    content:
      "Redimensionamiento a 224x224, normalizacion con preprocess_input de EfficientNetV2, y data augmentation (rotaciones, flips, zoom, cambios de brillo). Se aplico oversampling selectivo en clases minoritarias para balancear el entrenamiento.",
  },
  {
    title: "4. Modelado",
    icon: Cpu,
    color: "text-chart-4",
    content:
      "Transfer Learning con EfficientNetV2-B0 preentrenado en ImageNet. Se congelaron las capas iniciales y se entreno un clasificador custom de 26 clases. Grad-CAM se implemento sobre el submodelo EfficientNet para generar mapas de calor explicativos.",
  },
  {
    title: "5. Evaluacion",
    icon: BarChart3,
    color: "text-chart-5",
    content:
      "Métricas: Accuracy ~94%, Precision ~93%, Recall ~92%, F1-score ~92%. La matriz de confusion revelo que algunos defectos de manzanas y naranjas son los mas dificiles de distinguir. El modelo generaliza bien ante variaciones de iluminacion.",
  },
  {
    title: "6. Despliegue",
    icon: Rocket,
    color: "text-primary",
    content:
      "Backend en FastAPI + Docker desplegado en Hugging Face Spaces. Frontend React + Vite + Tailwind con estetica retro 8-bit. PWA para instalacion en moviles. Webcam nativa en desktop y captura de camara/galeria en movil.",
  },
]

const METRICS = [
  { label: "Accuracy", value: 94, color: "bg-chart-1" },
  { label: "Precision", value: 93, color: "bg-chart-2" },
  { label: "Recall", value: 92, color: "bg-chart-3" },
  { label: "F1-Score", value: 92, color: "bg-chart-4" },
]

const LIMITATIONS = [
  "Dependencia de buena iluminacion para inferencia precisa.",
  "Frutas muy pequenas o parcialmente ocultas pueden confundirse.",
  "No distingue entre tipos especificos de defecto (solo fresca vs danada).",
  "El modelo fue entrenado con frutas aisladas, no en racimos o canastas.",
]

export function AboutSection() {
  const [expanded, setExpanded] = useState(false)

  return (
    <Card className="border-2 border-[var(--border)] bg-card shadow-pixel-md">
      <CardHeader
        className="cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-pixel text-pixel-base">
            <Gamepad2 className="h-4 w-4 text-primary" />
            Acerca de BanNano
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] font-mono border-2 border-[var(--border)] bg-muted shadow-pixel-sm hidden sm:inline-flex">
              <Info className="h-2.5 w-2.5 mr-1" />
              INFO
            </Badge>
            {expanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>
      </CardHeader>

      <div
        className={cn(
          "grid transition-all duration-300 ease-out",
          expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <CardContent className="space-y-8 pb-6">
            {/* Descripcion */}
            <p className="text-sm text-muted-foreground leading-relaxed font-mono">
              BanNano es un sistema de <strong>vision por computadora</strong> e <strong>inteligencia artificial</strong> disenado
              para inspeccionar la calidad de frutas y verduras en tiempo real. Utiliza un modelo
              <strong> EfficientNetV2</strong> con <strong>Grad-CAM</strong> para clasificar y explicar las predicciones,
              apoyando procesos de control de calidad en supermercados, plantas de empaque y cadenas de exportacion.
            </p>

            {/* CRISP-DM Steps */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Layers className="h-3.5 w-3.5 text-primary" />
                <p className="text-[10px] font-bold text-foreground uppercase tracking-wide font-pixel">
                  Metodologia CRISP-DM
                </p>
                <div className="h-0.5 flex-1 bg-primary/20" />
              </div>
              <div className="space-y-2">
                {CRISP_STEPS.map((step) => (
                  <div
                    key={step.title}
                    className="border-2 border-[var(--border)] bg-muted p-3 shadow-pixel-sm"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <step.icon className={cn("h-3.5 w-3.5 shrink-0", step.color)} />
                      <p className="text-xs font-bold font-pixel text-foreground">
                        {step.title}
                      </p>
                    </div>
                    <p className="text-[11px] text-muted-foreground font-mono leading-relaxed">
                      {step.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Clases", value: "26", sub: "13 frutas x 2 estados" },
                { label: "Modelo", value: "EfficientNetV2", sub: "Transfer Learning" },
                { label: "Dataset", value: "3,000+", sub: "Imagenes etiquetadas" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="border-2 border-[var(--border)] bg-muted p-3 text-center shadow-pixel-sm hover:shadow-pixel-md transition-all"
                >
                  <div className="text-lg font-bold font-mono text-primary leading-tight">
                    {stat.value}
                  </div>
                  <div className="text-[10px] font-bold text-muted-foreground uppercase font-pixel mt-1">
                    {stat.label}
                  </div>
                  <div className="text-[9px] text-muted-foreground mt-0.5 font-mono leading-tight">
                    {stat.sub}
                  </div>
                </div>
              ))}
            </div>

            {/* Métricas del modelo */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-3.5 w-3.5 text-chart-5" />
                <p className="text-[10px] font-bold text-foreground uppercase tracking-wide font-pixel">
                  Métricas del modelo
                </p>
                <div className="h-0.5 flex-1 bg-primary/20" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {METRICS.map((m) => (
                  <div key={m.label} className="border-2 border-[var(--border)] bg-muted p-2.5 shadow-pixel-sm space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold font-pixel text-muted-foreground">
                        {m.label}
                      </span>
                      <span className="text-xs font-bold font-mono text-foreground">
                        {m.value}%
                      </span>
                    </div>
                    <XpBar value={m.value} barColor={m.color} className="h-1.5" />
                  </div>
                ))}
              </div>
            </div>

            {/* Top Fruits */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Trophy className="h-3.5 w-3.5 text-chart-4" />
                <p className="text-[10px] font-bold text-foreground uppercase tracking-wide font-pixel">
                  Mejores predicciones por fruta
                </p>
                <div className="h-0.5 flex-1 bg-primary/20" />
              </div>
              <div className="space-y-2">
                {TOP_FRUITS.map((fruit) => (
                  <div key={fruit.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 font-bold text-foreground font-mono">
                        <span>{fruit.icon}</span>
                        {fruit.name}
                      </span>
                      <span className="font-mono text-chart-4 text-sm">
                        {fruit.accuracy}%
                      </span>
                    </div>
                    <XpBar value={fruit.accuracy} />
                  </div>
                ))}
              </div>
            </div>

            {/* Tecnologia */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Zap className="h-3.5 w-3.5 text-chart-2" />
                <p className="text-[10px] font-bold text-foreground uppercase tracking-wide font-pixel">
                  Tecnologia
                </p>
                <div className="h-0.5 flex-1 bg-primary/20" />
              </div>
              <div className="space-y-2 border-2 border-[var(--border)] bg-muted p-3 shadow-pixel-sm">
                <div className="flex items-start gap-2 text-xs">
                  <Brain className="h-3 w-3 mt-0.5 text-primary shrink-0" />
                  <div className="font-mono leading-relaxed">
                    <span className="font-bold text-foreground">EfficientNetV2</span>
                    <span className="text-muted-foreground">
                      {" "}- Red neuronal convolucional optimizada para clasificacion de imagenes con transfer learning desde ImageNet.
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-xs">
                  <Zap className="h-3 w-3 mt-0.5 text-chart-4 shrink-0" />
                  <div className="font-mono leading-relaxed">
                    <span className="font-bold text-foreground">Grad-CAM</span>
                    <span className="text-muted-foreground">
                      {" "}- Tecnica de visualizacion explicable (XAI) que resalta las zonas de la imagen que mas influyeron en la prediccion de descomposicion.
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-xs">
                  <Star className="h-3 w-3 mt-0.5 text-chart-2 shrink-0" />
                  <div className="font-mono leading-relaxed">
                    <span className="font-bold text-foreground">Feedback Loop</span>
                    <span className="text-muted-foreground">
                      {" "}- Las correcciones de los usuarios se almacenan en un dataset de Hugging Face para reentrenamiento continuo y mejora de precision.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Limitaciones */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                <p className="text-[10px] font-bold text-foreground uppercase tracking-wide font-pixel">
                  Limitaciones y reflexion critica
                </p>
                <div className="h-0.5 flex-1 bg-primary/20" />
              </div>
              <div className="border-2 border-destructive/20 bg-destructive/5 p-3 shadow-pixel-sm space-y-2">
                {LIMITATIONS.map((limitation, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <Lightbulb className="h-3 w-3 mt-0.5 text-destructive shrink-0" />
                    <p className="font-mono text-muted-foreground leading-relaxed">
                      {limitation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  )
}
