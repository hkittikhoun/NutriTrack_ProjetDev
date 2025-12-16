import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/auth-context";
import SavedRecipeDetails from "../components/recipe/SavedRecipeDetails";

export default function SavedRecipesContainer() {
  const auth = useContext(AuthContext);

  if (!auth.isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <SavedRecipeDetails />;
}
