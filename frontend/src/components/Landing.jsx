"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import "../css/Landing.css"
import TopBar from "./TopBar"
import ProfileSummaryCard from "./ProfileSummaryCard"
import PinnedHealthOverview from "./PinnedHealthOverview"
import QuickActions from "./QuickActions"
import MedicalHistory from "./MedicalHistory"

export default function Landing({ user: initialUser, setUser }) {
  const [user, setUserState] = useState(initialUser)
  const [pinnedConditions, setPinnedConditions] = useState([])
  const [medications, setMedications] = useState([])
  const [medicalHistory, setMedicalHistory] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      navigate("/signin")
      return
    }
    fetch("/api/auth/me", { headers: { Authorization: token } })
      .then((res) => res.json())
      .then((data) => {
        console.log("[Landing] /api/auth/me response:", data)
        if (data && data._id) {
          setUserState(data)
          setUser && setUser(data)
          localStorage.setItem("user", JSON.stringify(data))
        } else {
          localStorage.removeItem("user")
          navigate("/signin")
        }
      })
      .catch(() => {
        localStorage.removeItem("user")
        navigate("/signin")
      })
    fetch("/api/userdata/pinned-conditions", { headers: { Authorization: token } })
      .then((res) => res.json())
      .then(setPinnedConditions)
    fetch("/api/userdata/medications", { headers: { Authorization: token } })
      .then((res) => res.json())
      .then(setMedications)
    fetch("/api/userdata/medical-history", { headers: { Authorization: token } })
      .then((res) => res.json())
      .then(setMedicalHistory)
  }, [navigate, setUser])

  const handleAddRecord = (newRecord) => {
    setMedicalHistory((prev) => [newRecord, ...prev])
  }

  if (!user) return <div>Loading...</div>

  return (
    <div className="landing-container">
      <TopBar user={user} />
      <div className="landing-content">
        <ProfileSummaryCard user={user} setUser={setUserState} />
        <PinnedHealthOverview
          user={user}
          pinnedConditions={pinnedConditions}
          setPinnedConditions={setPinnedConditions}
          medications={medications}
          setMedications={setMedications}
        />
        <QuickActions user={user} onAddRecord={handleAddRecord} />
        <MedicalHistory user={user} medicalHistory={medicalHistory} setMedicalHistory={setMedicalHistory} />
      </div>
    </div>
  )
}
