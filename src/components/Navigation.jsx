"use client"
import { useTheme } from "./ThemeProvider"

function Navigation({ view, setView, onHistoryClick }) {
  const { theme } = useTheme()

  const navItems = [
    { id: "home", label: "Home", icon: "🏠" },
    { id: "how-to-use", label: "How to Use", icon: "📖" },
    { id: "history", label: "History", icon: "📚" },
    { id: "settings", label: "Settings", icon: "⚙️" },
    { id: "about", label: "About", icon: "ℹ️" },
  ]

  const handleClick = (itemId) => {
    if (itemId === "history") {
      onHistoryClick()
    } else {
      setView(itemId)
    }
  }

  return (
    <nav
      className={`rounded-2xl p-2 shadow-lg backdrop-blur-sm transition-all duration-300 ${
        theme === "dark" ? "bg-gray-800/80 border border-gray-700" : "bg-white/80 border border-cyan-100"
      }`}
    >
      <div className="flex gap-2 overflow-x-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleClick(item.id)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 whitespace-nowrap transform hover:scale-105 ${
              view === item.id
                ? theme === "dark"
                  ? "bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg"
                  : "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg"
                : theme === "dark"
                  ? "text-gray-300 hover:bg-gray-700 hover:text-white"
                  : "text-gray-600 hover:bg-cyan-50 hover:text-teal-700"
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="hidden sm:inline">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}

export default Navigation
