import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { AuthContext } from "../../context/auth-context";
import "./DailyPlan.css";

export default function DailyPlan() {
  const [cartFoods, setCartFoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [mealPlans, setMealPlans] = useState({
    morning: [],
    lunch: [],
    dinner: [],
  });
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [validationErrors, setValidationErrors] = useState([]);
  const navigate = useNavigate();
  const auth = useContext(AuthContext);

  useEffect(() => {
    const prefillAuthorFromUser = async () => {
      try {
        if (author && author.trim() !== "") return;

        const { data: authData, error: authErr } =
          await supabase.auth.getUser();
        if (authErr) {
          if (auth && auth.userId) setAuthor(auth.userId);
          console.warn(
            "Could not fetch supabase user:",
            authErr.message || authErr
          );
          return;
        }

        const user = authData?.user;
        if (!user) return;

        const meta = user.user_metadata || {};
        const name =
          meta.full_name || meta.fullName || meta.name || user.email || user.id;
        if (name) setAuthor(name);
      } catch (e) {
        console.error("Failed to prefill author", e);
        if (auth && auth.userId) setAuthor(auth.userId);
      }
    };

    prefillAuthorFromUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.userId]);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true);
        const { data: authData, error: authErr } =
          await supabase.auth.getUser();
        if (authErr) {
          console.warn("Failed to get user:", authErr.message);
          return;
        }
        const userId = authData?.user?.id || null;
        if (!userId) return;

        const { data: rows, error: cartErr } = await supabase
          .from("cart_items")
          .select(
            `
            id,
            quantity,
            food:food_id(FoodID, FoodDescription)
          `
          )
          .eq("user_id", userId)
          .order("id", { ascending: true });

        if (cartErr) {
          console.warn("Failed to load cart:", cartErr.message);
          return;
        }

        const cartItems = (rows || [])
          .filter((r) => r.food && r.food.FoodID)
          .map((r) => ({
            id: r.id,
            foodId: r.food.FoodID,
            name: r.food.FoodDescription,
            cartQuantity: r.quantity,
          }));

        setCartFoods(cartItems);
      } catch (e) {
        console.error("Error fetching cart:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  const addItemToMeal = (mealType) => {
    setMealPlans((prev) => ({
      ...prev,
      [mealType]: [
        ...prev[mealType],
        {
          id: Date.now() + Math.random(),
          foodId: "",
          quantity: 1,
          mealType: mealType,
        },
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

  const handleFoodChange = (mealType, itemId, foodId) => {
    const selectedFood = cartFoods.find((food) => food.foodId === foodId);

    setMealPlans((prev) => ({
      ...prev,
      [mealType]: prev[mealType].map((item) =>
        item.id === itemId
          ? {
              ...item,
              foodId: foodId,
              quantity: selectedFood ? selectedFood.cartQuantity : 1,
            }
          : item
      ),
    }));
  };

  const prefillFromCart = () => {
    if (!cartFoods || cartFoods.length === 0) {
      setNotice("No items in cart to prefill.");
      setTimeout(() => setNotice(null), 2000);
      return;
    }

    const newMealPlans = {
      morning: [],
      lunch: [],
      dinner: [],
    };

    cartFoods.forEach((cartItem, index) => {
      const mealTypes = ["morning", "lunch", "dinner"];
      const mealType = mealTypes[index % 3];

      newMealPlans[mealType].push({
        id: Date.now() + index,
        foodId: cartItem.foodId,
        quantity: cartItem.cartQuantity,
        mealType: mealType,
      });
    });

    setMealPlans(newMealPlans);
    setNotice(`Prefilled with ${cartFoods.length} items from cart.`);
    setTimeout(() => setNotice(null), 2500);
  };

  const getAllSelectedItems = () => {
    return [...mealPlans.morning, ...mealPlans.lunch, ...mealPlans.dinner];
  };

  const handleSave = async () => {
    const selectedItems = getAllSelectedItems();

    const errors = [];
    if (!title || title.trim() === "") errors.push("Title is required.");
    if (!author || author.trim() === "") errors.push("Author is required.");
    if (selectedItems.length === 0)
      errors.push("Add at least one food to the plan.");

    const incompleteItems = selectedItems.filter((item) => !item.foodId);
    if (incompleteItems.length > 0) {
      errors.push("All items must have a selected food.");
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors([]);

    try {
      setLoading(true);
      setError(null);

      const { data: authData, error: authErr } = await supabase.auth.getUser();
      if (authErr) {
        setError(authErr.message || "Authentication error");
        return;
      }
      const userId = authData?.user?.id || auth.userId;
      if (!userId) {
        setError("Please sign in to save the plan.");
        return;
      }

      let totalKcal = 0;
      try {
        const foodIds = selectedItems.map((item) => item.foodId);
        const quantities = selectedItems.reduce((acc, item) => {
          acc[item.foodId] = (acc[item.foodId] || 0) + Number(item.quantity);
          return acc;
        }, {});

        if (foodIds.length > 0) {
          const { data: energies, error: energyErr } = await supabase
            .from("nutrient_amount")
            .select(`FoodID, NutrientValue, nutrient_name!inner(NutrientCode)`)
            .in("FoodID", foodIds)
            .eq("nutrient_name.NutrientCode", 208);

          if (!energyErr && energies) {
            const energyMap = new Map();
            energies.forEach((e) =>
              energyMap.set(String(e.FoodID), Number(e.NutrientValue))
            );

            Object.entries(quantities).forEach(([foodId, qty]) => {
              const kcalPer100g = energyMap.get(String(foodId)) || 0;
              totalKcal += (kcalPer100g * qty) / 100;
            });
          }
        }
      } catch (e) {
        console.error("Error computing totalKcal:", e);
      }

      const planPayload = {
        user_id: userId,
        total_kcal: Math.round(totalKcal),
        status: "daily",
        title: title || null,
        author: author || null,
      };

      let { data: plan, error: planErr } = await supabase
        .from("meal_plans")
        .insert(planPayload)
        .select()
        .single();

      if (planErr) {
        if (planErr.code === "42703") {
          const { data: plan2, error: planErr2 } = await supabase
            .from("meal_plans")
            .insert({
              user_id: userId,
              total_kcal: Math.round(totalKcal),
              status: "daily",
            })
            .select()
            .single();

          if (planErr2) {
            setError(planErr2.message || "Failed to create plan");
            return;
          }
          plan = plan2;
        } else {
          setError(planErr.message || "Failed to create plan");
          return;
        }
      }

      const items = selectedItems.map((item) => ({
        meal_plan_id: plan.id,
        food_id: item.foodId,
        quantity: Number(item.quantity),
        meal_type: item.mealType,
      }));

      const { error: itemsErr } = await supabase
        .from("meal_plan_items")
        .insert(items);

      if (itemsErr) {
        if (itemsErr.code === "42703") {
          const itemsNoType = items.map((it) => {
            const copy = { ...it };
            delete copy.meal_type;
            return copy;
          });
          const { error: itemsErr2 } = await supabase
            .from("meal_plan_items")
            .insert(itemsNoType);
          if (itemsErr2) {
            setError(itemsErr2.message || "Failed to save items");
            return;
          }
        } else {
          setError(itemsErr.message || "Failed to save items");
          return;
        }
      }

      setNotice("Plan created successfully!");
      setTimeout(() => setNotice(null), 2500);
      navigate("/mealplan?tab=saved", {
        state: { notice: "Plan saved." },
      });
    } catch (e) {
      console.error("Error saving plan:", e);
      setError("Unexpected error while saving");
    } finally {
      setLoading(false);
    }
  };

  const renderMealSection = (mealType, mealTitle) => {
    const mealItems = mealPlans[mealType];

    return (
      <div className="meal-section" key={mealType}>
        <div className="meal-header">
          <h3>{mealTitle}</h3>
          <button
            onClick={() => addItemToMeal(mealType)}
            disabled={loading}
            className="add-meal-item-btn"
          >
            Add food
          </button>
        </div>

        {mealItems.length === 0 ? (
          <div className="no-meal-items">
            <p>No foods for this meal</p>
          </div>
        ) : (
          <div className="meal-items-list">
            {mealItems.map((item) => (
              <div key={item.id} className="meal-item-row">
                <div className="meal-item-field">
                  <label>Food</label>
                  <select
                    value={item.foodId}
                    onChange={(e) =>
                      handleFoodChange(mealType, item.id, e.target.value)
                    }
                  >
                    <option value="">-- Choose a food --</option>
                    {cartFoods.map((food) => (
                      <option key={food.foodId} value={food.foodId}>
                        {food.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="meal-item-field">
                  <label>Quantity (g)</label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      updateMealItem(
                        mealType,
                        item.id,
                        "quantity",
                        Number(e.target.value)
                      )
                    }
                    placeholder="100"
                  />
                </div>

                <div className="meal-item-actions">
                  <button
                    onClick={() => removeItemFromMeal(mealType, item.id)}
                    className="remove-meal-item-btn"
                    disabled={loading}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const totalSelectedItems = getAllSelectedItems().length;

  return (
    <div className="daily-plan">
      <h1>Create your meal plan</h1>
      {error && <div className="error">{error}</div>}
      {notice && <div className="notice success">{notice}</div>}
      {validationErrors && validationErrors.length > 0 && (
        <div className="validation-errors">
          {validationErrors.map((err, idx) => (
            <div key={idx} className="error-item">
              {err}
            </div>
          ))}
        </div>
      )}
      {loading && <div>Loading...</div>}

      <div className="field-row">
        <div style={{ marginRight: 12 }}>
          <label htmlFor="plan-title">Title</label>
          <input
            id="plan-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Plan title"
          />
        </div>
        <div>
          <label htmlFor="plan-author">Author</label>
          <input
            id="plan-author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Your name"
          />
        </div>
      </div>

      {cartFoods && cartFoods.length > 0 && (
        <div className="cart-section">
          <h3>Foods available in your cart ({cartFoods.length})</h3>
          <button
            onClick={prefillFromCart}
            disabled={loading}
            className="prefill-btn"
          >
            Prefill from cart
          </button>
        </div>
      )}

      <div className="meals-container">
        <h2>Meal planning</h2>
        <div className="meals-grid">
          {renderMealSection("morning", "🌅 Morning")}
          {renderMealSection("lunch", "🌞 Lunch")}
          {renderMealSection("dinner", "🌙 Dinner")}
        </div>
      </div>

      <div className="form-actions">
        <button
          onClick={handleSave}
          disabled={loading || totalSelectedItems === 0}
        >
          Save plan ({totalSelectedItems} items)
        </button>
        <button onClick={() => navigate(-1)} style={{ marginLeft: 8 }}>
          Cancel
        </button>
      </div>
    </div>
  );
}
