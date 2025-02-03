import { useState } from "react";
import "./App.scss";
import "./Common.scss";
import MathTable from "./components/MathTable";
import AddQuestion from "./components/AddQuestion";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Lesson from "./pages/Lesson";
import Nomatch from "./pages/Nomatch";
import AppLayout from "./pages/layout/AppLayout";
import Problem from "./pages/Problem";
import Home from "./pages/Home";

function App() {
  const [count, setCount] = useState(0);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="/lesson" element={<Lesson />} />
          <Route path="/problem" element={<Problem />} />
          <Route path="*" element={<Nomatch />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
