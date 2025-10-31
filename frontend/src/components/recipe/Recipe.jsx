import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import CreateRecipe from "./CreateRecipe";
import SavedRecipe from "./SavedRecipe";
import "./Recipe.css";

export default function Recipe() {
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
    <div className="recipe-container">
      <h1>Recipes</h1>

      <div className="recipe-tabs">
        <button
          className={`tab-button ${activeTab === "create" ? "active" : ""}`}
          onClick={() => handleTabChange("create")}
        >
          Create Recipe
        </button>
        <button
          className={`tab-button ${activeTab === "saved" ? "active" : ""}`}
          onClick={() => handleTabChange("saved")}
        >
          Browse Recipes
        </button>
      </div>

      <div className="recipe-content">
        {activeTab === "create" && <CreateRecipe />}
        {activeTab === "saved" && <SavedRecipe />}
      </div>
    </div>
  );
}
