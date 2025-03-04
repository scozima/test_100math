// src/index.js
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './i18n/config'
import { AuthProvider } from "./context/AuthProvider"; // AuthProviderをインポート

ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthProvider> {/* App全体をAuthProviderでラップ */}
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </AuthProvider>
)
