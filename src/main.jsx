// src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { AuthProvider } from "./context/AuthProvider"; // AuthProviderをインポート

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <AuthProvider> {/* App全体をAuthProviderでラップ */}
    <App />
  </AuthProvider>
);
