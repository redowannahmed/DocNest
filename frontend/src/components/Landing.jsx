import "../css/Landing.css";
import TopBar from "./TopBar";
import ProfileSummaryCard from "./ProfileSummaryCard";
import PinnedHealthOverview from "./PinnedHealthOverview";
import QuickActions from "./QuickActions";
import MedicalHistory from "./MedicalHistory";

export default function Landing() {
  return (
    <div className="landing-container">
      <TopBar />
      <div className="landing-content">
        <ProfileSummaryCard />
        <PinnedHealthOverview />
        <QuickActions />
        <MedicalHistory />
      </div>
    </div>
  );
}