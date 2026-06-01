import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/ThemeProvider"

export function ThemeToggle() {
  const { theme, toggleTheme, isTransitioning } = useTheme()

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isTransitioning) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    toggleTheme(centerX, centerY)
  }

  const isDark = theme === "dark"

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleClick}
      disabled={isTransitioning}
      aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      className="relative overflow-hidden border-2 border-[var(--border)] bg-card shadow-pixel-sm hover:shadow-pixel-md transition-all active:shadow-pixel-sm active:translate-x-[2px] active:translate-y-[2px] h-9 w-9"
    >
      <span
        className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
          isDark ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-0 opacity-0"
        }`}
      >
        <Moon className="h-4 w-4 text-primary" />
      </span>
      <span
        className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
          isDark ? "-rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
        }`}
      >
        <Sun className="h-4 w-4 text-chart-4" />
      </span>
    </Button>
  )
}
