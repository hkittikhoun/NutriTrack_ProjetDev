import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import NutritionCalculator from "./NutritionCalculator";

// --- Mocks ---
let mockSelectedFood;
const mockClearSelectedFood = vi.fn();
const mockNavigate = vi.fn();

const supabaseMocks = vi.hoisted(() => {
  const eqMock = vi.fn();
  const selectMock = vi.fn(() => ({ eq: eqMock }));
  const fromMock = vi.fn(() => ({ select: selectMock }));
  return { eqMock, selectMock, fromMock };
});

vi.mock("../../context/nutrition", () => ({
  useNutrition: () => ({
    selectedFood: mockSelectedFood,
    clearSelectedFood: mockClearSelectedFood,
  }),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("../../supabaseClient", () => {
  return { supabase: { from: supabaseMocks.fromMock } };
});

vi.mock("./NutrientSection", () => ({
  NutrientSection: ({ title, nutrients, quantity, calculate }) => (
    <div data-testid={`section-${title.toLowerCase()}`}>
      <span>{title}</span>
      {nutrients.map((n) => (
        <div key={n.nutrient_name.NutrientCode} data-testid="nutrient-row">
          {n.nutrient_name.NutrientName}: {calculate(n.NutrientValue, quantity)}{" "}
          {n.nutrient_name.NutrientUnit}
        </div>
      ))}
    </div>
  ),
}));

const sampleFood = {
  FoodID: 1,
  FoodDescription: "Sample Food",
};

const sampleNutrients = [
  {
    NutrientValue: 100,
    nutrient_name: {
      NutrientCode: 208,
      NutrientName: "Energy",
      NutrientSymbol: "kcal",
      NutrientUnit: "kcal",
    },
  },
  {
    NutrientValue: 10,
    nutrient_name: {
      NutrientCode: 203,
      NutrientName: "Protein",
      NutrientSymbol: "PROT",
      NutrientUnit: "g",
    },
  },
  {
    NutrientValue: 5,
    nutrient_name: {
      NutrientCode: 304,
      NutrientName: "Magnesium",
      NutrientSymbol: "MG",
      NutrientUnit: "mg",
    },
  },
];

const renderComponent = () =>
  render(
    <MemoryRouter>
      <NutritionCalculator />
    </MemoryRouter>
  );

beforeEach(() => {
  mockSelectedFood = null;
  mockClearSelectedFood.mockReset();
  mockNavigate.mockReset();
  supabaseMocks.fromMock?.mockReset();
  supabaseMocks.selectMock?.mockReset();
  supabaseMocks.eqMock?.mockReset();
});

describe("NutritionCalculator", () => {
  it("shows CTA when no food selected", () => {
    mockSelectedFood = null;
    renderComponent();

    expect(screen.getByText(/no food selected/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /go to catalogue/i })
    ).toBeInTheDocument();
  });

  it("navigates to catalogue from CTA", async () => {
    mockSelectedFood = null;
    renderComponent();

    const button = screen.getByRole("button", { name: /go to catalogue/i });
    await userEvent.click(button);

    expect(mockNavigate).toHaveBeenCalledWith("/catalogue");
  });

  it("fetches and displays nutrients for selected food", async () => {
    mockSelectedFood = sampleFood;
    supabaseMocks.eqMock.mockResolvedValue({
      data: sampleNutrients,
      error: null,
    });

    renderComponent();

    await waitFor(() => {
      expect(supabaseMocks.fromMock).toHaveBeenCalledWith("nutrient_amount");
      expect(supabaseMocks.eqMock).toHaveBeenCalledWith(
        "FoodID",
        sampleFood.FoodID
      );
    });

    await waitFor(() => {
      expect(screen.getAllByText(/energy/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/protein/i)).toBeInTheDocument();
      expect(screen.getByText(/magnesium/i)).toBeInTheDocument();
      expect(screen.getAllByTestId("nutrient-row").length).toBe(3);
    });
  });

  it("shows error message when supabase returns error", async () => {
    mockSelectedFood = sampleFood;
    supabaseMocks.eqMock.mockResolvedValue({
      data: null,
      error: { message: "boom" },
    });

    renderComponent();

    await waitFor(() => {
      expect(
        screen.getByText(/failed to load nutrients: boom/i)
      ).toBeInTheDocument();
    });
  });

  it("shows no-data message when nutrient list is empty", async () => {
    mockSelectedFood = sampleFood;
    supabaseMocks.eqMock.mockResolvedValue({ data: [], error: null });

    renderComponent();

    await waitFor(() => {
      expect(
        screen.getByText(/no nutritional data available/i)
      ).toBeInTheDocument();
    });
  });

  it("updates calculated values when quantity changes", async () => {
    mockSelectedFood = sampleFood;
    supabaseMocks.eqMock.mockResolvedValue({
      data: sampleNutrients,
      error: null,
    });

    renderComponent();

    const quantityInput = await screen.findByLabelText(/quantity \(grams\)/i);
    await userEvent.clear(quantityInput);
    await userEvent.type(quantityInput, "50");

    await waitFor(() => {
      expect(screen.getByText(/Energy: 50.00/)).toBeInTheDocument();
      expect(screen.getByText(/Protein: 5.00/)).toBeInTheDocument();
      expect(screen.getByText(/Magnesium: 2.50/)).toBeInTheDocument();
    });
  });

  it("clears selection and resets quantity when Clear is clicked", async () => {
    mockSelectedFood = sampleFood;
    supabaseMocks.eqMock.mockResolvedValue({
      data: sampleNutrients,
      error: null,
    });

    renderComponent();

    const clearButton = await screen.findByRole("button", { name: /clear/i });
    await userEvent.click(clearButton);

    expect(mockClearSelectedFood).toHaveBeenCalled();
    const quantityInput = screen.getByLabelText(/quantity \(grams\)/i);
    expect(quantityInput.value).toBe("100");
    expect(
      screen.getByText(/no nutritional data available/i)
    ).toBeInTheDocument();
  });

  it("shows loading state while fetching", async () => {
    mockSelectedFood = sampleFood;
    let resolvePromise;
    const pending = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    supabaseMocks.eqMock.mockReturnValue(pending);

    renderComponent();

    expect(screen.getByText(/loading nutritional data/i)).toBeInTheDocument();

    resolvePromise({ data: sampleNutrients, error: null });
    await waitFor(() => {
      expect(
        screen.queryByText(/loading nutritional data/i)
      ).not.toBeInTheDocument();
    });
  });
});
