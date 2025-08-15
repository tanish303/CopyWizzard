import React, { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    // Load the saved theme from electron-store on initial load
    const loadTheme = async () => {
      if (window.electronAPI) {
        const savedTheme = await window.electronAPI.getTheme();
        setTheme(savedTheme);
        // Apply theme to the root element for Tailwind's dark mode
        document.documentElement.className = savedTheme;
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    // Apply theme to the root element
    document.documentElement.className = newTheme;
    // Save the new theme preference persistently
    if (window.electronAPI) {
      window.electronAPI.setTheme(newTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};