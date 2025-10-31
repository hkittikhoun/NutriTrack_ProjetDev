import { useEffect, useState, useContext } from "react";
import { supabase } from "../../supabaseClient";
import { AuthContext } from "../../context/auth-context";
import { useNavigate } from "react-router-dom";
import "./SavedRecipe.css";

export default function SavedRecipe() {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [viewMode, setViewMode] = useState("all"); // "all" ou "mine"

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        setError(null);

        let query = supabase
          .from("recipes")
          .select(
            "id, title, author, description, servings, difficulty_level, category, cooking_time, prep_time, created_at, user_id"
          )
          .order("created_at", { ascending: false });

        // Si on veut voir seulement ses propres recettes
        if (viewMode === "mine" && auth?.userId) {
          query = query.eq("user_id", auth.userId);
        }

        const { data, error } = await query;
        if (error) {
          setError(error.message || "Impossible de charger les recettes");
          return;
        }
        setRecipes(data || []);
      } catch (e) {
        console.error(e);
        setError("Erreur inattendue");
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [auth?.userId, viewMode]);

  // Vérifier si l'utilisateur est propriétaire de la recette
  const isOwner = (recipe) => {
    return auth?.userId && recipe.user_id === auth.userId;
  };

  const handleDelete = async (recipe) => {
    if (!isOwner(recipe)) {
      setNotice("Vous ne pouvez supprimer que vos propres recettes.");
      setTimeout(() => setNotice(null), 3000);
      return;
    }

    const ok = window.confirm(`Supprimer la recette "${recipe.title}" ?`);
    if (!ok) return;

    try {
      setLoading(true);

      // Supprimer les instructions d'abord (clé étrangère)
      const { error: instructionsErr } = await supabase
        .from("recipe_instructions")
        .delete()
        .eq("recipe_id", recipe.id);

      if (instructionsErr) {
        setError(
          "Impossible de supprimer les instructions: " + instructionsErr.message
        );
        return;
      }

      // Supprimer les ingrédients
      const { error: ingredientsErr } = await supabase
        .from("recipe_ingredients")
        .delete()
        .eq("recipe_id", recipe.id);

      if (ingredientsErr) {
        setError(
          "Impossible de supprimer les ingrédients: " + ingredientsErr.message
        );
        return;
      }

      // Supprimer la recette
      const { error: recipeErr } = await supabase
        .from("recipes")
        .delete()
        .eq("id", recipe.id)
        .eq("user_id", auth.userId); // Sécurité supplémentaire

      if (recipeErr) {
        setError("Impossible de supprimer la recette: " + recipeErr.message);
        return;
      }

      setRecipes((prev) => prev.filter((r) => r.id !== recipe.id));
      setNotice("Recette supprimée avec succès.");
      setTimeout(() => setNotice(null), 3000);
    } catch (e) {
      console.error(e);
      setError("Erreur lors de la suppression");
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
        return "Facile";
      case "medium":
        return "Moyen";
      case "hard":
        return "Difficile";
      default:
        return difficulty;
    }
  };

  return (
    <div className="saved-recipes">
      <h2>Recipe Collection</h2>

      {notice && <div className="notice success">{notice}</div>}
      {loading && <div className="loading">Loading recipes...</div>}
      {error && <div className="error">{error}</div>}

      <div className="view-filters">
        <button
          className={`filter-btn ${viewMode === "all" ? "active" : ""}`}
          onClick={() => setViewMode("all")}
        >
          All Recipes ({recipes.length})
        </button>
        {auth?.userId && (
          <button
            className={`filter-btn ${viewMode === "mine" ? "active" : ""}`}
            onClick={() => setViewMode("mine")}
          >
            My Recipes
          </button>
        )}
      </div>

      {!loading && !error && recipes.length === 0 && (
        <div className="no-recipes-message">
          {viewMode === "mine"
            ? "You haven't created any recipes yet."
            : "No recipes available at the moment."}
        </div>
      )}

      <div className="recipes-grid">
        {recipes.map((recipe) => (
          <div key={recipe.id} className="recipe-card">
            <div className="recipe-header">
              <div className="recipe-title-row">
                <h3>{recipe.title}</h3>
                {isOwner(recipe) && (
                  <span className="owner-badge">Your Recipe</span>
                )}
              </div>

              <div className="recipe-header-info">
                <span>
                  <strong>By:</strong> {recipe.author || "Anonymous"}
                </span>
                {recipe.category && (
                  <span>
                    <strong>Category:</strong> {recipe.category}
                  </span>
                )}
                {recipe.prep_time && (
                  <span>
                    <strong>Prep:</strong> {recipe.prep_time} min
                  </span>
                )}
              </div>

              <div className="recipe-meta">
                <span className="cooking-time">
                  ⏱️ {recipe.cooking_time ? `${recipe.cooking_time} min` : "—"}
                </span>
                <span className="servings">
                  🍽️ {recipe.servings ? `${recipe.servings} portions` : "—"}
                </span>
                <span
                  className="difficulty"
                  style={{ color: getDifficultyColor(recipe.difficulty_level) }}
                >
                  📊 {getDifficultyLabel(recipe.difficulty_level)}
                </span>
              </div>
            </div>

            <div className="recipe-description">{recipe.description || ""}</div>

            <div className="recipe-actions">
              <button
                className="view-btn"
                onClick={() => navigate(`/recipe/${recipe.id}`)}
              >
                View Recipe
              </button>
              {isOwner(recipe) && (
                <>
                  <button
                    className="edit-btn"
                    onClick={() => navigate(`/recipe/${recipe.id}?edit=true`)}
                  >
                    Edit
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(recipe)}
                    disabled={loading}
                  >
                    Delete
                  </button>
                </>
              )}
            </div>

            <div className="recipe-footer">
              <span className="created-date">
                Created:{" "}
                {recipe.created_at
                  ? new Date(recipe.created_at).toLocaleDateString()
                  : "—"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
