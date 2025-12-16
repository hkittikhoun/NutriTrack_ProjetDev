import { useMemo } from "react";
import { useUrlTabs } from "../shared/hooks/useUrlTabs";
import DailyPlan from "./DailyPlan";
import SavedPlans from "./SavedPlans";
import "../shared/Tabs.css";

export default function MealPlans() {
  const tabs = useMemo(() => ["create", "saved"], []);
  const { activeTab, setActiveTab } = useUrlTabs(tabs, "create");

  return (
    <div className="section-container">
      <h1 className="section-title">Meal Plans</h1>

      <div className="tabs">
        <button
          className={`tab-button ${activeTab === "create" ? "active" : ""}`}
          onClick={() => setActiveTab("create")}
        >
          Create Plan
        </button>
        <button
          className={`tab-button ${activeTab === "saved" ? "active" : ""}`}
          onClick={() => setActiveTab("saved")}
        >
          Browse Plans
        </button>
      </div>

      <div className="tab-content">
        {activeTab === "create" && <DailyPlan />}
        {activeTab === "saved" && <SavedPlans />}
      </div>
    </div>
  );
}
