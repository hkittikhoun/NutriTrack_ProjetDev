import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { IngredientRow } from "./IngredientRow";

describe("IngredientRow", () => {
  const mockIngredient = {
    id: 1,
    foodId: "",
    ingredientName: "",
    quantity: "",
    unit: "g",
    preparation: "",
  };

  const mockProps = {
    ingredient: mockIngredient,
    cartFoods: [],
    onFoodChange: vi.fn(),
    onUpdate: vi.fn(),
    onRemove: vi.fn(),
    disableRemove: false,
  };

  it("affiche le label Ingredient", () => {
    render(<IngredientRow {...mockProps} />);
    expect(screen.getByText("Ingredient *")).toBeInTheDocument();
  });

  it("affiche le champ Name", () => {
    render(<IngredientRow {...mockProps} />);
    expect(screen.getByPlaceholderText("e.g., Flour")).toBeInTheDocument();
  });

  it("affiche le champ Quantity", () => {
    render(<IngredientRow {...mockProps} />);
    expect(screen.getByPlaceholderText("100")).toBeInTheDocument();
  });

  it("affiche le champ Unit", () => {
    render(<IngredientRow {...mockProps} />);
    expect(screen.getByText("Unit")).toBeInTheDocument();
  });

  it("affiche le champ Preparation", () => {
    render(<IngredientRow {...mockProps} />);
    expect(
      screen.getByPlaceholderText("e.g., chopped, diced")
    ).toBeInTheDocument();
  });

  it("affiche le bouton Remove", () => {
    render(<IngredientRow {...mockProps} />);
    expect(screen.getByRole("button", { name: /remove/i })).toBeInTheDocument();
  });

  it("affiche les options de cartFoods dans le select", () => {
    const propsWithCart = {
      ...mockProps,
      cartFoods: [
        { foodId: "1", name: "Apple" },
        { foodId: "2", name: "Banana" },
      ],
    };
    render(<IngredientRow {...propsWithCart} />);
    expect(screen.getByText("Apple")).toBeInTheDocument();
    expect(screen.getByText("Banana")).toBeInTheDocument();
  });

  it("affiche toutes les options d'unités", () => {
    render(<IngredientRow {...mockProps} />);
    expect(screen.getByText("grams (g)")).toBeInTheDocument();
    expect(screen.getByText("kilograms (kg)")).toBeInTheDocument();
    expect(screen.getByText("milliliters (ml)")).toBeInTheDocument();
    expect(screen.getByText("liters (l)")).toBeInTheDocument();
    expect(screen.getByText("cups")).toBeInTheDocument();
    expect(screen.getByText("tablespoons")).toBeInTheDocument();
    expect(screen.getByText("teaspoons")).toBeInTheDocument();
    expect(screen.getByText("pieces")).toBeInTheDocument();
  });

  it("désactive le bouton Remove quand disableRemove est true", () => {
    const propsDisabled = { ...mockProps, disableRemove: true };
    render(<IngredientRow {...propsDisabled} />);
    expect(screen.getByRole("button", { name: /remove/i })).toBeDisabled();
  });

  it("affiche les valeurs de l'ingrédient", () => {
    const ingredientWithValues = {
      id: 1,
      foodId: "123",
      ingredientName: "Flour",
      quantity: "200",
      unit: "g",
      preparation: "sifted",
    };
    const propsWithValues = { ...mockProps, ingredient: ingredientWithValues };
    render(<IngredientRow {...propsWithValues} />);

    expect(screen.getByPlaceholderText("e.g., Flour")).toHaveValue("Flour");
    expect(screen.getByPlaceholderText("100")).toHaveValue(200);
    expect(screen.getByPlaceholderText("e.g., chopped, diced")).toHaveValue(
      "sifted"
    );
  });
});
