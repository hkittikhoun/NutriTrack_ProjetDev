import { describe, it, expect } from "vitest";
import { mapItemsToEditMealPlans, mergeCartWithCatalogue } from "./mapUtils";

describe("mapUtils", () => {
  describe("mapItemsToEditMealPlans", () => {
    it("retourne les trois repas vides avec null", () => {
      const result = mapItemsToEditMealPlans(null);

      expect(result).toEqual({
        morning: [],
        lunch: [],
        dinner: [],
      });
    });

    it("retourne les trois repas vides avec tableau vide", () => {
      const result = mapItemsToEditMealPlans([]);

      expect(result).toEqual({
        morning: [],
        lunch: [],
        dinner: [],
      });
    });

    it("mappe un seul élément au type de repas fourni", () => {
      const items = [
        {
          id: 1,
          food_id: 123,
          quantity: 100,
          meal_type: "lunch",
        },
      ];

      const result = mapItemsToEditMealPlans(items);

      expect(result.lunch).toHaveLength(1);
      expect(result.lunch[0].id).toBe(1);
      expect(result.lunch[0].foodId).toBe("123");
      expect(result.lunch[0].quantity).toBe(100);
    });

    it("utilise 'morning' comme défaut si meal_type manquant", () => {
      const items = [
        {
          id: 1,
          food_id: 123,
          quantity: 100,
        },
      ];

      const result = mapItemsToEditMealPlans(items);

      expect(result.morning).toHaveLength(1);
      expect(result.lunch).toHaveLength(0);
    });

    it("convertit food_id en string", () => {
      const items = [
        {
          id: 1,
          food_id: 456,
          quantity: 100,
          meal_type: "dinner",
        },
      ];

      const result = mapItemsToEditMealPlans(items);

      expect(typeof result.dinner[0].foodId).toBe("string");
      expect(result.dinner[0].foodId).toBe("456");
    });

    it("utilise 1 comme quantité par défaut", () => {
      const items = [
        {
          id: 1,
          food_id: 123,
          meal_type: "morning",
        },
      ];

      const result = mapItemsToEditMealPlans(items);

      expect(result.morning[0].quantity).toBe(1);
    });

    it("mappe plusieurs éléments dans différents repas", () => {
      const items = [
        { id: 1, food_id: 100, quantity: 50, meal_type: "morning" },
        { id: 2, food_id: 200, quantity: 150, meal_type: "lunch" },
        { id: 3, food_id: 300, quantity: 200, meal_type: "dinner" },
      ];

      const result = mapItemsToEditMealPlans(items);

      expect(result.morning).toHaveLength(1);
      expect(result.lunch).toHaveLength(1);
      expect(result.dinner).toHaveLength(1);
    });

    it("ignore les éléments avec meal_type invalide", () => {
      const items = [
        { id: 1, food_id: 100, quantity: 50, meal_type: "breakfast" },
      ];

      const result = mapItemsToEditMealPlans(items);

      expect(result.morning).toHaveLength(0);
      expect(result.lunch).toHaveLength(0);
      expect(result.dinner).toHaveLength(0);
    });
  });

  describe("mergeCartWithCatalogue", () => {
    it("retourne le catalogue seul si panier vide", () => {
      const foods = [
        { FoodID: 1, FoodDescription: "Apple" },
        { FoodID: 2, FoodDescription: "Banana" },
      ];

      const result = mergeCartWithCatalogue([], foods);

      expect(result).toHaveLength(2);
      expect(result[0].FoodDescription).toBe("Apple");
      expect(result[1].FoodDescription).toBe("Banana");
    });

    it("retourne le panier seul si catalogue vide", () => {
      const cartFoods = [
        { foodId: 1, name: "Orange" },
        { foodId: 2, name: "Grape" },
      ];

      const result = mergeCartWithCatalogue(cartFoods, []);

      expect(result).toHaveLength(2);
      expect(result[0]._fromCart).toBe(true);
      expect(result[0].FoodDescription).toBe("Orange");
    });

    it("fusionne panier et catalogue sans doublons", () => {
      const cartFoods = [
        { foodId: 1, name: "Apple" },
        { foodId: 2, name: "Banana" },
      ];
      const foods = [
        { FoodID: 1, FoodDescription: "Apple" },
        { FoodID: 3, FoodDescription: "Orange" },
      ];

      const result = mergeCartWithCatalogue(cartFoods, foods);

      expect(result).toHaveLength(3);
      expect(result[0]._fromCart).toBe(true);
      expect(result[1]._fromCart).toBe(true);
      expect(result[2]._fromCart).toBeUndefined();
    });

    it("marque les articles du panier avec _fromCart", () => {
      const cartFoods = [{ foodId: 1, name: "Apple" }];

      const result = mergeCartWithCatalogue(cartFoods, []);

      expect(result[0]._fromCart).toBe(true);
    });

    it("ne marque pas les articles du catalogue", () => {
      const foods = [{ FoodID: 1, FoodDescription: "Apple" }];

      const result = mergeCartWithCatalogue([], foods);

      expect(result[0]._fromCart).toBeUndefined();
    });

    it("évite les doublons avec des foodId numériques et string", () => {
      const cartFoods = [{ foodId: 1, name: "Apple" }];
      const foods = [{ FoodID: "1", FoodDescription: "Apple" }];

      const result = mergeCartWithCatalogue(cartFoods, foods);

      expect(result).toHaveLength(1);
    });

    it("gère null pour cartFoods", () => {
      const foods = [{ FoodID: 1, FoodDescription: "Apple" }];

      const result = mergeCartWithCatalogue(null, foods);

      expect(result).toHaveLength(1);
      expect(result[0].FoodDescription).toBe("Apple");
    });

    it("gère undefined pour foods", () => {
      const cartFoods = [{ foodId: 1, name: "Apple" }];

      const result = mergeCartWithCatalogue(cartFoods, undefined);

      expect(result).toHaveLength(1);
      expect(result[0]._fromCart).toBe(true);
    });
  });
});
