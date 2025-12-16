import React from "react";
import "../../shared/MealPlan.css";
import { mergeCartWithCatalogue } from "./mapUtils";

export function MealPlanEditor({
  isOwner,
  loading,
  loadingCart,
  cartFoods,
  foods,
  mealPlans,
  addItemToMeal,
  removeItemFromMeal,
  updateMealItem,
  onPrefillFromCart,
  titleProps, // { title, setTitle, author, setAuthor }
  saveProps, // { onSave, saveDisabledLabel }
  onCancel,
}) {
  const renderMealSection = (mealType, mealTitle) => {
    const mealItems = mealPlans[mealType] || [];
    const mergedFoods = mergeCartWithCatalogue(cartFoods || [], foods || []);

    return (
      <div className="meal-section" key={mealType}>
        <div className="meal-header">
          <h3>{mealTitle}</h3>
          {isOwner && (
            <button
              onClick={() => addItemToMeal(mealType)}
              disabled={loading || loadingCart}
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
                    disabled={!isOwner}
                  >
                    <option value="">-- Choose a food --</option>
                    {(mergedFoods.length ? mergedFoods : cartFoods || []).map(
                      (food) => (
                        <option
                          key={String(food.FoodID ?? food.foodId)}
                          value={String(food.FoodID ?? food.foodId)}
                        >
                          {food.FoodDescription ?? food.name}
                          {food._fromCart ? " (from cart)" : ""}
                        </option>
                      )
                    )}
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
                    disabled={!isOwner}
                  />
                </div>

                {isOwner && (
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

  const totalItems =
    (mealPlans.morning?.length || 0) +
    (mealPlans.lunch?.length || 0) +
    (mealPlans.dinner?.length || 0);

  return (
    <div className="edit-plan-form">
      <h2>Edit Plan</h2>

      <div className="field-row">
        <div style={{ marginRight: 12 }}>
          <label htmlFor="edit-title">Title</label>
          <input
            id="edit-title"
            value={titleProps.title}
            onChange={(e) => titleProps.setTitle(e.target.value)}
            placeholder="Plan title"
          />
        </div>
        <div>
          <label htmlFor="edit-author">Author</label>
          <input
            id="edit-author"
            value={titleProps.author}
            onChange={(e) => titleProps.setAuthor(e.target.value)}
            placeholder="Your name"
          />
        </div>
      </div>

      {isOwner && !!onPrefillFromCart && cartFoods && cartFoods.length > 0 && (
        <div className="cart-section" style={{ marginBottom: 12 }}>
          <h3>Foods available in your cart ({cartFoods.length})</h3>
          <button
            onClick={onPrefillFromCart}
            disabled={loading || loadingCart}
            className="prefill-btn"
          >
            Prefill from cart
          </button>
        </div>
      )}

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
          onClick={saveProps.onSave}
          disabled={loading || totalItems === 0}
          className="save-btn"
        >
          Save ({saveProps.saveDisabledLabel ?? totalItems} items)
        </button>
        {onCancel && (
          <button onClick={onCancel} disabled={loading} className="cancel-btn">
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
