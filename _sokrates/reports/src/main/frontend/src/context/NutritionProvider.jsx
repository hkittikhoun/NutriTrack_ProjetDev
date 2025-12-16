import { useState } from "react";
import { NutritionContext } from "./nutrition-context.js";

export const NutritionProvider = ({ children }) => {
  const [selectedFood, setSelectedFood] = useState(null);

  const clearSelectedFood = () => {
    setSelectedFood(null);
  };

  return (
    <NutritionContext.Provider
      value={{
        selectedFood,
        setSelectedFood,
        clearSelectedFood,
      }}
    >
      {children}
    </NutritionContext.Provider>
  );
};
