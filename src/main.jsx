import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // ✅ Correctly importing the real App component

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />); // ✅ Render the imported App component
