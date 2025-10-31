import { useContext, useState } from "react";
import { useLocation } from "react-router-dom";
import MainNavigation from "../components/header/MainNavigation";
import { Outlet } from "react-router-dom";
import Cart from "../components/cart/Cart";
import { AuthContext } from "../context/auth-context";
import { CartContext } from "../context/cart-context";

export default function RootLayout() {
  const auth = useContext(AuthContext);
  const location = useLocation();
  const [cartIsOpen, setCartIsOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const showCartOnRoutes = ["/catalogue", "/mealplan", "/recipe"];

  const shouldShowCart =
    auth.isLoggedIn &&
    showCartOnRoutes.some(
      (route) =>
        location.pathname === route || location.pathname.startsWith(route + "/")
    );

  const refreshCart = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const toggleCart = () => {
    setCartIsOpen((prev) => !prev);
  };

  return (
    <CartContext.Provider value={{ refreshCart }}>
      <MainNavigation onOpenCart={toggleCart} cartIsOpen={cartIsOpen} />
      {shouldShowCart && (
        <Cart
          isOpen={cartIsOpen}
          onClose={() => setCartIsOpen(false)}
          refreshTrigger={refreshTrigger}
        />
      )}
      <main>
        <Outlet />
      </main>
    </CartContext.Provider>
  );
}
