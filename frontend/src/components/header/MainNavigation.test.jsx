import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import MainNavigation from "./MainNavigation";
import { AuthContext } from "../../context/auth-context";

// Mocks simples pour isoler le composant
const navLinksState = vi.hoisted(() => ({ lastProps: null }));
vi.mock("./NavLinks", () => ({
  __esModule: true,
  default: (props) => {
    navLinksState.lastProps = props;
    return (
      <div
        data-testid="nav-links"
        data-cart-open={String(props.cartIsOpen)}
        onClick={props.onClose}
      >
        NavLinks
      </div>
    );
  },
}));

vi.mock("./SideDrawer", () => ({
  __esModule: true,
  default: ({ children }) => <div data-testid="side-drawer">{children}</div>,
}));

vi.mock("./Backdrop", () => ({
  __esModule: true,
  default: ({ onClick }) => (
    <div data-testid="backdrop" onClick={onClick}>
      Backdrop
    </div>
  ),
}));

// Helper de rendu avec contexte Auth et Router
const renderWithAuth = (ui, authValue = { isLoggedIn: true }) =>
  render(
    <MemoryRouter>
      <AuthContext.Provider value={authValue}>{ui}</AuthContext.Provider>
    </MemoryRouter>
  );

beforeEach(() => {
  navLinksState.lastProps = null;
});

describe("MainNavigation", () => {
  it("affiche les liens centraux quand l'utilisateur est connecté", () => {
    renderWithAuth(<MainNavigation />);
    expect(screen.getByRole("heading", { name: /nutritrack/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /catalogue/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /calculatrice/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /plans/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /recipes/i })).toBeInTheDocument();
  });

  it("n'affiche pas les liens centraux quand l'utilisateur est déconnecté", () => {
    renderWithAuth(<MainNavigation />, { isLoggedIn: false });
    expect(screen.queryByRole("link", { name: /catalogue/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /calculatrice/i })).not.toBeInTheDocument();
  });

  it("ouvre et ferme le drawer avec le menu et le backdrop", async () => {
    renderWithAuth(<MainNavigation />);
    const menuBtn = screen.getByRole("button", { name: /open menu/i });
    await userEvent.click(menuBtn);

    expect(screen.getByTestId("side-drawer")).toBeInTheDocument();
    expect(screen.getByTestId("backdrop")).toBeInTheDocument();

    await userEvent.click(screen.getByTestId("backdrop"));
    await waitFor(() => {
      expect(screen.queryByTestId("side-drawer")).not.toBeInTheDocument();
    });
  });

  it("passe les props onOpenCart et cartIsOpen à NavLinks (drawer)", async () => {
    const onOpenCart = vi.fn();
    renderWithAuth(<MainNavigation onOpenCart={onOpenCart} cartIsOpen={true} />);
    await userEvent.click(screen.getByRole("button", { name: /open menu/i }));

    expect(navLinksState.lastProps?.onOpenCart).toBe(onOpenCart);
    expect(navLinksState.lastProps?.cartIsOpen).toBe(true);
  });
});
