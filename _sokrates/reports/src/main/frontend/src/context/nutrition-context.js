import { createContext } from "react";

export const NutritionContext = createContext({
  selectedFood: null,
  setSelectedFood: () => {},
  clearSelectedFood: () => {},
});
