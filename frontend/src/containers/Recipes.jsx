import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/auth-context";
import Recipe from "../components/recipe/Recipe";

export default function RecipeContainer() {
  const auth = useContext(AuthContext);

  if (!auth.isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <Recipe />;
}
