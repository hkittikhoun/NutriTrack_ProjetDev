import { describe, it, expect } from "vitest";
import {
  prefillFromCartToMealPlans,
  prefillFromCartToIngredients,
} from "./useCartPrefill";

describe("useCartPrefill", () => {
  describe("prefillFromCartToMealPlans", () => {
    it("retourne null avec un panier vide", () => {
      expect(prefillFromCartToMealPlans([])).toBeNull();
      expect(prefillFromCartToMealPlans(null)).toBeNull();
    });

    it("distribue les aliments dans les trois repas", () => {
      const cartFoods = [
        { foodId: "1", cartQuantity: 100, name: "Apple" },
        { foodId: "2", cartQuantity: 200, name: "Banana" },
        { foodId: "3", cartQuantity: 150, name: "Orange" },
      ];

      const result = prefillFromCartToMealPlans(cartFoods);

      expect(result.morning).toHaveLength(1);
      expect(result.lunch).toHaveLength(1);
      expect(result.dinner).toHaveLength(1);
    });

    it("alterne les repas correctement", () => {
      const cartFoods = [
        { foodId: "1", cartQuantity: 100, name: "Apple" },
        { foodId: "2", cartQuantity: 200, name: "Banana" },
        { foodId: "3", cartQuantity: 150, name: "Orange" },
        { foodId: "4", cartQuantity: 120, name: "Grape" },
      ];

      const result = prefillFromCartToMealPlans(cartFoods);

      expect(result.morning).toHaveLength(2);
      expect(result.lunch).toHaveLength(1);
      expect(result.dinner).toHaveLength(1);
    });

    it("préserve la quantité du panier", () => {
      const cartFoods = [{ foodId: "1", cartQuantity: 250, name: "Apple" }];

      const result = prefillFromCartToMealPlans(cartFoods);

      expect(result.morning[0].quantity).toBe(250);
    });

    it("convertit foodId en string", () => {
      const cartFoods = [{ foodId: 123, cartQuantity: 100, name: "Apple" }];

      const result = prefillFromCartToMealPlans(cartFoods);

      expect(typeof result.morning[0].foodId).toBe("string");
      expect(result.morning[0].foodId).toBe("123");
    });
  });

  describe("prefillFromCartToIngredients", () => {
    it("retourne null avec un panier vide", () => {
      expect(prefillFromCartToIngredients([])).toBeNull();
      expect(prefillFromCartToIngredients(null)).toBeNull();
    });

    it("crée un ingrédient par aliment du panier", () => {
      const cartFoods = [
        { foodId: "1", cartQuantity: 100, name: "Apple" },
        { foodId: "2", cartQuantity: 200, name: "Banana" },
      ];

      const result = prefillFromCartToIngredients(cartFoods);

      expect(result).toHaveLength(2);
    });

    it("affecte les bonnes propriétés aux ingrédients", () => {
      const cartFoods = [{ foodId: "123", cartQuantity: 150, name: "Flour" }];

      const result = prefillFromCartToIngredients(cartFoods);

      expect(result[0].foodId).toBe("123");
      expect(result[0].ingredientName).toBe("Flour");
      expect(result[0].quantity).toBe(150);
      expect(result[0].unit).toBe("g");
      expect(result[0].preparation).toBe("");
    });

    it("crée des ids uniques pour chaque ingrédient", () => {
      const cartFoods = [
        { foodId: "1", cartQuantity: 100, name: "Apple" },
        { foodId: "2", cartQuantity: 200, name: "Banana" },
      ];

      const result = prefillFromCartToIngredients(cartFoods);

      expect(result[0].id).not.toBe(result[1].id);
    });
  });
});
