export function validateRecipe({ title, author, ingredients, instructions }) {
  const errors = [];
  if (!String(title || "").trim()) errors.push("Le titre est requis");
  if (!String(author || "").trim()) errors.push("L'auteur est requis");
  if (
    ingredients.some(
      (ing) => !String(ing.ingredientName || ing.ingredient_name || "").trim()
    )
  ) {
    errors.push("Tous les ingrédients doivent avoir un nom");
  }
  if (
    instructions.some((inst) => !String(inst || inst?.instruction || "").trim())
  ) {
    errors.push("Toutes les instructions doivent être remplies");
  }
  return errors;
}

export function getDifficultyColor(difficulty) {
  switch (difficulty) {
    case "easy":
      return "#4caf50";
    case "medium":
      return "#ff9800";
    case "hard":
      return "#f44336";
    default:
      return "#666";
  }
}

export function getDifficultyLabel(difficulty) {
  switch (difficulty) {
    case "easy":
      return "Easy";
    case "medium":
      return "Medium";
    case "hard":
      return "Hard";
    default:
      return difficulty || "Unknown";
  }
}

/* Helpers pour normaliser l’insert/update */
export function buildIngredientsData(ingredients, recipeId) {
  return (ingredients || [])
    .filter((ing) =>
      String(ing.ingredientName || ing.ingredient_name || "").trim()
    )
    .map((ing, index) => ({
      recipe_id: recipeId,
      food_id: ing.foodId ? parseInt(ing.foodId) : null,
      ingredient_name: String(ing.ingredientName || ing.ingredient_name).trim(),
      quantity: ing.quantity ? parseFloat(ing.quantity) : null,
      unit: String(ing.unit || "").trim() || null,
      preparation: String(ing.preparation || "").trim() || null,
      order_index: index + 1,
    }));
}

export function buildInstructionsData(instructions, recipeId) {
  // accepte tableau de strings ou d’objets { instruction }
  return (instructions || [])
    .filter((inst) => {
      const s = typeof inst === "string" ? inst : inst?.instruction;
      return String(s || "").trim();
    })
    .map((inst, index) => ({
      recipe_id: recipeId,
      step_number: index + 1,
      instruction: (typeof inst === "string" ? inst : inst.instruction).trim(),
    }));
}
