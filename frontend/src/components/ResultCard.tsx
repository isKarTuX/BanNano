import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { PredictionResult } from "@/types"
import { CLASS_LABELS } from "@/types"
import { getFruitLabel, formatConfidence, isRotten } from "@/lib/utils"
import { Apple, ShieldCheck, ShieldAlert, Microscope } from "lucide-react"

interface ResultCardProps {
  result: PredictionResult | null
  loading: boolean
}

export function ResultCard({ result, loading }: ResultCardProps) {
  if (loading) {
    return (
      <Card className="border-slate-700 bg-slate-900/50 animate-pulse">
        <CardContent className="flex flex-col items-center gap-4 py-12">
          <div className="rounded-full bg-slate-800 p-4">
            <Microscope className="h-8 w-8 text-slate-500 animate-spin" />
          </div>
          <p className="text-sm text-slate-400">Analizando imagen...</p>
          <div className="h-2 w-48 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full w-1/2 rounded-full bg-shimmer animate-shimmer" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!result) return null

  const rotten = isRotten(result.class_name)
  const fruitName = getFruitLabel(result.class_name)

  return (
    <Card
      className={`border-2 transition-all ${
        rotten
          ? "border-red-500/30 bg-red-950/10"
          : "border-emerald-500/30 bg-emerald-950/10"
      }`}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {rotten ? (
              <ShieldAlert className="h-5 w-5 text-red-400" />
            ) : (
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
            )}
            <CardTitle
              className={rotten ? "text-red-400" : "text-emerald-400"}
            >
              {fruitName}
            </CardTitle>
          </div>
          <Badge variant={rotten ? "destructive" : "success"}>
            {rotten ? "Dañado" : "Saludable"}
          </Badge>
        </div>
        <CardDescription>
          {rotten ? "Se detectó descomposición" : "Fruta en buen estado"}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Confianza</span>
            <span
              className={`font-mono font-semibold ${
                rotten ? "text-red-400" : "text-emerald-400"
              }`}
            >
              {formatConfidence(result.confidence)}
            </span>
          </div>
          <Progress
            value={result.confidence * 100}
            indicatorClassName={
              rotten ? "bg-red-500" : "bg-emerald-500"
            }
          />
        </div>

        {/* Top 3 */}
        <div className="space-y-1.5">
          <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">
            Top 3 predicciones
          </p>
          {(() => {
            const sorted = result.all_probabilities
              .map((p, i) => ({ p, i }))
              .sort((a, b) => b.p - a.p)
              .slice(0, 3)
            return sorted.map(({ p, i }, rank) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className="w-4 text-slate-600 font-mono text-right">
                  {rank + 1}.
                </span>
                <span className="flex-1 truncate text-slate-300">
                  {getFruitLabel(CLASS_LABELS[i])}
                </span>
                <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      rank === 0
                        ? rotten
                          ? "bg-red-500"
                          : "bg-emerald-500"
                        : "bg-slate-600"
                    }`}
                    style={{ width: `${(p * 100).toFixed(0)}%` }}
                  />
                </div>
                <span className="w-12 text-right font-mono text-slate-400">
                  {(p * 100).toFixed(1)}%
                </span>
              </div>
            ))
          })()}
        </div>

        {/* Imagen original */}
        <div className="space-y-2">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
            Imagen original
          </p>
          <div className="overflow-hidden rounded-lg border border-slate-700">
            <img
              src={`data:image/jpeg;base64,${result.image_base64}`}
              alt="Original"
              className="w-full max-h-64 object-contain bg-slate-900"
            />
          </div>
        </div>

        {/* Mapa de calor Grad-CAM (solo para Rotten) */}
        {result.heatmap_base64 && (
          <div className="space-y-2">
            <p className="text-xs text-amber-500 font-medium uppercase tracking-wide flex items-center gap-1.5">
              <Apple className="h-3 w-3" />
              Zona de daño detectada — Grad-CAM
            </p>
            <div className="overflow-hidden rounded-lg border-2 border-amber-500/30">
              <img
                src={`data:image/jpeg;base64,${result.heatmap_base64}`}
                alt="Grad-CAM Heatmap"
                className="w-full max-h-64 object-contain bg-slate-900"
              />
            </div>
            <p className="text-xs text-amber-600/70">
              Las zonas rojas/amarillas indican las regiones que activaron la
              detección de descomposición.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
