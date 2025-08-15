"use client"
import { useTheme } from "./ThemeProvider"

function HowToUsePage() {
  const { theme } = useTheme()

  const steps = [
    {
      title: "Getting an Explanation",
      icon: "🔍",
      steps: [
        "Select any text on your screen from any application.",
        "Press the hotkey CommandOrControl+Shift+G.",
        "A small toast notification will appear with a concise explanation of the selected text.",
      ],
    },
    {
      title: "Continuing the Conversation",
      icon: "💬",
      steps: [
        'After a response appears, the toast will have a "Continue Conversation" button.',
        "Clicking this button will copy the full context of your query and the AI's response to your clipboard.",
        "It will then automatically open Gemini in your web browser.",
        "Simply paste (Ctrl+V or Cmd+V) into the Gemini prompt to continue the discussion with the full context.",
      ],
    },
    {
      title: "Viewing Your History",
      icon: "📚",
      steps: [
        "Open the main application window by clicking the tray icon.",
        'Navigate to the "History" tab to see a list of all your past queries.',
        "You can mark important queries by clicking the star icon (☆) to favorite them.",
      ],
    },
  ]

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
          <span className="text-4xl">📖</span>
          How to Use CopyWizz
        </h2>

        <div className="space-y-8">
          {steps.map((section, sectionIndex) => (
            <div
              key={section.title}
              className={`p-6 rounded-xl border transition-all duration-300 animate-slideInLeft ${
                theme === "dark" ? "bg-gray-700/50 border-gray-600" : "bg-white/70 border-gray-200"
              }`}
              style={{ animationDelay: `${sectionIndex * 0.2}s` }}
            >
              <h3
                className={`text-xl font-bold mb-4 flex items-center gap-3 ${
                  theme === "dark" ? "text-gray-200" : "text-gray-700"
                }`}
              >
                <span className="text-2xl">{section.icon}</span>
                {section.title}
              </h3>

              <ol className="space-y-3">
                {section.steps.map((step, stepIndex) => (
                  <li
                    key={stepIndex}
                    className={`flex gap-4 animate-slideInLeft ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}
                    style={{ animationDelay: `${sectionIndex * 0.2 + stepIndex * 0.1}s` }}
                  >
                    <span
                      className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                        theme === "dark" ? "bg-teal-600" : "bg-teal-500"
                      }`}
                    >
                      {stepIndex + 1}
                    </span>
                    <span className="leading-relaxed">
                      {step.split(/(\*\*.*?\*\*)/).map((part, i) =>
                        part.startsWith("**") && part.endsWith("**") ? (
                          <kbd
                            key={i}
                            className={`px-2 py-1 rounded text-xs font-mono ${
                              theme === "dark"
                                ? "bg-gray-600 text-gray-200 border border-gray-500"
                                : "bg-gray-100 text-gray-700 border border-gray-300"
                            }`}
                          >
                            {part.slice(2, -2)}
                          </kbd>
                        ) : (
                          part
                        ),
                      )}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default HowToUsePage
