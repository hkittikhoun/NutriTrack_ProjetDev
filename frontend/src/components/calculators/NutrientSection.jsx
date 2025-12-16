import React from "react";

export function NutrientSection({
  title,
  className,
  nutrients,
  quantity,
  calculate,
}) {
  if (!nutrients || nutrients.length === 0) return null;
  const cardClass = className.replace("-group", "");
  return (
    <div className={`nutrient-group ${className}`}>
      <h4>{title}</h4>
      <div className="nutrients-grid">
        {nutrients.map((nutrient, index) => (
          <div key={index} className={`nutrient-card ${cardClass}`}>
            <span className="nutrient-name">
              {nutrient.nutrient_name.NutrientSymbol}
            </span>
            <span className="nutrient-value">
              {calculate(nutrient.NutrientValue, quantity)}{" "}
              {nutrient.nutrient_name.NutrientUnit}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
