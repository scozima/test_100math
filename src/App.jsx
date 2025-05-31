// App.jsx
import { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "./context/AuthProvider";

import Login from "./pages/Login";
import Lesson from "./pages/Lesson";
import Nomatch from "./pages/Nomatch";
import AppLayout from "./pages/layout/AppLayout";
import Problem from "./pages/Problem";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";

import { Toaster } from "sonner";

function App() {
  const { user, loading } = useContext(AuthContext);
  const basename = import.meta.env.BASENAME || "/";

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router basename={basename}>
      <Toaster richColors />
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="/lesson" element={<Lesson />} />
          <Route
            path="/problem"
            element={user ? <Problem /> : <Navigate to="/" />}
          />
          <Route
            path="/dashboard"
            element={user ? <Dashboard /> : <Navigate to="/" />}
          />
          <Route path="*" element={<Nomatch />} />
        </Route>
        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" /> : <Login />}
        />
        {/* Stripe決済関連のページ */}
        <Route path="/success" element={<PaymentSuccess />} />
        <Route path="/canceled" element={<PaymentCancel />} />
      </Routes>
    </Router>
  );
}

export default App;
