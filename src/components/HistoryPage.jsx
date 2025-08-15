"use client"
import { useTheme } from "./ThemeProvider"

function HistoryPage({ history, onToggleFavorite }) {
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
          <span className="text-4xl">📚</span>
          Query History
        </h2>

        {history.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 flex items-center justify-center opacity-50">
              <span className="text-4xl">📝</span>
            </div>
            <p className={`text-lg ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
              No history yet. Use the hotkey to ask a question!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {history.map((item, index) => (
              <div
                key={item.id}
                className={`p-6 rounded-xl border transition-all duration-300 hover:scale-[1.02] animate-slideInLeft ${
                  theme === "dark"
                    ? "bg-gray-700/50 border-gray-600 hover:bg-gray-700"
                    : "bg-white/70 border-gray-200 hover:bg-white"
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 space-y-4">
                    <div>
                      <h3 className={`font-semibold mb-2 ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>
                        Query:
                      </h3>
                      <p className={`${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>{item.query}</p>
                    </div>

                    <div>
                      <h3 className={`font-semibold mb-2 ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>
                        Response:
                      </h3>
                      <p
                        className={`whitespace-pre-wrap leading-relaxed ${
                          theme === "dark" ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        {item.response}
                      </p>
                    </div>

                    <div className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                      {new Date(item.timestamp).toLocaleString()}
                    </div>
                  </div>

                  <button
                    onClick={() => onToggleFavorite(item.id)}
                    className={`p-3 rounded-full transition-all duration-300 hover:scale-110 ${
                      item.favorited
                        ? "text-yellow-500 hover:text-yellow-600"
                        : theme === "dark"
                          ? "text-gray-500 hover:text-yellow-500"
                          : "text-gray-400 hover:text-yellow-500"
                    }`}
                    title={item.favorited ? "Remove from favorites" : "Add to favorites"}
                  >
                    <span className="text-2xl">{item.favorited ? "★" : "☆"}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default HistoryPage
