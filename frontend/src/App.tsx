import { useState, useCallback, useRef } from "react"
import { Apple, Brain, Database, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ImageUploader } from "@/components/ImageUploader"
import { ResultCard } from "@/components/ResultCard"
import { FeedbackSection } from "@/components/FeedbackSection"
import { predictFruit, submitFeedback } from "@/api"
import type { PredictionResult } from "@/types"

type AppState = "idle" | "uploading" | "loading" | "result"

export default function App() {
  const [appState, setAppState] = useState<AppState>("idle")
  const [result, setResult] = useState<PredictionResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [feedbackLoading, setFeedbackLoading] = useState(false)
  const selectedFileRef = useRef<File | null>(null)

  const handleImageSelect = useCallback((file: File) => {
    selectedFileRef.current = file
    setAppState("uploading")
  }, [])

  const handleAnalyze = useCallback(async () => {
    const file = selectedFileRef.current
    if (!file) return

    setAppState("loading")
    setError(null)
    setResult(null)

    try {
      const data = await predictFruit(file)
      setResult(data)
      setAppState("result")
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error desconocido al analizar"
      )
      setAppState("uploading")
    }
  }, [])

  const handleConfirmCorrect = useCallback(async () => {
    if (!result || !selectedFileRef.current) return
    setFeedbackLoading(true)
    try {
      await submitFeedback(selectedFileRef.current, result.class_name)
    } catch {
      // Silently fail on feedback errors to not disrupt UX
    } finally {
      setFeedbackLoading(false)
    }
  }, [result])

  const handleCorrection = useCallback(
    async (correctLabel: string) => {
      if (!selectedFileRef.current) return
      setFeedbackLoading(true)
      try {
        await submitFeedback(selectedFileRef.current, correctLabel)
      } catch {
        // Silently fail
      } finally {
        setFeedbackLoading(false)
      }
    },
    []
  )

  const handleReset = useCallback(() => {
    setAppState("idle")
    setResult(null)
    setError(null)
    selectedFileRef.current = null
  }, [])

  return (
    <div className="min-h-dvh flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-emerald-500/20 p-1.5">
              <Apple className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight">FruitScan</h1>
              <p className="text-[10px] text-slate-500">IA · Calidad</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-[10px]">
            v1.0 Beta
          </Badge>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 mx-auto w-full max-w-lg px-4 py-6 space-y-6">
        {/* Error */}
        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-950/20 p-4">
            <p className="text-sm text-red-400">{error}</p>
            <Button
              variant="link"
              size="sm"
              className="mt-1 h-auto p-0 text-red-400"
              onClick={() => setError(null)}
            >
              Descartar
            </Button>
          </div>
        )}

        {/* Upload Section */}
        {(appState === "idle" || appState === "uploading") && (
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <div className="inline-flex rounded-full bg-slate-800 p-3 mb-2">
                <Camera className="h-6 w-6 text-emerald-400" />
              </div>
              <h2 className="text-lg font-semibold">
                Escanea una fruta
              </h2>
              <p className="text-sm text-slate-400">
                Toma una foto para verificar su calidad
              </p>
            </div>

            <ImageUploader
              onImageSelect={handleImageSelect}
              disabled={appState === "loading"}
            />

            {appState === "uploading" && (
              <Button size="lg" className="w-full" onClick={handleAnalyze}>
                <Brain className="h-4 w-4" />
                Analizar fruta
              </Button>
            )}
          </div>
        )}

        {/* Loading */}
        {appState === "loading" && <ResultCard result={null} loading={true} />}

        {/* Result */}
        {appState === "result" && result && (
          <div className="space-y-4">
            <ResultCard result={result} loading={false} />

            <FeedbackSection
              predictedClass={result.class_name}
              onConfirmCorrect={handleConfirmCorrect}
              onSubmitCorrection={handleCorrection}
              disabled={feedbackLoading}
            />

            <Button
              variant="outline"
              className="w-full"
              onClick={handleReset}
              disabled={feedbackLoading}
            >
              Analizar otra fruta
            </Button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-4">
        <div className="mx-auto max-w-lg px-4 flex items-center justify-center gap-4 text-[10px] text-slate-600">
          <span className="flex items-center gap-1">
            <Brain className="h-3 w-3" />
            TensorFlow + Grad-CAM
          </span>
          <span className="flex items-center gap-1">
            <Database className="h-3 w-3" />
            Hugging Face Datasets
          </span>
        </div>
      </footer>
    </div>
  )
}
