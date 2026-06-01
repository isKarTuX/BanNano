import { useState } from "react"
import { ThumbsUp, ThumbsDown, CheckCircle2, Send, RotateCcw, BarChart3, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CLASS_LABELS } from "@/types"
import { cn } from "@/lib/utils"

type FeedbackState = "voting" | "correcting" | "submitted"

interface FeedbackSectionProps {
  predictedClass: string
  onConfirmCorrect: () => Promise<void>
  onSubmitCorrection: (correctLabel: string) => Promise<void>
  disabled: boolean
  feedbackCount?: number
}

export function FeedbackSection({
  predictedClass,
  onConfirmCorrect,
  onSubmitCorrection,
  disabled,
  feedbackCount = 0,
}: FeedbackSectionProps) {
  const [state, setState] = useState<FeedbackState>("voting")
  const [selectedCorrection, setSelectedCorrection] = useState<string>("")
  const [error, setError] = useState<string | null>(null)

  async function handleConfirm() {
    setError(null)
    try {
      await onConfirmCorrect()
      setState("submitted")
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo enviar el feedback. Intenta de nuevo."
      )
    }
  }

  async function handleSubmitCorrection() {
    if (!selectedCorrection) return
    setError(null)
    try {
      await onSubmitCorrection(selectedCorrection)
      setState("submitted")
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo enviar la correccion. Intenta de nuevo."
      )
    }
  }

  function handleReset() {
    setState("voting")
    setSelectedCorrection("")
    setError(null)
  }

  return (
    <Card className="border-2 border-[var(--border)] bg-card shadow-pixel-md">
      <CardContent className="pt-6 space-y-4">
        {/* Error de envio */}
        {error && (
          <div className="border-2 border-destructive/40 bg-destructive/10 p-3 text-center shadow-pixel-sm animate-scale-in">
            <div className="flex items-center justify-center gap-2">
              <AlertCircle className="h-3.5 w-3.5 text-destructive shrink-0" />
              <p className="text-xs font-bold text-destructive font-mono">{error}</p>
            </div>
          </div>
        )}

        {state === "voting" && (
          <>
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <div className="h-0.5 w-8 bg-primary/30" />
                <p className="text-sm font-bold text-foreground font-pixel text-pixel-base">
                  Es correcto?
                </p>
                <div className="h-0.5 w-8 bg-primary/30" />
              </div>
              <p className="text-xs text-muted-foreground font-mono">
                Tu feedback ayuda a mejorar el modelo
              </p>
              {feedbackCount > 0 && (
                <div className="flex items-center justify-center gap-1.5">
                  <div className="inline-flex items-center gap-1.5 border-2 border-[var(--border)] bg-muted px-3 py-1.5 shadow-pixel-sm">
                    <BarChart3 className="h-3 w-3 text-chart-4" />
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {feedbackCount} correccion{feedbackCount !== 1 ? "es" : ""} enviada{feedbackCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Button
                variant="outline"
                size="lg"
                onClick={handleConfirm}
                disabled={disabled}
                className={cn(
                  "flex-1 sm:flex-initial sm:min-w-[140px] shadow-pixel-sm font-bold text-xs",
                  "border-2 border-[#77b8a1]/50 text-[#77b8a1]",
                  "hover:bg-[#77b8a1]/10 hover:text-[#77b8a1] hover:shadow-pixel-md",
                  "active:shadow-pixel-sm active:translate-x-[2px] active:translate-y-[2px]"
                )}
              >
                <ThumbsUp className="h-4 w-4" aria-hidden="true" />
                Si, correcto
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setState("correcting")}
                disabled={disabled}
                className={cn(
                  "flex-1 sm:flex-initial sm:min-w-[140px] shadow-pixel-sm font-bold text-xs",
                  "border-2 border-[#d95c5c]/50 text-[#d95c5c]",
                  "hover:bg-[#d95c5c]/10 hover:text-[#d95c5c] hover:shadow-pixel-md",
                  "active:shadow-pixel-sm active:translate-x-[2px] active:translate-y-[2px]"
                )}
              >
                <ThumbsDown className="h-4 w-4" aria-hidden="true" />
                No, corregir
              </Button>
            </div>
          </>
        )}

        {state === "correcting" && (
          <div className="space-y-4 animate-slide-up">
            <div className="flex items-center justify-center gap-2">
              <div className="h-0.5 w-8 bg-chart-4/30" />
              <p className="text-sm font-bold text-chart-4 text-center font-pixel text-pixel-base">
                Cual es la fruta correcta?
              </p>
              <div className="h-0.5 w-8 bg-chart-4/30" />
            </div>

            <Select
              value={selectedCorrection}
              onValueChange={setSelectedCorrection}
              disabled={disabled}
            >
              <SelectTrigger className="w-full border-2 border-[var(--border)] bg-card shadow-pixel-sm pixel-input font-mono text-sm">
                <SelectValue placeholder="Selecciona la fruta real..." />
              </SelectTrigger>
              <SelectContent className="max-h-72 border-2 border-[var(--border)] bg-card">
                <SelectGroup>
                  <div className="px-2 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-pixel">
                    Frescas
                  </div>
                  {CLASS_LABELS.filter((c) => c.startsWith("Fresh_")).map(
                    (label) => (
                      <SelectItem 
                        key={label} 
                        value={label}
                        className="text-xs font-mono cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <span className="h-2 w-2 bg-[#77b8a1] border border-[#77b8a1]/50 shadow-pixel-sm" />
                          {label.replace("Fresh_Fresh", "").replace("Fresh_", "")}
                          <span className="text-[10px] text-muted-foreground ml-1 uppercase">
                            - Fresca
                          </span>
                        </span>
                      </SelectItem>
                    )
                  )}
                </SelectGroup>
                <SelectGroup>
                  <div className="px-2 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-pixel">
                    Danadas
                  </div>
                  {CLASS_LABELS.filter((c) => c.startsWith("Rotten_")).map(
                    (label) => (
                      <SelectItem 
                        key={label} 
                        value={label}
                        className="text-xs font-mono cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <span className="h-2 w-2 bg-[#d95c5c] border border-[#d95c5c]/50 shadow-pixel-sm" />
                          {label.replace("Rotten_Rotten", "").replace("Rotten_", "")}
                          <span className="text-[10px] text-muted-foreground ml-1 uppercase">
                            - Danada
                          </span>
                        </span>
                      </SelectItem>
                    )
                  )}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Button
              className="w-full shadow-pixel-sm font-pixel text-xs py-5"
              size="lg"
              disabled={!selectedCorrection || disabled}
              onClick={handleSubmitCorrection}
            >
              <Send className="h-4 w-4" />
              Enviar correccion
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground hover:text-foreground font-mono text-xs"
              onClick={handleReset}
              disabled={disabled}
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Volver
            </Button>
          </div>
        )}

        {state === "submitted" && (
          <div className="flex flex-col items-center gap-3 py-4 animate-scale-in">
            <div className="border-2 border-[#77b8a1]/40 bg-[#77b8a1]/10 p-3 shadow-pixel-sm">
              <CheckCircle2 className="h-8 w-8 text-[#77b8a1]" />
            </div>
            <p className="text-sm font-bold text-foreground font-pixel text-pixel-base">
              Gracias!
            </p>
            <p className="text-xs text-muted-foreground text-center max-w-xs font-mono leading-relaxed">
              Tu feedback se envio correctamente y se usara para reentrenar el modelo
              y mejorar su precision.
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground font-mono text-xs mt-2"
              onClick={handleReset}
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Enviar otro feedback
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
