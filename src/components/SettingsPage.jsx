import React, { useState, useEffect } from 'react';

function SettingsPage({ styles }) {
  const [apiKey, setApiKey] = useState('');
  const [launchAtLogin, setLaunchAtLogin] = useState(true);
  const [customPrompt, setCustomPrompt] = useState('');
  const [appVersion, setAppVersion] = useState('');
  
  const [saveMessage, setSavedMessage] = useState('');

  useEffect(() => {
    const loadSettings = async () => {
      console.log('[SettingsPage] Fetching settings...');
      if (window.electronAPI) {
        const settings = await window.electronAPI.getSettings();
        console.log('[SettingsPage] Received settings:', settings);
        setApiKey(settings.apiKey || '');
        setLaunchAtLogin(settings.launchAtLogin);
        setCustomPrompt(settings.customPrompt || '');
        setAppVersion(settings.appVersion || '');
      }
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    console.log('[SettingsPage] Save button clicked.');
    if (window.electronAPI) {
      // Save all settings at once
      await window.electronAPI.setApiKey(apiKey);
      await window.electronAPI.setLaunchAtLogin(launchAtLogin);
      await window.electronAPI.setCustomPrompt(customPrompt);
      
      console.log('[SettingsPage] All settings sent to main process.');
      setSavedMessage('Settings saved successfully!');
      setTimeout(() => setSavedMessage(''), 3000);
    }
  };

  return (
    <div>
      <h2 style={styles.pageTitle}>Settings</h2>
      <div style={styles.settingsContainer}>
        
        {/* API Key Management */}
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

        {/* Prompt Customization */}
        <div style={styles.formGroup}>
          <label htmlFor="customPrompt" style={styles.label}>Custom AI Prompt</label>
          <textarea
            id="customPrompt"
            style={{...styles.input, height: '150px', whiteSpace: 'pre-wrap'}}
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
          />
        </div>

        {/* Application Behavior */}
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

        <button onClick={handleSave} style={styles.saveButton}>
          Save All Settings
        </button>
        {saveMessage && <p style={styles.saveMessage}>{saveMessage}</p>}

        {/* About Section */}
        <div style={styles.aboutSection}>
          <p>CopyWizz Version: {appVersion}</p>
        </div>

      </div>
    </div>
  );
}

export default SettingsPage;
