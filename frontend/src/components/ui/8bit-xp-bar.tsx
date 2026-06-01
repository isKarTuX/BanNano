import * as React from "react"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"

interface XpBarProps extends React.ComponentPropsWithoutRef<typeof Progress> {
  value: number
  levelUpMessage?: string
  barColor?: string
}

export function XpBar({
  className,
  value = 0,
  levelUpMessage = "LEVEL UP!",
  barColor = "bg-chart-4",
  ...props
}: XpBarProps) {
  const isLevelUp = value >= 100
  const segments = 20
  const filledSegments = Math.round((Math.min(value, 100) / 100) * segments)

  return (
    <div className={cn("relative w-full", className)}>
      <div
        data-slot="xp-bar"
        className={cn(
          "relative h-4 w-full overflow-hidden border-2 border-[var(--border)] bg-muted",
          isLevelUp && "animate-pixel-pulse"
        )}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        {...props}
      >
        <div className="flex h-full w-full gap-[2px] p-[2px]">
          {Array.from({ length: segments }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-full flex-1 transition-colors duration-300",
                i < filledSegments
                  ? value >= 100
                    ? "bg-chart-2"
                    : barColor
                  : "bg-muted"
              )}
            />
          ))}
        </div>
      </div>

      {isLevelUp && (
        <div
          className={cn(
            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
            "text-[10px] font-bold text-foreground",
            "pointer-events-none whitespace-nowrap z-10",
            "animate-blink select-none",
            "text-shadow-pixel"
          )}
        >
          {levelUpMessage}
        </div>
      )}
    </div>
  )
}
