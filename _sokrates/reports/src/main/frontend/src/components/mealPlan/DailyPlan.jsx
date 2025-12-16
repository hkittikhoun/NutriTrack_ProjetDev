import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { AuthContext } from "../../context/auth-context";
import { usePrefillAuthor } from "../shared/hooks/usePrefillAuthors";
import { useCartFoods } from "../shared/hooks/useCartFoods";
import { prefillFromCartToMealPlans } from "../shared/hooks/useCartPrefill";
import "../shared/MealPlan.css";
import { MealPlanEditor } from "../shared/mealPlan/MealPlanEditor";

export default function DailyPlan() {
  const [mealPlans, setMealPlans] = useState({
    morning: [],
    lunch: [],
    dinner: [],
  });
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [validationErrors, setValidationErrors] = useState([]);
  const [notice, setNotice] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();
  const auth = useContext(AuthContext);
  const { cartFoods, loadingCart, cartError } = useCartFoods();
  usePrefillAuthor(author, setAuthor, auth);

  const addItemToMeal = (mealType) => {
    setMealPlans((prev) => ({
      ...prev,
      [mealType]: [
        ...prev[mealType],
        { id: Date.now() + Math.random(), foodId: "", quantity: 100, mealType },
      ],
    }));
  };
  const removeItemFromMeal = (mealType, itemId) => {
    setMealPlans((prev) => ({
      ...prev,
      [mealType]: prev[mealType].filter((item) => item.id !== itemId),
    }));
  };
  const updateMealItem = (mealType, itemId, field, value) => {
    setMealPlans((prev) => ({
      ...prev,
      [mealType]: prev[mealType].map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item
      ),
    }));
  };
  const prefillFromCart = () => {
    const mapped = prefillFromCartToMealPlans(cartFoods);
    if (!mapped) {
      setNotice("No items in cart to prefill.");
      setTimeout(() => setNotice(null), 2000);
      return;
    }
    setMealPlans(mapped);
    setNotice(`Prefilled with ${cartFoods.length} items from cart.`);
    setTimeout(() => setNotice(null), 2500);
  };
  const getAllSelectedItems = () => [
    ...mealPlans.morning,
    ...mealPlans.lunch,
    ...mealPlans.dinner,
  ];

  const handleSave = async () => {
    const selectedItems = getAllSelectedItems();
    const errors = [];
    if (!title?.trim()) errors.push("Title is required.");
    if (!author?.trim()) errors.push("Author is required.");
    if (selectedItems.length === 0)
      errors.push("Add at least one food to the plan.");
    if (selectedItems.some((item) => !item.foodId))
      errors.push("All items must have a selected food.");
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    setValidationErrors([]);
    setSaving(true);
    setError(null);

    try {
      const { data: authData, error: authErr } = await supabase.auth.getUser();
      if (authErr) {
        setError(authErr.message || "Authentication error");
        return;
      }
      const userId = authData?.user?.id || auth?.userId;
      if (!userId) {
        setError("Please sign in to save the plan.");
        return;
      }

      let totalKcal = 0;
      const selected = selectedItems
        .map((i) => Number(i.foodId))
        .filter(Boolean);
      const quantities = selectedItems.reduce((acc, item) => {
        const k = String(item.foodId);
        acc[k] = (acc[k] || 0) + Number(item.quantity || 0);
        return acc;
      }, {});
      if (selected.length > 0) {
        const { data: energies, error: energyErr } = await supabase
          .from("nutrient_amount")
          .select(`FoodID, NutrientValue, nutrient_name!inner(NutrientCode)`)
          .in("FoodID", selected)
          .eq("nutrient_name.NutrientCode", 208);
        if (!energyErr && energies?.length) {
          const energyMap = new Map(
            energies.map((e) => [
              String(e.FoodID),
              Number(e.NutrientValue) || 0,
            ])
          );
          Object.entries(quantities).forEach(([foodId, qty]) => {
            const kcalPer100g = energyMap.get(String(foodId)) || 0;
            totalKcal += (kcalPer100g * Number(qty)) / 100;
          });
        }
      }

      const planPayload = {
        user_id: userId,
        total_kcal: Math.round(totalKcal),
        status: "daily",
        title: title.trim() || null,
        author: author.trim() || null,
      };

      const { data: plan, error: planErr } = await supabase
        .from("meal_plans")
        .insert(planPayload)
        .select()
        .single();
      if (planErr) {
        setError(planErr.message || "Failed to create plan");
        return;
      }

      const toInsert = selectedItems.map((item) => ({
        meal_plan_id: plan.id,
        food_id: Number(item.foodId),
        quantity: Number(item.quantity) || 0,
        meal_type: item.mealType,
      }));
      const { error: itemsErr } = await supabase
        .from("meal_plan_items")
        .insert(toInsert);
      if (itemsErr) {
        setError(itemsErr.message || "Failed to save items");
        return;
      }

      setNotice("Plan created successfully!");
      setTimeout(() => setNotice(null), 2500);
      navigate("/mealplan?tab=saved", { state: { notice: "Plan saved." } });
    } catch (e) {
      console.error("Error saving plan:", e);
      setError("Unexpected error while saving");
    } finally {
      setSaving(false);
    }
  };

  const totalSelectedItems =
    (mealPlans.morning?.length || 0) +
    (mealPlans.lunch?.length || 0) +
    (mealPlans.dinner?.length || 0);

  return (
    <div className="daily-plan">
      <h1>Create your meal plan</h1>
      {error && <div className="error">{error}</div>}
      {notice && <div className="notice success">{notice}</div>}
      {validationErrors.length > 0 && (
        <div className="validation-errors">
          {validationErrors.map((err, idx) => (
            <div key={idx} className="error-item">
              {err}
            </div>
          ))}
        </div>
      )}
      {loadingCart && <div>Loading...</div>}
      {cartError && <div className="error">{cartError}</div>}

      <MealPlanEditor
        isOwner={true}
        loading={saving}
        loadingCart={loadingCart}
        cartFoods={cartFoods}
        foods={[]}
        mealPlans={mealPlans}
        addItemToMeal={addItemToMeal}
        removeItemFromMeal={removeItemFromMeal}
        updateMealItem={updateMealItem}
        onPrefillFromCart={prefillFromCart}
        titleProps={{ title, setTitle, author, setAuthor }}
        saveProps={{
          onSave: handleSave,
          saveDisabledLabel: totalSelectedItems,
        }}
        onCancel={() => navigate(-1)}
      />
    </div>
  );
}
