import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { XpBar } from "@/components/ui/8bit-xp-bar"
import type { PredictionResult } from "@/types"
import { CLASS_LABELS } from "@/types"
import { getFruitLabel, formatConfidence, isRotten } from "@/lib/utils"
import { ShieldCheck, ShieldAlert, Microscope, Apple, Clock, Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface ResultCardProps {
  result: PredictionResult | null
  loading: boolean
  inferenceTimeMs?: number | null
}

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden bg-muted animate-pulse border border-[var(--border)]", className)}>
      <div className="absolute inset-0 bg-shimmer animate-shimmer" />
    </div>
  )
}

export function ResultCard({ result, loading, inferenceTimeMs }: ResultCardProps) {
  if (loading) {
    return (
      <Card className="border-2 border-[var(--border)] bg-card shadow-pixel-md">
        <CardContent className="flex flex-col items-center gap-6 py-12">
          <div className="border-2 border-[var(--border)] bg-card p-4 shadow-pixel-sm">
            <Microscope className="h-8 w-8 text-primary animate-pixel-spin" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-sm font-bold text-foreground font-pixel text-pixel-base">
              Analizando imagen...
            </p>
            <p className="text-xs text-muted-foreground font-mono">
              El modelo esta procesando tu fruta
            </p>
          </div>
          <div className="w-full max-w-xs space-y-2">
            <SkeletonBlock className="h-3 w-full" />
            <SkeletonBlock className="h-3 w-3/4" />
            <SkeletonBlock className="h-3 w-1/2" />
          </div>
          <div className="flex gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonBlock
                key={i}
                className="h-32 w-20"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!result) return null

  const rotten = isRotten(result.class_name)
  const fruitName = getFruitLabel(result.class_name)

  return (
    <Card className={cn(
      "border-2 shadow-pixel-md transition-all",
      rotten
        ? "border-[#d95c5c]/50 bg-[#d95c5c]/5"
        : "border-[#77b8a1]/50 bg-[#77b8a1]/5"
    )}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {rotten ? (
              <ShieldAlert className="h-5 w-5 text-[#d95c5c]" />
            ) : (
              <ShieldCheck className="h-5 w-5 text-[#77b8a1]" />
            )}
            <CardTitle className={cn(
              "font-pixel text-pixel-lg leading-relaxed",
              rotten ? "text-[#d95c5c]" : "text-[#77b8a1]"
            )}>
              {fruitName}
            </CardTitle>
          </div>
          <Badge 
            variant="outline" 
            className={cn(
              "text-[10px] font-bold font-mono border-2 shadow-pixel-sm",
              rotten 
                ? "border-[#d95c5c]/60 text-[#d95c5c] bg-[#d95c5c]/10" 
                : "border-[#77b8a1]/60 text-[#77b8a1] bg-[#77b8a1]/10"
            )}
          >
            {rotten ? "DANADA" : "SALUDABLE"}
          </Badge>
        </div>
        <CardDescription className="font-mono text-xs">
          {rotten
            ? "Se detecto descomposicion en la fruta"
            : "Fruta en buen estado"
          }
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Confianza con XP bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-bold text-muted-foreground uppercase tracking-wide text-[10px] font-pixel">
              Confianza del modelo
            </span>
            <span className={cn(
              "font-mono font-bold text-sm",
              rotten ? "text-[#d95c5c]" : "text-[#77b8a1]"
            )}>
              {formatConfidence(result.confidence)}
            </span>
          </div>
          <XpBar
            value={result.confidence * 100}
            levelUpMessage="MAX CONFIANZA!"
            barColor={rotten ? "bg-[#d95c5c]" : "bg-[#77b8a1]"}
          />
        </div>

        {/* Tiempo de inferencia */}
        {inferenceTimeMs != null && (
          <div className="flex items-center gap-2 border-2 border-[var(--border)] bg-muted p-2.5 shadow-pixel-sm">
            <Clock className="h-3.5 w-3.5 text-chart-4" />
            <span className="text-xs font-mono text-muted-foreground">
              Tiempo de inferencia:
            </span>
            <span className="text-xs font-bold font-mono text-foreground ml-auto">
              {(inferenceTimeMs / 1000).toFixed(2)}s
            </span>
          </div>
        )}

        {/* Top 3 predicciones */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-0.5 w-4 bg-primary/30" />
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide font-pixel">
              Top 3 predicciones
            </p>
          </div>
          {(() => {
            const sorted = result.all_probabilities
              .map((p, i) => ({ p, i }))
              .sort((a, b) => b.p - a.p)
              .slice(0, 3)
            return sorted.map(({ p, i }, rank) => {
              const label = CLASS_LABELS[i]
              const isTop = rank === 0
              return (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className={cn(
                    "w-5 font-mono text-right text-[10px] font-bold",
                    isTop ? "text-primary" : "text-muted-foreground"
                  )}>
                    {rank + 1}.
                  </span>
                  <span className={cn(
                    "flex-1 truncate font-bold",
                    isTop ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {getFruitLabel(label)}
                  </span>
                  <XpBar
                    value={p * 100}
                    barColor={
                      isTop
                        ? rotten
                          ? "bg-[#d95c5c]"
                          : "bg-[#77b8a1]"
                        : "bg-muted-foreground"
                    }
                    className="flex-1 h-2"
                  />
                  <span className="w-12 text-right font-mono text-muted-foreground text-[10px]">
                    {(p * 100).toFixed(1)}%
                  </span>
                </div>
              )
            })
          })()}
        </div>

        {/* Imagen original */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-0.5 w-4 bg-primary/30" />
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide font-pixel">
              Imagen original
            </p>
          </div>
          <div className="overflow-hidden border-2 border-[var(--border)] bg-muted shadow-pixel-sm">
            <img
              src={`data:image/jpeg;base64,${result.image_base64}`}
              alt="Original"
              className="w-full max-h-64 object-contain retro"
            />
          </div>
        </div>

        {/* Mapa de calor Grad-CAM (solo para Rotten) */}
        {result.heatmap_base64 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Apple className="h-3 w-3 text-chart-4" />
              <p className="text-[10px] font-bold text-chart-4 uppercase tracking-wide font-pixel">
                Zona de dano detectada - Grad-CAM
              </p>
            </div>
            <div className="overflow-hidden border-2 border-chart-4/30 shadow-pixel-sm">
              <img
                src={`data:image/jpeg;base64,${result.heatmap_base64}`}
                alt="Grad-CAM Heatmap"
                className="w-full max-h-64 object-contain bg-muted retro"
              />
            </div>
            {/* Explicacion educativa del Grad-CAM */}
            <div className="flex items-start gap-2 border-2 border-chart-4/20 bg-chart-4/5 p-3 shadow-pixel-sm">
              <Info className="h-3.5 w-3.5 text-chart-4 mt-0.5 shrink-0" />
              <p className="text-xs text-chart-4/80 font-mono leading-relaxed">
                <strong>Grad-CAM</strong> (Gradient-weighted Class Activation Mapping) es una tecnica de
                <strong> inteligencia artificial explicable (XAI)</strong> que resalta las regiones de la imagen
                que mas influyeron en la decision del modelo. Las zonas <strong>rojas y amarillas</strong> indican
                los pixeles que activaron la deteccion de descomposicion.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
