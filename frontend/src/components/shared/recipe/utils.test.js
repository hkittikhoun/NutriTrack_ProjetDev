import { describe, it, expect } from "vitest";
import {
  validateRecipe,
  getDifficultyColor,
  getDifficultyLabel,
  buildIngredientsData,
  buildInstructionsData,
} from "./utils";

describe("recipe utils", () => {
  describe("validateRecipe", () => {
    it("retourne aucune erreur avec une recette valide", () => {
      const recipe = {
        title: "Pancakes",
        author: "John",
        ingredients: [{ ingredientName: "Flour" }],
        instructions: ["Mix all"],
      };

      const errors = validateRecipe(recipe);

      expect(errors).toHaveLength(0);
    });

    it("retourne erreur si titre manquant", () => {
      const recipe = {
        title: "",
        author: "John",
        ingredients: [{ ingredientName: "Flour" }],
        instructions: ["Mix"],
      };

      const errors = validateRecipe(recipe);

      expect(errors).toContain("Le titre est requis");
    });

    it("retourne erreur si auteur manquant", () => {
      const recipe = {
        title: "Pancakes",
        author: "",
        ingredients: [{ ingredientName: "Flour" }],
        instructions: ["Mix"],
      };

      const errors = validateRecipe(recipe);

      expect(errors).toContain("L'auteur est requis");
    });

    it("retourne erreur si ingrédient sans nom", () => {
      const recipe = {
        title: "Pancakes",
        author: "John",
        ingredients: [{ ingredientName: "" }],
        instructions: ["Mix"],
      };

      const errors = validateRecipe(recipe);

      expect(errors).toContain("Tous les ingrédients doivent avoir un nom");
    });

    it("retourne erreur si instruction vide", () => {
      const recipe = {
        title: "Pancakes",
        author: "John",
        ingredients: [{ ingredientName: "Flour" }],
        instructions: [""],
      };

      const errors = validateRecipe(recipe);

      expect(errors).toContain("Toutes les instructions doivent être remplies");
    });

    it("retourne plusieurs erreurs", () => {
      const recipe = {
        title: "",
        author: "",
        ingredients: [{ ingredientName: "" }],
        instructions: [""],
      };

      const errors = validateRecipe(recipe);

      expect(errors.length).toBeGreaterThan(1);
    });
  });

  describe("getDifficultyColor", () => {
    it("retourne la couleur verte pour easy", () => {
      expect(getDifficultyColor("easy")).toBe("#4caf50");
    });

    it("retourne la couleur orange pour medium", () => {
      expect(getDifficultyColor("medium")).toBe("#ff9800");
    });

    it("retourne la couleur rouge pour hard", () => {
      expect(getDifficultyColor("hard")).toBe("#f44336");
    });

    it("retourne la couleur par défaut pour unknown", () => {
      expect(getDifficultyColor("unknown")).toBe("#666");
    });
  });

  describe("getDifficultyLabel", () => {
    it("retourne 'Easy' pour easy", () => {
      expect(getDifficultyLabel("easy")).toBe("Easy");
    });

    it("retourne 'Medium' pour medium", () => {
      expect(getDifficultyLabel("medium")).toBe("Medium");
    });

    it("retourne 'Hard' pour hard", () => {
      expect(getDifficultyLabel("hard")).toBe("Hard");
    });

    it("retourne la valeur elle-même si inconnue", () => {
      expect(getDifficultyLabel("custom")).toBe("custom");
    });

    it("retourne 'Unknown' si undefined", () => {
      expect(getDifficultyLabel(undefined)).toBe("Unknown");
    });
  });

  describe("buildIngredientsData", () => {
    it("retourne tableau vide si ingredients null", () => {
      const result = buildIngredientsData(null, 1);

      expect(result).toEqual([]);
    });

    it("filtre les ingrédients sans nom", () => {
      const ingredients = [
        { ingredientName: "Flour", quantity: 200 },
        { ingredientName: "", quantity: 100 },
      ];

      const result = buildIngredientsData(ingredients, 1);

      expect(result).toHaveLength(1);
      expect(result[0].ingredient_name).toBe("Flour");
    });

    it("mappe correctement un ingrédient valide", () => {
      const ingredients = [
        {
          ingredientName: "Sugar",
          foodId: 123,
          quantity: 100,
          unit: "g",
          preparation: "fine",
        },
      ];

      const result = buildIngredientsData(ingredients, 5);

      expect(result[0]).toEqual({
        recipe_id: 5,
        food_id: 123,
        ingredient_name: "Sugar",
        quantity: 100,
        unit: "g",
        preparation: "fine",
        order_index: 1,
      });
    });

    it("ajoute l'order_index correct", () => {
      const ingredients = [
        { ingredientName: "Flour" },
        { ingredientName: "Sugar" },
      ];

      const result = buildIngredientsData(ingredients, 1);

      expect(result[0].order_index).toBe(1);
      expect(result[1].order_index).toBe(2);
    });

    it("convertit quantity en nombre", () => {
      const ingredients = [{ ingredientName: "Flour", quantity: "200" }];

      const result = buildIngredientsData(ingredients, 1);

      expect(typeof result[0].quantity).toBe("number");
      expect(result[0].quantity).toBe(200);
    });

    it("accepte ingredient_name en DB format", () => {
      const ingredients = [{ ingredient_name: "Butter" }];

      const result = buildIngredientsData(ingredients, 1);

      expect(result[0].ingredient_name).toBe("Butter");
    });
  });

  describe("buildInstructionsData", () => {
    it("retourne tableau vide si instructions null", () => {
      const result = buildInstructionsData(null, 1);

      expect(result).toEqual([]);
    });

    it("accepte tableau de strings", () => {
      const instructions = ["Mix all", "Bake"];

      const result = buildInstructionsData(instructions, 1);

      expect(result).toHaveLength(2);
      expect(result[0].instruction).toBe("Mix all");
      expect(result[1].instruction).toBe("Bake");
    });

    it("accepte tableau d'objets { instruction }", () => {
      const instructions = [
        { instruction: "Mix all" },
        { instruction: "Bake" },
      ];

      const result = buildInstructionsData(instructions, 1);

      expect(result).toHaveLength(2);
      expect(result[0].instruction).toBe("Mix all");
    });

    it("filtre les instructions vides", () => {
      const instructions = ["Mix all", "", "Bake"];

      const result = buildInstructionsData(instructions, 1);

      expect(result).toHaveLength(2);
      expect(result[0].instruction).toBe("Mix all");
      expect(result[1].instruction).toBe("Bake");
    });

    it("ajoute step_number correct", () => {
      const instructions = ["Step 1", "Step 2"];

      const result = buildInstructionsData(instructions, 1);

      expect(result[0].step_number).toBe(1);
      expect(result[1].step_number).toBe(2);
    });

    it("assigne recipe_id correct", () => {
      const instructions = ["Mix"];

      const result = buildInstructionsData(instructions, 99);

      expect(result[0].recipe_id).toBe(99);
    });

    it("trimme les espaces", () => {
      const instructions = ["  Mix all  "];

      const result = buildInstructionsData(instructions, 1);

      expect(result[0].instruction).toBe("Mix all");
    });
  });
});
