// src/index.js
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./context/AuthProvider"; // AuthProviderをインポート
import "./index.css";  // Tailwind CSSのインポートを追加

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <AuthProvider> {/* App全体をAuthProviderでラップ */}
    <App />
  </AuthProvider>
);
