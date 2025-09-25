// src/App.js
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
// ✨ 1. IMPORT TOASTIFY
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AddJob from "./pages/AddJob";

function App() {
  const token = localStorage.getItem("token");

  return (
    <Router>
      {/* ✨ 2. ADD THE TOAST CONTAINER HERE */}
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar={false} />
      <Routes>
        {/* ... your routes ... */}
        <Route path="/" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/add-job" element={token ? <AddJob /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;