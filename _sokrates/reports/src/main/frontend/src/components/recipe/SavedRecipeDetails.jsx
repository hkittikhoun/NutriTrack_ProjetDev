import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { AuthContext } from "../../context/auth-context";
import "../shared/Recipe.css";

import {
  validateRecipe,
  getDifficultyColor,
  getDifficultyLabel,
  buildIngredientsData,
  buildInstructionsData,
} from "../shared/recipe/utils";
import { RecipeForm } from "./RecipeForm";
import {
  mapDbIngredientsToEdit,
  mapDbInstructionsToEdit,
} from "../shared/hooks/useRecipeForm";

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

        if (
          searchParams.get("edit") === "true" &&
          (!auth?.userId || recipeData.user_id !== auth.userId)
        ) {
          setIsEditing(false);
          setNotice("You can only edit your own recipes.");
          setTimeout(() => setNotice(null), 3000);
        }

        if (recipeData.user_id === auth?.userId) {
          setEditTitle(recipeData.title || "");
          setEditAuthor(recipeData.author || "");
          setEditDescription(recipeData.description || "");
          setEditServings(recipeData.servings || "");
          setEditDifficultyLevel(recipeData.difficulty_level || "easy");
          setEditCategory(recipeData.category || "");
          setEditCookingTime(recipeData.cooking_time || "");
          setEditPrepTime(recipeData.prep_time || "");

          setEditIngredients(mapDbIngredientsToEdit(ingredientsData));
          setEditInstructions(mapDbInstructionsToEdit(instructionsData));

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

    setEditIngredients(mapDbIngredientsToEdit(ingredients));
    setEditInstructions(mapDbInstructionsToEdit(instructions));

    setIsEditing(false);
  };

  const saveEdits = async () => {
    if (!isOwner()) {
      setError("You can only edit your own recipes.");
      return;
    }

    const errors = validateRecipe({
      title: editTitle,
      author: editAuthor,
      ingredients: editIngredients,
      instructions: editInstructions,
    });
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

      const ingredientsData = buildIngredientsData(editIngredients, id);
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

      const instructionsData = buildInstructionsData(editInstructions, id);
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
        <RecipeForm
          mode="edit"
          fields={{
            title: editTitle,
            author: editAuthor,
            description: editDescription,
            servings: editServings,
            difficultyLevel: editDifficultyLevel,
            category: editCategory,
            cookingTime: editCookingTime,
            prepTime: editPrepTime,
          }}
          setFields={{
            setTitle: setEditTitle,
            setAuthor: setEditAuthor,
            setDescription: setEditDescription,
            setServings: setEditServings,
            setDifficultyLevel: setEditDifficultyLevel,
            setCategory: setEditCategory,
            setCookingTime: setEditCookingTime,
            setPrepTime: setEditPrepTime,
          }}
          ingredients={editIngredients}
          setIngredients={setEditIngredients}
          instructions={editInstructions}
          setInstructions={setEditInstructions}
          cartFoods={cartFoods}
          loading={loading}
          onSave={saveEdits}
          onCancel={cancelEdit}
        />
      )}
      {error && <div className="error">{error}</div>}
    </div>
  );
}
