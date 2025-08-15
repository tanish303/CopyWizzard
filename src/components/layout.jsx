"use client"

import { useTheme } from "./ThemeProvider"
import Navigation from "./Navigation"
import Toast from "./Toast"

function Layout({ children, view, setView, onHistoryClick, toast, onToastClose }) {
  const { theme } = useTheme()

  return (
    <div
      className={`min-h-screen transition-all duration-300 ${
        theme === "dark"
          ? "bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800"
          : "bg-gradient-to-br from-slate-50 via-white to-gray-50"
      }`}
    >
      <div className="flex min-h-screen">
        <div
          className={`w-64 flex-shrink-0 fixed left-0 top-0 h-screen ${
            theme === "dark" ? "bg-slate-800/95 border-r border-slate-700" : "bg-white/95 border-r border-slate-200"
          } backdrop-blur-sm shadow-xl z-10`}
        >
          <Navigation view={view} setView={setView} onHistoryClick={onHistoryClick} />
        </div>

        <main className="flex-1 overflow-auto ml-64">
          <div className="p-8">
            <div className="animate-fadeIn max-w-5xl mx-auto">{children}</div>
          </div>
        </main>
      </div>

      <Toast show={toast.show} message={toast.message} type={toast.type} onClose={onToastClose} />
    </div>
  )
}

export default Layout
