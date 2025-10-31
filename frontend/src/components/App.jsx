import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useCallback, useState } from "react";
import { AuthContext } from "../context/auth-context";
import { NutritionProvider } from "../context/NutritionProvider.jsx";

import RootLayout from "../containers/Roots";
import ErrorPage from "../containers/ErrorPage";
import Home from "../containers/Home";
import Login from "../containers/Login";
import Signup from "../containers/Signup";
import CatalogueContainer from "../containers/Catalogue";
import CalculatricesContainer from "../containers/Calculatrices";
import PaymentSuccess from "./payement/PayementSuccess";
import PlansContainer from "../containers/Plans.jsx";
import SavedPlanDetailsContainer from "../containers/SavedPlan.jsx";
import RecipeContainer from "../containers/Recipes.jsx";
import SavedRecipesContainer from "../containers/SavedRecipes.jsx";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(
    sessionStorage.getItem("isLoggedIn") === "true"
  );
  const [userId, setUserId] = useState(sessionStorage.getItem("userId"));
  const [userToken, setUserToken] = useState(
    sessionStorage.getItem("userToken")
  );

  const login = useCallback((id, token) => {
    setIsLoggedIn(true);
    setUserId(id);
    setUserToken(token);
    sessionStorage.setItem("isLoggedIn", "true");
    sessionStorage.setItem("userId", id);
    sessionStorage.setItem("userToken", token);
  }, []);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setUserId(null);
    setUserToken(null);
    sessionStorage.removeItem("isLoggedIn");
    sessionStorage.removeItem("userId");
    sessionStorage.removeItem("userToken");
  }, []);

  const router = createBrowserRouter([
    {
      path: "/",
      element: <RootLayout />,
      errorElement: <ErrorPage />,
      children: [
        { path: "/", element: <Home /> },
        { path: "/login", element: <Login /> },
        { path: "/signup", element: <Signup /> },
        { path: "/catalogue", element: <CatalogueContainer /> },
        { path: "/calculatrice", element: <CalculatricesContainer /> },
        { path: "/mealplan", element: <PlansContainer /> },
        { path: "/mealplan/:id", element: <SavedPlanDetailsContainer /> },
        { path: "/recipe", element: <RecipeContainer /> },
        { path: "/recipe/:id", element: <SavedRecipesContainer /> },
        { path: "/payment-success", element: <PaymentSuccess /> },
      ],
    },
  ]);

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, userId, userToken, login, logout }}
    >
      <NutritionProvider>
        <RouterProvider router={router} />
      </NutritionProvider>
    </AuthContext.Provider>
  );
};

export default App;
