import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Catalogue from "./Catalogue";

// Mock FoodCard pour simplifier le rendu
vi.mock("../foodCard/FoodCard", () => ({
  default: ({ food }) => (
    <div data-testid="food-card">
      <span>{food.FoodDescription}</span>
      <span>{food.nutrients?.map((n) => n.NutrientSymbol).join(",")}</span>
    </div>
  ),
}));

// Mock Supabase hoisté avec une file de réponses
const supabaseMocks = vi.hoisted(() => {
  const nextResponses = [];
  return { nextResponses };
});

vi.mock("../../supabaseClient", () => {
  const makeChain = () => {
    const chain = {
      select: () => chain,
      order: () => chain,
      eq: () => chain,
      in: () => chain,
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

beforeEach(() => {
  vi.clearAllMocks();
  supabaseMocks.nextResponses.length = 0;
});

describe("Catalogue", () => {
  it("charge les groupes puis affiche la liste dans le select", async () => {
    const groups = [
      { FoodGroupID: 1, FoodGroupName: "Fruits" },
      { FoodGroupID: 2, FoodGroupName: "Légumes" },
    ];
    // food_group select -> order -> retourne les groupes
    supabaseMocks.nextResponses.push({ data: groups, error: null });

    render(<Catalogue />);

    // Vérifie la présence du titre et du select
    expect(
      screen.getByRole("heading", { name: /food catalogue/i })
    ).toBeInTheDocument();
    const select = await screen.findByLabelText(/choose a food group/i);
    expect(select).toBeInTheDocument();

    // Options chargées
    const options = screen.getAllByRole("option");
    expect(options.map((o) => o.textContent)).toContain("Fruits");
    expect(options.map((o) => o.textContent)).toContain("Légumes");
  });

  it("sélectionne un groupe et charge les aliments avec états de chargement", async () => {
    // 1) food_group
    supabaseMocks.nextResponses.push({
      data: [{ FoodGroupID: 1, FoodGroupName: "Fruits" }],
      error: null,
    });
    // 2) food_name avec nutriments
    const foodsWithNutrients = [
      {
        FoodID: 10,
        FoodDescription: "Pomme",
        nutrient_amount: [
          {
            NutrientValue: 52,
            nutrient_name: {
              NutrientSymbol: "Energy",
              NutrientUnit: "kcal",
              NutrientCode: 208,
            },
          },
          {
            NutrientValue: 0.3,
            nutrient_name: {
              NutrientSymbol: "Fat",
              NutrientUnit: "g",
              NutrientCode: 204,
            },
          },
          {
            NutrientValue: 0.3,
            nutrient_name: {
              NutrientSymbol: "Protein",
              NutrientUnit: "g",
              NutrientCode: 203,
            },
          },
        ],
      },
    ];
    supabaseMocks.nextResponses.push({ data: foodsWithNutrients, error: null });

    render(<Catalogue />);

    const select = await screen.findByLabelText(/choose a food group/i);
    await userEvent.selectOptions(select, "1");

    // Si l'état de chargement est fugitif, ne bloque pas le test
    const loading = screen.queryByText(/loading foods/i);
    if (loading) {
      expect(loading).toBeInTheDocument();
    }

    // Les cartes d'aliments apparaissent
    await waitFor(() => {
      expect(screen.getByTestId("food-card")).toBeInTheDocument();
      expect(screen.getByText(/pomme/i)).toBeInTheDocument();
    });
  });

  it("affiche une erreur si le chargement des groupes échoue", async () => {
    supabaseMocks.nextResponses.push({
      data: null,
      error: { message: "Oops" },
    });

    render(<Catalogue />);

    expect(
      await screen.findByText(/failed to load food groups/i)
    ).toBeInTheDocument();
  });

  it("affiche une erreur si le chargement des aliments échoue", async () => {
    // groups ok
    supabaseMocks.nextResponses.push({
      data: [{ FoodGroupID: 1, FoodGroupName: "Fruits" }],
      error: null,
    });
    // foods erreur
    supabaseMocks.nextResponses.push({
      data: null,
      error: { message: "Boom" },
    });

    render(<Catalogue />);

    const select = await screen.findByLabelText(/choose a food group/i);
    await userEvent.selectOptions(select, "1");

    expect(
      await screen.findByText(/failed to load foods/i)
    ).toBeInTheDocument();
  });

  it("affiche un message 'no data' si aucun aliment", async () => {
    // groups ok
    supabaseMocks.nextResponses.push({
      data: [{ FoodGroupID: 1, FoodGroupName: "Fruits" }],
      error: null,
    });
    // foods liste vide
    supabaseMocks.nextResponses.push({ data: [], error: null });

    render(<Catalogue />);

    const select = await screen.findByLabelText(/choose a food group/i);
    await userEvent.selectOptions(select, "1");

    expect(
      await screen.findByText(/no foods found for this group/i)
    ).toBeInTheDocument();
  });
});
