import React from "react";
import { Link, Outlet } from "react-router-dom";

import reactLogo from "../../assets/react.svg"; // 画像を正しくインポート
import viteLogo from "/vite.svg"; // Vite のロゴ

export default function LContainer() {
  // ✅ 大文字で始める
  return (
    <>
      <ul>
        <li><Link to="/">ホーム</Link></li>
        <li><Link to="/lesson">レッスン</Link></li>
        <li><Link to="/dashboard">ダッシュボード</Link></li>
        <li><Link to="/problem">登録・編集</Link></li>
      </ul>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <Outlet /> {/* ここに子コンポーネントが表示される */}
    </>
  );
}
