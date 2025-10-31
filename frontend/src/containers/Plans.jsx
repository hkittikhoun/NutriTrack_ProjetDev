import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/auth-context";
import MealPlans from "../components/mealPlan/MealPlans";

export default function PlansContainer() {
  const auth = useContext(AuthContext);

  if (!auth.isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <MealPlans />;
}
