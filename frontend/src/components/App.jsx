import TopBar from "./TopBar";
import PinnedHealthOverview from "./PinnedHealthOverview";
import QuickActions from "./QuickActions";
import MedicalHistory from "./MedicalHistory";

export default function App() {
  return (
    <div className="container">
      <TopBar />
      <div className="content">
        <QuickActions />
        <PinnedHealthOverview />
        <MedicalHistory />
      </div>
    </div>
  );
}
