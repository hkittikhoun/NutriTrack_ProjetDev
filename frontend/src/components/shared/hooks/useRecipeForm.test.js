import { describe, it, expect } from "vitest";
import {
  mapDbIngredientsToEdit,
  mapDbInstructionsToEdit,
} from "./useRecipeForm";

describe("useRecipeForm", () => {
  describe("mapDbIngredientsToEdit", () => {
    it("retourne un ingrédient vide si tableau vide", () => {
      const result = mapDbIngredientsToEdit([]);

      expect(result).toHaveLength(1);
      expect(result[0].foodId).toBe("");
      expect(result[0].ingredientName).toBe("");
      expect(result[0].quantity).toBe("");
      expect(result[0].unit).toBe("g");
    });

    it("retourne un ingrédient vide si null", () => {
      const result = mapDbIngredientsToEdit(null);

      expect(result).toHaveLength(1);
      expect(result[0].unit).toBe("g");
    });

    it("mappe les ingrédients de la base de données", () => {
      const dbData = [
        {
          id: 1,
          food_id: 123,
          ingredient_name: "Flour",
          quantity: 200,
          unit: "g",
          preparation: "sifted",
        },
      ];

      const result = mapDbIngredientsToEdit(dbData);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
      expect(result[0].foodId).toBe("123");
      expect(result[0].ingredientName).toBe("Flour");
      expect(result[0].quantity).toBe(200);
      expect(result[0].unit).toBe("g");
      expect(result[0].preparation).toBe("sifted");
    });

    it("convertit food_id en string", () => {
      const dbData = [
        {
          id: 1,
          food_id: 456,
          ingredient_name: "Sugar",
          quantity: 100,
          unit: "g",
          preparation: "",
        },
      ];

      const result = mapDbIngredientsToEdit(dbData);

      expect(typeof result[0].foodId).toBe("string");
      expect(result[0].foodId).toBe("456");
    });

    it("utilise les valeurs par défaut pour les champs manquants", () => {
      const dbData = [
        {
          id: 1,
          food_id: null,
          ingredient_name: undefined,
          quantity: undefined,
          unit: undefined,
          preparation: undefined,
        },
      ];

      const result = mapDbIngredientsToEdit(dbData);

      expect(result[0].foodId).toBe("");
      expect(result[0].ingredientName).toBe("");
      expect(result[0].quantity).toBe("");
      expect(result[0].unit).toBe("g");
      expect(result[0].preparation).toBe("");
    });

    it("mappe plusieurs ingrédients", () => {
      const dbData = [
        {
          id: 1,
          food_id: 123,
          ingredient_name: "Flour",
          quantity: 200,
          unit: "g",
          preparation: "sifted",
        },
        {
          id: 2,
          food_id: 456,
          ingredient_name: "Sugar",
          quantity: 100,
          unit: "g",
          preparation: "fine",
        },
      ];

      const result = mapDbIngredientsToEdit(dbData);

      expect(result).toHaveLength(2);
      expect(result[0].ingredientName).toBe("Flour");
      expect(result[1].ingredientName).toBe("Sugar");
    });
  });

  describe("mapDbInstructionsToEdit", () => {
    it("retourne une instruction vide si tableau vide", () => {
      const result = mapDbInstructionsToEdit([]);

      expect(result).toHaveLength(1);
      expect(result[0]).toBe("");
    });

    it("retourne une instruction vide si null", () => {
      const result = mapDbInstructionsToEdit(null);

      expect(result).toHaveLength(1);
      expect(result[0]).toBe("");
    });

    it("mappe une seule instruction", () => {
      const dbData = [
        {
          id: 1,
          instruction: "Preheat oven to 180°C",
        },
      ];

      const result = mapDbInstructionsToEdit(dbData);

      expect(result).toHaveLength(1);
      expect(result[0]).toBe("Preheat oven to 180°C");
    });

    it("mappe plusieurs instructions", () => {
      const dbData = [
        {
          id: 1,
          instruction: "Preheat oven to 180°C",
        },
        {
          id: 2,
          instruction: "Mix ingredients",
        },
        {
          id: 3,
          instruction: "Bake for 30 minutes",
        },
      ];

      const result = mapDbInstructionsToEdit(dbData);

      expect(result).toHaveLength(3);
      expect(result[0]).toBe("Preheat oven to 180°C");
      expect(result[1]).toBe("Mix ingredients");
      expect(result[2]).toBe("Bake for 30 minutes");
    });

    it("extrait uniquement le champ instruction", () => {
      const dbData = [
        {
          id: 1,
          instruction: "Step 1",
          otherField: "ignored",
        },
      ];

      const result = mapDbInstructionsToEdit(dbData);

      expect(result[0]).toBe("Step 1");
      expect(typeof result[0]).toBe("string");
    });
  });
});
