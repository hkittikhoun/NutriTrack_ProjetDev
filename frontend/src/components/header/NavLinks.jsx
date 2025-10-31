import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/auth-context";
import "./NavLinks.css";

const NavLinks = ({ onClose, onOpenCart, cartIsOpen }) => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    auth.logout();
    navigate("/");
    if (onClose) onClose();
  };

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  const handleCartClick = () => {
    if (onOpenCart) onOpenCart();
    if (onClose) onClose();
  };

  const showCartOnRoutes = ["/catalogue", "/mealplan", "/recipe"];
  const shouldShowCart = showCartOnRoutes.some(
    (route) =>
      location.pathname === route || location.pathname.startsWith(route + "/")
  );

  return (
    <ul className="nav-links">
      {auth.isLoggedIn && (
        <li className="catalogue-link">
          <NavLink to="/catalogue" onClick={handleLinkClick}>
            CATALOGUE
          </NavLink>
        </li>
      )}

      {auth.isLoggedIn && (
        <li className="calculatrice-link">
          <NavLink to="/calculatrice" onClick={handleLinkClick}>
            CALCULATRICE
          </NavLink>
        </li>
      )}

      {auth.isLoggedIn && (
        <li className="saved-plans-link">
          <NavLink to="/mealplan" onClick={handleLinkClick}>
            PLANS
          </NavLink>
        </li>
      )}

      {auth.isLoggedIn && (
        <li className="recipe-link">
          <NavLink to="/recipe" onClick={handleLinkClick}>
            RECIPES
          </NavLink>
        </li>
      )}

      {!auth.isLoggedIn && (
        <li className="login-link">
          <NavLink to="/login" onClick={handleLinkClick}>
            LOGIN
          </NavLink>
        </li>
      )}

      {auth.isLoggedIn && shouldShowCart && (
        <li className="cart-link">
          <button onClick={handleCartClick}>
            {cartIsOpen ? "CART ✕" : "CART 🛒"}
          </button>
        </li>
      )}

      {auth.isLoggedIn && (
        <li className="logout-link">
          <button onClick={handleLogout}>LOGOUT</button>
        </li>
      )}
    </ul>
  );
};

export default NavLinks;
