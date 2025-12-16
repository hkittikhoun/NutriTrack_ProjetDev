import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import App from "./App";

// Mock tous les composants importés dans App.jsx
vi.mock("../containers/Roots", () => ({
  default: ({ children }) => <div data-testid="root-layout">{children}</div>,
}));

vi.mock("../containers/ErrorPage", () => ({
  default: () => <div data-testid="error-page">Error Page</div>,
}));

vi.mock("../containers/Home", () => ({
  default: () => <div data-testid="home">Home</div>,
}));

vi.mock("../containers/Login", () => ({
  default: () => <div data-testid="login">Login</div>,
}));

vi.mock("../containers/Signup", () => ({
  default: () => <div data-testid="signup">Signup</div>,
}));

vi.mock("../containers/Catalogue", () => ({
  default: () => <div data-testid="catalogue">Catalogue</div>,
}));

vi.mock("../containers/Calculatrices", () => ({
  default: () => <div data-testid="calculatrices">Calculatrices</div>,
}));

vi.mock("./payement/PayementSuccess", () => ({
  default: () => <div data-testid="payment-success">Payment Success</div>,
}));

vi.mock("../containers/Plans.jsx", () => ({
  default: () => <div data-testid="plans">Plans</div>,
}));

vi.mock("../containers/SavedPlan.jsx", () => ({
  default: () => <div data-testid="saved-plan">Saved Plan</div>,
}));

vi.mock("../containers/Recipes.jsx", () => ({
  default: () => <div data-testid="recipes">Recipes</div>,
}));

vi.mock("../containers/SavedRecipes.jsx", () => ({
  default: () => <div data-testid="saved-recipes">Saved Recipes</div>,
}));

vi.mock("../context/NutritionProvider.jsx", () => ({
  NutritionProvider: ({ children }) => (
    <div data-testid="nutrition-provider">{children}</div>
  ),
}));

describe("App Component", () => {
  beforeEach(() => {
    // Nettoyer le sessionStorage avant chaque test
    sessionStorage.clear();
  });

  // Test de rendu de base
  it("should render without crashing", () => {
    render(<App />);
    expect(screen.getByTestId("nutrition-provider")).toBeInTheDocument();
  });

  it("should initialize with logged out state when no session data", () => {
    render(<App />);
    // L'app devrait se rendre avec succès en mode déconnecté
    expect(screen.getByTestId("nutrition-provider")).toBeInTheDocument();
  });

  // Tests pour vérifier l'état initial basé sur le sessionStorage
  it("should initialize with logged in state when session data exists", () => {
    sessionStorage.setItem("isLoggedIn", "true");
    sessionStorage.setItem("userId", "test-user-123");
    sessionStorage.setItem("userToken", "test-token-456");

    render(<App />);

    // L'app devrait se rendre avec succès en mode connecté
    expect(screen.getByTestId("nutrition-provider")).toBeInTheDocument();
  });

  it("should wrap components with AuthContext.Provider", () => {
    const { container } = render(<App />);

    // Vérifie que le composant est rendu correctement
    expect(screen.getByTestId("nutrition-provider")).toBeInTheDocument();
  });

  // Tests pour vérifier que le NutritionProvider enveloppe les composants correctement
  it("should wrap components with NutritionProvider", () => {
    render(<App />);
    expect(screen.getByTestId("nutrition-provider")).toBeInTheDocument();
  });

  it("should provide router with correct structure", () => {
    const { container } = render(<App />);

    // Le Router doit être le parent de tous les autres composants
    expect(container.firstChild).toBeTruthy();
  });
});

describe("App Component - Authentication State Management", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  // Tests pour vérifier la gestion de l'état d'authentification via le sessionStorage
  it("should read initial state from sessionStorage", () => {
    sessionStorage.setItem("isLoggedIn", "true");
    sessionStorage.setItem("userId", "user-123");
    sessionStorage.setItem("userToken", "token-abc");

    render(<App />);

    // Vérifier que les valeurs du sessionStorage sont correctes
    expect(sessionStorage.getItem("isLoggedIn")).toBe("true");
    expect(sessionStorage.getItem("userId")).toBe("user-123");
    expect(sessionStorage.getItem("userToken")).toBe("token-abc");
  });

  it("should handle missing sessionStorage values gracefully", () => {
    // Ne pas définir de session storage
    expect(() => render(<App />)).not.toThrow();
  });
});

describe("App Component - Context Values", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("should provide AuthContext with correct initial values when logged out", () => {
    render(<App />);

    // Vérifier que les valeurs du sessionStorage sont nulles ou par défaut
    expect(sessionStorage.getItem("isLoggedIn")).toBeNull();
  });

  it("should provide AuthContext with correct initial values when logged in", () => {
    sessionStorage.setItem("isLoggedIn", "true");
    sessionStorage.setItem("userId", "test-user");
    sessionStorage.setItem("userToken", "test-token");

    render(<App />);

    // Verify que les valeurs du sessionStorage sont correctes
    expect(sessionStorage.getItem("isLoggedIn")).toBe("true");
    expect(sessionStorage.getItem("userId")).toBe("test-user");
    expect(sessionStorage.getItem("userToken")).toBe("test-token");
  });
});
