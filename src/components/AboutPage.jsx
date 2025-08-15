"use client"
import { useTheme } from "./ThemeProvider"

function AboutPage() {
  const { theme } = useTheme()

  return (
    <div className="animate-slideUp">
      <div
        className={`rounded-2xl p-8 shadow-xl backdrop-blur-sm transition-all duration-300 ${
          theme === "dark" ? "bg-gray-800/80 border border-gray-700" : "bg-white/80 border border-cyan-100"
        }`}
      >
        <h2
          className={`text-3xl font-bold mb-8 flex items-center gap-3 ${
            theme === "dark" ? "text-white" : "text-gray-800"
          }`}
        >
          <span className="text-4xl">ℹ️</span>
          About
        </h2>

        <div className="text-center py-16">
          <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 flex items-center justify-center shadow-lg animate-pulse">
            <span className="text-6xl">🧙‍♂️</span>
          </div>
          <p className={`text-lg ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Coming soon...</p>
        </div>
      </div>
    </div>
  )
}

export default AboutPage
