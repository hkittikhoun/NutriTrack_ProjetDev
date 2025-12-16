import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import SavedRecipeDetails from "./SavedRecipeDetails";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockAuth = { userId: "user-123" };
vi.mock("react", async () => {
  const actual = await vi.importActual("react");
  return {
    ...actual,
    useContext: () => mockAuth,
  };
});

const mockFrom = vi.fn();
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();
const mockOrder = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
const mockInsert = vi.fn();
const mockGetUser = vi.fn();

vi.mock("../../supabaseClient", () => ({
  supabase: {
    from: (table) => mockFrom(table),
    auth: { getUser: () => mockGetUser() },
  },
}));

vi.mock("./RecipeForm", () => ({
  RecipeForm: ({ onCancel, onSave }) => (
    <div data-testid="recipe-form">
      Recipe Form
      <button onClick={onCancel}>Cancel</button>
      <button onClick={() => onSave({})}>Save</button>
    </div>
  ),
}));

vi.mock("../shared/recipe/utils", () => ({
  validateRecipe: () => [],
  getDifficultyColor: (level) => "#4caf50",
  getDifficultyLabel: (level) => "Easy",
  buildIngredientsData: (ingredients) => ingredients,
  buildInstructionsData: (instructions) => instructions,
}));

vi.mock("../shared/hooks/useRecipeForm", () => ({
  mapDbIngredientsToEdit: (data) => data || [],
  mapDbInstructionsToEdit: (data) => data || [],
}));

function renderRecipeDetails(recipeId = "1") {
  return render(
    <MemoryRouter initialEntries={[`/recipe/${recipeId}`]}>
      <Routes>
        <Route path="/recipe/:id" element={<SavedRecipeDetails />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("SavedRecipeDetails", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.userId = "user-123";

    mockFrom.mockReturnValue({
      select: mockSelect,
      update: mockUpdate,
      delete: mockDelete,
      insert: mockInsert,
    });
    mockSelect.mockReturnValue({
      eq: mockEq,
      order: mockOrder,
    });
    mockEq.mockReturnValue({
      single: mockSingle,
      order: mockOrder,
      eq: mockEq,
    });
    mockSingle.mockResolvedValue({
      data: null,
      error: { message: "Not found" },
    });
    mockOrder.mockResolvedValue({ data: [], error: null });
    mockUpdate.mockReturnValue({ eq: mockEq });
    mockDelete.mockReturnValue({ eq: mockEq });
    mockInsert.mockResolvedValue({ error: null });
    mockGetUser.mockResolvedValue({ data: null, error: null });
  });

  it("affiche le message de chargement", () => {
    mockSingle.mockImplementationOnce(() => new Promise(() => {}));
    renderRecipeDetails();
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });

  it("affiche une erreur si le chargement échoue", async () => {
    mockSingle.mockResolvedValueOnce({
      data: null,
      error: { message: "Recipe not found" },
    });

    renderRecipeDetails();

    await waitFor(() => {
      expect(screen.getByText(/Recipe not found/i)).toBeInTheDocument();
    });
  });

  it("affiche les détails de la recette chargée", async () => {
    const mockRecipe = {
      id: 1,
      title: "Pasta Carbonara",
      author: "Chef Mario",
      description: "Classic Italian pasta",
      servings: 4,
      difficulty_level: "easy",
      category: "Main Course",
      cooking_time: 30,
      prep_time: 15,
      user_id: "other-user",
    };

    mockSingle.mockResolvedValueOnce({ data: mockRecipe, error: null });
    mockOrder.mockResolvedValue({ data: [], error: null });

    renderRecipeDetails();

    await waitFor(() => {
      expect(screen.getByText("Pasta Carbonara")).toBeInTheDocument();
    });
    expect(screen.getByText("Chef Mario")).toBeInTheDocument();
  });

  it("affiche le bouton Edit pour les recettes de l'utilisateur", async () => {
    const mockRecipe = {
      id: 1,
      title: "My Recipe",
      author: "Me",
      user_id: "user-123",
    };

    mockSingle.mockResolvedValueOnce({ data: mockRecipe, error: null });
    mockOrder.mockResolvedValue({ data: [], error: null });
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
      error: null,
    });

    renderRecipeDetails();

    await waitFor(() => {
      expect(screen.getByText("My Recipe")).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: /Edit/i })).toBeInTheDocument();
  });

  it("n'affiche pas le bouton Edit pour les recettes d'autres utilisateurs", async () => {
    const mockRecipe = {
      id: 1,
      title: "Other Recipe",
      author: "Other",
      user_id: "other-user",
    };

    mockSingle.mockResolvedValueOnce({ data: mockRecipe, error: null });
    mockOrder.mockResolvedValue({ data: [], error: null });

    renderRecipeDetails();

    await waitFor(() => {
      expect(screen.getByText("Other Recipe")).toBeInTheDocument();
    });
    expect(
      screen.queryByRole("button", { name: /Edit/i })
    ).not.toBeInTheDocument();
  });

  it("affiche le bouton retour", async () => {
    const mockRecipe = {
      id: 1,
      title: "Recipe",
      author: "Author",
      user_id: "other",
    };

    mockSingle.mockResolvedValueOnce({ data: mockRecipe, error: null });
    mockOrder.mockResolvedValue({ data: [], error: null });

    renderRecipeDetails();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Back/i })).toBeInTheDocument();
    });
  });

  it("affiche le RecipeForm en mode édition et gère l'annulation", async () => {
    const mockRecipe = {
      id: 1,
      title: "Edit Me",
      author: "Me",
      user_id: "user-123",
    };
    mockSingle.mockResolvedValueOnce({ data: mockRecipe, error: null });
    mockOrder.mockResolvedValue({ data: [], error: null });

    renderRecipeDetails("1?edit=true");

    await waitFor(() => {
      expect(screen.getByTestId("recipe-form")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Cancel"));
    await waitFor(() => {
      expect(screen.getByText("Edit Me")).toBeInTheDocument();
    });
  });

  it("affiche un message de succès après modification", async () => {
    const mockRecipe = {
      id: 1,
      title: "Edit Me",
      author: "Me",
      user_id: "user-123",
    };
    mockSingle.mockResolvedValueOnce({ data: mockRecipe, error: null });
    mockOrder.mockResolvedValue({ data: [], error: null });
    mockUpdate.mockReturnValue({ eq: () => Promise.resolve({ error: null }) });

    renderRecipeDetails("1?edit=true");

    await waitFor(() => {
      expect(screen.getByTestId("recipe-form")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Save"));
  });

  it("affiche une erreur si la validation échoue", async () => {
    vi.doMock("../shared/recipe/utils", () => ({
      validateRecipe: () => ["Erreur de validation"],
      getDifficultyColor: () => "#4caf50",
      getDifficultyLabel: () => "Easy",
      buildIngredientsData: (ingredients) => ingredients,
      buildInstructionsData: (instructions) => instructions,
    }));

    const mockRecipe = {
      id: 1,
      title: "Edit Me",
      author: "Me",
      user_id: "user-123",
    };
    mockSingle.mockResolvedValueOnce({ data: mockRecipe, error: null });
    mockOrder.mockResolvedValue({ data: [], error: null });

    renderRecipeDetails("1?edit=true");

    await waitFor(() => {
      expect(screen.getByTestId("recipe-form")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Save"));
  });

  it("affiche une erreur si la requête supabase échoue", async () => {
    const mockRecipe = {
      id: 1,
      title: "Edit Me",
      author: "Me",
      user_id: "user-123",
    };
    mockSingle.mockResolvedValueOnce({ data: mockRecipe, error: null });
    mockOrder.mockResolvedValue({ data: [], error: null });
    mockUpdate.mockReturnValue({
      eq: () => Promise.resolve({ error: { message: "Update failed" } }),
    });

    renderRecipeDetails("1?edit=true");

    await waitFor(() => {
      expect(screen.getByTestId("recipe-form")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Save"));
  });
});
