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
  const [viewMode, setViewMode] = useState("all");

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

        // Filtrer par utilisateur seulement si "mine" est sélectionné
        if (viewMode === "mine" && auth?.userId) {
          query = query.eq("user_id", auth.userId);
        }

        const { data, error } = await query;
        if (error) {
          setError(error.message || "Failed to load recipes");
          return;
        }
        setRecipes(data || []);
      } catch (e) {
        console.error(e);
        setError("Unexpected error");
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [auth?.userId, viewMode]);

  const isOwner = (recipe) => {
    return auth?.userId && recipe.user_id === auth.userId;
  };

  const handleDelete = async (recipe) => {
    if (!isOwner(recipe)) {
      setNotice("You can only delete your own recipes.");
      setTimeout(() => setNotice(null), 3000);
      return;
    }

    const ok = window.confirm(`Delete recipe "${recipe.title}"?`);
    if (!ok) return;

    try {
      setLoading(true);

      const { error: instructionsErr } = await supabase
        .from("recipe_instructions")
        .delete()
        .eq("recipe_id", recipe.id);

      if (instructionsErr) {
        setError("Failed to delete instructions: " + instructionsErr.message);
        return;
      }

      const { error: ingredientsErr } = await supabase
        .from("recipe_ingredients")
        .delete()
        .eq("recipe_id", recipe.id);

      if (ingredientsErr) {
        setError("Failed to delete ingredients: " + ingredientsErr.message);
        return;
      }

      const { error: recipeErr } = await supabase
        .from("recipes")
        .delete()
        .eq("id", recipe.id)
        .eq("user_id", auth.userId);

      if (recipeErr) {
        setError("Failed to delete recipe: " + recipeErr.message);
        return;
      }

      setRecipes((prev) => prev.filter((r) => r.id !== recipe.id));
      setNotice("Recipe deleted successfully.");
      setTimeout(() => setNotice(null), 3000);
    } catch (e) {
      console.error(e);
      setError("Error while deleting");
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
                  🍽️ {recipe.servings ? `${recipe.servings} servings` : "—"}
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
