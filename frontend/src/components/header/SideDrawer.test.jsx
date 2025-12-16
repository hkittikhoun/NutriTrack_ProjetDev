import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";
import SideDrawer from "./SideDrawer";

// Prépare un conteneur de portail pour le tiroir
let drawerRoot;

beforeEach(() => {
  drawerRoot = document.createElement("div");
  drawerRoot.setAttribute("id", "drawer");
  document.body.appendChild(drawerRoot);
});

afterEach(() => {
  drawerRoot.remove();
  drawerRoot = null;
});

describe("SideDrawer", () => {
  it("rend le contenu dans le portail cible", () => {
    render(
      <SideDrawer>
        <div data-testid="drawer-child">Contenu</div>
      </SideDrawer>
    );
    const child = drawerRoot.querySelector("[data-testid='drawer-child']");
    expect(child).toBeInTheDocument();
  });

  it("propage onClick quand on clique sur le conteneur", () => {
    const onClick = vi.fn();
    render(
      <SideDrawer onClick={onClick}>
        <div>Inside</div>
      </SideDrawer>
    );
    drawerRoot.querySelector(".side-drawer").click();
    expect(onClick).toHaveBeenCalled();
  });
});
