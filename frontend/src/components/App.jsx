import TopBar from "./TopBar";
import ProfileSummaryCard from "./ProfileSummaryCard";
import PinnedHealthOverview from "./PinnedHealthOverview";
import QuickActions from "./QuickActions";
import MedicalHistory from "./MedicalHistory";

export default function App() {
  return (
    <div className="container">
      <TopBar />
      <div className="content">
        <ProfileSummaryCard />
        <QuickActions />
        <PinnedHealthOverview />
        <MedicalHistory />
      </div>
    </div>
  );
}
