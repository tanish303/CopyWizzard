import React from 'react';

function HomePage({ styles }) {
  return (
    <div style={styles.pageContainer}>
      <h1 style={styles.appName}>CopyWizz</h1>
      <p style={styles.punchline}>Your instant second brain. Just a keypress away.</p>
    </div>
  );
}

export default HomePage;