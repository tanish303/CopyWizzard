"use client"
import { useTheme } from "./ThemeProvider"

function AboutPage() {
  const { theme } = useTheme()

  const handleEmailClick = () => {
    window.open("mailto:tanishdhingra2003@gmail.com?subject=CopyWizz Feedback", "_blank")
  }

  return (
    <div className="animate-slideUp">
      <div className="relative overflow-hidden rounded-3xl shadow-2xl backdrop-blur-sm">
        <div
          className={`absolute inset-0 ${
            theme === "dark"
              ? "bg-gradient-to-br from-slate-800 via-slate-900 to-indigo-900"
              : "bg-gradient-to-br from-cyan-50 via-teal-100 to-blue-200"
          }`}
        ></div>
        <div
          className={`absolute inset-0 ${
            theme === "dark"
              ? "bg-gradient-to-t from-black/20 to-transparent"
              : "bg-gradient-to-t from-white/30 to-transparent"
          }`}
        ></div>

        {/* Content */}
        <div className={`relative p-12 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg">
              <span className="text-2xl">ℹ️</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight">Platform Information</h1>
          </div>


          {/* App Description */}
          <div className="space-y-6 mb-10">
            <p className={`text-lg leading-relaxed ${theme === "dark" ? "text-gray-100" : "text-gray-700"}`}>
              Effortlessly understand any text on your screen. Highlight a complex term, a line of code, or a confusing phrase in any application, press a hotkey, and instantly receive a clear, concise explanation.

            </p>

            <p className={`text-lg leading-relaxed ${theme === "dark" ? "text-gray-100" : "text-gray-700"}`}>
           Stop breaking your focus by switching tabs to look things up. CopyWizz streamlines your workflow by providing the answers you need, right when you need them, making it the perfect companion for students, developers, and lifelong learners.

            </p>
          </div>

          {/* Version and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div>
              <h3 className={`text-xl font-semibold mb-2 ${theme === "dark" ? "text-cyan-300" : "text-teal-600"}`}>
                Version:
              </h3>
              <p className={`text-lg ${theme === "dark" ? "text-gray-200" : "text-gray-600"}`}>1.0.0</p>
            </div>
            <div>
              <h3 className={`text-xl font-semibold mb-2 ${theme === "dark" ? "text-cyan-300" : "text-teal-600"}`}>
                Status:
              </h3>
              <p className="text-lg text-green-500 font-medium">Fully Operational</p>
            </div>
          </div>

          {/* Help and Feedback Section */}
          <div className="mb-10">
            <h3 className={`text-xl font-semibold mb-4 ${theme === "dark" ? "text-cyan-300" : "text-teal-600"}`}>
              Help and Feedback:
            </h3>
            <p className={`mb-4 ${theme === "dark" ? "text-gray-200" : "text-gray-600"}`}>
              Need assistance or have suggestions? We'd love to hear from you!
            </p>
            <button
              onClick={handleEmailClick}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg text-white"
            >
              <span className="text-xl">📧</span>
              Contact Support
            </button>
          </div>

          {/* Divider */}
          <div
            className={`w-full h-px bg-gradient-to-r from-transparent to-transparent mb-8 ${
              theme === "dark" ? "via-gray-500" : "via-gray-400"
            }`}
          ></div>

          {/* Footer */}
          <div className="text-center">
            
            <p className={theme === "dark" ? "text-gray-300" : "text-gray-600"}>
              <span className="font-semibold">BY:</span> Tanish Dhingra |
              <button
                onClick={handleEmailClick}
                className={`transition-colors duration-200 ml-1 underline decoration-dotted ${
                  theme === "dark" ? "text-cyan-400 hover:text-cyan-300" : "text-teal-600 hover:text-teal-500"
                }`}
              >
                tanishdhingra2003@gmail.com
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AboutPage
