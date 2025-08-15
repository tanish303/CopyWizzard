"use client"

import { useState, useEffect, useCallback } from "react"
import Navigation from "./components/Navigation"
import HomePage from "./components/HomePage"
import HowToUsePage from "./components/HowToUsePage"
import HistoryPage from "./components/HistoryPage"
import SettingsPage from "./components/SettingsPage"
import AboutPage from "./components/AboutPage"
import Toast from "./components/Toast"
import { ThemeProvider, useTheme } from "./components/ThemeProvider"

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
        className={`min-h-screen flex items-center justify-center ${theme === "dark" ? "bg-gray-900" : "bg-gradient-to-br from-cyan-50 to-teal-50"}`}
      >
        <div
          className={`p-8 rounded-2xl shadow-xl ${theme === "dark" ? "bg-gray-800 border border-gray-700" : "bg-white border border-cyan-100"}`}
        >
          <p className="text-red-500 text-lg font-medium">This application must be run inside Electron.</p>
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
    <div
      className={`min-h-screen transition-all duration-300 ${
        theme === "dark"
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
          : "bg-gradient-to-br from-cyan-50 via-white to-teal-50"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 min-h-screen flex flex-col">
        <Navigation
          view={view}
          setView={setView}
          onHistoryClick={() => {
            setView("history")
            fetchHistory()
          }}
        />
        <main className="flex-1 mt-6">
          <div className="animate-fadeIn">{renderView()}</div>
        </main>
      </div>
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ show: false, message: "", type: "success" })}
      />
    </div>
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
