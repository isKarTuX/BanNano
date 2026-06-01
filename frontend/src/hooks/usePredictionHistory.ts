import { useState, useEffect, useCallback } from "react"
import type { PredictionResult } from "@/types"

const STORAGE_KEY = "bannano-history"
const MAX_ENTRIES = 15

export interface HistoryEntry {
  id: string
  timestamp: number
  className: string
  confidence: number
  isFresh: boolean
  inferenceTimeMs?: number
}

function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as HistoryEntry[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveHistory(entries: HistoryEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  } catch {
    // Silently fail if storage is full
  }
}

export function usePredictionHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>(loadHistory)

  const addEntry = useCallback((
    result: PredictionResult,
    inferenceTimeMs?: number
  ) => {
    const entry: HistoryEntry = {
      id: crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      className: result.class_name,
      confidence: result.confidence,
      isFresh: result.is_fresh,
      inferenceTimeMs,
    }
    setHistory((prev) => {
      const next = [entry, ...prev].slice(0, MAX_ENTRIES)
      saveHistory(next)
      return next
    })
  }, [])

  const clearHistory = useCallback(() => {
    setHistory([])
    saveHistory([])
  }, [])

  const stats = {
    total: history.length,
    fresh: history.filter((h) => h.isFresh).length,
    rotten: history.filter((h) => !h.isFresh).length,
    avgConfidence: history.length
      ? history.reduce((sum, h) => sum + h.confidence, 0) / history.length
      : 0,
    avgInferenceTime: history.length && history.some((h) => h.inferenceTimeMs)
      ? history
          .filter((h) => h.inferenceTimeMs)
          .reduce((sum, h) => sum + (h.inferenceTimeMs || 0), 0) /
        history.filter((h) => h.inferenceTimeMs).length
      : 0,
  }

  return { history, addEntry, clearHistory, stats }
}
