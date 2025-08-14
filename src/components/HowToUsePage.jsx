import React from 'react';

function HowToUsePage({ styles }) {
  return (
    <div>
      <h2 style={styles.pageTitle}>How to Use CopyWizz</h2>
      <div style={styles.instructions}>
        <h3>Getting an Explanation</h3>
        <ol>
          <li>Select any text on your screen from any application.</li>
          <li>Press the hotkey <strong style={styles.hotkey}>CommandOrControl+Shift+G</strong>.</li>
          <li>A small toast notification will appear with a concise explanation of the selected text.</li>
        </ol>
        
        <h3>Continuing the Conversation</h3>
        <ol>
          <li>After a response appears, the toast will have a "Continue Conversation" button.</li>
          <li>Clicking this button will copy the full context of your query and the AI's response to your clipboard.</li>
          <li>It will then automatically open Gemini in your web browser.</li>
          <li>Simply paste (<strong style={styles.hotkey}>Ctrl+V</strong> or <strong style={styles.hotkey}>Cmd+V</strong>) into the Gemini prompt to continue the discussion with the full context.</li>
        </ol>

        <h3>Viewing Your History</h3>
        <ol>
          <li>Open the main application window by clicking the tray icon.</li>
          <li>Navigate to the "History" tab to see a list of all your past queries.</li>
          <li>You can mark important queries by clicking the star icon (☆) to favorite them.</li>
        </ol>
      </div>
    </div>
  );
}

export default HowToUsePage;
