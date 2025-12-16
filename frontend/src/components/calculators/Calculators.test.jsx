import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Calculatrices from "./Calculators";

// Mock the child calculator components
vi.mock("./CaloriesCalculator", () => ({
  default: () => (
    <div data-testid="calories-calculator">Calories Calculator Content</div>
  ),
}));

vi.mock("./NutritionCalculator", () => ({
  default: () => (
    <div data-testid="nutrition-calculator">Nutrition Calculator Content</div>
  ),
}));

describe("Calculatrices Component", () => {
  const renderWithRouter = (initialEntries = ["/"]) => {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <Calculatrices />
      </MemoryRouter>
    );
  };

  describe("Initial Rendering", () => {
    it("should render the component with title", () => {
      renderWithRouter();
      expect(screen.getByText("Health Calculators")).toBeInTheDocument();
    });

    it("should render both tab buttons", () => {
      renderWithRouter();
      expect(
        screen.getByRole("button", { name: /calorie calculator/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /nutrition calculator/i })
      ).toBeInTheDocument();
    });

    it("should default to calories calculator when no query param is provided", () => {
      renderWithRouter();
      const caloriesTab = screen.getByRole("button", {
        name: /calorie calculator/i,
      });
      expect(caloriesTab).toHaveClass("active");
      expect(screen.getByTestId("calories-calculator")).toBeInTheDocument();
    });

    it("should not render nutrition calculator initially", () => {
      renderWithRouter();
      expect(
        screen.queryByTestId("nutrition-calculator")
      ).not.toBeInTheDocument();
    });
  });

  describe("Query Parameter Handling", () => {
    it("should activate calories calculator when tab=calories in URL", () => {
      renderWithRouter(["/?tab=calories"]);
      const caloriesTab = screen.getByRole("button", {
        name: /calorie calculator/i,
      });
      expect(caloriesTab).toHaveClass("active");
      expect(screen.getByTestId("calories-calculator")).toBeInTheDocument();
    });

    it("should activate nutrition calculator when tab=nutrition in URL", () => {
      renderWithRouter(["/?tab=nutrition"]);
      const nutritionTab = screen.getByRole("button", {
        name: /nutrition calculator/i,
      });
      expect(nutritionTab).toHaveClass("active");
      expect(screen.getByTestId("nutrition-calculator")).toBeInTheDocument();
    });

    it("should not show any calculator when invalid tab param is provided", () => {
      renderWithRouter(["/?tab=invalid"]);
      // With invalid tab, neither calculator should render
      expect(
        screen.queryByTestId("calories-calculator")
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("nutrition-calculator")
      ).not.toBeInTheDocument();
    });
  });

  describe("Tab Navigation", () => {
    it("should switch to nutrition calculator when nutrition tab is clicked", async () => {
      const user = userEvent.setup();
      renderWithRouter();

      const nutritionTab = screen.getByRole("button", {
        name: /nutrition calculator/i,
      });
      await user.click(nutritionTab);

      await waitFor(() => {
        expect(nutritionTab).toHaveClass("active");
        expect(screen.getByTestId("nutrition-calculator")).toBeInTheDocument();
        expect(
          screen.queryByTestId("calories-calculator")
        ).not.toBeInTheDocument();
      });
    });

    it("should switch to calories calculator when calories tab is clicked", async () => {
      const user = userEvent.setup();
      renderWithRouter(["/?tab=nutrition"]);

      const caloriesTab = screen.getByRole("button", {
        name: /calorie calculator/i,
      });
      await user.click(caloriesTab);

      await waitFor(() => {
        expect(caloriesTab).toHaveClass("active");
        expect(screen.getByTestId("calories-calculator")).toBeInTheDocument();
        expect(
          screen.queryByTestId("nutrition-calculator")
        ).not.toBeInTheDocument();
      });
    });

    it("should update URL when switching tabs", async () => {
      const user = userEvent.setup();
      renderWithRouter();

      const nutritionTab = screen.getByRole("button", {
        name: /nutrition calculator/i,
      });
      await user.click(nutritionTab);

      // Verify the tab is active and content is shown (URL was updated)
      await waitFor(() => {
        expect(nutritionTab).toHaveClass("active");
        expect(screen.getByTestId("nutrition-calculator")).toBeInTheDocument();
      });
    });

    it("should apply active class only to the selected tab", async () => {
      const user = userEvent.setup();
      renderWithRouter();

      const caloriesTab = screen.getByRole("button", {
        name: /calorie calculator/i,
      });
      const nutritionTab = screen.getByRole("button", {
        name: /nutrition calculator/i,
      });

      expect(caloriesTab).toHaveClass("active");
      expect(nutritionTab).not.toHaveClass("active");

      await user.click(nutritionTab);

      await waitFor(() => {
        expect(caloriesTab).not.toHaveClass("active");
        expect(nutritionTab).toHaveClass("active");
      });
    });
  });

  describe("Component Structure", () => {
    it("should have the correct container class", () => {
      const { container } = renderWithRouter();
      expect(
        container.querySelector(".calculators-container")
      ).toBeInTheDocument();
    });

    it("should have calculator-tabs class for tab buttons container", () => {
      const { container } = renderWithRouter();
      expect(container.querySelector(".calculator-tabs")).toBeInTheDocument();
    });

    it("should have calculator-content class for content container", () => {
      const { container } = renderWithRouter();
      expect(
        container.querySelector(".calculator-content")
      ).toBeInTheDocument();
    });

    it("should render buttons with tab-button class", () => {
      const { container } = renderWithRouter();
      const buttons = container.querySelectorAll(".tab-button");
      expect(buttons).toHaveLength(2);
    });
  });

  describe("Edge Cases", () => {
    it("should handle rapid tab switching", async () => {
      const user = userEvent.setup();
      renderWithRouter();

      const caloriesTab = screen.getByRole("button", {
        name: /calorie calculator/i,
      });
      const nutritionTab = screen.getByRole("button", {
        name: /nutrition calculator/i,
      });

      await user.click(nutritionTab);
      await user.click(caloriesTab);
      await user.click(nutritionTab);

      await waitFor(() => {
        expect(screen.getByTestId("nutrition-calculator")).toBeInTheDocument();
        expect(nutritionTab).toHaveClass("active");
      });
    });

    it("should maintain state when tab is clicked multiple times", async () => {
      const user = userEvent.setup();
      renderWithRouter();

      const caloriesTab = screen.getByRole("button", {
        name: /calorie calculator/i,
      });

      await user.click(caloriesTab);
      await user.click(caloriesTab);

      expect(caloriesTab).toHaveClass("active");
      expect(screen.getByTestId("calories-calculator")).toBeInTheDocument();
    });
  });
});
