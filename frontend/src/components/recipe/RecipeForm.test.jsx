import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RecipeForm } from "./RecipeForm";

// Mock child components
vi.mock("../shared/recipe/IngredientRow", () => ({
  IngredientRow: ({ ingredient, onRemove, disableRemove }) => (
    <div data-testid={`ingredient-${ingredient.id}`}>
      <span>Ingredient: {ingredient.ingredientName || "empty"}</span>
      <button
        onClick={() => onRemove(ingredient.id)}
        disabled={disableRemove}
        data-testid={`remove-ingredient-${ingredient.id}`}
      >
        Remove Ingredient
      </button>
    </div>
  ),
}));

vi.mock("../shared/recipe/InstructionRow", () => ({
  InstructionRow: ({ index, value, onRemove, disableRemove }) => (
    <div data-testid={`instruction-${index}`}>
      <span>
        Instruction {index + 1}: {value || "empty"}
      </span>
      <button
        onClick={() => onRemove(index)}
        disabled={disableRemove}
        data-testid={`remove-instruction-${index}`}
      >
        Remove Instruction
      </button>
    </div>
  ),
}));

describe("RecipeForm", () => {
  const mockSetters = {
    setTitle: vi.fn(),
    setAuthor: vi.fn(),
    setDescription: vi.fn(),
    setServings: vi.fn(),
    setDifficultyLevel: vi.fn(),
    setCategory: vi.fn(),
    setCookingTime: vi.fn(),
    setPrepTime: vi.fn(),
  };

  const mockFields = {
    title: "",
    author: "",
    description: "",
    servings: "",
    difficultyLevel: "easy",
    category: "",
    cookingTime: "",
    prepTime: "",
  };

  const mockIngredients = [
    {
      id: 1,
      ingredientName: "Flour",
      quantity: "100",
      unit: "g",
      preparation: "",
    },
  ];

  const mockInstructions = ["Mix well"];

  const mockSetIngredients = vi.fn();
  const mockSetInstructions = vi.fn();
  const mockOnSave = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderForm = (props = {}) => {
    return render(
      <RecipeForm
        mode="create"
        fields={mockFields}
        setFields={mockSetters}
        ingredients={mockIngredients}
        setIngredients={mockSetIngredients}
        instructions={mockInstructions}
        setInstructions={mockSetInstructions}
        cartFoods={[]}
        loading={false}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        {...props}
      />
    );
  };

  it("rend le titre correct selon le mode", () => {
    const { rerender } = renderForm({ mode: "create" });
    expect(screen.getByText("Create Recipe")).toBeInTheDocument();

    rerender(
      <RecipeForm
        mode="edit"
        fields={mockFields}
        setFields={mockSetters}
        ingredients={mockIngredients}
        setIngredients={mockSetIngredients}
        instructions={mockInstructions}
        setInstructions={mockSetInstructions}
        cartFoods={[]}
        loading={false}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );
    expect(screen.getByText("Edit Recipe")).toBeInTheDocument();
  });

  it("affiche tous les champs de base", () => {
    renderForm();
    expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Author/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Servings/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Difficulty level/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Prep time/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Cook time/i)).toBeInTheDocument();
  });

  it("appelle les setters quand les champs sont modifiés", async () => {
    renderForm();

    const titleInput = screen.getByLabelText(/Title/i);
    await userEvent.type(titleInput, "Test");
    expect(mockSetters.setTitle).toHaveBeenCalled();

    const authorInput = screen.getByLabelText(/Author/i);
    await userEvent.type(authorInput, "Chef");
    expect(mockSetters.setAuthor).toHaveBeenCalled();
  });

  it("affiche les ingrédients et instructions", () => {
    renderForm();
    expect(screen.getByTestId("ingredient-1")).toBeInTheDocument();
    expect(screen.getByTestId("instruction-0")).toBeInTheDocument();
  });

  it("ajoute un ingrédient quand le bouton est cliqué", async () => {
    renderForm();
    const addButton = screen.getByRole("button", { name: /Add ingredient/i });
    await userEvent.click(addButton);
    expect(mockSetIngredients).toHaveBeenCalled();
  });

  it("ajoute une instruction quand le bouton est cliqué", async () => {
    renderForm();
    const addButton = screen.getByRole("button", { name: /Add step/i });
    await userEvent.click(addButton);
    expect(mockSetInstructions).toHaveBeenCalled();
  });

  it("appelle onSave quand le bouton Save est cliqué", async () => {
    renderForm();
    const saveButton = screen.getByRole("button", { name: /Save/i });
    await userEvent.click(saveButton);
    expect(mockOnSave).toHaveBeenCalled();
  });

  it("affiche le bouton Cancel seulement si onCancel est fourni", () => {
    const { rerender } = renderForm({ onCancel: mockOnCancel });
    expect(screen.getByRole("button", { name: /Cancel/i })).toBeInTheDocument();

    rerender(
      <RecipeForm
        mode="create"
        fields={mockFields}
        setFields={mockSetters}
        ingredients={mockIngredients}
        setIngredients={mockSetIngredients}
        instructions={mockInstructions}
        setInstructions={mockSetInstructions}
        cartFoods={[]}
        loading={false}
        onSave={mockOnSave}
        onCancel={null}
      />
    );
    expect(
      screen.queryByRole("button", { name: /Cancel/i })
    ).not.toBeInTheDocument();
  });

  it("appelle onCancel quand le bouton Cancel est cliqué", async () => {
    renderForm();
    const cancelButton = screen.getByRole("button", { name: /Cancel/i });
    await userEvent.click(cancelButton);
    expect(mockOnCancel).toHaveBeenCalled();
  });
});
