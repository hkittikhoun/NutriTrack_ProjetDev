import { useState, useContext } from "react";
import { Link, NavLink } from "react-router-dom";
import "./MainNavigation.css";

import SideDrawer from "./SideDrawer";
import Backdrop from "./Backdrop";
import NavLinks from "./NavLinks";
import { AuthContext } from "../../context/auth-context";

const MainNavigation = ({ onOpenCart, cartIsOpen }) => {
  const [drawerIsOpen, setDrawerIsOpen] = useState(false);
  const auth = useContext(AuthContext);

  const openDrawer = () => {
    setDrawerIsOpen(true);
  };
  const closeDrawer = () => {
    setDrawerIsOpen(false);
  };

  return (
    <>
      {drawerIsOpen && <Backdrop onClick={closeDrawer} />}
      {drawerIsOpen && (
        <SideDrawer>
          <nav className="main-navigation__drawer-nav">
            <NavLinks
              onClose={closeDrawer}
              onOpenCart={onOpenCart}
              cartIsOpen={cartIsOpen}
            />
          </nav>
        </SideDrawer>
      )}
      <header className="main-header">
        <button
          className="main-navigation__menu-btn"
          onClick={openDrawer}
          aria-label="Open menu"
          title="Open menu"
          aria-expanded={drawerIsOpen}
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>
        <div className="main-header__zone main-header__zone--left">
          <h1 className="main-navigation__title">
            <Link to="/">NutriTrack</Link>
          </h1>
        </div>
        <div className="main-header__zone main-header__zone--center">
          {auth.isLoggedIn && (
            <>
              <NavLink
                to="/catalogue"
                className={({ isActive }) =>
                  "main-navigation__catalogue-btn" + (isActive ? " active" : "")
                }
                end
              >
                CATALOGUE
              </NavLink>
              <NavLink
                to="/calculatrice"
                className={({ isActive }) =>
                  "main-navigation__catalogue-btn" + (isActive ? " active" : "")
                }
                end
              >
                CALCULATRICE
              </NavLink>
              <NavLink
                to="/mealplan"
                className={({ isActive }) =>
                  "main-navigation__catalogue-btn" + (isActive ? " active" : "")
                }
                end
              >
                PLANS
              </NavLink>
              <NavLink
                to="/recipe"
                className={({ isActive }) =>
                  "main-navigation__catalogue-btn" + (isActive ? " active" : "")
                }
                end
              >
                RECIPES
              </NavLink>
            </>
          )}
        </div>
        <div className="main-header__zone main-header__zone--right">
          <nav className="main-navigation__header-nav">
            <NavLinks onOpenCart={onOpenCart} cartIsOpen={cartIsOpen} />
          </nav>
        </div>
      </header>
    </>
  );
};
export default MainNavigation;
