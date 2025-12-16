import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import SavedRecipe from "./SavedRecipe";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockAuth = { userId: "user-123" };

// Mock useContext to return mockAuth
vi.mock("react", async () => {
  const actual = await vi.importActual("react");
  return {
    ...actual,
    useContext: () => mockAuth,
  };
});

const mockFrom = vi.fn();
const mockSelect = vi.fn();
const mockOrder = vi.fn();
const mockEq = vi.fn();
const mockDelete = vi.fn();

vi.mock("../../supabaseClient", () => ({
  supabase: {
    from: (table) => mockFrom(table),
  },
}));

vi.mock("../shared/recipe/utils", () => ({
  getDifficultyColor: (level) => (level === "easy" ? "#4caf50" : "#666"),
  getDifficultyLabel: (level) => (level === "easy" ? "Easy" : "Unknown"),
}));

function renderSavedRecipe() {
  return render(
    <BrowserRouter>
      <SavedRecipe />
    </BrowserRouter>
  );
}

describe("SavedRecipe", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    mockAuth.userId = "user-123";

    // Setup default supabase chain mocks
    mockFrom.mockReturnValue({
      select: mockSelect,
      delete: mockDelete,
    });
    mockSelect.mockReturnValue({
      order: mockOrder,
    });

    // mockOrder needs to return a fresh promise-like object each time
    // that can be both awaited directly AND has eq method
    mockOrder.mockImplementation(() => {
      const orderResult = Promise.resolve({ data: [], error: null });
      orderResult.eq = mockEq;
      return orderResult;
    });

    mockEq.mockResolvedValue({ data: [], error: null });
    mockDelete.mockReturnValue({
      eq: mockEq,
    });
  });

  it("rend le titre et les filtres", async () => {
    mockOrder.mockResolvedValueOnce({ data: [], error: null });
    renderSavedRecipe();
    expect(screen.getByText(/Recipe Collection/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /All Recipes/i })
      ).toBeInTheDocument();
    });
  });

  it("affiche le message de chargement", () => {
    mockOrder.mockImplementationOnce(() => new Promise(() => {})); // Never resolves
    renderSavedRecipe();
    expect(screen.getByText(/Loading recipes.../i)).toBeInTheDocument();
  });

  it("affiche les recettes chargées", async () => {
    const mockRecipes = [
      {
        id: 1,
        title: "Pasta Carbonara",
        author: "Chef Mario",
        description: "Classic Italian dish",
        servings: 4,
        difficulty_level: "easy",
        category: "Main Course",
        cooking_time: 30,
        prep_time: 15,
        created_at: "2025-01-01T00:00:00",
        user_id: "user-123",
      },
    ];
    mockOrder.mockResolvedValueOnce({ data: mockRecipes, error: null });

    renderSavedRecipe();

    await waitFor(() => {
      expect(screen.getByText("Pasta Carbonara")).toBeInTheDocument();
    });
    expect(screen.getByText("Chef Mario")).toBeInTheDocument();
    expect(screen.getByText(/Classic Italian dish/i)).toBeInTheDocument();
  });

  it("affiche le badge 'Your Recipe' pour les recettes de l'utilisateur", async () => {
    const mockRecipes = [
      {
        id: 1,
        title: "My Recipe",
        author: "Me",
        user_id: "user-123",
        created_at: "2025-01-01",
      },
    ];
    mockOrder.mockResolvedValueOnce({ data: mockRecipes, error: null });

    renderSavedRecipe();

    await waitFor(() => {
      expect(screen.getByText("Your Recipe")).toBeInTheDocument();
    });
  });

  it("affiche les boutons Edit et Delete pour les recettes de l'utilisateur", async () => {
    const mockRecipes = [
      {
        id: 1,
        title: "My Recipe",
        author: "Me",
        user_id: "user-123",
        created_at: "2025-01-01",
      },
    ];
    mockOrder.mockResolvedValueOnce({ data: mockRecipes, error: null });

    renderSavedRecipe();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Edit/i })).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Delete/i })
      ).toBeInTheDocument();
    });
  });

  it("n'affiche pas Edit/Delete pour les recettes d'autres utilisateurs", async () => {
    const mockRecipes = [
      {
        id: 1,
        title: "Someone Recipe",
        author: "Other",
        user_id: "other-user",
        created_at: "2025-01-01",
      },
    ];
    mockOrder.mockResolvedValueOnce({ data: mockRecipes, error: null });

    renderSavedRecipe();

    await waitFor(() => {
      expect(screen.getByText("Someone Recipe")).toBeInTheDocument();
    });
    expect(
      screen.queryByRole("button", { name: /Edit/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Delete/i })
    ).not.toBeInTheDocument();
  });

  it("navigue vers la page de détails quand View Recipe est cliqué", async () => {
    const mockRecipes = [
      {
        id: 1,
        title: "Test Recipe",
        author: "Chef",
        user_id: "other",
        created_at: "2025-01-01",
      },
    ];
    mockOrder.mockResolvedValueOnce({ data: mockRecipes, error: null });

    renderSavedRecipe();

    await waitFor(() => {
      expect(screen.getByText("Test Recipe")).toBeInTheDocument();
    });

    const viewButton = screen.getByRole("button", { name: /View Recipe/i });
    await userEvent.click(viewButton);

    expect(mockNavigate).toHaveBeenCalledWith("/recipe/1");
  });

  it("bascule vers 'My Recipes' quand le filtre est cliqué", async () => {
    renderSavedRecipe();

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /My Recipes/i })
      ).toBeInTheDocument();
    });

    const myRecipesButton = screen.getByRole("button", { name: /My Recipes/i });
    await userEvent.click(myRecipesButton);

    // Verify the button becomes active
    await waitFor(() => {
      expect(myRecipesButton).toHaveClass("active");
    });
  });

  it("affiche un message quand aucune recette n'est disponible", async () => {
    mockOrder.mockResolvedValueOnce({ data: [], error: null });

    renderSavedRecipe();

    await waitFor(() => {
      expect(
        screen.getByText(/No recipes available at the moment/i)
      ).toBeInTheDocument();
    });
  });

  it("affiche une erreur si le chargement échoue", async () => {
    mockOrder.mockResolvedValueOnce({
      data: null,
      error: { message: "Network error" },
    });

    renderSavedRecipe();

    await waitFor(() => {
      expect(screen.getByText(/Network error/i)).toBeInTheDocument();
    });
  });
});
