import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import Recipe from "./Recipe";

// Mock child components to simplify testing
vi.mock("./CreateRecipe", () => ({
  default: () => <div data-testid="create-recipe">Create Recipe Component</div>,
}));

vi.mock("./SavedRecipe", () => ({
  default: () => <div data-testid="saved-recipe">Saved Recipe Component</div>,
}));

// Mock the URL tabs hook
const mockSetActiveTab = vi.fn();
const mockActiveTab = { current: "create" };

vi.mock("../shared/hooks/useUrlTabs", () => ({
  useUrlTabs: (tabs, defaultTab) => ({
    activeTab: mockActiveTab.current,
    setActiveTab: (tab) => {
      mockActiveTab.current = tab;
      mockSetActiveTab(tab);
    },
  }),
}));

function renderRecipe() {
  return render(
    <BrowserRouter>
      <Recipe />
    </BrowserRouter>
  );
}

describe("Recipe", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockActiveTab.current = "create";
  });

  it("rend le titre et les onglets", () => {
    renderRecipe();
    expect(
      screen.getByRole("heading", { name: /Recipes/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Create Recipe/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Browse Recipes/i })
    ).toBeInTheDocument();
  });

  it("affiche CreateRecipe par défaut", () => {
    renderRecipe();
    expect(screen.getByTestId("create-recipe")).toBeInTheDocument();
    expect(screen.queryByTestId("saved-recipe")).not.toBeInTheDocument();
  });

  it("bascule vers l'onglet saved quand on clique dessus", async () => {
    renderRecipe();

    const savedButton = screen.getByRole("button", { name: /Browse Recipes/i });
    await userEvent.click(savedButton);

    expect(mockSetActiveTab).toHaveBeenCalledWith("saved");
  });

  it("l'onglet actif a la classe active", () => {
    mockActiveTab.current = "create";
    renderRecipe();

    const createButton = screen.getByRole("button", { name: /Create Recipe/i });
    expect(createButton).toHaveClass("active");
  });
});
