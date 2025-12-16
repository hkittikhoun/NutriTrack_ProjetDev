import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { AuthContext } from "../../context/auth-context";
import { useCartFoods } from "../shared/hooks/useCartFoods";
import { prefillFromCartToMealPlans } from "../shared/hooks/useCartPrefill";
import "../shared/MealPlan.css";
import { MealPlanEditor } from "../shared/mealPlan/MealPlanEditor";
import { mapItemsToEditMealPlans } from "../shared/mealPlan/mapUtils";

export default function SavedPlanDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const auth = useContext(AuthContext);
  const [searchParams] = useSearchParams();

  const [plan, setPlan] = useState(null);
  const [items, setItems] = useState([]);
  const [foods, setFoods] = useState([]);
  const [isEditing, setIsEditing] = useState(
    searchParams.get("edit") === "true"
  );

  const [editTitle, setEditTitle] = useState("");
  const [editAuthor, setEditAuthor] = useState("");
  const [editMealPlans, setEditMealPlans] = useState({
    morning: [],
    lunch: [],
    dinner: [],
  });

  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { cartFoods, loadingCart, cartError } = useCartFoods();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const { data: planData, error: pErr } = await supabase
          .from("meal_plans")
          .select("id, title, author, total_kcal, status, created_at, user_id")
          .eq("id", id)
          .single();
        if (pErr) {
          setError(pErr.message || "Failed to load plan");
          return;
        }
        setPlan(planData);

        const { data: itemRows, error: itemsErr } = await supabase
          .from("meal_plan_items")
          .select(
            "id, food_id, quantity, meal_type, food:food_id(FoodID, FoodDescription)"
          )
          .eq("meal_plan_id", id)
          .order("id", { ascending: true });
        if (itemsErr) {
          setError(itemsErr.message || "Failed to load items");
          return;
        }
        setItems(itemRows || []);

        if (
          searchParams.get("edit") === "true" &&
          (!auth?.userId || planData.user_id !== auth.userId)
        ) {
          setIsEditing(false);
          setNotice("You can only edit your own plans.");
          setTimeout(() => setNotice(null), 3000);
        }

        if (
          itemRows?.length &&
          (itemRows[0].food == null || itemRows[0].food === undefined)
        ) {
          try {
            const foodIds = Array.from(
              new Set((itemRows || []).map((it) => it.food_id).filter(Boolean))
            );
            if (foodIds.length > 0) {
              const { data: foodsById, error: foodFetchErr } = await supabase
                .from("food_name")
                .select("FoodID, FoodDescription")
                .in("FoodID", foodIds);
              if (!foodFetchErr) {
                const map = {};
                (foodsById || []).forEach((f) => (map[String(f.FoodID)] = f));
                const merged = (itemRows || []).map((it) => ({
                  ...it,
                  food: map[String(it.food_id)] || null,
                }));
                setItems(merged);
              }
            }
          } catch (e) {
            console.debug("Fallback food-merge failed", e);
          }
        }

        if (planData.user_id === auth?.userId) {
          setEditTitle(planData?.title || "");
          setEditAuthor(planData?.author || "");
          setEditMealPlans(mapItemsToEditMealPlans(itemRows || []));

          const { data: foodsData, error: fErr } = await supabase
            .from("food_name")
            .select("FoodID, FoodDescription")
            .order("FoodDescription", { ascending: true });
          if (!fErr) setFoods(foodsData || []);
        }
      } catch (e) {
        console.error(e);
        setError("Failed to load plan");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, auth?.userId, searchParams]);

  const isOwner = () => auth?.userId && plan?.user_id === auth.userId;

  const startEdit = () => {
    if (!isOwner()) {
      setNotice("You can only edit your own plans.");
      setTimeout(() => setNotice(null), 3000);
      return;
    }
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setEditTitle(plan?.title || "");
    setEditAuthor(plan?.author || "");
    setEditMealPlans(mapItemsToEditMealPlans(items));
    setIsEditing(false);
  };

  const getAllEditItems = () => [
    ...editMealPlans.morning,
    ...editMealPlans.lunch,
    ...editMealPlans.dinner,
  ];

  const prefillFromCart = () => {
    if (!isOwner()) return;
    const mapped = prefillFromCartToMealPlans(cartFoods);
    if (!mapped) {
      setNotice("No items in cart to prefill.");
      setTimeout(() => setNotice(null), 2000);
      return;
    }
    setEditMealPlans(mapped);
    setNotice(`Prefilled with ${cartFoods.length} items from cart.`);
    setTimeout(() => setNotice(null), 2500);
  };

  const addItemToMeal = (mealType) => {
    if (!isOwner()) return;
    setEditMealPlans((prev) => ({
      ...prev,
      [mealType]: [
        ...prev[mealType],
        { id: Date.now() + Math.random(), foodId: "", quantity: 1, mealType },
      ],
    }));
  };
  const removeItemFromMeal = (mealType, itemId) => {
    if (!isOwner()) return;
    setEditMealPlans((prev) => ({
      ...prev,
      [mealType]: prev[mealType].filter((item) => item.id !== itemId),
    }));
  };
  const updateMealItem = (mealType, itemId, field, value) => {
    if (!isOwner()) return;
    setEditMealPlans((prev) => ({
      ...prev,
      [mealType]: prev[mealType].map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item
      ),
    }));
  };

  const saveEdits = async () => {
    if (!isOwner()) {
      setError("You can only modify your own plans.");
      return;
    }

    try {
      setLoading(true);

      const { error: upErr } = await supabase
        .from("meal_plans")
        .update({ title: editTitle || null, author: editAuthor || null })
        .eq("id", id)
        .eq("user_id", auth.userId);
      if (upErr) {
        setError(upErr.message || "Failed to update plan");
        return;
      }

      const { error: delErr } = await supabase
        .from("meal_plan_items")
        .delete()
        .eq("meal_plan_id", id);
      if (delErr) {
        setError(delErr.message || "Failed to replace items");
        return;
      }

      const allEditItems = getAllEditItems();
      const toInsert = allEditItems
        .filter((it) => it.foodId)
        .map((it) => ({
          meal_plan_id: id,
          food_id: Number(it.foodId),
          quantity: Number(it.quantity) || 1,
          meal_type: it.mealType,
        }));

      if (toInsert.length > 0) {
        const { error: insErr } = await supabase
          .from("meal_plan_items")
          .insert(toInsert);
        if (insErr) {
          setError(insErr.message || "Failed to insert items");
          return;
        }
      }

      const { data: planData } = await supabase
        .from("meal_plans")
        .select("id, title, author, total_kcal, status, created_at, user_id")
        .eq("id", id)
        .single();
      setPlan(planData || plan);

      const { data: itemRows } = await supabase
        .from("meal_plan_items")
        .select(
          "id, food_id, quantity, meal_type, food:food_id(FoodID, FoodDescription)"
        )
        .eq("meal_plan_id", id)
        .order("id", { ascending: true });
      setItems(itemRows || []);

      setIsEditing(false);
      setNotice("Plan updated.");
      setTimeout(() => setNotice(null), 2500);
    } catch (e) {
      console.error(e);
      setError("Unexpected error while saving");
    } finally {
      setLoading(false);
    }
  };

  const totalEditItems =
    (editMealPlans.morning?.length || 0) +
    (editMealPlans.lunch?.length || 0) +
    (editMealPlans.dinner?.length || 0);

  return (
    <div className="saved-plans">
      <h1>Plan Details</h1>
      {notice && <div className="notice success">{notice}</div>}
      {loading && <div>Loading...</div>}
      {error && <div className="error">{error}</div>}
      {cartError && <div className="error">{cartError}</div>}

      {plan && (
        <div className="plan-details">
          {!isEditing ? (
            <>
              <div className="plan-header-info">
                <h2>{plan.title || "(Untitled)"}</h2>
                {isOwner() && <span className="owner-badge">Your plan</span>}
              </div>
              <div className="plan-meta">
                <span>
                  <strong>Author:</strong> {plan.author || "—"}
                </span>
                <span>
                  <strong>Calories:</strong> {plan.total_kcal ?? "—"} kcal
                </span>
                <span>
                  <strong>Created:</strong>{" "}
                  {plan.created_at
                    ? new Date(plan.created_at).toLocaleString()
                    : ""}
                </span>
              </div>

              <h3>Foods by meal</h3>
              <div className="meals-display">
                {["morning", "lunch", "dinner"].map((mealType) => {
                  const titles = {
                    morning: "🌅 Morning",
                    lunch: "🌞 Lunch",
                    dinner: "🌙 Dinner",
                  };
                  const mealItems = (items || []).filter(
                    (it) => it.meal_type === mealType
                  );
                  return (
                    <div key={mealType} className="meal-display-section">
                      <h4>{titles[mealType]}</h4>
                      {mealItems.length === 0 ? (
                        <p className="no-items-text">No items</p>
                      ) : (
                        <ul className="meal-items-display">
                          {mealItems.map((item) => (
                            <li key={item.id}>
                              <strong>
                                {item.food?.FoodDescription ||
                                  String(item.food_id)}
                              </strong>
                              <span> — {item.quantity}g</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="action-buttons">
                {isOwner() && (
                  <button onClick={startEdit} className="edit-btn">
                    Edit
                  </button>
                )}
                <button onClick={() => navigate(-1)} className="back-btn">
                  Back
                </button>
              </div>
            </>
          ) : (
            <MealPlanEditor
              isOwner={isOwner()}
              loading={loading}
              loadingCart={loadingCart}
              cartFoods={cartFoods}
              foods={foods}
              mealPlans={editMealPlans}
              addItemToMeal={addItemToMeal}
              removeItemFromMeal={removeItemFromMeal}
              updateMealItem={updateMealItem}
              onPrefillFromCart={prefillFromCart}
              titleProps={{
                title: editTitle,
                setTitle: setEditTitle,
                author: editAuthor,
                setAuthor: setEditAuthor,
              }}
              saveProps={{
                onSave: saveEdits,
                saveDisabledLabel: totalEditItems,
              }}
              onCancel={cancelEdit}
            />
          )}
        </div>
      )}
    </div>
  );
}
