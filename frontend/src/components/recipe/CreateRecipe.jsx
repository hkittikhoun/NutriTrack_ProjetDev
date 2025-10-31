import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { AuthContext } from "../../context/auth-context";
import "./CreateRecipe.css";

export default function CreateRecipe() {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [servings, setServings] = useState("");
  const [difficultyLevel, setDifficultyLevel] = useState("easy");
  const [category, setCategory] = useState("");
  const [cookingTime, setCookingTime] = useState("");
  const [prepTime, setPrepTime] = useState("");

  const [ingredients, setIngredients] = useState([
    {
      id: Date.now(),
      foodId: "",
      ingredientName: "",
      quantity: "",
      unit: "g",
      preparation: "",
    },
  ]);

  const [instructions, setInstructions] = useState([""]);

  const [cartFoods, setCartFoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(null);
  const [error, setError] = useState(null);

  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  // Charger les aliments du panier au démarrage
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

  // Pré-remplir l'auteur depuis l'utilisateur connecté
  useEffect(() => {
    const prefillAuthorFromUser = async () => {
      try {
        if (author && author.trim() !== "") return;

        const { data: authData, error: authErr } =
          await supabase.auth.getUser();
        if (authErr || !authData?.user) {
          if (auth && auth.userId) setAuthor(auth.userId);
          return;
        }

        const user = authData.user;
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
  }, [auth, author]);

  const addIngredient = () => {
    setIngredients([
      ...ingredients,
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
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((ing) => ing.id !== id));
    }
  };

  const updateIngredient = (id, field, value) => {
    setIngredients(
      ingredients.map((ing) =>
        ing.id === id ? { ...ing, [field]: value } : ing
      )
    );
  };

  const handleFoodChange = (id, foodId) => {
    const selectedFood = cartFoods.find(
      (food) => String(food.foodId) === foodId
    );

    setIngredients(
      ingredients.map((ing) =>
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
    setInstructions([...instructions, ""]);
  };

  const removeInstruction = (index) => {
    if (instructions.length > 1) {
      setInstructions(instructions.filter((_, i) => i !== index));
    }
  };

  const updateInstruction = (index, value) => {
    setInstructions(
      instructions.map((instruction, i) => (i === index ? value : instruction))
    );
  };

  const prefillFromCart = () => {
    if (!cartFoods || cartFoods.length === 0) {
      setNotice("Aucun item dans le panier pour pré-remplir.");
      setTimeout(() => setNotice(null), 2000);
      return;
    }

    const newIngredients = cartFoods.map((cartItem, index) => ({
      id: Date.now() + index,
      foodId: String(cartItem.foodId),
      ingredientName: cartItem.name,
      quantity: cartItem.cartQuantity,
      unit: "g",
      preparation: "",
    }));

    setIngredients(newIngredients);
    setNotice(`Pré-rempli avec ${cartFoods.length} ingrédients du panier.`);
    setTimeout(() => setNotice(null), 2500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    const errors = [];
    if (!title.trim()) errors.push("Le titre est requis");
    if (!author.trim()) errors.push("L'auteur est requis");
    if (ingredients.some((ing) => !ing.ingredientName.trim())) {
      errors.push("Tous les ingrédients doivent avoir un nom");
    }
    if (instructions.some((inst) => !inst.trim())) {
      errors.push("Toutes les instructions doivent être remplies");
    }

    if (errors.length > 0) {
      setError(errors.join(", "));
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data: authData, error: authErr } = await supabase.auth.getUser();
      if (authErr) {
        setError("Erreur d'authentification: " + authErr.message);
        return;
      }
      const userId = authData?.user?.id || auth.userId;
      if (!userId) {
        setError("Veuillez vous connecter pour créer une recette.");
        return;
      }

      // 1. Créer la recette
      const recipeData = {
        user_id: userId,
        title: title.trim(),
        author: author.trim(),
        description: description.trim() || null,
        servings: servings ? parseInt(servings) : null,
        difficulty_level: difficultyLevel,
        category: category.trim() || null,
        cooking_time: cookingTime ? parseInt(cookingTime) : null,
        prep_time: prepTime ? parseInt(prepTime) : null,
      };

      const { data: recipe, error: recipeErr } = await supabase
        .from("recipes")
        .insert(recipeData)
        .select()
        .single();

      if (recipeErr) {
        setError("Impossible de créer la recette: " + recipeErr.message);
        return;
      }

      // 2. Insérer les ingrédients
      const ingredientsData = ingredients
        .filter((ing) => ing.ingredientName.trim())
        .map((ing, index) => ({
          recipe_id: recipe.id,
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
          setError(
            "Impossible d'ajouter les ingrédients: " + ingredientsErr.message
          );
          return;
        }
      }

      // 3. Insérer les instructions
      const instructionsData = instructions
        .filter((inst) => inst.trim())
        .map((inst, index) => ({
          recipe_id: recipe.id,
          step_number: index + 1,
          instruction: inst.trim(),
        }));

      if (instructionsData.length > 0) {
        const { error: instructionsErr } = await supabase
          .from("recipe_instructions")
          .insert(instructionsData);

        if (instructionsErr) {
          setError(
            "Impossible d'ajouter les instructions: " + instructionsErr.message
          );
          return;
        }
      }

      setNotice("Recette créée avec succès!");

      // Reset form
      setTitle("");
      setDescription("");
      setServings("");
      setCookingTime("");
      setPrepTime("");
      setCategory("");
      setIngredients([
        {
          id: Date.now(),
          foodId: "",
          ingredientName: "",
          quantity: "",
          unit: "g",
          preparation: "",
        },
      ]);
      setInstructions([""]);

      setTimeout(() => {
        setNotice(null);
        navigate("/recipe?tab=saved");
      }, 2000);
    } catch (e) {
      console.error(e);
      setError("Erreur lors de la création de la recette");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-recipe">
      <h2>Create New Recipe</h2>

      {notice && <div className="notice success">{notice}</div>}
      {error && <div className="error">{error}</div>}
      {loading && <div className="loading">Loading...</div>}

      <form onSubmit={handleSubmit} className="recipe-form">
        <div className="form-section">
          <h3>Basic Information</h3>

          <div className="field-row">
            <div className="form-field">
              <label htmlFor="recipe-title">Title *</label>
              <input
                id="recipe-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Recipe title"
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="recipe-author">Author *</label>
              <input
                id="recipe-author"
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Your name"
                required
              />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="recipe-description">Description</label>
            <textarea
              id="recipe-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of your recipe"
              rows="3"
            />
          </div>

          <div className="field-row">
            <div className="form-field">
              <label htmlFor="servings">Servings</label>
              <input
                id="servings"
                type="number"
                value={servings}
                onChange={(e) => setServings(e.target.value)}
                placeholder="4"
                min="1"
              />
            </div>
            <div className="form-field">
              <label htmlFor="difficulty">Difficulty Level</label>
              <select
                id="difficulty"
                value={difficultyLevel}
                onChange={(e) => setDifficultyLevel(e.target.value)}
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
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., Dessert, Main Course"
              />
            </div>
            <div className="form-field">
              <label htmlFor="prep-time">Prep Time (minutes)</label>
              <input
                id="prep-time"
                type="number"
                value={prepTime}
                onChange={(e) => setPrepTime(e.target.value)}
                placeholder="15"
                min="1"
              />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="cooking-time">Cooking Time (minutes)</label>
            <input
              id="cooking-time"
              type="number"
              value={cookingTime}
              onChange={(e) => setCookingTime(e.target.value)}
              placeholder="30"
              min="1"
            />
          </div>
        </div>

        {cartFoods && cartFoods.length > 0 && (
          <div className="cart-section">
            <h3>Available ingredients from your cart ({cartFoods.length})</h3>
            <button
              type="button"
              onClick={prefillFromCart}
              disabled={loading}
              className="prefill-btn"
            >
              Prefill from cart
            </button>
          </div>
        )}

        <div className="form-section">
          <h3>Ingredients</h3>

          {ingredients.map((ingredient) => (
            <div key={ingredient.id} className="ingredient-row">
              {/* Ligne 1: Dropdown de sélection */}
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
                      -- Choose from cart or enter manually --
                    </option>
                    {cartFoods.map((food) => (
                      <option key={food.foodId} value={String(food.foodId)}>
                        {food.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Ligne 2: Nom de l'ingrédient */}
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

              {/* Ligne 3: Quantité et Unité */}
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

              {/* Ligne 4: Préparation et Remove */}
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
                    disabled={ingredients.length === 1}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}

          <button type="button" onClick={addIngredient} className="add-btn">
            Add Ingredient
          </button>
        </div>

        <div className="form-section">
          <h3>Instructions</h3>

          {instructions.map((instruction, index) => (
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
                  disabled={instructions.length === 1}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          <button type="button" onClick={addInstruction} className="add-btn">
            Add Step
          </button>
        </div>

        <div className="form-submit">
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Saving..." : "Create Recipe"}
          </button>
        </div>
      </form>
    </div>
  );
}
