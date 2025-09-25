import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useCallback, useState } from "react";
import { AuthContext } from "../context/auth-context";

import RootLayout from "../containers/Roots";
import ErrorPage from "../containers/ErrorPage";
import Home from "../containers/Home";
import Login from "../containers/Login";
import Signup from "../containers/Signup";
import CatalogueContainer from "../containers/Catalogue";

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
      element: <RootLayout></RootLayout>,
      errorElement: <ErrorPage></ErrorPage>,
      children: [
        { path: "/", element: <Home></Home> },
        { path: "/login", element: <Login></Login> },
        { path: "/signup", element: <Signup></Signup> },
      ],
    },
  ]);

  const routerLoggedIn = createBrowserRouter([
    {
      path: "/",
      element: <RootLayout></RootLayout>,
      errorElement: <ErrorPage></ErrorPage>,
      children: [
        { path: "/", element: <Home></Home> },
        { path: "/login", element: <Login></Login> },
        { path: "/signup", element: <Signup></Signup> },
        {
          path: "/catalogue",
          element: <CatalogueContainer></CatalogueContainer>,
        },
      ],
    },
  ]);

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, userId, userToken, login, logout }}
    >
      <RouterProvider router={isLoggedIn ? routerLoggedIn : router} />
    </AuthContext.Provider>
  );
};

export default App;
