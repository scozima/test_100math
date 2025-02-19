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
import Dashboard from "./pages/Dashboard";
import Header from "./components/Header";

// ここでAuthProviderをインポート
import { AuthProvider } from "./context/AuthContext"; // 修正

function App() {
  const { user, loading } = useContext(AuthContext); // loadingも一緒に取得
  const basename = process.env.BASENAME || '/';

  if (loading) {
    return <div>Loading...</div>;  // user情報が取得されるまでローディング表示
  }

  return (
    <AuthProvider>
      <Router basename={basename}>
        <Header />
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route
              index
              element={user ? <Home /> : <Navigate to="/login" />}
            />
            <Route
              path="/lesson"
              element={user ? <Lesson /> : <Navigate to="/login" />}
            />
            <Route
              path="/problem"
              element={user ? <Problem /> : <Navigate to="/login" />}
            />
            <Route
              path="/dashboard"
              element={user ? <Dashboard /> : <Navigate to="/login" />}
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
