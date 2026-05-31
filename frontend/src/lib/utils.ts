import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatConfidence(value: number): string {
  return `${(value * 100).toFixed(1)}%`
}

export function getFruitLabel(className: string): string {
  const noPrefix = className
    .replace(/^Fresh_Fresh/, "")
    .replace(/^Rotten_Rotten/, "")
  const words = noPrefix.replace(/([A-Z])/g, " $1").trim()
  return words || className
}

export function isRotten(className: string): boolean {
  return className.startsWith("Rotten_")
}
