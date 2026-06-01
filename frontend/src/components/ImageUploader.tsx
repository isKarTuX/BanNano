import { useState, useRef, useCallback, useEffect } from "react"
import { Camera, X, Image as ImageIcon, Crosshair, Aperture } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ImageUploaderProps {
  onImageSelect: (file: File) => void
  onClear?: () => void
  disabled?: boolean
}

const MAX_FILE_SIZE_MB = 10

function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
}

export function ImageUploader({ onImageSelect, onClear, disabled }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [cameraReady, setCameraReady] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  function validateFile(file: File): boolean {
    setError(null)
    if (!file.type.startsWith("image/")) {
      setError("El archivo debe ser una imagen (JPG, PNG, WEBP).")
      return false
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`Imagen demasiado grande. Maximo ${MAX_FILE_SIZE_MB}MB.`)
      return false
    }
    return true
  }

  function handleFile(file: File) {
    if (!validateFile(file)) return
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)
    onImageSelect(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  // Limpiar stream de camara al desmontar para evitar memory leak
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }, [])

  /* ------------------------------------------------------------------ */
  /*  Desktop webcam via getUserMedia                                    */
  /* ------------------------------------------------------------------ */
  const startCamera = useCallback(async () => {
    if (disabled) return
    setCameraOpen(true)
    setCameraReady(false)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play()
          setCameraReady(true)
        }
      }
    } catch (err) {
      console.error("[Camera] Error accediendo a la webcam:", err)
      setError("No se pudo acceder a la camara. Asegurate de dar permiso.")
      stopCamera()
    }
  }, [disabled])

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    setCameraOpen(false)
    setCameraReady(false)
  }, [])

  const takePhoto = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || !cameraReady) return

    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    canvas.toBlob(
      (blob) => {
        if (!blob) return
        const file = new File([blob], `capture_${Date.now()}.jpg`, {
          type: "image/jpeg",
        })
        stopCamera()
        handleFile(file)
      },
      "image/jpeg",
      0.92
    )
  }, [cameraReady, stopCamera])

  /* ------------------------------------------------------------------ */
  /*  Mobile file picker (dynamic input)                               */
  /* ------------------------------------------------------------------ */
  function triggerFilePicker(options: { accept: string; capture?: string }) {
    if (disabled) return
    const input = document.createElement("input")
    input.type = "file"
    input.accept = options.accept
    if (options.capture) input.capture = options.capture
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) handleFile(file)
    }
    input.click()
  }

  function openCamera() {
    setError(null) // Limpiar error previo al intentar nueva accion
    if (isMobileDevice()) {
      // En movil usamos el input nativo con capture
      triggerFilePicker({ accept: "image/*", capture: "environment" })
    } else {
      // En desktop usamos getUserMedia
      startCamera()
    }
  }

  function openGallery() {
    setError(null) // Limpiar error previo al intentar nueva accion
    triggerFilePicker({ accept: "image/jpeg,image/png,image/webp" })
  }

  function clearSelection() {
    setPreview(null)
    setError(null)
    onClear?.()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      openGallery()
    }
  }

  /* ================================================================== */
  return (
    <div className="w-full space-y-4">
      {error && (
        <div className="border-2 border-destructive/40 bg-destructive/10 p-3 text-center shadow-pixel-sm">
          <p className="text-xs font-bold text-destructive font-mono">{error}</p>
        </div>
      )}

      {/* ---------- Camera modal (desktop only) ---------- */}
      {cameraOpen && (
        <div className="relative overflow-hidden border-2 border-[var(--border)] bg-card shadow-pixel-md">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full max-h-80 object-contain bg-black retro"
          />
          {/* Esquinas decorativas retro */}
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-primary/50" aria-hidden="true" />
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-primary/50" aria-hidden="true" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-primary/50" aria-hidden="true" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-primary/50" aria-hidden="true" />

          {/* Controls overlay */}
          <div className="absolute bottom-0 inset-x-0 flex items-center justify-between gap-2 p-3 bg-gradient-to-t from-black/70 to-transparent">
            <Button
              variant="ghost"
              size="sm"
              onClick={stopCamera}
              className="text-white hover:text-white hover:bg-white/20 font-pixel text-[10px]"
            >
              <X className="h-4 w-4 mr-1" aria-hidden="true" />
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={takePhoto}
              disabled={!cameraReady}
              className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-pixel-sm font-pixel text-[10px]"
            >
              <Aperture className="h-4 w-4 mr-1" aria-hidden="true" />
              Capturar
            </Button>
          </div>
        </div>
      )}

      {/* ---------- Preview ---------- */}
      {!cameraOpen && preview && (
        <div className="relative overflow-hidden border-2 border-[var(--border)] bg-card shadow-pixel-md">
          <img
            src={preview}
            alt="Vista previa de la imagen seleccionada"
            className="w-full max-h-80 object-contain bg-muted retro"
          />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              clearSelection()
            }}
            aria-label="Eliminar imagen seleccionada"
            disabled={disabled}
            className="absolute top-2 right-2 border-2 border-destructive bg-background p-1.5 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all shadow-pixel-sm hover:shadow-pixel-md active:shadow-pixel-sm active:translate-x-[2px] active:translate-y-[2px]"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
          {/* Esquinas decorativas retro */}
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-primary/50" aria-hidden="true" />
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-primary/50" aria-hidden="true" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-primary/50" aria-hidden="true" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-primary/50" aria-hidden="true" />
        </div>
      )}

      {/* ---------- Drop zone ---------- */}
      {!cameraOpen && !preview && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Zona para arrastrar o seleccionar una imagen"
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onKeyDown={handleKeyDown}
          className={cn(
            "relative flex flex-col items-center justify-center gap-4 border-2 border-dashed border-[var(--border)] p-8 md:p-12 transition-all outline-none focus:border-primary focus:ring-2 focus:ring-primary/30",
            dragOver && "border-primary bg-primary/5 scale-[1.02] shadow-pixel-md",
            disabled && "opacity-50 cursor-not-allowed",
            !disabled && "cursor-pointer hover:border-primary/50 hover:bg-muted/50 hover:shadow-pixel-sm"
          )}
        >
          <div className="border-2 border-[var(--border)] bg-card p-4 shadow-pixel-sm animate-float">
            <Crosshair className="h-8 w-8 text-primary" aria-hidden="true" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-sm font-bold text-foreground font-pixel text-pixel-base">
              Arrastra una imagen aqui
            </p>
            <p className="text-xs text-muted-foreground font-mono">
              o usa los botones de abajo (JPG, PNG, max {MAX_FILE_SIZE_MB}MB)
            </p>
          </div>
          <div className="flex gap-1" aria-hidden="true">
            <div className="h-1 w-8 bg-primary/20" />
            <div className="h-1 w-4 bg-primary/40" />
            <div className="h-1 w-8 bg-primary/20" />
          </div>
        </div>
      )}

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* ---------- Buttons ---------- */}
      {!cameraOpen && !preview && (
        <div className="flex gap-3">
          <Button
            variant="secondary"
            size="lg"
            className="flex-1 shadow-pixel-sm font-pixel text-xs py-5 hover:shadow-pixel-md active:shadow-pixel-sm active:translate-x-[2px] active:translate-y-[2px]"
            onClick={openCamera}
            disabled={disabled}
          >
            <Camera className="h-4 w-4" aria-hidden="true" />
            Camara
          </Button>
          <Button
            variant="secondary"
            size="lg"
            className="flex-1 shadow-pixel-sm font-pixel text-xs py-5 hover:shadow-pixel-md active:shadow-pixel-sm active:translate-x-[2px] active:translate-y-[2px]"
            onClick={openGallery}
            disabled={disabled}
          >
            <ImageIcon className="h-4 w-4" aria-hidden="true" />
            Galeria
          </Button>
        </div>
      )}
    </div>
  )
}
