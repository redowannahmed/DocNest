"use client"

import React, { useState, useEffect } from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom"
import SignIn from "./components/SignIn"
import SignUp from "./components/SignUp"
import Homepage from "./components/Homepage" // Import Homepage
import Landing from "./components/Landing" // Import Landing page
import DoctorDashboard from "./components/DoctorDashboard"
import DoctorBlogs from "./components/DoctorBlogs"
import sessionManager from "./utils/SessionManager"

function AppRouter() {
  const [user, setUser] = useState(() => {
    return sessionManager.getUser()
  })
  const navigate = useNavigate()

  // Listen for session changes and update user state
  useEffect(() => {
    const currentUser = sessionManager.getUser()
    setUser(currentUser)
    
    console.log("[AppRouter] Session info:", sessionManager.getSessionInfo())
  }, [])

  const handleLogin = (userData, token) => {
    sessionManager.login(userData, token)
    setUser(userData)
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
    sessionManager.login(userData, token)
    setUser(userData)
    navigate("/dashboard") // Redirect to dashboard after registration
  }

  const handleLogout = () => {
    sessionManager.logout()
    setUser(null)
    navigate("/signin")
  }

  return (
    <Routes>
      {/* Homepage - Default route that everyone sees first */}
      <Route path="/" element={<Homepage />} />

      {/* Authentication routes */}
      <Route path="/signin" element={<SignIn onLogin={handleLogin} />} />
      <Route path="/signup" element={<SignUp onRegister={handleRegister} />} />

      {/* Dashboard route - Landing component for authenticated users */}
      <Route
        path="/dashboard"
        element={
          user && user.role === "patient"
            ? <Landing user={user} setUser={setUser} onLogout={handleLogout} />
            : <Navigate to={user ? (user.role === "doctor" ? "/doctor" : "/signin") : "/signin"} />
        }
      />

      {/* Doctor dashboard */}
      <Route
        path="/doctor"
        element={user && user.role === "doctor" ? <DoctorDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/signin" />}
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
