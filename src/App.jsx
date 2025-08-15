"use client"

import { useState, useEffect, useCallback } from "react"
import HomePage from "./components/HomePage"
import HowToUsePage from "./components/HowToUsePage"
import HistoryPage from "./components/HistoryPage"
import SettingsPage from "./components/SettingsPage"
import AboutPage from "./components/AboutPage"
import { ThemeProvider, useTheme } from "./components/ThemeProvider"
import Layout from "./components/Layout"

function AppContent() {
  const [view, setView] = useState("home")
  const [history, setHistory] = useState([])
  const [isElectron, setIsElectron] = useState(false)
  const [toast, setToast] = useState({ show: false, message: "", type: "success" })
  const { theme } = useTheme()

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000)
  }

  const fetchHistory = useCallback(async () => {
    if (window.electronAPI) {
      const historyData = await window.electronAPI.getHistory()
      setHistory(historyData)
    }
  }, [])

  const handleToggleFavorite = async (itemId) => {
    if (window.electronAPI) {
      await window.electronAPI.toggleFavorite(itemId)
      fetchHistory()
    }
  }

  useEffect(() => {
    if (window.electronAPI) {
      setIsElectron(true)
      if (view === "history") {
        fetchHistory()
      }

      const handleResponse = () => {
        if (view === "history") {
          fetchHistory()
        }
      }

      window.electronAPI.onHotkeyResponse(handleResponse)
    }
  }, [fetchHistory, view])

  if (!isElectron) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          theme === "dark"
            ? "bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800"
            : "bg-gradient-to-br from-slate-50 via-white to-gray-50"
        }`}
      >
        <div
          className={`p-8 rounded-2xl shadow-2xl border ${
            theme === "dark"
              ? "bg-slate-800/90 border-slate-700 backdrop-blur-sm"
              : "bg-white/90 border-slate-200 backdrop-blur-sm"
          }`}
        >
          <p className={`text-lg font-semibold ${theme === "dark" ? "text-red-400" : "text-red-600"}`}>
            This application must be run inside Electron.
          </p>
        </div>
      </div>
    )
  }

  const renderView = () => {
    switch (view) {
      case "home":
        return <HomePage />
      case "how-to-use":
        return <HowToUsePage />
      case "history":
        return <HistoryPage history={history} onToggleFavorite={handleToggleFavorite} />
      case "settings":
        return <SettingsPage showToast={showToast} />
      case "about":
        return <AboutPage />
      default:
        return <HomePage />
    }
  }

  return (
    <Layout
      view={view}
      setView={setView}
      onHistoryClick={() => {
        setView("history")
        fetchHistory()
      }}
      toast={toast}
      onToastClose={() => setToast({ show: false, message: "", type: "success" })}
    >
      {renderView()}
    </Layout>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}

export default App
