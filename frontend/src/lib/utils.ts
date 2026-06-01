import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { getFruitLabelEs, isRotten as checkRotten } from "./fruitLabels"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatConfidence(value: number): string {
  return `${(value * 100).toFixed(1)}%`
}

/** @deprecated Use getFruitLabelEs from ./fruitLabels instead */
export function getFruitLabel(className: string): string {
  return getFruitLabelEs(className)
}

export function isRotten(className: string): boolean {
  return checkRotten(className)
}
