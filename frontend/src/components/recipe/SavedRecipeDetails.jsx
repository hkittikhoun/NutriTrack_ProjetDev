import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { AuthContext } from "../../context/auth-context";
import "./SavedRecipeDetails.css";

export default function SavedRecipeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const auth = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const [recipe, setRecipe] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [instructions, setInstructions] = useState([]);
  const [cartFoods, setCartFoods] = useState([]);
  const [isEditing, setIsEditing] = useState(
    searchParams.get("edit") === "true"
  );

  const [editTitle, setEditTitle] = useState("");
  const [editAuthor, setEditAuthor] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editServings, setEditServings] = useState("");
  const [editDifficultyLevel, setEditDifficultyLevel] = useState("easy");
  const [editCategory, setEditCategory] = useState("");
  const [editCookingTime, setEditCookingTime] = useState("");
  const [editPrepTime, setEditPrepTime] = useState("");
  const [editIngredients, setEditIngredients] = useState([]);
  const [editInstructions, setEditInstructions] = useState([""]);

  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Charger la recette (accessible à tous)
        const { data: recipeData, error: rErr } = await supabase
          .from("recipes")
          .select("*")
          .eq("id", id)
          .single();

        if (rErr) {
          setError(rErr.message || "Failed to load recipe");
          setLoading(false);
          return;
        }
        setRecipe(recipeData);

        // Charger les ingrédients (accessible à tous)
        const { data: ingredientsData, error: iErr } = await supabase
          .from("recipe_ingredients")
          .select("*")
          .eq("recipe_id", id)
          .order("order_index", { ascending: true });

        if (iErr) {
          setError(iErr.message || "Failed to load ingredients");
          setLoading(false);
          return;
        }
        setIngredients(ingredientsData || []);

        // Charger les instructions (accessible à tous)
        const { data: instructionsData, error: insErr } = await supabase
          .from("recipe_instructions")
          .select("*")
          .eq("recipe_id", id)
          .order("step_number", { ascending: true });

        if (insErr) {
          setError(insErr.message || "Failed to load instructions");
          setLoading(false);
          return;
        }
        setInstructions(instructionsData || []);

        // Vérifier si l'utilisateur essaie d'éditer une recette qui n'est pas la sienne
        if (
          searchParams.get("edit") === "true" &&
          (!auth?.userId || recipeData.user_id !== auth.userId)
        ) {
          setIsEditing(false);
          setNotice("You can only edit your own recipes.");
          setTimeout(() => setNotice(null), 3000);
        }

        // Charger les données d'édition uniquement si c'est le propriétaire
        if (recipeData.user_id === auth?.userId) {
          setEditTitle(recipeData.title || "");
          setEditAuthor(recipeData.author || "");
          setEditDescription(recipeData.description || "");
          setEditServings(recipeData.servings || "");
          setEditDifficultyLevel(recipeData.difficulty_level || "easy");
          setEditCategory(recipeData.category || "");
          setEditCookingTime(recipeData.cooking_time || "");
          setEditPrepTime(recipeData.prep_time || "");

          const editIngs = (ingredientsData || []).map((ing) => ({
            id: ing.id,
            foodId: ing.food_id ? String(ing.food_id) : "",
            ingredientName: ing.ingredient_name || "",
            quantity: ing.quantity || "",
            unit: ing.unit || "g",
            preparation: ing.preparation || "",
          }));
          setEditIngredients(
            editIngs.length > 0
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
                ]
          );

          const editInsts = (instructionsData || []).map(
            (inst) => inst.instruction
          );
          setEditInstructions(editInsts.length > 0 ? editInsts : [""]);

          // Charger le panier pour le propriétaire
          const { data: authData, error: authErr } =
            await supabase.auth.getUser();
          if (!authErr && authData?.user?.id) {
            const { data: cartRows, error: cartErr } = await supabase
              .from("cart_items")
              .select(
                `
                id,
                quantity,
                food:food_id(FoodID, FoodDescription)
              `
              )
              .eq("user_id", authData.user.id)
              .order("id", { ascending: true });

            if (!cartErr) {
              const cartItems = (cartRows || [])
                .filter((r) => r.food && r.food.FoodID)
                .map((r) => ({
                  id: r.id,
                  foodId: r.food.FoodID,
                  name: r.food.FoodDescription,
                  cartQuantity: r.quantity,
                }));
              setCartFoods(cartItems);
            }
          }
        }
      } catch (e) {
        console.error(e);
        setError("Failed to load recipe");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, auth?.userId, searchParams]);

  const isOwner = () => {
    return auth?.userId && recipe?.user_id === auth.userId;
  };

  const startEdit = () => {
    if (!isOwner()) {
      setNotice("You can only edit your own recipes.");
      setTimeout(() => setNotice(null), 3000);
      return;
    }
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setEditTitle(recipe?.title || "");
    setEditAuthor(recipe?.author || "");
    setEditDescription(recipe?.description || "");
    setEditServings(recipe?.servings || "");
    setEditDifficultyLevel(recipe?.difficulty_level || "easy");
    setEditCategory(recipe?.category || "");
    setEditCookingTime(recipe?.cooking_time || "");
    setEditPrepTime(recipe?.prep_time || "");

    const editIngs = ingredients.map((ing) => ({
      id: ing.id,
      foodId: ing.food_id ? String(ing.food_id) : "",
      ingredientName: ing.ingredient_name || "",
      quantity: ing.quantity || "",
      unit: ing.unit || "g",
      preparation: ing.preparation || "",
    }));
    setEditIngredients(
      editIngs.length > 0
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
          ]
    );

    const editInsts = instructions.map((inst) => inst.instruction);
    setEditInstructions(editInsts.length > 0 ? editInsts : [""]);

    setIsEditing(false);
  };

  const addIngredient = () => {
    setEditIngredients([
      ...editIngredients,
      {
        id: Date.now() + Math.random(),
        foodId: "",
        ingredientName: "",
        quantity: "",
        unit: "g",
        preparation: "",
      },
    ]);
  };

  const removeIngredient = (id) => {
    if (editIngredients.length > 1) {
      setEditIngredients(editIngredients.filter((ing) => ing.id !== id));
    }
  };

  const updateIngredient = (id, field, value) => {
    setEditIngredients(
      editIngredients.map((ing) =>
        ing.id === id ? { ...ing, [field]: value } : ing
      )
    );
  };

  const handleFoodChange = (id, foodId) => {
    const selectedFood = cartFoods.find(
      (food) => String(food.foodId) === foodId
    );

    setEditIngredients(
      editIngredients.map((ing) =>
        ing.id === id
          ? {
              ...ing,
              foodId: foodId,
              ingredientName: selectedFood ? selectedFood.name : "",
              quantity: selectedFood ? selectedFood.cartQuantity : "",
            }
          : ing
      )
    );
  };

  const addInstruction = () => {
    setEditInstructions([...editInstructions, ""]);
  };

  const removeInstruction = (index) => {
    if (editInstructions.length > 1) {
      setEditInstructions(editInstructions.filter((_, i) => i !== index));
    }
  };

  const updateInstruction = (index, value) => {
    setEditInstructions(
      editInstructions.map((instruction, i) =>
        i === index ? value : instruction
      )
    );
  };

  const saveEdits = async () => {
    if (!isOwner()) {
      setError("You can only edit your own recipes.");
      return;
    }

    const errors = [];
    if (!editTitle.trim()) errors.push("Title is required");
    if (!editAuthor.trim()) errors.push("Author is required");
    if (editIngredients.some((ing) => !ing.ingredientName.trim())) {
      errors.push("All ingredients must have a name");
    }
    if (editInstructions.some((inst) => !inst.trim())) {
      errors.push("All instructions must be filled in");
    }

    if (errors.length > 0) {
      setError(errors.join(", "));
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const recipeData = {
        title: editTitle.trim(),
        author: editAuthor.trim(),
        description: editDescription.trim() || null,
        servings: editServings ? parseInt(editServings) : null,
        difficulty_level: editDifficultyLevel,
        category: editCategory.trim() || null,
        cooking_time: editCookingTime ? parseInt(editCookingTime) : null,
        prep_time: editPrepTime ? parseInt(editPrepTime) : null,
      };

      const { error: recipeErr } = await supabase
        .from("recipes")
        .update(recipeData)
        .eq("id", id)
        .eq("user_id", auth.userId);

      if (recipeErr) {
        setError("Failed to update recipe: " + recipeErr.message);
        return;
      }

      const { error: delIngredientsErr } = await supabase
        .from("recipe_ingredients")
        .delete()
        .eq("recipe_id", id);

      if (delIngredientsErr) {
        setError(
          "Failed to delete old ingredients: " + delIngredientsErr.message
        );
        return;
      }

      const ingredientsData = editIngredients
        .filter((ing) => ing.ingredientName.trim())
        .map((ing, index) => ({
          recipe_id: id,
          food_id: ing.foodId ? parseInt(ing.foodId) : null,
          ingredient_name: ing.ingredientName.trim(),
          quantity: ing.quantity ? parseFloat(ing.quantity) : null,
          unit: ing.unit.trim() || null,
          preparation: ing.preparation.trim() || null,
          order_index: index + 1,
        }));

      if (ingredientsData.length > 0) {
        const { error: ingredientsErr } = await supabase
          .from("recipe_ingredients")
          .insert(ingredientsData);

        if (ingredientsErr) {
          setError("Failed to add ingredients: " + ingredientsErr.message);
          return;
        }
      }

      const { error: delInstructionsErr } = await supabase
        .from("recipe_instructions")
        .delete()
        .eq("recipe_id", id);

      if (delInstructionsErr) {
        setError(
          "Failed to delete old instructions: " + delInstructionsErr.message
        );
        return;
      }

      const instructionsData = editInstructions
        .filter((inst) => inst.trim())
        .map((inst, index) => ({
          recipe_id: id,
          step_number: index + 1,
          instruction: inst.trim(),
        }));

      if (instructionsData.length > 0) {
        const { error: instructionsErr } = await supabase
          .from("recipe_instructions")
          .insert(instructionsData);

        if (instructionsErr) {
          setError("Failed to add instructions: " + instructionsErr.message);
          return;
        }
      }

      const updatedRecipe = { ...recipe, ...recipeData };
      setRecipe(updatedRecipe);

      setEditTitle(updatedRecipe.title || "");
      setEditAuthor(updatedRecipe.author || "");
      setEditDescription(updatedRecipe.description || "");
      setEditServings(updatedRecipe.servings || "");
      setEditDifficultyLevel(updatedRecipe.difficulty_level || "easy");
      setEditCategory(updatedRecipe.category || "");
      setEditCookingTime(updatedRecipe.cooking_time || "");
      setEditPrepTime(updatedRecipe.prep_time || "");

      const { data: newIngredients } = await supabase
        .from("recipe_ingredients")
        .select("*")
        .eq("recipe_id", id)
        .order("order_index", { ascending: true });
      setIngredients(newIngredients || []);

      const { data: newInstructions } = await supabase
        .from("recipe_instructions")
        .select("*")
        .eq("recipe_id", id)
        .order("step_number", { ascending: true });
      setInstructions(newInstructions || []);

      setIsEditing(false);
      setNotice("Recipe updated successfully!");
      setTimeout(() => setNotice(null), 3000);
    } catch (e) {
      console.error(e);
      setError("Unexpected error while saving");
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "easy":
        return "#4caf50";
      case "medium":
        return "#ff9800";
      case "hard":
        return "#f44336";
      default:
        return "#666";
    }
  };

  const getDifficultyLabel = (difficulty) => {
    switch (difficulty) {
      case "easy":
        return "Easy";
      case "medium":
        return "Medium";
      case "hard":
        return "Hard";
      default:
        return difficulty;
    }
  };

  if (loading && !recipe) {
    return (
      <div className="recipe-details">
        <div className="loading">Loading recipe...</div>
      </div>
    );
  }

  if (error && !recipe) {
    return (
      <div className="recipe-details">
        <div className="error">{error}</div>
        <button onClick={() => navigate(-1)} className="back-btn">
          Back
        </button>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="recipe-details">
        <div className="error">Recipe not found</div>
        <button onClick={() => navigate(-1)} className="back-btn">
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="recipe-details">
      <h1>Recipe Details</h1>
      {notice && <div className="notice success">{notice}</div>}
      {error && <div className="error">{error}</div>}

      {!isEditing ? (
        <div className="recipe-display">
          <div className="recipe-header-info">
            <h2>{recipe.title}</h2>
            {isOwner() && <span className="owner-badge">Your recipe</span>}
          </div>

          <div className="recipe-meta">
            <span>
              <strong>Author:</strong> {recipe.author || "Anonymous"}
            </span>
            <span>
              <strong>Difficulty:</strong>{" "}
              <span
                style={{ color: getDifficultyColor(recipe.difficulty_level) }}
              >
                {getDifficultyLabel(recipe.difficulty_level)}
              </span>
            </span>
            {recipe.servings && (
              <span>
                <strong>Servings:</strong> {recipe.servings}
              </span>
            )}
            {recipe.category && (
              <span>
                <strong>Category:</strong> {recipe.category}
              </span>
            )}
            {recipe.prep_time && (
              <span>
                <strong>Prep time:</strong> {recipe.prep_time} min
              </span>
            )}
            {recipe.cooking_time && (
              <span>
                <strong>Cook time:</strong> {recipe.cooking_time} min
              </span>
            )}
          </div>

          {recipe.description && (
            <div className="recipe-description">
              <h3>Description</h3>
              <p>{recipe.description}</p>
            </div>
          )}

          <div className="recipe-ingredients">
            <h3>Ingredients</h3>
            {ingredients.length === 0 ? (
              <p className="no-items">No ingredients</p>
            ) : (
              <ul>
                {ingredients.map((ingredient) => (
                  <li key={ingredient.id}>
                    <strong>{ingredient.ingredient_name}</strong>
                    {ingredient.quantity && (
                      <span> — {ingredient.quantity}</span>
                    )}
                    {ingredient.unit && <span> {ingredient.unit}</span>}
                    {ingredient.preparation && (
                      <span> ({ingredient.preparation})</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="recipe-instructions">
            <h3>Instructions</h3>
            {instructions.length === 0 ? (
              <p className="no-items">No instructions</p>
            ) : (
              <ol>
                {instructions.map((instruction) => (
                  <li key={instruction.id}>{instruction.instruction}</li>
                ))}
              </ol>
            )}
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
        </div>
      ) : (
        <div className="edit-recipe-form">
          <h2>Edit Recipe</h2>

          <div className="form-section">
            <h3>Basic information</h3>

            <div className="field-row">
              <div className="form-field">
                <label htmlFor="edit-title">Title *</label>
                <input
                  id="edit-title"
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Recipe title"
                  required
                />
              </div>
              <div className="form-field">
                <label htmlFor="edit-author">Author *</label>
                <input
                  id="edit-author"
                  type="text"
                  value={editAuthor}
                  onChange={(e) => setEditAuthor(e.target.value)}
                  placeholder="Your name"
                  required
                />
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="edit-description">Description</label>
              <textarea
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Description of your recipe"
                rows="3"
              />
            </div>

            <div className="field-row">
              <div className="form-field">
                <label htmlFor="edit-servings">Servings</label>
                <input
                  id="edit-servings"
                  type="number"
                  value={editServings}
                  onChange={(e) => setEditServings(e.target.value)}
                  placeholder="4"
                  min="1"
                />
              </div>
              <div className="form-field">
                <label htmlFor="edit-difficulty">Difficulty level</label>
                <select
                  id="edit-difficulty"
                  value={editDifficultyLevel}
                  onChange={(e) => setEditDifficultyLevel(e.target.value)}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            <div className="field-row">
              <div className="form-field">
                <label htmlFor="edit-category">Category</label>
                <input
                  id="edit-category"
                  type="text"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  placeholder="e.g., Dessert, Main course"
                />
              </div>
              <div className="form-field">
                <label htmlFor="edit-prep-time">Prep time (minutes)</label>
                <input
                  id="edit-prep-time"
                  type="number"
                  value={editPrepTime}
                  onChange={(e) => setEditPrepTime(e.target.value)}
                  placeholder="15"
                  min="1"
                />
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="edit-cooking-time">Cook time (minutes)</label>
              <input
                id="edit-cooking-time"
                type="number"
                value={editCookingTime}
                onChange={(e) => setEditCookingTime(e.target.value)}
                placeholder="30"
                min="1"
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Ingredients</h3>

            {editIngredients.map((ingredient) => (
              <div key={ingredient.id} className="ingredient-row">
                {/* Row 1: Dropdown */}
                <div className="ingredient-dropdown">
                  <div className="form-field">
                    <label>Ingredient *</label>
                    <select
                      value={ingredient.foodId}
                      onChange={(e) =>
                        handleFoodChange(ingredient.id, e.target.value)
                      }
                    >
                      <option value="">
                        -- Choose from cart or type manually --
                      </option>
                      {cartFoods.map((food) => (
                        <option key={food.foodId} value={String(food.foodId)}>
                          {food.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Row 2: Ingredient name */}
                <div className="ingredient-name-row">
                  <div className="form-field">
                    <label>Name (if not from cart)</label>
                    <input
                      type="text"
                      value={ingredient.ingredientName}
                      onChange={(e) =>
                        updateIngredient(
                          ingredient.id,
                          "ingredientName",
                          e.target.value
                        )
                      }
                      placeholder="e.g., Flour"
                    />
                  </div>
                </div>

                {/* Row 3: Quantity and Unit */}
                <div className="ingredient-quantity-row">
                  <div className="form-field">
                    <label>Quantity</label>
                    <input
                      type="number"
                      value={ingredient.quantity}
                      onChange={(e) =>
                        updateIngredient(
                          ingredient.id,
                          "quantity",
                          e.target.value
                        )
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
                      onChange={(e) =>
                        updateIngredient(ingredient.id, "unit", e.target.value)
                      }
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

                {/* Row 4: Preparation and Remove */}
                <div className="ingredient-prep-row">
                  <div className="form-field">
                    <label>Preparation</label>
                    <input
                      type="text"
                      value={ingredient.preparation}
                      onChange={(e) =>
                        updateIngredient(
                          ingredient.id,
                          "preparation",
                          e.target.value
                        )
                      }
                      placeholder="e.g., chopped, diced"
                    />
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      onClick={() => removeIngredient(ingredient.id)}
                      className="remove-btn"
                      disabled={editIngredients.length === 1}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <button type="button" onClick={addIngredient} className="add-btn">
              Add ingredient
            </button>
          </div>

          <div className="form-section">
            <h3>Instructions</h3>

            {editInstructions.map((instruction, index) => (
              <div key={index} className="instruction-row">
                <div className="form-field">
                  <label>Step {index + 1} *</label>
                  <textarea
                    value={instruction}
                    onChange={(e) => updateInstruction(index, e.target.value)}
                    placeholder="Describe this step..."
                    rows="3"
                    required
                  />
                </div>
                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => removeInstruction(index)}
                    className="remove-btn"
                    disabled={editInstructions.length === 1}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}

            <button type="button" onClick={addInstruction} className="add-btn">
              Add step
            </button>
          </div>

          <div className="form-actions">
            <button onClick={saveEdits} disabled={loading} className="save-btn">
              {loading ? "Saving..." : "Save"}
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
      {error && <div className="error">{error}</div>}
    </div>
  );
}
