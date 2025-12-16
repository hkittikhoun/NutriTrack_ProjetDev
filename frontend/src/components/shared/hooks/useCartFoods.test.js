import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useCartFoods } from "./useCartFoods";

vi.mock("../../../supabaseClient", () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  },
}));

import { supabase } from "../../../supabaseClient";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useCartFoods", () => {
  it("retourne un panier vide au chargement initial", async () => {
    supabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    const { result } = renderHook(() => useCartFoods());
    
    await waitFor(() => {
      expect(result.current.loadingCart).toBe(false);
    });

    expect(result.current.cartFoods).toEqual([]);
    expect(result.current.cartError).toBeNull();
  });

  it("retourne une erreur si getUser échoue", async () => {
    supabase.auth.getUser.mockResolvedValue({
      data: null,
      error: { message: "Auth error" },
    });

    const { result } = renderHook(() => useCartFoods());

    await waitFor(() => {
      expect(result.current.loadingCart).toBe(false);
    });

    expect(result.current.cartFoods).toEqual([]);
  });

  it("charge les aliments du panier", async () => {
    const mockCartData = [
      {
        id: 1,
        quantity: 100,
        food: { FoodID: "123", FoodDescription: "Apple" },
      },
      {
        id: 2,
        quantity: 200,
        food: { FoodID: "456", FoodDescription: "Banana" },
      },
    ];

    supabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "user1" } },
      error: null,
    });

    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: mockCartData,
            error: null,
          }),
        }),
      }),
    });

    const { result } = renderHook(() => useCartFoods());

    await waitFor(() => {
      expect(result.current.loadingCart).toBe(false);
    });

    expect(result.current.cartFoods).toHaveLength(2);
    expect(result.current.cartFoods[0].name).toBe("Apple");
    expect(result.current.cartFoods[1].name).toBe("Banana");
  });

  it("affiche une erreur si la requête Supabase échoue", async () => {
    supabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "user1" } },
      error: null,
    });

    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: null,
            error: { message: "Database error" },
          }),
        }),
      }),
    });

    const { result } = renderHook(() => useCartFoods());

    await waitFor(() => {
      expect(result.current.loadingCart).toBe(false);
    });

    expect(result.current.cartError).toBe("Database error");
    expect(result.current.cartFoods).toEqual([]);
  });
});
