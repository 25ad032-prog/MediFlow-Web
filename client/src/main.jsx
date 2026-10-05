import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { QueueProvider } from './context/QueueContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <QueueProvider>
        <App />
      </QueueProvider>
    </AuthProvider>
  </React.StrictMode>,
);
