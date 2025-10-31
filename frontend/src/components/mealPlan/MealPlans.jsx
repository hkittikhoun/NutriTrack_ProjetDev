import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import DailyPlan from "./DailyPlan";
import SavedPlans from "./SavedPlans";
import "./MealPlans.css";

export default function MealPlans() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") || "create"
  );

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && (tab === "create" || tab === "saved")) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  return (
    <div className="meal-plans-container">
      <h1>Meal Plans</h1>

      <div className="meal-plans-tabs">
        <button
          className={`tab-button ${activeTab === "create" ? "active" : ""}`}
          onClick={() => handleTabChange("create")}
        >
          Create Plan
        </button>
        <button
          className={`tab-button ${activeTab === "saved" ? "active" : ""}`}
          onClick={() => handleTabChange("saved")}
        >
          Browse Plans
        </button>
      </div>

      <div className="meal-plans-content">
        {activeTab === "create" && <DailyPlan />}
        {activeTab === "saved" && <SavedPlans />}
      </div>
    </div>
  );
}
