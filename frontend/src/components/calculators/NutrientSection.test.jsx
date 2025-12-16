import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NutrientSection } from "./NutrientSection";

// Tests
describe("NutrientSection", () => {
  const nutrients = [
    {
      NutrientValue: 100,
      nutrient_name: {
        NutrientSymbol: "EN",
        NutrientUnit: "kcal",
        NutrientCode: 208,
      },
    },
    {
      NutrientValue: 10,
      nutrient_name: {
        NutrientSymbol: "PROT",
        NutrientUnit: "g",
        NutrientCode: 203,
      },
    },
  ];

  // pour vérifier le rendu null lorsque les nutriments sont absents
  it("returns null when nutrients is undefined", () => {
    const { container } = render(
      <NutrientSection
        title="Energy"
        className="energy-group"
        nutrients={undefined}
        quantity={100}
        calculate={() => "0"}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  // pour vérifier le rendu null lorsque les nutriments sont vides
  it("returns null when nutrients is empty", () => {
    const { container } = render(
      <NutrientSection
        title="Energy"
        className="energy-group"
        nutrients={[]}
        quantity={100}
        calculate={() => "0"}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  // pour vérifier le rendu correct des cartes de nutriments
  it("renders nutrient cards with calculated values", () => {
    const calculate = vi.fn((base, qty) => ((base * qty) / 100).toFixed(2));

    const { container } = render(
      <NutrientSection
        title="Energy"
        className="energy-group"
        nutrients={nutrients}
        quantity={150}
        calculate={calculate}
      />
    );

    expect(screen.getByText("Energy")).toBeInTheDocument();
    expect(screen.getByText("EN")).toBeInTheDocument();
    expect(screen.getByText(/kcal/)).toBeInTheDocument();
    expect(screen.getByText("PROT")).toBeInTheDocument();

    // la fonction de calcul doit être appelée pour chaque nutriment
    expect(calculate).toHaveBeenCalledTimes(2);
    expect(calculate).toHaveBeenCalledWith(100, 150);
    expect(calculate).toHaveBeenCalledWith(10, 150);

    // vérifier que les cartes ont la bonne classe CSS
    const cards = container.querySelectorAll(".nutrient-card.energy");
    expect(cards.length).toBe(2);

    // validate les valeurs calculées affichées
    expect(screen.getByText(/150.00 kcal/)).toBeInTheDocument();
    expect(screen.getByText(/15.00 g/)).toBeInTheDocument();
  });
});
