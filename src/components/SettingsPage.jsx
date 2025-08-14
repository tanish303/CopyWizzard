import React, { useState, useEffect } from 'react';

function SettingsPage({ styles }) {
  const [apiKey, setApiKey] = useState('');
  const [launchAtLogin, setLaunchAtLogin] = useState(true);
  const [customPrompt, setCustomPrompt] = useState('');
  const [appVersion, setAppVersion] = useState('');
  
  // --- NEW State for verification ---
  const [isVerifying, setIsVerifying] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' }); // type can be 'success' or 'error'

  useEffect(() => {
    const loadSettings = async () => {
      if (window.electronAPI) {
        const settings = await window.electronAPI.getSettings();
        setApiKey(settings.apiKey || '');
        setLaunchAtLogin(settings.launchAtLogin);
        setCustomPrompt(settings.customPrompt || '');
        setAppVersion(settings.appVersion || '');
      }
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    if (window.electronAPI) {
      // 1. Start verification
      setIsVerifying(true);
      setMessage({ text: 'Verifying API Key...', type: 'info' });

      const verificationResult = await window.electronAPI.verifyApiKey(apiKey);

      setIsVerifying(false);

      // 2. Check result and save if valid
      if (verificationResult.success) {
        await window.electronAPI.setApiKey(apiKey);
        await window.electronAPI.setLaunchAtLogin(launchAtLogin);
        await window.electronAPI.setCustomPrompt(customPrompt);
        
        setMessage({ text: 'Settings saved successfully!', type: 'success' });
      } else {
        setMessage({ text: `Error: ${verificationResult.error}`, type: 'error' });
      }

      setTimeout(() => setMessage({ text: '', type: '' }), 4000);
    }
  };

  return (
    <div>
      <h2 style={styles.pageTitle}>Settings</h2>
      <div style={styles.settingsContainer}>
        
        <div style={styles.formGroup}>
          <label htmlFor="apiKey" style={styles.label}>Gemini API Key</label>
          <input
            type="password"
            id="apiKey"
            style={styles.input}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your API key here"
          />
        </div>

        <div style={styles.formGroup}>
          <label htmlFor="customPrompt" style={styles.label}>Custom AI Prompt</label>
          <textarea
            id="customPrompt"
            style={{...styles.input, height: '150px', whiteSpace: 'pre-wrap'}}
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
          />
        </div>

        <div style={styles.formGroup}>
           <label style={{...styles.label, display: 'flex', alignItems: 'center', cursor: 'pointer'}}>
            <input
              type="checkbox"
              checked={launchAtLogin}
              onChange={(e) => setLaunchAtLogin(e.target.checked)}
              style={{marginRight: '10px'}}
            />
            Launch automatically when you log in
          </label>
        </div>

        <button onClick={handleSave} style={styles.saveButton} disabled={isVerifying}>
          {isVerifying ? 'Verifying...' : 'Save All Settings'}
        </button>
        {message.text && (
          <p style={{ 
            ...styles.saveMessage, 
            color: message.type === 'error' ? 'red' : 'green' 
          }}>
            {message.text}
          </p>
        )}

        <div style={{...styles.aboutSection, marginTop: '3rem'}}>
          <p>CopyWizz Version: {appVersion}</p>
        </div>

      </div>
    </div>
  );
}

export default SettingsPage;
