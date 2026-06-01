import { useState, useCallback, useRef } from "react"
import { Brain, Database, Github, Sparkles, ExternalLink, Heart, Code2, FolderOpen, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ImageUploader } from "@/components/ImageUploader"
import { ResultCard } from "@/components/ResultCard"
import { FeedbackSection } from "@/components/FeedbackSection"
import { AboutSection } from "@/components/AboutSection"
import { PredictionHistory } from "@/components/PredictionHistory"
import { ThemeToggle } from "@/components/ThemeToggle"
import SecretPage from "@/components/SecretPage"
import { predictFruit, submitFeedback } from "@/api"
import { usePredictionHistory } from "@/hooks/usePredictionHistory"
import { useEasterEgg } from "@/hooks/useEasterEgg"
import type { PredictionResult } from "@/types"

type AppState = "idle" | "uploading" | "loading" | "result"

export default function App() {
  const [appState, setAppState] = useState<AppState>("idle")
  const [result, setResult] = useState<PredictionResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [feedbackLoading, setFeedbackLoading] = useState(false)
  const [inferenceTime, setInferenceTime] = useState<number | null>(null)
  const [feedbackCount, setFeedbackCount] = useState(() => {
    try {
      return parseInt(localStorage.getItem("bannano-feedback-count") || "0", 10)
    } catch { return 0 }
  })
  const [showSecret, setShowSecret] = useState(false)
  const [showUwu, setShowUwu] = useState(false)
  const [resetKey, setResetKey] = useState(0)
  const selectedFileRef = useRef<File | null>(null)

  const { handleKeynerClick, handleMaryClick, handleMykClick } = useEasterEgg(
    () => setShowSecret(true),
    () => setShowUwu(true)
  )

  const { history, addEntry, clearHistory, stats } = usePredictionHistory()

  const handleImageSelect = useCallback((file: File) => {
    selectedFileRef.current = file
    setError(null)
    setInferenceTime(null)
    setAppState("uploading")
  }, [])

  const handleImageClear = useCallback(() => {
    selectedFileRef.current = null
    setAppState("idle")
    setError(null)
    setInferenceTime(null)
  }, [])

  const handleAnalyze = useCallback(async () => {
    const file = selectedFileRef.current
    if (!file) return

    setAppState("loading")
    setError(null)
    setResult(null)
    setInferenceTime(null)

    const startTime = performance.now()

    try {
      const data = await predictFruit(file)
      const elapsed = Math.round(performance.now() - startTime)
      setInferenceTime(elapsed)
      setResult(data)
      addEntry(data, elapsed)
      setAppState("result")
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error desconocido al analizar"
      )
      setAppState("uploading")
    }
  }, [addEntry])

  const handleConfirmCorrect = useCallback(async () => {
    if (!result || !selectedFileRef.current) return
    setFeedbackLoading(true)
    try {
      await submitFeedback(selectedFileRef.current, result.class_name)
      setFeedbackCount((prev) => {
        const next = prev + 1
        localStorage.setItem("bannano-feedback-count", String(next))
        return next
      })
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
        setFeedbackCount((prev) => {
          const next = prev + 1
          localStorage.setItem("bannano-feedback-count", String(next))
          return next
        })
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
    setInferenceTime(null)
    selectedFileRef.current = null
    setResetKey((k) => k + 1)
  }, [])

  if (showSecret) {
    return <SecretPage onBack={() => setShowSecret(false)} />
  }

  return (
    <div className="min-h-dvh flex flex-col bg-background text-foreground">
      {/* UWU Easter Egg Overlay */}
      {showUwu && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in cursor-pointer"
          onClick={() => setShowUwu(false)}
        >
          <div className="text-center animate-bounce-in">
            <h1 className="text-6xl md:text-9xl font-bold font-pixel text-pink-400 text-shadow-sm animate-pulse-glow select-none">
              UWU
            </h1>
            <p className="mt-4 text-sm text-muted-foreground font-mono animate-pulse">
              Click para cerrar...
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-20 border-b-2 border-[var(--border)] bg-card/95 backdrop-blur-sm shadow-pixel-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="border-2 border-[var(--border)] bg-muted p-1.5 shadow-pixel-sm">
              <img
                src="/banano-icon.svg"
                alt="BanNano"
                className="h-7 w-7 retro"
              />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight font-pixel leading-relaxed">
                BanNano
              </h1>
              <p className="text-[10px] text-muted-foreground font-mono tracking-widest uppercase">
                IA . CALIDAD . FRUTAS
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-[10px] font-mono border-2 border-[var(--border)] bg-muted shadow-pixel-sm hidden sm:inline-flex">
              <Heart className="h-2.5 w-2.5 mr-1 text-chart-2" />
              by MyK
            </Badge>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-6 md:py-10 space-y-8">
        {/* Error */}
        {error && (
          <div className="max-w-2xl mx-auto animate-scale-in">
            <div className="border-2 border-destructive/40 bg-destructive/10 p-4 shadow-pixel-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-destructive animate-pixel-pulse" />
                  <p className="text-sm text-destructive font-bold">{error}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-destructive hover:text-destructive shrink-0 font-bold text-lg leading-none"
                  onClick={() => setError(null)}
                >
                  x
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Hero + Upload */}
        {(appState === "idle" || appState === "uploading") && (
          <div className="space-y-6 max-w-2xl mx-auto">
            {/* Hero */}
            <div className="text-center space-y-4 animate-slide-up">
              <div className="inline-block border-2 border-[var(--border)] bg-muted p-4 shadow-pixel-md animate-float">
                <img
                  src="/banano-icon.svg"
                  alt="BanNano"
                  className="h-14 w-14 retro"
                />
              </div>
              <div className="space-y-2">
                <h2 className="text-lg md:text-xl font-bold font-pixel text-shadow-sm leading-relaxed">
                  Analiza tus frutas con IA
                </h2>
                <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                  Toma una foto y descubre al instante si esta fresca o danada.
                  El modelo usa EfficientNetV2 con visualizacion Grad-CAM.
                </p>
              </div>
              {/* Barra decorativa retro */}
              <div className="flex items-center justify-center gap-2">
                <div className="h-0.5 w-12 bg-primary/30" />
                <div className="h-1.5 w-1.5 bg-primary rotate-45" />
                <div className="h-0.5 w-12 bg-primary/30" />
              </div>
            </div>

            <ImageUploader
              key={resetKey}
              onImageSelect={handleImageSelect}
              onClear={handleImageClear}
              disabled={false}
            />

            {appState === "uploading" && (
              <Button
                size="lg"
                className="w-full shadow-pixel-md animate-slide-up text-base font-pixel py-6"
                onClick={handleAnalyze}
              >
                <Brain className="h-5 w-5" />
                Analizar fruta
              </Button>
            )}
          </div>
        )}

        {/* Loading */}
        {appState === "loading" && (
          <div className="max-w-2xl mx-auto">
            <ResultCard result={null} loading={true} />
          </div>
        )}

        {/* Result */}
        {appState === "result" && result && (
          <div className="max-w-2xl mx-auto space-y-6 animate-scale-in">
            <ResultCard result={result} loading={false} inferenceTimeMs={inferenceTime} />

            <FeedbackSection
              predictedClass={result.class_name}
              onConfirmCorrect={handleConfirmCorrect}
              onSubmitCorrection={handleCorrection}
              disabled={feedbackLoading}
              feedbackCount={feedbackCount}
            />

            <Button
              variant="outline"
              className="w-full shadow-pixel-sm font-pixel text-xs py-5"
              onClick={handleReset}
              disabled={feedbackLoading}
            >
              Analizar otra fruta
            </Button>
          </div>
        )}

        {/* Historial */}
        <div className="max-w-2xl mx-auto">
          <PredictionHistory
            history={history}
            stats={stats}
            onClear={clearHistory}
          />
        </div>

        {/* About Section */}
        <div className="max-w-2xl mx-auto">
          <AboutSection />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-[var(--border)] py-8 bg-card shadow-[0_-4px_0_0_var(--pixel-shadow-color)]">
        <div className="mx-auto max-w-5xl px-4">
          {/* Desktop Layout */}
          <div className="hidden md:grid grid-cols-3 gap-6">

            {/* Bloque Modelo */}
            <div className="border-2 border-[var(--border)] bg-background p-4 shadow-pixel-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-primary" />
                <span className="text-[10px] font-pixel tracking-widest text-primary uppercase">
                  Modelo
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="flex items-center gap-2 text-xs border-2 border-[var(--border)] bg-muted px-3 py-2 shadow-pixel-sm font-mono text-muted-foreground">
                  <Brain className="h-3.5 w-3.5 text-primary shrink-0" />
                  EfficientNetV2 + Grad-CAM
                </span>
                <span className="flex items-center gap-2 text-xs border-2 border-[var(--border)] bg-muted px-3 py-2 shadow-pixel-sm font-mono text-muted-foreground">
                  <Database className="h-3.5 w-3.5 text-chart-4 shrink-0" />
                  HF Datasets
                </span>
              </div>
            </div>

            {/* Bloque Autores */}
            <div className="border-2 border-[var(--border)] bg-background p-4 shadow-pixel-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-chart-2" />
                <span className="text-[10px] font-pixel tracking-widest text-chart-2 uppercase">
                  Autores
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <span
                  onClick={handleKeynerClick}
                  className="flex items-center gap-2 text-xs border-2 border-[var(--border)] bg-muted px-3 py-2 shadow-pixel-sm font-mono text-muted-foreground select-none"
                >
                  <User className="h-3.5 w-3.5 text-chart-2 shrink-0" />
                  Keyner Ramirez
                </span>
                <span
                  onClick={handleMaryClick}
                  className="flex items-center gap-2 text-xs border-2 border-[var(--border)] bg-muted px-3 py-2 shadow-pixel-sm font-mono text-muted-foreground select-none"
                >
                  <User className="h-3.5 w-3.5 text-chart-2 shrink-0" />
                  Mary Hoyos
                </span>
                <span
                  onClick={handleMykClick}
                  className="flex items-center justify-center gap-2 text-[10px] border-2 border-primary/30 bg-primary/10 px-3 py-2 shadow-pixel-sm font-pixel text-primary select-none"
                >
                  MyK
                </span>
              </div>
            </div>

            {/* Bloque Recursos */}
            <div className="border-2 border-[var(--border)] bg-background p-4 shadow-pixel-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-chart-5" />
                <span className="text-[10px] font-pixel tracking-widest text-chart-5 uppercase">
                  Recursos
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href="https://github.com/isKarTuX/BanNano"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs hover:text-primary transition-colors border-2 border-[var(--border)] bg-muted px-2.5 py-2 shadow-pixel-sm hover:shadow-pixel-md font-mono text-muted-foreground"
                >
                  <Github className="h-3.5 w-3.5 shrink-0" />
                  Repo
                  <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                </a>
                <a
                  href="https://huggingface.co/mkartux"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs hover:text-chart-4 transition-colors border-2 border-[var(--border)] bg-muted px-2.5 py-2 shadow-pixel-sm hover:shadow-pixel-md font-mono text-muted-foreground"
                >
                  <Database className="h-3.5 w-3.5 shrink-0" />
                  HF Hub
                  <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                </a>
                <a
                  href="https://colab.research.google.com/drive/1A9Zw_6VRBJwnzsvfOY17whX1SJGhqLPO?usp=sharing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs hover:text-chart-5 transition-colors border-2 border-[var(--border)] bg-muted px-2.5 py-2 shadow-pixel-sm hover:shadow-pixel-md font-mono text-muted-foreground"
                >
                  <Code2 className="h-3.5 w-3.5 shrink-0" />
                  Colab
                  <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                </a>
                <a
                  href="https://www.kaggle.com/datasets/ulnnproject/food-freshness-dataset"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs hover:text-chart-3 transition-colors border-2 border-[var(--border)] bg-muted px-2.5 py-2 shadow-pixel-sm hover:shadow-pixel-md font-mono text-muted-foreground"
                >
                  <FolderOpen className="h-3.5 w-3.5 shrink-0" />
                  Dataset
                  <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                </a>
              </div>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="flex md:hidden flex-col gap-5">

            {/* Bloque Modelo */}
            <div className="border-2 border-[var(--border)] bg-background p-4 shadow-pixel-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-primary" />
                <span className="text-[10px] font-pixel tracking-widest text-primary uppercase">
                  Modelo
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="flex items-center gap-2 text-xs border-2 border-[var(--border)] bg-muted px-3 py-2 shadow-pixel-sm font-mono text-muted-foreground">
                  <Brain className="h-3.5 w-3.5 text-primary shrink-0" />
                  EfficientNetV2 + Grad-CAM
                </span>
                <span className="flex items-center gap-2 text-xs border-2 border-[var(--border)] bg-muted px-3 py-2 shadow-pixel-sm font-mono text-muted-foreground">
                  <Database className="h-3.5 w-3.5 text-chart-4 shrink-0" />
                  HF Datasets
                </span>
              </div>
            </div>

            {/* Bloque Autores */}
            <div className="border-2 border-[var(--border)] bg-background p-4 shadow-pixel-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-chart-2" />
                <span className="text-[10px] font-pixel tracking-widest text-chart-2 uppercase">
                  Autores
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <span
                  onClick={handleKeynerClick}
                  className="flex items-center gap-2 text-xs border-2 border-[var(--border)] bg-muted px-3 py-2 shadow-pixel-sm font-mono text-muted-foreground select-none"
                >
                  <User className="h-3.5 w-3.5 text-chart-2 shrink-0" />
                  Keyner Ramirez
                </span>
                <span
                  onClick={handleMaryClick}
                  className="flex items-center gap-2 text-xs border-2 border-[var(--border)] bg-muted px-3 py-2 shadow-pixel-sm font-mono text-muted-foreground select-none"
                >
                  <User className="h-3.5 w-3.5 text-chart-2 shrink-0" />
                  Mary Hoyos
                </span>
                <span
                  onClick={handleMykClick}
                  className="flex items-center justify-center gap-2 text-[10px] border-2 border-primary/30 bg-primary/10 px-3 py-2 shadow-pixel-sm font-pixel text-primary select-none"
                >
                  MyK
                </span>
              </div>
            </div>

            {/* Bloque Recursos */}
            <div className="border-2 border-[var(--border)] bg-background p-4 shadow-pixel-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-chart-5" />
                <span className="text-[10px] font-pixel tracking-widest text-chart-5 uppercase">
                  Recursos
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href="https://github.com/isKarTuX/BanNano"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs hover:text-primary transition-colors border-2 border-[var(--border)] bg-muted px-2.5 py-2 shadow-pixel-sm hover:shadow-pixel-md font-mono text-muted-foreground"
                >
                  <Github className="h-3.5 w-3.5 shrink-0" />
                  Repo
                </a>
                <a
                  href="https://huggingface.co/mkartux"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs hover:text-chart-4 transition-colors border-2 border-[var(--border)] bg-muted px-2.5 py-2 shadow-pixel-sm hover:shadow-pixel-md font-mono text-muted-foreground"
                >
                  <Database className="h-3.5 w-3.5 shrink-0" />
                  HF Hub
                </a>
                <a
                  href="https://colab.research.google.com/drive/1A9Zw_6VRBJwnzsvfOY17whX1SJGhqLPO?usp=sharing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs hover:text-chart-5 transition-colors border-2 border-[var(--border)] bg-muted px-2.5 py-2 shadow-pixel-sm hover:shadow-pixel-md font-mono text-muted-foreground"
                >
                  <Code2 className="h-3.5 w-3.5 shrink-0" />
                  Colab
                </a>
                <a
                  href="https://www.kaggle.com/datasets/ulnnproject/food-freshness-dataset"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs hover:text-chart-3 transition-colors border-2 border-[var(--border)] bg-muted px-2.5 py-2 shadow-pixel-sm hover:shadow-pixel-md font-mono text-muted-foreground"
                >
                  <FolderOpen className="h-3.5 w-3.5 shrink-0" />
                  Dataset
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
