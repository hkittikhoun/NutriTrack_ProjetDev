import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MealPlanEditor } from "./MealPlanEditor";

describe("MealPlanEditor", () => {
  const mockProps = {
    isOwner: true,
    loading: false,
    loadingCart: false,
    cartFoods: [],
    foods: [],
    mealPlans: {
      morning: [],
      lunch: [],
      dinner: [],
    },
    addItemToMeal: vi.fn(),
    removeItemFromMeal: vi.fn(),
    updateMealItem: vi.fn(),
    onPrefillFromCart: vi.fn(),
    titleProps: {
      title: "",
      setTitle: vi.fn(),
      author: "",
      setAuthor: vi.fn(),
    },
    saveProps: {
      onSave: vi.fn(),
      saveDisabledLabel: null,
    },
    onCancel: vi.fn(),
  };

  it("affiche le titre principal", () => {
    render(<MealPlanEditor {...mockProps} />);
    expect(screen.getByText("Edit Plan")).toBeInTheDocument();
  });

  it("affiche les champs titre et auteur", () => {
    render(<MealPlanEditor {...mockProps} />);
    expect(screen.getByLabelText("Title")).toBeInTheDocument();
    expect(screen.getByLabelText("Author")).toBeInTheDocument();
  });

  it("affiche les trois sections de repas", () => {
    render(<MealPlanEditor {...mockProps} />);
    expect(screen.getByText("🌅 Morning")).toBeInTheDocument();
    expect(screen.getByText("🌞 Lunch")).toBeInTheDocument();
    expect(screen.getByText("🌙 Dinner")).toBeInTheDocument();
  });

  it("affiche le bouton Save", () => {
    render(<MealPlanEditor {...mockProps} />);
    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
  });

  it("affiche le bouton Cancel quand onCancel est fourni", () => {
    render(<MealPlanEditor {...mockProps} />);
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  it("n'affiche pas le bouton Cancel quand onCancel est undefined", () => {
    const propsWithoutCancel = { ...mockProps, onCancel: undefined };
    render(<MealPlanEditor {...propsWithoutCancel} />);
    expect(
      screen.queryByRole("button", { name: /cancel/i })
    ).not.toBeInTheDocument();
  });

  it("affiche les boutons Add food quand isOwner est true", () => {
    render(<MealPlanEditor {...mockProps} />);
    const addButtons = screen.getAllByRole("button", { name: /add food/i });
    expect(addButtons).toHaveLength(3);
  });

  it("n'affiche pas les boutons Add food quand isOwner est false", () => {
    const propsNotOwner = { ...mockProps, isOwner: false };
    render(<MealPlanEditor {...propsNotOwner} />);
    expect(
      screen.queryByRole("button", { name: /add food/i })
    ).not.toBeInTheDocument();
  });

  it("affiche le bouton Prefill quand cartFoods a des items", () => {
    const propsWithCart = {
      ...mockProps,
      cartFoods: [{ foodId: "1", name: "Apple", FoodDescription: "Red Apple" }],
    };
    render(<MealPlanEditor {...propsWithCart} />);
    expect(
      screen.getByRole("button", { name: /prefill from cart/i })
    ).toBeInTheDocument();
  });

  it("n'affiche pas le bouton Prefill quand cartFoods est vide", () => {
    render(<MealPlanEditor {...mockProps} />);
    expect(
      screen.queryByRole("button", { name: /prefill from cart/i })
    ).not.toBeInTheDocument();
  });

  it("affiche 'No foods for this meal' quand une section est vide", () => {
    render(<MealPlanEditor {...mockProps} />);
    const noFoodsMessages = screen.getAllByText(/no foods for this meal/i);
    expect(noFoodsMessages).toHaveLength(3);
  });

  it("désactive le bouton Save quand totalItems est 0", () => {
    render(<MealPlanEditor {...mockProps} />);
    const saveButton = screen.getByRole("button", { name: /save/i });
    expect(saveButton).toBeDisabled();
  });
});
