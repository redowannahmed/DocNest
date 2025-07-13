"use client"

import React, { useState } from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom"
import SignIn from "./components/SignIn"
import SignUp from "./components/SignUp"
import Homepage from "./components/Homepage" // Import Homepage
import Landing from "./components/Landing" // Import Landing page
import DoctorDashboard from "./components/DoctorDashboard"

function AppRouter() {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user")
    return storedUser ? JSON.parse(storedUser) : null
  })
  const navigate = useNavigate()

  const handleLogin = (userData, token) => {
    setUser(userData)
    localStorage.setItem("user", JSON.stringify(userData))
    localStorage.setItem("token", token)

    // Check user role and redirect to the appropriate route
    if (userData.selectedRole === "doctor") {
      navigate("/doctor")
    } else {
      navigate("/dashboard") // Redirect to the dashboard after login
    }
  }

  const handleRegister = (userData, token) => {
    setUser(userData)
    localStorage.setItem("user", JSON.stringify(userData))
    localStorage.setItem("token", token)
    navigate("/dashboard") // Redirect to dashboard after registration
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    navigate("/")
  }

  return (
    <Routes>
      {/* Homepage - shown to unauthenticated users */}
      <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Homepage />} />

      {/* Authentication routes - only accessible when not logged in */}
      <Route path="/signin" element={user ? <Navigate to="/dashboard" /> : <SignIn onLogin={handleLogin} />} />
      <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <SignUp onRegister={handleRegister} />} />

      {/* Protected routes - only accessible when logged in */}
      <Route
        path="/dashboard"
        element={user ? <Landing user={user} setUser={setUser} onLogout={handleLogout} /> : <Navigate to="/" />}
      />
      <Route
        path="/doctor"
        element={user && user.selectedRole === "doctor" ? <DoctorDashboard user={user} /> : <Navigate to="/" />}
      />

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  </React.StrictMode>,
)
