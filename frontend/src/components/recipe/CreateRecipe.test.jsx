import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import CreateRecipe from "./CreateRecipe";

// Minimal deterministic mocks
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockAuth = { userId: "user-123", login: vi.fn(), logout: vi.fn() };
vi.mock("../../context/auth-context", () => ({
  AuthContext: {
    Provider: ({ children }) => children,
    Consumer: ({ children }) => children(mockAuth),
  },
}));

// Supabase mock
const mockGetUser = vi.fn();
const mockFrom = vi.fn();
const mockInsert = vi.fn();
const mockSelect = vi.fn();
const mockSingle = vi.fn();
vi.mock("../../supabaseClient", () => ({
  supabase: {
    auth: { getUser: (...args) => mockGetUser(...args) },
    from: (table) => mockFrom(table),
  },
}));

// Hooks mocks for cart and prefill author (minimal behavior)
vi.mock("../shared/hooks/useCartFoods", () => ({
  useCartFoods: () => ({
    cartFoods: [{ id: 1, name: "Apple" }],
    loadingCart: false,
    cartError: null,
  }),
}));
vi.mock("../shared/hooks/usePrefillAuthors", () => ({
  usePrefillAuthor: () => {},
}));
vi.mock("../shared/hooks/useCartPrefill", () => ({
  prefillFromCartToIngredients: (cartFoods) =>
    cartFoods?.length
      ? [
          {
            id: 1,
            foodId: "1",
            ingredientName: "Apple",
            quantity: "100",
            unit: "g",
            preparation: "",
          },
        ]
      : null,
}));

// Utils used by component
vi.mock("../shared/recipe/utils", () => ({
  validateRecipe: ({ title, author, ingredients, instructions }) => {
    const errs = [];
    if (!String(title || "").trim()) errs.push("Le titre est requis");
    if (!String(author || "").trim()) errs.push("L'auteur est requis");
    if (
      ingredients.some(
        (ing) => !String(ing.ingredientName || ing.ingredient_name || "").trim()
      )
    ) {
      errs.push("Tous les ingrédients doivent avoir un nom");
    }
    if (
      instructions.some(
        (inst) => !String(inst || inst?.instruction || "").trim()
      )
    ) {
      errs.push("Toutes les instructions doivent être remplies");
    }
    return errs;
  },
  buildIngredientsData: (ingredients, recipeId) =>
    ingredients.map((ing) => ({
      recipe_id: recipeId,
      ingredient_name: ing.ingredientName,
      quantity: ing.quantity,
      unit: ing.unit,
    })),
  buildInstructionsData: (instructions, recipeId) =>
    instructions.map((text, idx) => ({
      recipe_id: recipeId,
      step_number: idx + 1,
      instruction: text,
    })),
}));

// Mock RecipeForm to simplify testing - it calls onSave with current state
vi.mock("./RecipeForm", () => ({
  RecipeForm: ({ onSave, loading }) => (
    <div className="edit-recipe-form">
      <button
        className="save-btn"
        onClick={(e) => {
          // Call onSave with the current state passed as props
          onSave(e);
        }}
        disabled={loading}
      >
        Save
      </button>
    </div>
  ),
}));

function renderCreate() {
  return render(
    <BrowserRouter>
      <CreateRecipe />
    </BrowserRouter>
  );
}

describe("CreateRecipe", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    // Configure supabase chain mocks per test
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
      error: null,
    });
    mockFrom.mockImplementation((table) => ({
      insert: (data) => mockInsert(table, data),
    }));
    mockInsert.mockImplementation((table, data) => ({
      select: () => mockSelect(table, data),
    }));
    mockSelect.mockImplementation((table, data) => ({
      single: () => mockSingle(table, data),
    }));
    mockSingle.mockResolvedValue({ data: { id: 42 }, error: null });
  });

  it("rend le titre et la section panier quand des items existent", () => {
    renderCreate();
    expect(screen.getByText(/Create New Recipe/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Available ingredients from your cart \(1\)/i)
    ).toBeInTheDocument();
  });

  it("affiche une erreur de validation si le titre est manquant", async () => {
    renderCreate();
    // Component starts with empty title/author and one empty ingredient
    const saveButton = screen.getByRole("button", { name: /save/i });
    await userEvent.click(saveButton);
    // Should show validation error for missing title
    await waitFor(() => {
      expect(screen.getByText(/Le titre est requis/i)).toBeInTheDocument();
    });
  });

  it("prefill from cart ajoute des ingrédients", async () => {
    renderCreate();

    // Use prefill button to get valid ingredients from cart
    const prefillButton = screen.getByRole("button", { name: /prefill/i });
    await userEvent.click(prefillButton);

    // Wait for prefill notice
    await waitFor(() => {
      expect(
        screen.getByText(/Pré-rempli avec 1 ingrédients du panier/i)
      ).toBeInTheDocument();
    });
  });

  it("affiche le bouton prefill quand le panier a des items", () => {
    renderCreate();
    // Cart has 1 item from mock
    expect(
      screen.getByText(/Available ingredients from your cart \(1\)/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /prefill/i })
    ).toBeInTheDocument();
  });
});
