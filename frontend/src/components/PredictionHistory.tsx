import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { XpBar } from "@/components/ui/8bit-xp-bar"
import { Button } from "@/components/ui/button"
import { getFruitLabel, isRotten } from "@/lib/utils"
import { cn } from "@/lib/utils"
import {
  History,
  Trash2,
  ChevronDown,
  ChevronUp,
  Clock,
  ShieldCheck,
  ShieldAlert,
  BarChart3,
} from "lucide-react"
import type { HistoryEntry } from "@/hooks/usePredictionHistory"

interface PredictionHistoryProps {
  history: HistoryEntry[]
  stats: {
    total: number
    fresh: number
    rotten: number
    avgConfidence: number
    avgInferenceTime: number
  }
  onClear: () => void
}

export function PredictionHistory({ history, stats, onClear }: PredictionHistoryProps) {
  const [expanded, setExpanded] = useState(false)

  if (history.length === 0) return null

  const formatDate = (ts: number) =>
    new Intl.DateTimeFormat("es", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(ts))

  return (
    <Card className="border-2 border-[var(--border)] bg-card shadow-pixel-md">
      <CardHeader
        className="cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-pixel text-pixel-base">
            <History className="h-4 w-4 text-primary" />
            Historial de analisis
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-muted-foreground">
              {stats.total} registro{stats.total !== 1 ? "s" : ""}
            </span>
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
          <CardContent className="space-y-5 pb-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="border-2 border-[var(--border)] bg-muted p-2.5 text-center shadow-pixel-sm">
                <div className="text-base font-bold font-mono text-primary">
                  {stats.total}
                </div>
                <div className="text-[9px] font-bold text-muted-foreground uppercase font-pixel mt-0.5">
                  Total
                </div>
              </div>
              <div className="border-2 border-[var(--border)] bg-muted p-2.5 text-center shadow-pixel-sm">
                <div className="text-base font-bold font-mono text-[#77b8a1]">
                  {stats.fresh}
                </div>
                <div className="text-[9px] font-bold text-muted-foreground uppercase font-pixel mt-0.5">
                  Sanas
                </div>
              </div>
              <div className="border-2 border-[var(--border)] bg-muted p-2.5 text-center shadow-pixel-sm">
                <div className="text-base font-bold font-mono text-[#d95c5c]">
                  {stats.rotten}
                </div>
                <div className="text-[9px] font-bold text-muted-foreground uppercase font-pixel mt-0.5">
                  Danadas
                </div>
              </div>
              <div className="border-2 border-[var(--border)] bg-muted p-2.5 text-center shadow-pixel-sm">
                <div className="text-base font-bold font-mono text-chart-4">
                  {(stats.avgConfidence * 100).toFixed(0)}%
                </div>
                <div className="text-[9px] font-bold text-muted-foreground uppercase font-pixel mt-0.5">
                  Conf. promedio
                </div>
              </div>
            </div>

            {/* Promedio de tiempo de inferencia */}
            {stats.avgInferenceTime > 0 && (
              <div className="flex items-center gap-2 border-2 border-[var(--border)] bg-muted p-2.5 shadow-pixel-sm">
                <Clock className="h-3.5 w-3.5 text-chart-3" />
                <span className="text-xs font-mono text-muted-foreground">
                  Tiempo promedio de inferencia:
                </span>
                <span className="text-xs font-bold font-mono text-foreground ml-auto">
                  {(stats.avgInferenceTime / 1000).toFixed(2)}s
                </span>
              </div>
            )}

            {/* Lista de entradas */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {history.map((entry) => {
                const rotten = !entry.isFresh
                return (
                  <div
                    key={entry.id}
                    className={cn(
                      "flex items-center gap-3 border-2 p-2.5 shadow-pixel-sm transition-all",
                      rotten
                        ? "border-[#d95c5c]/30 bg-[#d95c5c]/5"
                        : "border-[#77b8a1]/30 bg-[#77b8a1]/5"
                    )}
                  >
                    {rotten ? (
                      <ShieldAlert className="h-4 w-4 text-[#d95c5c] shrink-0" />
                    ) : (
                      <ShieldCheck className="h-4 w-4 text-[#77b8a1] shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate font-mono">
                        {getFruitLabel(entry.className)}
                      </p>
                      <p className="text-[9px] text-muted-foreground font-mono">
                        {formatDate(entry.timestamp)}
                      </p>
                    </div>
                    <div className="w-16">
                      <XpBar
                        value={entry.confidence * 100}
                        barColor={rotten ? "bg-[#d95c5c]" : "bg-[#77b8a1]"}
                        className="h-1.5"
                      />
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground w-10 text-right">
                      {(entry.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                )
              })}
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground hover:text-destructive font-mono text-xs"
              onClick={onClear}
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Limpiar historial
            </Button>
          </CardContent>
        </div>
      </div>
    </Card>
  )
}
