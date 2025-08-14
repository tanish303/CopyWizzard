// =======================================================================
// FILE: src/App.jsx (Main Controller Component)
// =======================================================================
import { useState, useEffect, useCallback } from 'react';
import Navigation from './components/Navigation';
import HomePage from './components/HomePage';
import HowToUsePage from './components/HowToUsePage';
import HistoryPage from './components/HistoryPage';
import SettingsPage from './components/SettingsPage';

// --- MOVED STYLES OBJECT TO THE TOP ---
// Global styles are now defined before the component that uses them.
const styles = {
  container: {
    padding: '0 2rem 2rem 2rem',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: '#333',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column'
  },
  mainContent: {
    flexGrow: 1,
    overflowY: 'auto'
  },
  nav: {
    display: 'flex',
    gap: '1rem',
    borderBottom: '1px solid #eee',
    padding: '1rem 0',
    flexShrink: 0,
  },
  navButton: {
    background: 'none',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    color: '#555'
  },
  navButtonActive: {
    background: '#007bff',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem'
  },
  pageContainer: {
    textAlign: 'center',
    paddingTop: '4rem'
  },
  appName: {
    fontSize: '3rem',
    fontWeight: 'bold',
    color: '#007bff'
  },
  punchline: {
    fontSize: '1.2rem',
    color: '#666'
  },
  pageTitle: {
    textAlign: 'left',
    borderBottom: '1px solid #eee',
    paddingBottom: '0.5rem',
    marginBottom: '2rem'
  },
  instructions: {
    textAlign: 'left',
    maxWidth: '600px',
    margin: '0 auto',
    lineHeight: '1.6'
  },
  hotkey: {
    background: '#eee',
    padding: '2px 6px',
    borderRadius: '4px',
    fontFamily: 'monospace'
  },
  historyList: {
    listStyle: 'none',
    padding: 0,
  },
  historyItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '1px solid #eee',
    padding: '1rem 0'
  },
  historyContent: { 
    marginRight: '1rem',
    flex: 1
  },
  favoriteButton: {
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    padding: '0.5rem',
    color: '#ffc107'
  }
};


function App() {
  const [view, setView] = useState('home'); // 'home', 'how-to-use', 'history', 'settings'
  const [history, setHistory] = useState([]);
  const [isElectron, setIsElectron] = useState(false);

  const fetchHistory = useCallback(async () => {
    if (window.electronAPI) {
      const historyData = await window.electronAPI.getHistory();
      setHistory(historyData);
    }
  }, []);

  const handleToggleFavorite = async (itemId) => {
    if (window.electronAPI) {
      await window.electronAPI.toggleFavorite(itemId);
      fetchHistory();
    }
  };
  
  useEffect(() => {
    if (window.electronAPI) {
      setIsElectron(true);
      if (view === 'history') {
        fetchHistory();
      }
      
      const handleResponse = () => {
        if (view === 'history') {
          fetchHistory();
        }
      };

      window.electronAPI.onHotkeyResponse(handleResponse);
    }
  }, [fetchHistory, view]);

  if (!isElectron) {
    return (
      <div style={styles.container}>
        <p style={{ color: '#ff6347' }}>This application must be run inside Electron.</p>
      </div>
    );
  }

  const renderView = () => {
    switch(view) {
      case 'home':
        return <HomePage styles={styles} />;
      case 'how-to-use':
        return <HowToUsePage styles={styles} />;
      case 'history':
        return <HistoryPage styles={styles} history={history} onToggleFavorite={handleToggleFavorite} />;
      case 'settings':
        return <SettingsPage styles={styles} />;
      default:
        return <HomePage styles={styles} />;
    }
  }
  
  return (
    <div style={styles.container}>
      <Navigation view={view} setView={setView} onHistoryClick={() => { setView('history'); fetchHistory(); }} styles={styles} />
      <main style={styles.mainContent}>
        {renderView()}
      </main>
    </div>
  );
}


export default App;


