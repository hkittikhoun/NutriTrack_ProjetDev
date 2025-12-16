export function mapDbIngredientsToEdit(ingredientsData) {
  const editIngs = (ingredientsData || []).map((ing) => ({
    id: ing.id,
    foodId: ing.food_id ? String(ing.food_id) : "",
    ingredientName: ing.ingredient_name || "",
    quantity: ing.quantity || "",
    unit: ing.unit || "g",
    preparation: ing.preparation || "",
  }));
  return editIngs.length > 0
    ? editIngs
    : [
        {
          id: Date.now(),
          foodId: "",
          ingredientName: "",
          quantity: "",
          unit: "g",
          preparation: "",
        },
      ];
}

export function mapDbInstructionsToEdit(instructionsData) {
  const editInsts = (instructionsData || []).map((inst) => inst.instruction);
  return editInsts.length > 0 ? editInsts : [""];
}
