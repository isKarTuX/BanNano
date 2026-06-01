import { useState } from "react"
import { ChevronDown, ChevronUp, Leaf, Apple } from "lucide-react"
import { SUPPORTED_FRUITS } from "@/lib/fruitLabels"
import { cn } from "@/lib/utils"

export function SupportedFruits() {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="w-full max-w-md mx-auto">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-center gap-2 py-2 text-xs text-muted-foreground font-mono hover:text-foreground transition-colors"
      >
        <Leaf className="h-3.5 w-3.5 text-chart-3" />
        <span>Frutas y verduras soportadas</span>
        {expanded ? (
          <ChevronUp className="h-3.5 w-3.5" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5" />
        )}
      </button>

      <div
        className={cn(
          "grid transition-all duration-300 ease-out overflow-hidden",
          expanded ? "grid-rows-[1fr] mt-2" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <div className="border-2 border-[var(--border)] bg-muted p-3 shadow-pixel-sm">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-1.5">
              {SUPPORTED_FRUITS.map((fruit) => (
                <div
                  key={fruit}
                  className="flex items-center gap-1.5 text-[10px] sm:text-xs text-muted-foreground font-mono"
                >
                  <Apple className="h-2.5 w-2.5 text-chart-3 shrink-0" />
                  <span className="truncate">{fruit}</span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[9px] text-muted-foreground/70 font-mono text-center leading-tight">
              Detecta estado: Fresca o Danada / Podrida
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
