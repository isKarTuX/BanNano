import { useEffect, useState, useCallback, useRef, useMemo } from "react"
import { Heart, ArrowLeft, ChevronLeft, ChevronRight, Sparkles } from "lucide-react"
import { Sunflower, Tulip, Daisy, Rose } from "./Flowers"

interface FloatingHeart {
  id: number
  x: number
  size: number
  delay: number
  duration: number
  opacity: number
  createdAt: number
}

interface SecretPageProps {
  onBack: () => void
}

const PHOTOS = [
  "/secret-photos/photo1.webp",
  "/secret-photos/photo2.webp",
  "/secret-photos/photo3.webp",
  "/secret-photos/photo4.webp",
  "/secret-photos/photo5.webp",
]

// Configuracion de flores decorativas - RESPONSIVE sizes
const FLOWER_CONFIG_DESKTOP = [
  { component: Sunflower, left: "5%", bottom: "8%", size: 120, delay: "0s", rotate: -5 },
  { component: Tulip, right: "8%", bottom: "5%", size: 100, delay: "1.5s", rotate: 8 },
  { component: Daisy, left: "12%", top: "12%", size: 90, delay: "0.8s", rotate: -12 },
  { component: Rose, right: "10%", top: "18%", size: 85, delay: "2s", rotate: 5 },
  { component: Sunflower, left: "3%", top: "40%", size: 70, delay: "3s", rotate: 15 },
  { component: Tulip, right: "5%", top: "45%", size: 75, delay: "1s", rotate: -8 },
  { component: Daisy, left: "6%", bottom: "30%", size: 65, delay: "2.5s", rotate: 10 },
  { component: Rose, right: "12%", bottom: "25%", size: 70, delay: "0.5s", rotate: -3 },
]

// Mobile: fewer flowers, smaller, positioned away from content
const FLOWER_CONFIG_MOBILE = [
  { component: Sunflower, left: "2%", bottom: "5%", size: 60, delay: "0s", rotate: -5 },
  { component: Tulip, right: "3%", bottom: "3%", size: 50, delay: "1.5s", rotate: 8 },
  { component: Daisy, left: "5%", top: "8%", size: 45, delay: "0.8s", rotate: -12 },
  { component: Rose, right: "5%", top: "10%", size: 45, delay: "2s", rotate: 5 },
]

export default function SecretPage({ onBack }: SecretPageProps) {
  const [hearts, setHearts] = useState<FloatingHeart[]>([])
  const [currentPhoto, setCurrentPhoto] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const heartIdRef = useRef(0)

  // Detect mobile for flower config
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768
  const flowerConfig = useMemo(() => isMobile ? FLOWER_CONFIG_MOBILE : FLOWER_CONFIG_DESKTOP, [isMobile])

  useEffect(() => {
    const interval = setInterval(() => {
      const newHeart: FloatingHeart = {
        id: heartIdRef.current++,
        x: Math.random() * 100,
        size: 16 + Math.random() * 32,
        delay: Math.random() * 2,
        duration: 4 + Math.random() * 4,
        opacity: 0.3 + Math.random() * 0.7,
        createdAt: Date.now(),
      }
      setHearts((prev) => [...prev.slice(-20), newHeart])
    }, 400)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const cleanup = setInterval(() => {
      setHearts((prev) => prev.filter((h) => {
        const age = Date.now() - h.createdAt
        return age < 8000
      }))
    }, 2000)
    return () => clearInterval(cleanup)
  }, [])

  const goNext = useCallback(() => {
    setCurrentPhoto((prev) => (prev + 1) % PHOTOS.length)
  }, [])

  const goPrev = useCallback(() => {
    setCurrentPhoto((prev) => (prev - 1 + PHOTOS.length) % PHOTOS.length)
  }, [])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX)
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStart === null) return
    const diff = touchStart - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext()
      else goPrev()
    }
    setTouchStart(null)
  }, [touchStart, goNext, goPrev])

  const hasPhotos = true

  return (
    <div className="min-h-dvh relative overflow-x-hidden overflow-y-auto bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-rose-500/20">
      {/* Flores decorativas de fondo - RESPONSIVE */}
      <div className="fixed inset-0 pointer-events-none z-[5] overflow-hidden">
        {flowerConfig.map((flower, i) => {
          const FlowerComponent = flower.component
          return (
            <div
              key={`flower-${i}`}
              className="absolute animate-sway"
              style={{
                left: flower.left,
                right: flower.right,
                top: flower.top,
                bottom: flower.bottom,
                width: flower.size,
                height: flower.size,
                animationDelay: flower.delay,
                transform: `rotate(${flower.rotate}deg)`,
                opacity: 0.5,
              }}
            >
              <FlowerComponent className="w-full h-full" />
            </div>
          )
        })}
      </div>

      {/* Corazones flotantes */}
      <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
        {hearts.map((heart) => (
          <div
            key={heart.id}
            className="absolute animate-float-up"
            style={{
              left: `${heart.x}%`,
              bottom: "-40px",
              animationDelay: `${heart.delay}s`,
              animationDuration: `${heart.duration}s`,
            }}
          >
            <Heart
              className="text-rose-400 fill-rose-400"
              style={{
                width: heart.size,
                height: heart.size,
                opacity: heart.opacity,
              }}
            />
          </div>
        ))}
      </div>

      {/* Particulas de sparkles */}
      <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
        {hearts.slice(0, 6).map((_, i) => (
          <Sparkles
            key={`sparkle-${i}`}
            className="absolute text-yellow-300 animate-twinkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: 12 + Math.random() * 16,
              height: 12 + Math.random() * 16,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Contenido principal - SCROLLABLE en movil */}
      <div className="relative z-20 min-h-dvh flex flex-col items-center px-3 py-4 sm:px-4 sm:py-8">
        {/* Boton volver - RESPONSIVE positioning */}
        <button
          onClick={onBack}
          className="self-start flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 border-2 border-[var(--border)] bg-card/90 backdrop-blur-sm shadow-pixel-sm hover:shadow-pixel-md transition-all text-xs sm:text-sm font-pixel mb-4 sm:mb-6"
        >
          <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
          Volver
        </button>

        {/* Titulo - RESPONSIVE font sizes */}
        <div className="text-center space-y-1 sm:space-y-2 mb-4 sm:mb-8 animate-scale-in px-2">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-pixel text-rose-500 text-shadow-sm leading-tight">
            Como llegaste aqui?
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground font-mono leading-tight">
            No sabia que tenia visitas hoy...
          </p>
        </div>

        {/* Collage de fotos - RESPONSIVE sizing */}
        <div
          className="relative w-full max-w-[280px] sm:max-w-sm md:max-w-md aspect-[3/4] max-h-[50vh] sm:max-h-none border-2 border-[var(--border)] bg-card shadow-pixel-lg overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {hasPhotos ? (
            <>
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <img
                  src={PHOTOS[currentPhoto]}
                  alt={`Foto ${currentPhoto + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none"
                  }}
                />
                {/* Fallback placeholder */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
                  <div className="text-center space-y-2 px-4">
                    <Heart className="h-8 w-8 sm:h-12 sm:w-12 text-rose-300 mx-auto animate-pulse" />
                    <p className="text-[10px] sm:text-xs text-muted-foreground font-mono">
                      Anade tu foto aqui
                    </p>
                  </div>
                </div>
              </div>

              {/* Controles de navegacion */}
              <button
                onClick={goPrev}
                className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 bg-card/80 backdrop-blur-sm border-2 border-[var(--border)] shadow-pixel-sm hover:bg-card transition-colors"
                aria-label="Foto anterior"
              >
                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <button
                onClick={goNext}
                className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 bg-card/80 backdrop-blur-sm border-2 border-[var(--border)] shadow-pixel-sm hover:bg-card transition-colors"
                aria-label="Siguiente foto"
              >
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>

              {/* Indicadores */}
              <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2">
                {PHOTOS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPhoto(i)}
                    className={`h-1.5 sm:h-2 rounded-full transition-all ${
                      i === currentPhoto
                        ? "bg-rose-500 w-3 sm:w-4"
                        : "bg-white/50 hover:bg-white/80 w-1.5 sm:w-2"
                    }`}
                    aria-label={`Ver foto ${i + 1}`}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-4 px-4">
                <Heart className="h-12 w-12 sm:h-16 sm:w-16 text-rose-400 animate-pulse mx-auto" />
                <p className="text-xs sm:text-sm text-muted-foreground font-mono">
                  Pronto se anadiran las fotos aqui...
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Mensajes sarcasticos - RESPONSIVE text wrapping */}
        <div className="mt-4 sm:mt-8 text-center space-y-3 sm:space-y-4 max-w-[90vw] sm:max-w-md px-2 animate-slide-up pb-4">
          {/* Mensaje sarcastico 1 - flex-wrap para no desbordar */}
          <div className="inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1 px-3 py-2 sm:px-4 sm:py-2 border-2 border-rose-300/50 bg-rose-50/10 shadow-pixel-sm">
            <Heart className="h-3 w-3 sm:h-4 sm:w-4 text-rose-500 fill-rose-500 shrink-0" />
            <span className="text-[10px] sm:text-sm font-pixel text-rose-400 leading-tight">
              Te quiero mucho mi cuchurrumi, mi medio metro
            </span>
            <Heart className="h-3 w-3 sm:h-4 sm:w-4 text-rose-500 fill-rose-500 shrink-0" />
          </div>

          {/* Mensaje sarcastico 2 */}
          <p className="text-[10px] sm:text-xs text-muted-foreground font-mono leading-relaxed px-2 sm:px-0">
            Si, me tome la molestia de hacer un easter egg completo solo para ti.
            No, no tengo vida social. Y que?
          </p>

          {/* Mensaje sarcastico 3 */}
          <p className="text-[10px] sm:text-xs text-muted-foreground font-mono leading-relaxed px-2 sm:px-0">
            Si llegaste aqui dando click como loco en nuestros nombres, felicidades.
            Tienes demasiado tiempo libre.
          </p>

          {/* Mensaje sincero que se mantiene */}
          <div className="pt-2 border-t-2 border-dashed border-rose-300/30">
            <p className="text-[10px] sm:text-xs text-rose-400 font-mono leading-relaxed px-2 sm:px-0">
              Gracias por ser mi companera en este y todos los proyectos.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
