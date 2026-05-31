import { useState } from "react"
import { ThumbsUp, ThumbsDown, CheckCircle2, Send } from "lucide-react"
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

type FeedbackState = "idle" | "voting" | "correcting" | "submitted"

interface FeedbackSectionProps {
  predictedClass: string
  onConfirmCorrect: () => void
  onSubmitCorrection: (correctLabel: string) => void
  disabled: boolean
}

export function FeedbackSection({
  predictedClass,
  onConfirmCorrect,
  onSubmitCorrection,
  disabled,
}: FeedbackSectionProps) {
  const [state, setState] = useState<FeedbackState>("voting")
  const [selectedCorrection, setSelectedCorrection] = useState<string>("")

  return (
    <Card className="border-slate-700 bg-slate-900/30">
      <CardContent className="pt-6 space-y-4">
        {state === "voting" && (
          <>
            <p className="text-sm text-slate-300 text-center font-medium">
              ¿Es correcto el diagnóstico?
            </p>
            <div className="flex justify-center gap-3">
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  onConfirmCorrect()
                  setState("submitted")
                }}
                disabled={disabled}
                className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-950/30 hover:text-emerald-300 min-w-[120px]"
              >
                <ThumbsUp className="h-4 w-4" />
                Sí
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setState("correcting")}
                disabled={disabled}
                className="border-red-500/30 text-red-400 hover:bg-red-950/30 hover:text-red-300 min-w-[120px]"
              >
                <ThumbsDown className="h-4 w-4" />
                No
              </Button>
            </div>
          </>
        )}

        {state === "correcting" && (
          <div className="space-y-3">
            <p className="text-sm text-amber-400 font-medium text-center">
              ¿Cuál es la fruta correcta?
            </p>

            <Select
              value={selectedCorrection}
              onValueChange={setSelectedCorrection}
              disabled={disabled}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona la fruta real..." />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                <SelectGroup>
                  {CLASS_LABELS.filter((c) => c.startsWith("Fresh_")).map(
                    (label) => (
                      <SelectItem key={label} value={label}>
                        <span className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-emerald-400" />
                          {label.replace("Fresh_", "")}
                          <span className="text-xs text-muted-foreground ml-1">
                            — Fresca
                          </span>
                        </span>
                      </SelectItem>
                    )
                  )}
                </SelectGroup>
                <SelectGroup>
                  {CLASS_LABELS.filter((c) => c.startsWith("Rotten_")).map(
                    (label) => (
                      <SelectItem key={label} value={label}>
                        <span className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-red-400" />
                          {label.replace("Rotten_", "")}
                          <span className="text-xs text-muted-foreground ml-1">
                            — Dañada
                          </span>
                        </span>
                      </SelectItem>
                    )
                  )}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Button
              className="w-full"
              size="lg"
              disabled={!selectedCorrection || disabled}
              onClick={() => {
                onSubmitCorrection(selectedCorrection)
                setState("submitted")
              }}
            >
              <Send className="h-4 w-4" />
              Enviar corrección
            </Button>
          </div>
        )}

        {state === "submitted" && (
          <div className="flex flex-col items-center gap-2 py-4 text-emerald-400">
            <CheckCircle2 className="h-10 w-10" />
            <p className="text-sm font-medium">
              ¡Gracias por ayudarnos a mejorar!
            </p>
            <p className="text-xs text-slate-500">
              Tu feedback se usará para reentrenar el modelo.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
