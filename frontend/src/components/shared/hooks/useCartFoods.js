/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";

export function useCartFoods() {
  const [cartFoods, setCartFoods] = useState([]);
  const [loadingCart, setLoadingCart] = useState(false);
  const [cartError, setCartError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoadingCart(true);
        setCartError(null);
        const { data: authData, error: authErr } =
          await supabase.auth.getUser();
        if (authErr) {
          setCartFoods([]);
          return;
        }
        const userId = authData?.user?.id;
        if (!userId) {
          setCartFoods([]);
          return;
        }

        const { data: rows, error: cartErr } = await supabase
          .from("cart_items")
          .select(`id, quantity, food:food_id(FoodID, FoodDescription)`)
          .eq("user_id", userId)
          .order("id", { ascending: true });

        if (cartErr) {
          setCartError(cartErr.message);
          setCartFoods([]);
          return;
        }

        const items = (rows || [])
          .filter((r) => r.food && r.food.FoodID)
          .map((r) => ({
            id: r.id,
            foodId: String(r.food.FoodID),
            name: r.food.FoodDescription,
            cartQuantity: r.quantity,
          }));

        if (!cancelled) setCartFoods(items);
      } catch (e) {
        if (!cancelled) setCartError("Failed to load cart");
      } finally {
        if (!cancelled) setLoadingCart(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { cartFoods, loadingCart, cartError };
}
