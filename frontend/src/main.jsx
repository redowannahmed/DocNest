"use client"

import React, { useState } from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom"
import SignIn from "./components/SignIn"
import SignUp from "./components/SignUp"
import Homepage from "./components/Homepage" // Import Homepage
import Landing from "./components/Landing" // Import Landing page
import DoctorDashboard from "./components/DoctorDashboard"
import DoctorBlogs from "./components/DoctorBlogs"

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
    console.log("[AppRouter] handleLogin userData:", userData)
    // Check user role and redirect to the appropriate route
    if (userData.role === "doctor") {
      navigate("/doctor")
    } else if (userData.role === "patient") {
      navigate("/dashboard")
    } else {
      navigate("/") // fallback
    }
  }

  const handleRegister = (userData, token) => {
    setUser(userData)
    localStorage.setItem("user", JSON.stringify(userData))
    localStorage.setItem("token", token)
    navigate("/dashboard") // Redirect to dashboard after registration
  }

  return (
    <Routes>
      {/* Homepage - Default route that everyone sees first */}
      <Route path="/" element={<Homepage />} />

      {/* Authentication routes */}
      <Route path="/signin" element={<SignIn onLogin={handleLogin} />} />
      <Route path="/signup" element={<SignUp onRegister={handleRegister} />} />

      {/* Dashboard route - Landing component for authenticated users */}
      <Route path="/dashboard" element={user ? <Landing user={user} setUser={setUser} /> : <Navigate to="/signin" />} />

      {/* Doctor dashboard */}
      <Route
        path="/doctor"
        element={user && user.role === "doctor" ? <DoctorDashboard user={user} /> : <Navigate to="/signin" />}
      />

      {/* Doctor Blogs route for patients */}
      <Route
        path="/doctor-blogs"
        element={user ? <DoctorBlogs /> : <Navigate to="/signin" />}
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
