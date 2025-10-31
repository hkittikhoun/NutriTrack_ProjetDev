import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/auth-context";
import Calculatrices from "../components/calculators/Calculators.jsx";

export default function CalculatricesContainer() {
  const auth = useContext(AuthContext);

  if (!auth.isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <Calculatrices />;
}
