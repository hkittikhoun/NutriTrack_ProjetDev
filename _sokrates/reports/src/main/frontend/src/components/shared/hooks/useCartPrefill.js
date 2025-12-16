export function prefillFromCartToMealPlans(cartFoods) {
  if (!cartFoods || cartFoods.length === 0) return null;
  const newMealPlans = { morning: [], lunch: [], dinner: [] };
  const mealTypes = ["morning", "lunch", "dinner"];
  cartFoods.forEach((c, idx) => {
    const mealType = mealTypes[idx % 3];
    newMealPlans[mealType].push({
      id: Date.now() + idx,
      foodId: String(c.foodId),
      quantity: c.cartQuantity,
      mealType,
    });
  });
  return newMealPlans;
}

export function prefillFromCartToIngredients(cartFoods) {
  if (!cartFoods || cartFoods.length === 0) return null;
  return cartFoods.map((c, idx) => ({
    id: Date.now() + idx,
    foodId: String(c.foodId),
    ingredientName: c.name,
    quantity: c.cartQuantity,
    unit: "g",
    preparation: "",
  }));
}
