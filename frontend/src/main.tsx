import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import { ThemeProvider } from "@/components/ThemeProvider"
import "./index.css"

// Register PWA service worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        console.log("[PWA] Service Worker registrado:", reg.scope)
      })
      .catch((err) => {
        console.error("[PWA] Error registrando SW:", err)
      })
  })
}

// Detectar si está corriendo como PWA instalada (standalone)
function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true // iOS
  )
}

// Ocultar splash screen cuando la app está lista
function hideSplashScreen() {
  const splash = document.getElementById("pwa-splash")
  if (splash) {
    splash.classList.add("hidden")
    // Remover del DOM después de la transición
    setTimeout(() => {
      splash.remove()
    }, 500)
  }
}

// Log para debug de PWA
if (isStandalone()) {
  console.log("[PWA] App ejecutándose en modo standalone (instalada)")
} else {
  console.log("[PWA] App ejecutándose en navegador")
}

const root = ReactDOM.createRoot(document.getElementById("root")!)

root.render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="bannano-theme">
      <App />
    </ThemeProvider>
  </React.StrictMode>
)

// Ocultar splash screen después de que React renderice
// Usamos requestAnimationFrame para asegurar que el primer frame se haya pintado
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    hideSplashScreen()
  })
})
