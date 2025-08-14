import React from 'react';

function Navigation({ view, setView, onHistoryClick, styles }) {
  return (
    <nav style={styles.nav}>
      <button onClick={() => setView('home')} style={view === 'home' ? styles.navButtonActive : styles.navButton}>
        Home
      </button>
      <button onClick={() => setView('how-to-use')} style={view === 'how-to-use' ? styles.navButtonActive : styles.navButton}>
        How to Use
      </button>
      <button onClick={onHistoryClick} style={view === 'history' ? styles.navButtonActive : styles.navButton}>
        History
      </button>
      <button onClick={() => setView('settings')} style={view === 'settings' ? styles.navButtonActive : styles.navButton}>
        Settings
      </button>
    </nav>
  );
}

export default Navigation;