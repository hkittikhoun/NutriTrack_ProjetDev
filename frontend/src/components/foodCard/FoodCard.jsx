import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { AuthContext } from "../../context/auth-context";
import { CartContext } from "../../context/cart-context";
import { useNutrition } from "../../context/nutrition.jsx";
import "./FoodCard.css";

export default function FoodCard({ food }) {
  const { FoodDescription, nutrients } = food;
  const navigate = useNavigate();
  const { setSelectedFood } = useNutrition();
  const auth = useContext(AuthContext);
  const { refreshCart } = useContext(CartContext);

  const handleUseInCalculator = () => {
    setSelectedFood(food);
    navigate("/calculatrice?tab=nutrition");
  };

  const handleAddToCart = async () => {
    try {
      if (!auth.isLoggedIn || !auth.userId) {
        alert("Veuillez vous connecter pour ajouter au panier.");
        navigate("/login");
        return;
      }

      const quantity = 1;

      const { error } = await supabase.from("cart_items").insert({
        user_id: auth.userId,
        food_id: food.FoodID,
        quantity,
      });

      if (error) {
        if (error.code === "23505") {
          const { data: existing, error: selErr } = await supabase
            .from("cart_items")
            .select("id, quantity")
            .eq("user_id", auth.userId)
            .eq("food_id", food.FoodID)
            .single();

          if (selErr || !existing) {
            console.error("Failed to fetch existing cart item:", selErr);
            alert("Impossible d'ajouter au panier.");
            return;
          }

          const { error: updErr } = await supabase
            .from("cart_items")
            .update({ quantity: existing.quantity + quantity })
            .eq("id", existing.id);

          if (updErr) {
            console.error("Failed to increment quantity:", updErr);
            alert("Impossible de mettre à jour la quantité.");
            return;
          }

          alert("Quantité augmentée dans le panier.");
          refreshCart();
          return;
        }

        console.error("Add to cart failed:", error);
        alert("Impossible d'ajouter au panier: " + error.message);
        return;
      }

      alert("Ajouté au panier.");
      refreshCart();
    } catch (e) {
      console.error(e);
      alert("Une erreur inattendue s'est produite.");
    }
  };

  return (
    <div className="food-card">
      <h3 className="food-title">{FoodDescription}</h3>
      <div className="nutrients">
        {nutrients && nutrients.length > 0 ? (
          nutrients.map((nutrient, index) => (
            <div key={index} className="nutrient">
              <span className="nutrient-symbol">{nutrient.NutrientSymbol}</span>
              <span className="nutrient-value">
                {nutrient.NutrientValue} {nutrient.NutrientUnit}
              </span>
            </div>
          ))
        ) : (
          <div className="nutrient">
            <span className="nutrient-symbol">N/A</span>
            <span className="nutrient-value">No data</span>
          </div>
        )}
      </div>
      <div className="food-card-actions">
        <button className="calculator-btn" onClick={handleUseInCalculator}>
          <span className="btn-text">Use in Calculator</span>
        </button>
        <button className="cart-btn" onClick={handleAddToCart}>
          <span className="btn-text">Add to Cart</span>
        </button>
      </div>
    </div>
  );
}
