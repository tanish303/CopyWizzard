"use client"
import { useTheme } from "./ThemeProvider"

function HomePage() {
  const { theme } = useTheme()

  return (
    <div className="text-center py-16 animate-slideUp">
      <div
        className={`inline-block p-8 rounded-3xl shadow-2xl backdrop-blur-sm transition-all duration-500 hover:scale-105 ${
          theme === "dark" ? "bg-gray-800/50 border border-gray-700" : "bg-white/70 border border-cyan-100"
        }`}
      >
        <div className="mb-6">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 flex items-center justify-center shadow-lg animate-pulse">
            <span className="text-4xl">🧙‍♂️</span>
          </div>
        </div>

        <h1
          className={`text-6xl font-bold mb-4 bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent animate-shimmer ${
            theme === "dark" ? "from-teal-400 to-cyan-400" : "from-teal-600 to-cyan-600"
          }`}
        >
          CopyWizz
        </h1>

        <p className={`text-xl mb-8 leading-relaxed ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
          Your instant second brain. Just a keypress away.
        </p>

        <div
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium ${
            theme === "dark"
              ? "bg-gray-700 text-gray-300 border border-gray-600"
              : "bg-cyan-50 text-teal-700 border border-cyan-200"
          }`}
        >
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Ready to assist
        </div>
      </div>
    </div>
  )
}

export default HomePage
