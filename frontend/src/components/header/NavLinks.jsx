import { NavLink, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/auth-context";
import "./NavLinks.css";

const NavLinks = ({ onClose }) => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    auth.logout();
    navigate("/");
    if (onClose) onClose();
  };

  const handleLinkClick = () => {
    if (onClose) onClose();
  };
  return (
    <ul className="nav-links">
      {!auth.isLoggedIn && <li style={{ display: "none" }}></li>}
      {auth.isLoggedIn && (
        <li>
          <NavLink to="/catalogue" onClick={handleLinkClick}>
            CATALOGUE
          </NavLink>
        </li>
      )}

      {!auth.isLoggedIn && (
        <li>
          <NavLink to="/login" onClick={handleLinkClick}>
            LOGIN
          </NavLink>
        </li>
      )}

      {auth.isLoggedIn && (
        <li>
          <button onClick={handleLogout}>LOGOUT</button>
        </li>
      )}
    </ul>
  );
};

export default NavLinks;
