import React from 'react';

function HistoryPage({ styles, history, onToggleFavorite }) {
  return (
    <div>
      <h2 style={styles.pageTitle}>Query History</h2>
      {history.length === 0 ? (
        <p>No history yet. Use the hotkey to ask a question!</p>
      ) : (
        <ul style={styles.historyList}>
          {history.map((item) => (
            <li key={item.id} style={styles.historyItem}>
              <div style={styles.historyContent}>
                <p><strong>Query:</strong> {item.query}</p>
                <p style={{whiteSpace: 'pre-wrap'}}><strong>Response:</strong> {item.response}</p>
                <small style={{color: '#888'}}>
                  {new Date(item.timestamp).toLocaleString()}
                </small>
              </div>
              <button 
                onClick={() => onToggleFavorite(item.id)}
                style={styles.favoriteButton}
                title={item.favorited ? 'Remove from favorites' : 'Add to favorites'}
              >
                {item.favorited ? '★' : '☆'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default HistoryPage;