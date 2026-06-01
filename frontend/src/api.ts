import type { PredictionResult } from "./types"

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000"
const REQUEST_TIMEOUT = 30000 // 30 segundos

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout = REQUEST_TIMEOUT
): Promise<Response> {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)

  try {
    const res = await fetch(url, { ...options, signal: controller.signal })
    clearTimeout(id)
    return res
  } catch (err) {
    clearTimeout(id)
    if (err instanceof Error) {
      if (err.name === "AbortError") {
        throw new Error("La solicitud tardó demasiado. Verifica tu conexion.")
      }
      throw new Error("Error de red. No se pudo conectar con el servidor.")
    }
    throw err
  }
}

export async function predictFruit(file: File): Promise<PredictionResult> {
  const MAX_SIZE_MB = 10
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    throw new Error(`La imagen es demasiado grande. Maximo ${MAX_SIZE_MB}MB permitidos.`)
  }

  const formData = new FormData()
  formData.append("file", file)

  const res = await fetchWithTimeout(`${API_BASE}/predict`, {
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

  const res = await fetchWithTimeout(`${API_BASE}/feedback`, {
    method: "POST",
    body: formData,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Feedback submission failed" }))
    throw new Error(err.detail || "Feedback submission failed")
  }

  return res.json()
}
