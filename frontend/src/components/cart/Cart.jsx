import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import "./Cart.css";

export default function Cart({ isOpen, onClose, refreshTrigger }) {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const navigate = useNavigate();

  const totalKcal = useMemo(
    () =>
      cart
        .reduce(
          (acc, item) =>
            acc + Number(item.quantity || 0) * Number(item.kcal || 0),
          0
        )
        .toFixed(0),
    [cart]
  );

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: authData, error: authErr } = await supabase.auth.getUser();
      if (authErr) {
        setError("Failed to get user: " + authErr.message);
        setCart([]);
        return;
      }
      const userId = authData?.user?.id;
      if (!userId) {
        setCart([]);
        return;
      }

      const { data: rows, error: cartErr } = await supabase
        .from("cart_items")
        .select(
          `
          id,
          quantity,
          food:food_id(FoodID, FoodDescription)
        `
        )
        .eq("user_id", userId)
        .order("id", { ascending: true });

      if (cartErr) {
        setError("Failed to load cart: " + cartErr.message);
        setCart([]);
        return;
      }

      const items = rows || [];
      const foodIds = items.map((r) => r.food?.FoodID).filter(Boolean);

      if (foodIds.length === 0) {
        setCart([]);
        return;
      }

      const { data: energies, error: energyErr } = await supabase
        .from("nutrient_amount")
        .select(
          `
          FoodID,
          NutrientValue,
          nutrient_name!inner(NutrientCode)
        `
        )
        .in("FoodID", foodIds)
        .eq("nutrient_name.NutrientCode", 208);

      if (energyErr) {
        setError("Failed to load calorie values: " + energyErr.message);
        setCart([]);
        return;
      }

      const energyByFoodId = new Map();
      (energies || []).forEach((e) => {
        energyByFoodId.set(e.FoodID, e.NutrientValue);
      });

      const normalized = items.map((r) => ({
        id: r.id,
        foodId: r.food?.FoodID,
        name: r.food?.FoodDescription,
        quantity: r.quantity,
        kcal: energyByFoodId.get(r.food?.FoodID) ?? null,
      }));

      setCart(normalized);
    } catch (e) {
      console.error(e);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  useEffect(() => {
    if (isOpen) fetchCart();
  }, [isOpen]);

  useEffect(() => {
    if (refreshTrigger > 0) {
      fetchCart();
    }
  }, [refreshTrigger]);

  const clearCart = async () => {
    const ok = window.confirm("Clear your cart?");
    if (!ok) return;
    try {
      setLoading(true);
      setError(null);

      const { data: authData, error: authErr } = await supabase.auth.getUser();
      if (authErr) {
        setError("Failed to get user: " + authErr.message);
        return;
      }
      const userId = authData?.user?.id;
      if (!userId) return;

      const { error: delErr } = await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", userId);

      if (delErr) {
        setError("Failed to clear cart: " + delErr.message);
        return;
      }

      setCart([]);
      setNotice("Cart cleared.");
      setTimeout(() => setNotice(null), 2000);
    } catch (e) {
      console.error(e);
      setError("An unexpected error occurred while clearing cart");
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (id, askConfirm = true) => {
    try {
      setLoading(true);
      setError(null);

      if (askConfirm) {
        const ok = window.confirm("Remove this item from cart?");
        if (!ok) {
          return;
        }
      }

      const { error: delErr } = await supabase
        .from("cart_items")
        .delete()
        .eq("id", id);

      if (delErr) {
        setError("Failed to remove item: " + delErr.message);
        return;
      }

      setCart((prev) => prev.filter((i) => i.id !== id));
      setNotice("Item removed from cart.");
      setTimeout(() => setNotice(null), 2000);
    } catch (e) {
      console.error(e);
      setError("An unexpected error occurred while removing item");
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (id, delta) => {
    const item = cart.find((i) => i.id === id);
    if (!item) return;

    const nextQty = Number(item.quantity) + Number(delta);
    if (!Number.isFinite(nextQty)) return;

    if (nextQty <= 0) {
      await removeItem(id, false);
      return;
    }

    setCart((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: nextQty } : i))
    );
    try {
      setError(null);
      const { error: updErr } = await supabase
        .from("cart_items")
        .update({ quantity: nextQty })
        .eq("id", id);
      if (updErr) {
        setError("Failed to update quantity: " + updErr.message);
        fetchCart();
      }
    } catch (e) {
      console.error(e);
      setError("An unexpected error occurred while updating quantity");
      fetchCart();
    }
  };

  return isOpen ? (
    <div className="lmj-cart">
      <button
        className="lmj-cart-toggle-button"
        onClick={onClose}
        disabled={loading}
      >
        Close
      </button>

      {error && <p className="error-message">{error}</p>}
      {loading && <p className="loading-message">Loading...</p>}

      {!loading && cart.length > 0 ? (
        <div>
          <h2>Cart</h2>
          {notice && <div className="cart-notice success">{notice}</div>}
          <ul>
            {cart.map(({ id, name, quantity, kcal }) => (
              <li key={id} className="cart-item">
                <div className="cart-item-main">
                  <p className="cart-item-name">{name}</p>
                  <p className="cart-item-meta">
                    {kcal !== null ? `${kcal} kcal` : "—"}
                  </p>
                </div>
                <div className="cart-item-controls">
                  <button
                    className="qty-btn"
                    onClick={() => updateQuantity(id, -1)}
                    disabled={loading}
                    aria-label="Decrease quantity"
                    title="Decrease"
                  >
                    −
                  </button>
                  <span className="qty-value">{quantity}</span>
                  <button
                    className="qty-btn"
                    onClick={() => updateQuantity(id, +1)}
                    disabled={loading}
                    aria-label="Increase quantity"
                    title="Increase"
                  >
                    +
                  </button>
                  <button
                    className="remove-btn"
                    onClick={() => removeItem(id)}
                    disabled={loading}
                    aria-label="Remove item"
                    title="Remove"
                  >
                    <span className="icon" aria-hidden="true">
                      🗑️
                    </span>
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <h3>Total: {totalKcal} kcal</h3>
          <button
            onClick={() => navigate("/mealplan?tab=create")}
            disabled={loading || cart.length === 0}
          >
            Create your meal plan
          </button>
          <button
            onClick={() => navigate("/recipe?tab=create")}
            disabled={loading || cart.length === 0}
          >
            Create a recipe
          </button>
          <button onClick={clearCart} disabled={loading}>
            Clear cart
          </button>
        </div>
      ) : (
        !loading && <div>Your cart is empty</div>
      )}
    </div>
  ) : null;
}
