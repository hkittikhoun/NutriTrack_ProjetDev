import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import NavLinks from "./NavLinks";
import { AuthContext } from "../../context/auth-context";

// Mock useNavigate et useLocation pour contrôler le contexte de route
const mockNavigate = vi.fn();
const mockLocation = { pathname: "/" };
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
  };
});

// Helper de rendu avec AuthContext et MemoryRouter
const renderWithAuth = (
  ui,
  authValue = { isLoggedIn: true, logout: vi.fn() },
  initialPath = "/"
) =>
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AuthContext.Provider value={authValue}>{ui}</AuthContext.Provider>
    </MemoryRouter>
  );

beforeEach(() => {
  vi.clearAllMocks();
  mockLocation.pathname = "/";
});

describe("NavLinks", () => {
  it("affiche les liens protégés quand connecté", () => {
    renderWithAuth(<NavLinks />);
    expect(
      screen.getByRole("link", { name: /catalogue/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /calculatrice/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /plans/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /recipes/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /logout/i })).toBeInTheDocument();
  });

  it("affiche login uniquement quand déconnecté", () => {
    renderWithAuth(<NavLinks />, { isLoggedIn: false, logout: vi.fn() });
    expect(screen.getByRole("link", { name: /login/i })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /logout/i })
    ).not.toBeInTheDocument();
  });

  it("appelle onOpenCart et onClose et affiche le libellé ouvert/fermé", async () => {
    const onOpenCart = vi.fn();
    const onClose = vi.fn();
    mockLocation.pathname = "/catalogue";

    renderWithAuth(
      <NavLinks onOpenCart={onOpenCart} onClose={onClose} cartIsOpen={false} />
    );

    const cartBtn = screen.getByRole("button", { name: /cart 🛒/i });
    await userEvent.click(cartBtn);
    expect(onOpenCart).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it("affiche 'CART ✕' quand cartIsOpen est vrai", () => {
    mockLocation.pathname = "/catalogue";
    renderWithAuth(<NavLinks cartIsOpen={true} />);
    expect(screen.getByRole("button", { name: /cart ✕/i })).toBeInTheDocument();
  });

  it("n'affiche pas le bouton cart hors des routes prévues", () => {
    mockLocation.pathname = "/other";
    renderWithAuth(<NavLinks cartIsOpen={false} />);
    expect(
      screen.queryByRole("button", { name: /cart/i })
    ).not.toBeInTheDocument();
  });

  it("ferme via onClose lors d'un clic de lien", async () => {
    const onClose = vi.fn();
    renderWithAuth(<NavLinks onClose={onClose} />);
    await userEvent.click(screen.getByRole("link", { name: /catalogue/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it("déconnecte et redirige vers / après logout", async () => {
    const logout = vi.fn();
    renderWithAuth(<NavLinks />, { isLoggedIn: true, logout });
    await userEvent.click(screen.getByRole("button", { name: /logout/i }));
    expect(logout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});
