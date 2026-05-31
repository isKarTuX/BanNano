import { useRef, useState } from "react"
import { Camera, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ImageUploaderProps {
  onImageSelect: (file: File) => void
  disabled?: boolean
}

export function ImageUploader({ onImageSelect, disabled }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) return
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)
    onImageSelect(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function clearSelection() {
    setPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  return (
    <div className="w-full space-y-4">
      {!preview ? (
        <div
          onClick={() => !disabled && fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          className={cn(
            "relative flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-slate-700 p-12 transition-all cursor-pointer",
            dragOver && "border-primary bg-primary/5 scale-[1.02]",
            disabled && "opacity-50 cursor-not-allowed",
            !disabled && "hover:border-slate-500 hover:bg-slate-900/50"
          )}
        >
          <div className="rounded-full bg-slate-800 p-4">
            <Camera className="h-8 w-8 text-slate-400" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm font-medium text-slate-300">
              Toca para tomar una foto
            </p>
            <p className="text-xs text-slate-500">
              o arrastra una imagen aquí (JPG, PNG)
            </p>
          </div>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-xl border border-slate-700">
          <img
            src={preview}
            alt="Preview"
            className="w-full max-h-80 object-contain bg-slate-900"
          />
          <button
            onClick={(e) => {
              e.stopPropagation()
              clearSelection()
            }}
            className="absolute top-3 right-3 rounded-full bg-slate-950/80 p-1.5 text-slate-400 hover:text-white transition-colors"
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
        className="hidden"
        disabled={disabled}
      />

      {!preview && (
        <Button
          variant="secondary"
          size="lg"
          className="w-full"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
        >
          <Upload className="h-4 w-4" />
          Seleccionar archivo
        </Button>
      )}
    </div>
  )
}
