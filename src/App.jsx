// App.jsx
import { useState, useContext } from "react";
import "./App.scss";
import "./Common.scss";
import MathTable from "./components/MathTable";
import AddQuestion from "./components/AddQuestion";

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "./context/AuthProvider"; // ここでインポート

import Login from "./pages/Login";
import Lesson from "./pages/Lesson";
import Nomatch from "./pages/Nomatch";
import AppLayout from "./pages/layout/AppLayout";
import Problem from "./pages/Problem";
import Home from "./pages/Home";

// ここでAuthProviderをインポート
import { AuthProvider } from "./context/AuthContext"; // 修正
import Header from "./components/Header";

function App() {
  const { user } = useContext(AuthContext); // AuthContextからuserを取得

  return (
    // App全体をAuthProviderでラップ
    <AuthProvider>
      <Router basename="/pj/100math">
      <Header /> 
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route
              index
              element={user ? <Home /> : <Navigate to="/login" />} // ログインしていない場合はログインページにリダイレクト
            />
            <Route
              path="/lesson"
              element={user ? <Lesson /> : <Navigate to="/login" />} // ログインしていない場合はログインページにリダイレクト
            />
            <Route
              path="/problem"
              element={user ? <Problem /> : <Navigate to="/login" />} // ログインしていない場合はログインページにリダイレクト
            />
            <Route path="*" element={<Nomatch />} />
          </Route>
          <Route path="/login" element={<Login />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
