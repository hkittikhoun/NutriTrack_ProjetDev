import React from "react";
import "../Recipe.css";
import { IngredientRow } from "./IngredientRow";
import { InstructionRow } from "./InstructionRow";

export function RecipeForm({
  mode, // "create" | "edit"
  fields, // { title, author, description, servings, difficultyLevel, category, cookingTime, prepTime }
  setFields, // setters: { setTitle, setAuthor, setDescription, setServings, setDifficultyLevel, setCategory, setCookingTime, setPrepTime }
  ingredients,
  setIngredients,
  instructions,
  setInstructions,
  cartFoods,
  loading,
  onSave,
  onCancel,
}) {
  const addIngredient = () =>
    setIngredients((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        foodId: "",
        ingredientName: "",
        quantity: "",
        unit: "g",
        preparation: "",
      },
    ]);

  const removeIngredient = (ingId) =>
    setIngredients((prev) =>
      prev.length > 1 ? prev.filter((ing) => ing.id !== ingId) : prev
    );

  const updateIngredient = (ingId, field, value) =>
    setIngredients((prev) =>
      prev.map((ing) => (ing.id === ingId ? { ...ing, [field]: value } : ing))
    );

  const handleFoodChange = (ingId, foodId) => {
    const selectedFood = cartFoods?.find(
      (food) => String(food.foodId) === String(foodId)
    );
    setIngredients((prev) =>
      prev.map((ing) =>
        ing.id === ingId
          ? {
              ...ing,
              foodId,
              ingredientName: selectedFood ? selectedFood.name : "",
              quantity: selectedFood ? selectedFood.cartQuantity : "",
            }
          : ing
      )
    );
  };

  const addInstruction = () => setInstructions((prev) => [...prev, ""]);
  const removeInstruction = (index) =>
    setInstructions((prev) =>
      prev.length > 1 ? prev.filter((_, i) => i !== index) : prev
    );
  const updateInstruction = (index, value) =>
    setInstructions((prev) =>
      prev.map((inst, i) => (i === index ? value : inst))
    );

  return (
    <div className="edit-recipe-form">
      <h2>{mode === "create" ? "Create Recipe" : "Edit Recipe"}</h2>

      <div className="form-section">
        <h3>Basic information</h3>

        <div className="field-row">
          <div className="form-field">
            <label htmlFor="title">Title *</label>
            <input
              id="title"
              type="text"
              value={fields.title}
              onChange={(e) => setFields.setTitle(e.target.value)}
              placeholder="Recipe title"
              required
            />
          </div>
          <div className="form-field">
            <label htmlFor="author">Author *</label>
            <input
              id="author"
              type="text"
              value={fields.author}
              onChange={(e) => setFields.setAuthor(e.target.value)}
              placeholder="Your name"
              required
            />
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={fields.description}
            onChange={(e) => setFields.setDescription(e.target.value)}
            placeholder="Description of your recipe"
            rows="3"
          />
        </div>

        <div className="field-row">
          <div className="form-field">
            <label htmlFor="servings">Servings</label>
            <input
              id="servings"
              type="number"
              value={fields.servings}
              onChange={(e) => setFields.setServings(e.target.value)}
              placeholder="4"
              min="1"
            />
          </div>
          <div className="form-field">
            <label htmlFor="difficulty">Difficulty level</label>
            <select
              id="difficulty"
              value={fields.difficultyLevel}
              onChange={(e) => setFields.setDifficultyLevel(e.target.value)}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        <div className="field-row">
          <div className="form-field">
            <label htmlFor="category">Category</label>
            <input
              id="category"
              type="text"
              value={fields.category}
              onChange={(e) => setFields.setCategory(e.target.value)}
              placeholder="e.g., Dessert, Main course"
            />
          </div>
          <div className="form-field">
            <label htmlFor="prep-time">Prep time (minutes)</label>
            <input
              id="prep-time"
              type="number"
              value={fields.prepTime}
              onChange={(e) => setFields.setPrepTime(e.target.value)}
              placeholder="15"
              min="1"
            />
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="cook-time">Cook time (minutes)</label>
          <input
            id="cook-time"
            type="number"
            value={fields.cookingTime}
            onChange={(e) => setFields.setCookingTime(e.target.value)}
            placeholder="30"
            min="1"
          />
        </div>
      </div>

      <div className="form-section">
        <h3>Ingredients</h3>
        {ingredients.map((ingredient) => (
          <IngredientRow
            key={ingredient.id}
            ingredient={ingredient}
            cartFoods={cartFoods || []}
            onFoodChange={handleFoodChange}
            onUpdate={updateIngredient}
            onRemove={removeIngredient}
            disableRemove={ingredients.length === 1}
          />
        ))}
        <button type="button" onClick={addIngredient} className="add-btn">
          Add ingredient
        </button>
      </div>

      <div className="form-section">
        <h3>Instructions</h3>
        {instructions.map((instruction, index) => (
          <InstructionRow
            key={index}
            index={index}
            value={instruction}
            onUpdate={updateInstruction}
            onRemove={removeInstruction}
            disableRemove={instructions.length === 1}
          />
        ))}
        <button type="button" onClick={addInstruction} className="add-btn">
          Add step
        </button>
      </div>

      <div className="form-actions">
        <button onClick={onSave} disabled={loading} className="save-btn">
          {loading ? "Saving..." : "Save"}
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
