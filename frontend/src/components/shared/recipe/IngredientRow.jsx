import React from "react";

export function IngredientRow({
  ingredient,
  cartFoods = [],
  onFoodChange,
  onUpdate,
  onRemove,
  disableRemove,
}) {
  return (
    <div className="ingredient-row">
      <div className="ingredient-dropdown">
        <div className="form-field">
          <label>Ingredient *</label>
          <select
            value={ingredient.foodId}
            onChange={(e) => onFoodChange(ingredient.id, e.target.value)}
          >
            <option value="">-- Choose from cart or enter manually --</option>
            {cartFoods.map((food) => (
              <option key={food.foodId} value={String(food.foodId)}>
                {food.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="ingredient-name-row">
        <div className="form-field">
          <label>Name (if not from cart)</label>
          <input
            type="text"
            value={ingredient.ingredientName}
            onChange={(e) =>
              onUpdate(ingredient.id, "ingredientName", e.target.value)
            }
            placeholder="e.g., Flour"
          />
        </div>
      </div>

      <div className="ingredient-quantity-row">
        <div className="form-field">
          <label>Quantity</label>
          <input
            type="number"
            value={ingredient.quantity}
            onChange={(e) =>
              onUpdate(ingredient.id, "quantity", e.target.value)
            }
            placeholder="100"
            min="0"
            step="0.1"
          />
        </div>

        <div className="form-field">
          <label>Unit</label>
          <select
            value={ingredient.unit}
            onChange={(e) => onUpdate(ingredient.id, "unit", e.target.value)}
          >
            <option value="g">grams (g)</option>
            <option value="kg">kilograms (kg)</option>
            <option value="ml">milliliters (ml)</option>
            <option value="l">liters (l)</option>
            <option value="cups">cups</option>
            <option value="tbsp">tablespoons</option>
            <option value="tsp">teaspoons</option>
            <option value="pieces">pieces</option>
          </select>
        </div>
      </div>

      <div className="ingredient-prep-row">
        <div className="form-field">
          <label>Preparation</label>
          <input
            type="text"
            value={ingredient.preparation}
            onChange={(e) =>
              onUpdate(ingredient.id, "preparation", e.target.value)
            }
            placeholder="e.g., chopped, diced"
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => onRemove(ingredient.id)}
            className="remove-btn"
            disabled={disableRemove}
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
