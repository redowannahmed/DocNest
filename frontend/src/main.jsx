import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./components/App.jsx";
import "./index.css";
import "./App.css";
import "@fortawesome/fontawesome-free/css/all.min.css"; // Font Awesome
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";
import Landing from "./components/Landing";
import DoctorDashboard from "./components/DoctorDashboard";


function AppRouter() {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const navigate = useNavigate();

  const handleLogin = (userData, token) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);

  // ✅ Redirect based on role
    if (userData.role === "doctor") {
      navigate("/doctor");
    } else {
      navigate("/");
    }
  };

  const handleRegister = (userData, token) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);

    if (userData.role === "doctor") {
      navigate("/doctor");
    } else {
      navigate("/");
    }
  };


  return (
    <Routes>
      <Route path="/signin" element={<SignIn onLogin={handleLogin} />} />
      <Route path="/signup" element={<SignUp onRegister={handleRegister} />} />
      <Route path="/" element={<Landing user={user} setUser={setUser} />} />
      {user?.role === "doctor" && (
        <Route path="/doctor" element={<DoctorDashboard />} />
      )}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  </React.StrictMode>
);
