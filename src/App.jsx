import { useState, useEffect } from 'react';

function App() {
  const [response, setResponse] = useState('');
  const [hotkeyText, setHotkeyText] = useState('');
  const [loading, setLoading] = useState(false); // 1. Add loading state

  useEffect(() => {
    window.electronAPI.onHotkey(async (text) => {  // 2. Make listener async
      setHotkeyText(text);
      setLoading(true);              // Show loading message
      setResponse('');               // Clear previous response

      try {
        const gptResponse = await window.electronAPI.askGPT(text);  // Call Gemini API
        setResponse(gptResponse);
        alert(`Explanation:\n\n${gptResponse}`);  // Show explanation popup
      } catch (err) {
        setResponse('Error getting explanation.');
      } finally {
        setLoading(false);           // Stop loading message
      }
    });
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      {/* Optional: you can keep this button or remove it */}
      {/* <button onClick={handleAskGPT} style={{ padding: '10px 20px', fontSize: '16px' }}>
        Ask GPT (Clipboard)
      </button> */}
      
      {loading ? (
        <p>Getting info from Gemini...</p>   // Show loading when waiting
      ) : (
        <pre style={{ marginTop: '2rem', whiteSpace: 'pre-wrap' }}>{response}</pre>
      )}

      {hotkeyText && (
        <div style={{ marginTop: '1rem', padding: '1rem', background: '#eee', borderRadius: '8px' }}>
          <strong>Copied Text (Hotkey):</strong> {hotkeyText}
        </div>
      )}
    </div>
  );
}

export default App;
