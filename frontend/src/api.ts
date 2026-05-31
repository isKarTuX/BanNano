import type { PredictionResult } from "./types"

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000"

export async function predictFruit(file: File): Promise<PredictionResult> {
  const formData = new FormData()
  formData.append("file", file)

  const res = await fetch(`${API_BASE}/predict`, {
    method: "POST",
    body: formData,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Prediction failed" }))
    throw new Error(err.detail || `Error ${res.status}`)
  }

  return res.json()
}

export async function submitFeedback(
  file: File,
  correctLabel: string
): Promise<{ status: string; image_id: string }> {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("correct_label", correctLabel)

  const res = await fetch(`${API_BASE}/feedback`, {
    method: "POST",
    body: formData,
  })

  if (!res.ok) {
    throw new Error("Feedback submission failed")
  }

  return res.json()
}
