"use client"

import { useState, useEffect } from "react"
import { useTheme } from "./ThemeProvider"

function SettingsPage({ showToast }) {
  const [apiKey, setApiKey] = useState("")
  const [launchAtLogin, setLaunchAtLogin] = useState(true)
  const [customPrompt, setCustomPrompt] = useState("")
  const [appVersion, setAppVersion] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [message, setMessage] = useState({ text: "", type: "" })
  const [wordCount, setWordCount] = useState(0)
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    const loadSettings = async () => {
      if (window.electronAPI) {
        const settings = await window.electronAPI.getSettings()
        setApiKey(settings.apiKey || "")
        setLaunchAtLogin(settings.launchAtLogin)
        setCustomPrompt(settings.customPrompt || "")
        setAppVersion(settings.appVersion || "")
        setWordCount(
          settings.customPrompt ? settings.customPrompt.split(" ").filter((word) => word.length > 0).length : 0,
        )
      }
    }
    loadSettings()
  }, [])

  const handleCustomPromptChange = (e) => {
    const text = e.target.value
    const words = text.split(" ").filter((word) => word.length > 0)

    if (words.length <= 120) {
      setCustomPrompt(text)
      setWordCount(words.length)
    }
  }

  const handleSave = async () => {
    if (window.electronAPI) {
      setIsVerifying(true)
      setMessage({ text: "Verifying API Key...", type: "info" })

      const verificationResult = await window.electronAPI.verifyApiKey(apiKey)
      setIsVerifying(false)

      if (verificationResult.success) {
        await window.electronAPI.setApiKey(apiKey)
        await window.electronAPI.setLaunchAtLogin(launchAtLogin)
        await window.electronAPI.setCustomPrompt(customPrompt)

        setMessage({ text: "Settings saved successfully!", type: "success" })
        showToast("Settings saved successfully!", "success")
      } else {
        setMessage({ text: `Error: ${verificationResult.error}`, type: "error" })
        showToast(`Error: ${verificationResult.error}`, "error")
      }

      setTimeout(() => setMessage({ text: "", type: "" }), 4000)
    }
  }

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
          <span className="text-4xl">⚙️</span>
          Settings
        </h2>

        <div className="space-y-8">
          {/* Theme Toggle */}
          <div className="animate-slideInLeft" style={{ animationDelay: "0.1s" }}>
            <label
              className={`block text-sm font-semibold mb-3 ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}
            >
              Theme Preference
            </label>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${
                  theme === "dark" ? "bg-teal-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-300 ${
                    theme === "dark" ? "translate-x-9" : "translate-x-1"
                  }`}
                />
              </button>
              <span className={`text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                {theme === "dark" ? "🌙 Dark Mode" : "☀️ Light Mode"}
              </span>
            </div>
          </div>

          {/* API Key */}
          <div className="animate-slideInLeft" style={{ animationDelay: "0.2s" }}>
            <label
              className={`block text-sm font-semibold mb-3 ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}
            >
              Gemini API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key here"
              className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                theme === "dark"
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
              }`}
            />
          </div>

          {/* Custom Prompt */}
          <div className="animate-slideInLeft" style={{ animationDelay: "0.3s" }}>
            <label
              className={`block text-sm font-semibold mb-3 ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}
            >
              Custom AI Prompt
              <span
                className={`ml-2 text-xs ${
                  wordCount > 120 ? "text-red-500" : theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                ({wordCount}/120 words)
              </span>
            </label>
            <textarea
              value={customPrompt}
              onChange={handleCustomPromptChange}
              rows={6}
              className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none ${
                theme === "dark"
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
              }`}
              placeholder="Enter your custom prompt here..."
            />
          </div>

          {/* Launch at Login */}
          <div className="animate-slideInLeft" style={{ animationDelay: "0.4s" }}>
            <label
              className={`flex items-center gap-3 cursor-pointer p-4 rounded-xl transition-all duration-300 hover:scale-105 ${
                theme === "dark" ? "hover:bg-gray-700" : "hover:bg-cyan-50"
              }`}
            >
              <input
                type="checkbox"
                checked={launchAtLogin}
                onChange={(e) => setLaunchAtLogin(e.target.checked)}
                className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
              />
              <span className={`font-medium ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>
                Launch automatically when you log in
              </span>
            </label>
          </div>

          {/* Save Button */}
          <div className="animate-slideInLeft" style={{ animationDelay: "0.5s" }}>
            <button
              onClick={handleSave}
              disabled={isVerifying}
              className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                isVerifying
                  ? "bg-gray-500"
                  : "bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 shadow-lg hover:shadow-xl"
              }`}
            >
              {isVerifying ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Verifying...
                </span>
              ) : (
                "Save All Settings"
              )}
            </button>
          </div>

          {/* Message */}
          {message.text && (
            <div
              className={`p-4 rounded-xl animate-slideInUp ${
                message.type === "error"
                  ? theme === "dark"
                    ? "bg-red-900/50 text-red-300 border border-red-700"
                    : "bg-red-50 text-red-700 border border-red-200"
                  : message.type === "success"
                    ? theme === "dark"
                      ? "bg-green-900/50 text-green-300 border border-green-700"
                      : "bg-green-50 text-green-700 border border-green-200"
                    : theme === "dark"
                      ? "bg-blue-900/50 text-blue-300 border border-blue-700"
                      : "bg-blue-50 text-blue-700 border border-blue-200"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* App Version */}
          <div
            className={`text-center pt-8 border-t ${
              theme === "dark" ? "border-gray-700 text-gray-400" : "border-gray-200 text-gray-500"
            }`}
          >
            <p className="text-sm">CopyWizz Version: {appVersion}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
