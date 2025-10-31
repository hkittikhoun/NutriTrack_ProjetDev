import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/auth-context";
import SavedPlanDetails from "../components/mealPlan/SavedPlanDetails";

export default function SavedPlanDetailsContainer() {
  const auth = useContext(AuthContext);

  if (!auth.isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <SavedPlanDetails />;
}