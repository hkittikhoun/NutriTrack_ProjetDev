import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import FoodCard from "./FoodCard";
import { AuthContext } from "../../context/auth-context";
import { CartContext } from "../../context/cart-context";

// Mock useNutrition pour capter setSelectedFood
const setSelectedFood = vi.fn();
vi.mock("../../context/nutrition.jsx", () => ({
  useNutrition: () => ({ setSelectedFood }),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

// Mock Supabase avec file de réponses thenable
const supabaseMocks = vi.hoisted(() => {
  const nextResponses = [];
  return { nextResponses };
});

vi.mock("../../supabaseClient", () => {
  const makeChain = () => {
    const chain = {
      insert: () => chain,
      select: () => chain,
      update: () => chain,
      eq: () => chain,
      single: () => chain,
      then: (resolve) => {
        const resp = supabaseMocks.nextResponses.length
          ? supabaseMocks.nextResponses.shift()
          : { data: null, error: null };
        return Promise.resolve(resolve(resp));
      },
    };
    return chain;
  };
  return {
    supabase: {
      from: () => makeChain(),
    },
  };
});

const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

// Helper de rendu avec providers Auth et Cart
const renderWithProviders = (
  ui,
  authValue = { isLoggedIn: true, userId: "u1" },
  refreshCart = vi.fn()
) => {
  return render(
    <MemoryRouter>
      <AuthContext.Provider value={authValue}>
        <CartContext.Provider value={{ refreshCart }}>
          {ui}
        </CartContext.Provider>
      </AuthContext.Provider>
    </MemoryRouter>
  );
};

const sampleFood = {
  FoodID: 10,
  FoodDescription: "Pomme",
  nutrients: [
    { NutrientSymbol: "Energy", NutrientUnit: "kcal", NutrientValue: 52 },
    { NutrientSymbol: "Protein", NutrientUnit: "g", NutrientValue: 0.3 },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();
  supabaseMocks.nextResponses.length = 0;
});

describe("FoodCard", () => {
  it("affiche les nutriments ou un fallback N/A", () => {
    renderWithProviders(<FoodCard food={sampleFood} />);
    expect(screen.getByText(/pomme/i)).toBeInTheDocument();
    expect(screen.getByText(/energy/i)).toBeInTheDocument();
    expect(screen.getByText(/52\s*kcal/i)).toBeInTheDocument();
    expect(screen.getByText(/protein/i)).toBeInTheDocument();

    renderWithProviders(
      <FoodCard food={{ FoodID: 11, FoodDescription: "Vide", nutrients: [] }} />
    );
    expect(screen.getByText(/n\/a/i)).toBeInTheDocument();
    expect(screen.getByText(/no data/i)).toBeInTheDocument();
  });

  it("déclenche le calculateur et setSelectedFood", async () => {
    renderWithProviders(<FoodCard food={sampleFood} />);
    await userEvent.click(
      screen.getByRole("button", { name: /use in calculator/i })
    );
    expect(setSelectedFood).toHaveBeenCalledWith(sampleFood);
    expect(mockNavigate).toHaveBeenCalledWith("/calculatrice?tab=nutrition");
  });

  it("ajoute au panier en succès et rafraîchit", async () => {
    const refreshCart = vi.fn();
    // insert success
    supabaseMocks.nextResponses.push({ data: null, error: null });

    renderWithProviders(
      <FoodCard food={sampleFood} />,
      { isLoggedIn: true, userId: "u1" },
      refreshCart
    );
    await userEvent.click(screen.getByRole("button", { name: /add to cart/i }));

    expect(alertSpy).toHaveBeenCalledWith("Ajouté au panier.");
    expect(refreshCart).toHaveBeenCalled();
  });

  it("redirige vers login si non connecté", async () => {
    renderWithProviders(<FoodCard food={sampleFood} />, {
      isLoggedIn: false,
      userId: null,
    });
    await userEvent.click(screen.getByRole("button", { name: /add to cart/i }));
    expect(alertSpy).toHaveBeenCalledWith(
      "Veuillez vous connecter pour ajouter au panier."
    );
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("gère le doublon en incrémentant la quantité", async () => {
    const refreshCart = vi.fn();
    // insert retourne une erreur code 23505
    supabaseMocks.nextResponses.push({ data: null, error: { code: "23505" } });
    // select single existant
    supabaseMocks.nextResponses.push({
      data: { id: 1, quantity: 2 },
      error: null,
    });
    // update success
    supabaseMocks.nextResponses.push({ data: null, error: null });

    renderWithProviders(
      <FoodCard food={sampleFood} />,
      { isLoggedIn: true, userId: "u1" },
      refreshCart
    );
    await userEvent.click(screen.getByRole("button", { name: /add to cart/i }));

    expect(alertSpy).toHaveBeenCalledWith("Quantité augmentée dans le panier.");
    expect(refreshCart).toHaveBeenCalled();
  });

  it("affiche une erreur générique si insert échoue", async () => {
    supabaseMocks.nextResponses.push({
      data: null,
      error: { message: "Boom" },
    });

    renderWithProviders(<FoodCard food={sampleFood} />);
    await userEvent.click(screen.getByRole("button", { name: /add to cart/i }));

    expect(alertSpy).toHaveBeenCalledWith(
      "Impossible d'ajouter au panier: Boom"
    );
  });
});
