import { useState, useContext } from "react";
import { Link, NavLink } from "react-router-dom";
import "./MainNavigation.css";

import SideDrawer from "./SideDrawer";
import Backdrop from "./Backdrop";
import NavLinks from "./NavLinks";
import { AuthContext } from "../../context/auth-context";

const MainNavigation = () => {
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
            <NavLinks onClose={closeDrawer} />
          </nav>
        </SideDrawer>
      )}
      <header className="main-header">
        <button className="main-navigation__menu-btn" onClick={openDrawer}>
          <span />
          <span />
          <span />
        </button>
        <div className="main-header__zone main-header__zone--left">
          <h1 className="main-navigation__title">
            <Link to="/">NutriTrack</Link>
          </h1>
        </div>
        <div className="main-header__zone main-header__zone--center">
          {auth.isLoggedIn && (
            <NavLink
              to="/catalogue"
              className={({ isActive }) =>
                "main-navigation__catalogue-btn" + (isActive ? " active" : "")
              }
              end
            >
              CATALOGUE
            </NavLink>
          )}
        </div>
        <div className="main-header__zone main-header__zone--right">
          <nav className="main-navigation__header-nav">
            <NavLinks />
          </nav>
        </div>
      </header>
    </>
  );
};
export default MainNavigation;
