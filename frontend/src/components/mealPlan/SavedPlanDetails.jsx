import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { AuthContext } from "../../context/auth-context";
import "./SavedPlanDetails.css";

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
          setLoading(false);
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
          setLoading(false);
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
          itemRows &&
          itemRows.length > 0 &&
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

          const mealPlans = {
            morning: [],
            lunch: [],
            dinner: [],
          };

          (itemRows || []).forEach((item) => {
            const mealType = item.meal_type || "morning";
            if (mealPlans[mealType]) {
              mealPlans[mealType].push({
                id: item.id,
                foodId: String(item.food_id),
                quantity: item.quantity,
                mealType: mealType,
              });
            }
          });

          setEditMealPlans(mealPlans);

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

  const isOwner = () => {
    return auth?.userId && plan?.user_id === auth.userId;
  };

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

    const mealPlans = {
      morning: [],
      lunch: [],
      dinner: [],
    };

    items.forEach((item) => {
      const mealType = item.meal_type || "morning";
      if (mealPlans[mealType]) {
        mealPlans[mealType].push({
          id: item.id,
          foodId: String(item.food_id),
          quantity: item.quantity,
          mealType: mealType,
        });
      }
    });

    setEditMealPlans(mealPlans);
    setIsEditing(false);
  };

  const addItemToMeal = (mealType) => {
    if (!isOwner()) return;
    setEditMealPlans((prev) => ({
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

  const getAllEditItems = () => {
    return [
      ...editMealPlans.morning,
      ...editMealPlans.lunch,
      ...editMealPlans.dinner,
    ];
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

      const { data: planData, error: pErr } = await supabase
        .from("meal_plans")
        .select("id, title, author, total_kcal, status, created_at, user_id")
        .eq("id", id)
        .single();
      if (!pErr) setPlan(planData);

      const { data: itemRows, error: itemsErr } = await supabase
        .from("meal_plan_items")
        .select(
          "id, food_id, quantity, meal_type, food:food_id(FoodID, FoodDescription)"
        )
        .eq("meal_plan_id", id)
        .order("id", { ascending: true });
      if (!itemsErr) setItems(itemRows || []);

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

  const renderMealSection = (mealType, mealTitle) => {
    const mealItems = editMealPlans[mealType];

    return (
      <div className="meal-section" key={mealType}>
        <div className="meal-header">
          <h3>{mealTitle}</h3>
          {isOwner() && (
            <button
              onClick={() => addItemToMeal(mealType)}
              disabled={loading}
              className="add-meal-item-btn"
            >
              Add food
            </button>
          )}
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
                      updateMealItem(
                        mealType,
                        item.id,
                        "foodId",
                        e.target.value
                      )
                    }
                    disabled={!isOwner()}
                  >
                    <option value="">-- Choose a food --</option>
                    {foods.map((food) => (
                      <option key={food.FoodID} value={String(food.FoodID)}>
                        {food.FoodDescription}
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
                    disabled={!isOwner()}
                  />
                </div>

                {isOwner() && (
                  <div className="meal-item-actions">
                    <button
                      onClick={() => removeItemFromMeal(mealType, item.id)}
                      className="remove-meal-item-btn"
                      disabled={loading}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const totalEditItems = getAllEditItems().length;

  return (
    <div className="saved-plans">
      <h1>Plan Details</h1>
      {notice && <div className="notice success">{notice}</div>}
      {loading && <div>Loading...</div>}
      {error && <div className="error">{error}</div>}
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
                  const mealTitles = {
                    morning: "🌅 Morning",
                    lunch: "🌞 Lunch",
                    dinner: "🌙 Dinner",
                  };
                  const mealItems = items.filter(
                    (item) => item.meal_type === mealType
                  );

                  return (
                    <div key={mealType} className="meal-display-section">
                      <h4>{mealTitles[mealType]}</h4>
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
            <div className="edit-plan-form">
              <h2>Edit Plan</h2>

              <div className="field-row">
                <div style={{ marginRight: 12 }}>
                  <label htmlFor="edit-title">Title</label>
                  <input
                    id="edit-title"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Plan title"
                  />
                </div>
                <div>
                  <label htmlFor="edit-author">Author</label>
                  <input
                    id="edit-author"
                    value={editAuthor}
                    onChange={(e) => setEditAuthor(e.target.value)}
                    placeholder="Your name"
                  />
                </div>
              </div>

              <div className="meals-container">
                <h3>Meal planning</h3>
                <div className="meals-grid">
                  {renderMealSection("morning", "🌅 Morning")}
                  {renderMealSection("lunch", "🌞 Lunch")}
                  {renderMealSection("dinner", "🌙 Dinner")}
                </div>
              </div>

              <div className="form-actions">
                <button
                  onClick={saveEdits}
                  disabled={loading || totalEditItems === 0}
                  className="save-btn"
                >
                  Save ({totalEditItems} items)
                </button>
                <button
                  onClick={cancelEdit}
                  disabled={loading}
                  className="cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
