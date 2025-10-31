import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import CaloriesCalculator from "./CaloriesCalculator";
import NutritionCalculator from "./NutritionCalculator";
import "./Calculators.css";

export default function Calculatrices() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCalculator, setActiveCalculator] = useState(
    searchParams.get("tab") || "calories"
  );

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && (tab === "calories" || tab === "nutrition")) {
      setActiveCalculator(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tab) => {
    setActiveCalculator(tab);
    setSearchParams({ tab });
  };

  return (
    <div className="calculators-container">
      <h1>Health Calculators</h1>

      <div className="calculator-tabs">
        <button
          className={`tab-button ${
            activeCalculator === "calories" ? "active" : ""
          }`}
          onClick={() => handleTabChange("calories")}
        >
          Calorie Calculator
        </button>
        <button
          className={`tab-button ${
            activeCalculator === "nutrition" ? "active" : ""
          }`}
          onClick={() => handleTabChange("nutrition")}
        >
          Nutrition Calculator
        </button>
      </div>

      <div className="calculator-content">
        {activeCalculator === "calories" && <CaloriesCalculator />}
        {activeCalculator === "nutrition" && <NutritionCalculator />}
      </div>
    </div>
  );
}
