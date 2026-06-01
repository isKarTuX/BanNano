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

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="bannano-theme">
      <App />
    </ThemeProvider>
  </React.StrictMode>
)
