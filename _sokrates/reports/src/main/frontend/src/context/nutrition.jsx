import { useContext } from "react";
import { NutritionContext } from "./nutrition-context.js";

export const useNutrition = () => {
  const context = useContext(NutritionContext);
  if (!context) {
    throw new Error("useNutrition must be used within a NutritionProvider");
  }
  return context;
};
