// Header.jsx
import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext"; // AuthContextのインポート
import "./Header.scss";

const Header = () => {
  const { user, logout } = useContext(AuthContext); // user情報を取得

  return (
    <header>
      <div className="user-info">
        {user ? (
          <div className="user-details">
            <img 
              src={user.photoURL || "/default-avatar.png"}  // 画像がない場合はデフォルト画像を使用
              alt="User Avatar" 
              style={{ width: 40, height: 40, borderRadius: "50%" }} 
            />
            <span>{user.displayName}</span>
            <button onClick={logout}>ログアウト</button>  {/* ログアウトボタン */}
          </div>
        ) : (
          <span>ログインしていません</span>
        )}
      </div>
    </header>
  );
};

export default Header;
