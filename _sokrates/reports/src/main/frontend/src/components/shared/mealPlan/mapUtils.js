export function mapItemsToEditMealPlans(items) {
  const mealPlans = { morning: [], lunch: [], dinner: [] };
  (items || []).forEach((item) => {
    const mealType = item.meal_type || "morning";
    if (mealPlans[mealType]) {
      mealPlans[mealType].push({
        id: item.id,
        foodId: String(item.food_id || item.foodId || ""),
        quantity: Number(item.quantity || 1),
        mealType,
      });
    }
  });
  return mealPlans;
}

export function mergeCartWithCatalogue(cartFoods = [], foods = []) {
  const cartOptions = (cartFoods || []).map((f) => ({
    FoodID: f.foodId,
    FoodDescription: f.name,
    _fromCart: true,
  }));
  return [
    ...cartOptions,
    ...foods.filter(
      (fd) => !cartOptions.some((c) => String(c.FoodID) === String(fd.FoodID))
    ),
  ];
}
