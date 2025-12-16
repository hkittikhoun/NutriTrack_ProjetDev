import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { AuthContext } from "../../context/auth-context";
import { usePrefillAuthor } from "../shared/hooks/usePrefillAuthors";
import { useCartFoods } from "../shared/hooks/useCartFoods";
import { prefillFromCartToIngredients } from "../shared/hooks/useCartPrefill";
import "../shared/Recipe.css";
import {
  validateRecipe,
  buildIngredientsData,
  buildInstructionsData,
} from "../shared/recipe/utils";
import { RecipeForm } from "./RecipeForm";

// helpers pour éviter les duplications
const makeEmptyIngredient = () => ({
  id: Date.now(),
  foodId: "",
  ingredientName: "",
  quantity: "",
  unit: "g",
  preparation: "",
});
const INITIAL_INGREDIENTS = [makeEmptyIngredient()];
const INITIAL_INSTRUCTIONS = [""];

export default function CreateRecipe() {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [servings, setServings] = useState("");
  const [difficultyLevel, setDifficultyLevel] = useState("easy");
  const [category, setCategory] = useState("");
  const [cookingTime, setCookingTime] = useState("");
  const [prepTime, setPrepTime] = useState("");

  const [ingredients, setIngredients] = useState(INITIAL_INGREDIENTS);
  const [instructions, setInstructions] = useState(INITIAL_INSTRUCTIONS);

  const [notice, setNotice] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  const { cartFoods, loadingCart, cartError } = useCartFoods();
  usePrefillAuthor(author, setAuthor, auth);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setServings("");
    setCookingTime("");
    setPrepTime("");
    setCategory("");
    setIngredients([makeEmptyIngredient()]);
    setInstructions(INITIAL_INSTRUCTIONS);
  };

  const prefillFromCart = () => {
    const mapped = prefillFromCartToIngredients(cartFoods);
    if (!mapped) {
      setNotice("Aucun item dans le panier pour pré-remplir.");
      setTimeout(() => setNotice(null), 2000);
      return;
    }
    setIngredients(mapped);
    setNotice(`Pré-rempli avec ${cartFoods.length} ingrédients du panier.`);
    setTimeout(() => setNotice(null), 2500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateRecipe({
      title,
      author,
      ingredients,
      instructions,
    });
    if (errors.length > 0) {
      setError(errors.join(", "));
      return;
    }

    setSaving(true);
    setError(null);

    try {
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

      const ingredientsData = buildIngredientsData(ingredients, recipe.id);
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

      const instructionsData = buildInstructionsData(instructions, recipe.id);
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
      resetForm();

      setTimeout(() => {
        setNotice(null);
        navigate("/recipe?tab=saved");
      }, 2000);
    } catch (e) {
      console.error(e);
      setError("Erreur lors de la création de la recette");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="create-recipe">
      <h2>Create New Recipe</h2>

      {notice && <div className="notice success">{notice}</div>}
      {error && <div className="error">{error}</div>}
      {loadingCart && <div className="loading">Loading...</div>}
      {cartError && <div className="error">{cartError}</div>}

      <RecipeForm
        mode="create"
        fields={{
          title,
          author,
          description,
          servings,
          difficultyLevel,
          category,
          cookingTime,
          prepTime,
        }}
        setFields={{
          setTitle,
          setAuthor,
          setDescription,
          setServings,
          setDifficultyLevel,
          setCategory,
          setCookingTime,
          setPrepTime,
        }}
        ingredients={ingredients}
        setIngredients={setIngredients}
        instructions={instructions}
        setInstructions={setInstructions}
        cartFoods={cartFoods}
        loading={saving}
        onSave={handleSubmit}
      />

      {cartFoods && cartFoods.length > 0 && (
        <div className="cart-section">
          <h3>Available ingredients from your cart ({cartFoods.length})</h3>
          <button
            type="button"
            onClick={prefillFromCart}
            disabled={saving || loadingCart}
            className="prefill-btn"
          >
            Prefill from cart
          </button>
        </div>
      )}
    </div>
  );
}
