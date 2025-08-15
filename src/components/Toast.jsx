"use client"

import { useEffect } from "react"
import { useTheme } from "./ThemeProvider"

function Toast({ show, message, type, onClose }) {
  const { theme } = useTheme()

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [show, onClose])

  if (!show) return null

  const getToastStyles = () => {
    const baseStyles =
      "fixed top-4 right-4 p-4 rounded-xl shadow-lg backdrop-blur-sm border z-50 transform transition-all duration-300 animate-slideInRight"

    if (type === "error") {
      return `${baseStyles} ${
        theme === "dark" ? "bg-red-900/90 text-red-200 border-red-700" : "bg-red-50 text-red-800 border-red-200"
      }`
    } else if (type === "success") {
      return `${baseStyles} ${
        theme === "dark"
          ? "bg-green-900/90 text-green-200 border-green-700"
          : "bg-green-50 text-green-800 border-green-200"
      }`
    } else {
      return `${baseStyles} ${
        theme === "dark" ? "bg-blue-900/90 text-blue-200 border-blue-700" : "bg-blue-50 text-blue-800 border-blue-200"
      }`
    }
  }

  const getIcon = () => {
    switch (type) {
      case "error":
        return "❌"
      case "success":
        return "✅"
      default:
        return "ℹ️"
    }
  }

  return (
    <div className={getToastStyles()}>
      <div className="flex items-center gap-3">
        <span className="text-xl">{getIcon()}</span>
        <span className="font-medium">{message}</span>
        <button
          onClick={onClose}
          className={`ml-2 p-1 rounded-full hover:bg-black/10 transition-colors ${
            theme === "dark" ? "hover:bg-white/10" : "hover:bg-black/10"
          }`}
        >
          <span className="text-lg">×</span>
        </button>
      </div>
    </div>
  )
}

export default Toast
