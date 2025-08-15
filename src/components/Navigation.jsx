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
    <nav className="h-full flex flex-col">
      <div className="p-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${
              theme === "dark"
                ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white"
                : "bg-gradient-to-br from-blue-500 to-purple-500 text-white"
            } shadow-lg`}
          >
            CW
          </div>
          <div>
            <h1 className={`font-bold text-lg ${theme === "dark" ? "text-white" : "text-slate-800"}`}>CopyWizz</h1>
            <p className={`text-xs ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>AI Writing Assistant</p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4">
        <div className="space-y-2">
          {navItems.map((item, index) => (
            <button
              key={item.id}
              onClick={() => handleClick(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 text-left group relative overflow-hidden ${
                view === item.id
                  ? theme === "dark"
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-[1.02]"
                    : "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-[1.02]"
                  : theme === "dark"
                    ? "text-slate-300 hover:bg-slate-700/50 hover:text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
              }`}
              style={{
                animationDelay: `${index * 100}ms`,
                animation: "slideInLeft 0.5s ease-out forwards",
              }}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-semibold">{item.label}</span>

              {view === item.id && <div className="absolute right-2 w-2 h-2 bg-white rounded-full animate-pulse" />}
            </button>
          ))}
        </div>
      </div>

      <div className={`p-4 border-t ${theme === "dark" ? "border-slate-700" : "border-slate-200"}`}>
        <div className={`text-xs text-center ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
          <p>© 2024 CopyWizz</p>
          <p>Professional Edition</p>
        </div>
      </div>
    </nav>
  )
}

export default Navigation
