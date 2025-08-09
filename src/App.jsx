// =======================================================================
// File: App.jsx
// Description: The React renderer component for the user interface.
// It handles listening for IPC events and managing the app's state.
// =======================================================================
import { useState, useEffect } from 'react';

function App() {
  const [response, setResponse] = useState('');
  const [hotkeyText, setHotkeyText] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ visible: false, text: '' });
  const [isElectron, setIsElectron] = useState(false);

  useEffect(() => {
    // Check if the electronAPI is available before trying to use it.
    if (window.electronAPI) {
      setIsElectron(true);

      // Listen for the hotkey trigger (initial state)
      window.electronAPI.onHotkeyTriggered((text) => {
        setHotkeyText(text);
        setLoading(true);
        setResponse('');
        setNotification({ visible: true, text: 'Getting info from Gemini...' });
      });

      // Listen for the final hotkey response
      window.electronAPI.onHotkeyResponse((gptResponse) => {
        setResponse(gptResponse);
        setLoading(false);
        setNotification({ visible: true, text: gptResponse });

        setTimeout(() => {
          setNotification({ visible: false, text: '' });
        }, 5000);
      });
    }
  }, []);

  if (!isElectron) {
    // Show a fallback message if the app is not running in Electron
    return (
      <div style={{ padding: '2rem', fontFamily: 'sans-serif', textAlign: 'center' }}>
        <p style={{ color: '#ff6347' }}>This application must be run inside Electron.</p>
        <p>Please use `npm run start` to launch the desktop application.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      {loading ? (
        <p>Getting info from Gemini...</p>
      ) : response ? (
        <pre style={{ marginTop: '2rem', whiteSpace: 'pre-wrap' }}>{response}</pre>
      ) : (
        // Add this welcome message when no hotkey has been pressed yet
        <div style={{ textAlign: 'center', marginTop: '2rem', color: '#666' }}>
          <p>Copy some text and press <strong>Ctrl+Shift+G</strong> to get started!</p>
        </div>
      )}

      {hotkeyText && (
        <div style={{ marginTop: '1rem', padding: '1rem', background: '#eee', borderRadius: '8px' }}>
          <strong>Copied Text (Hotkey):</strong> {hotkeyText}
        </div>
      )}

      {notification.visible && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          maxWidth: '300px',
          padding: '1rem',
          background: '#4CAF50',
          color: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          zIndex: 1000,
          whiteSpace: 'pre-wrap',
          fontSize: '14px',
          transition: 'opacity 0.5s ease-in-out',
          opacity: 1
        }}>
          {notification.text}
        </div>
      )}
    </div>
  );
}

export default App;
