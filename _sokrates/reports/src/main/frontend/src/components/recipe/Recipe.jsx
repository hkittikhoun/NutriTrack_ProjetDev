import { useMemo } from "react";
import { useUrlTabs } from "../shared/hooks/useUrlTabs";
import CreateRecipe from "./CreateRecipe";
import SavedRecipe from "./SavedRecipe";
import "../shared/Tabs.css";

export default function Recipe() {
  const tabs = useMemo(() => ["create", "saved"], []);
  const { activeTab, setActiveTab } = useUrlTabs(tabs, "create");

  return (
    <div className="section-container is-wide">
      <h1 className="section-title">Recipes</h1>

      <div className="tabs">
        <button
          className={`tab-button ${activeTab === "create" ? "active" : ""}`}
          onClick={() => setActiveTab("create")}
        >
          Create Recipe
        </button>
        <button
          className={`tab-button ${activeTab === "saved" ? "active" : ""}`}
          onClick={() => setActiveTab("saved")}
        >
          Browse Recipes
        </button>
      </div>

      <div className="tab-content">
        {activeTab === "create" && <CreateRecipe />}
        {activeTab === "saved" && <SavedRecipe />}
      </div>
    </div>
  );
}
