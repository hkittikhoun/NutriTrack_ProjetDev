import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { useNutrition } from "../../context/nutrition";
import { NutrientSection } from "./NutrientSection";
import "./NutritionCalculator.css";

export default function NutritionCalculator() {
  const { selectedFood, clearSelectedFood } = useNutrition();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(100);
  const [allNutrients, setAllNutrients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAllNutrients = async () => {
      if (!selectedFood?.FoodID) return;
      try {
        setLoading(true);
        setError("");
        const { data: nutrients, error: nutrientsError } = await supabase
          .from("nutrient_amount")
          .select(
            `
            NutrientValue,
            nutrient_name!inner(
              NutrientSymbol,
              NutrientUnit,
              NutrientName,
              NutrientCode
            )
          `
          )
          .eq("FoodID", selectedFood.FoodID);
        if (nutrientsError) {
          setError("Failed to load nutrients: " + nutrientsError.message);
          return;
        }
        const sorted = (nutrients || []).sort(
          (a, b) => a.nutrient_name.NutrientCode - b.nutrient_name.NutrientCode
        );
        setAllNutrients(sorted);
      } catch (err) {
        setError("An unexpected error occurred");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };
    if (selectedFood) fetchAllNutrients();
  }, [selectedFood]);

  const handleGoToCatalogue = () => navigate("/catalogue");
  const handleClearFood = () => {
    clearSelectedFood();
    setAllNutrients([]);
    setQuantity(100);
  };

  const calculateNutrientValue = (baseValue, qty) =>
    ((baseValue * qty) / 100).toFixed(2);

  const groupNutrients = (nutrients) => {
    const groups = {
      energy: [],
      macronutrients: [],
      vitamins: [],
      minerals: [],
      other: [],
    };
    nutrients.forEach((n) => {
      const code = n.nutrient_name.NutrientCode;
      const name = n.nutrient_name.NutrientName?.toLowerCase() || "";
      const symbol = n.nutrient_name.NutrientSymbol?.toLowerCase() || "";
      if (code === 208) {
        groups.energy.push(n);
      } else if ([203, 204, 205, 291, 269].includes(code)) {
        groups.macronutrients.push(n);
      } else if (
        name.includes("vitamin") ||
        symbol.includes("vit") ||
        [401, 404, 405, 406, 410, 415, 418].includes(code)
      ) {
        groups.vitamins.push(n);
      } else if ([301, 303, 304, 305, 306, 307, 309, 312, 315].includes(code)) {
        groups.minerals.push(n);
      } else {
        groups.other.push(n);
      }
    });
    return groups;
  };

  const grouped = groupNutrients(allNutrients);

  return (
    <div className="nutrition-calculator-container">
      <h1>Nutrition Calculator</h1>
      <p className="calculator-description">
        Select a food from the catalogue and calculate its nutritional values
        for a specific quantity
      </p>

      {!selectedFood ? (
        <div className="no-food-selected">
          <div className="selection-card">
            <h3>No Food Selected</h3>
            <p>
              Please select a food from the catalogue to calculate its
              nutritional values.
            </p>
            <button onClick={handleGoToCatalogue} className="catalogue-btn">
              Go to Catalogue
            </button>
          </div>
        </div>
      ) : (
        <div className="calculator-content">
          <div className="selected-food-section">
            <h3>Selected Food</h3>
            <div className="selected-food-card">
              <h4>{selectedFood.FoodDescription}</h4>
              <div className="food-actions">
                <button
                  onClick={handleGoToCatalogue}
                  className="change-food-btn"
                >
                  Change Food
                </button>
                <button onClick={handleClearFood} className="clear-food-btn">
                  Clear
                </button>
              </div>
            </div>
          </div>

          <div className="quantity-section">
            <h3>Quantity</h3>
            <div className="quantity-input-container">
              <label htmlFor="quantity">Quantity (grams):</label>
              <input
                type="number"
                id="quantity"
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(0, parseFloat(e.target.value) || 0))
                }
                min="0"
                step="0.1"
                placeholder="Enter quantity in grams"
              />
              <span className="quantity-unit">g</span>
            </div>
          </div>

          {loading && (
            <p className="loading-message">Loading nutritional data...</p>
          )}
          {error && <p className="error-message">{error}</p>}

          {!loading && !error && allNutrients.length > 0 && (
            <div className="nutrition-results">
              <h3>Nutritional Values for {quantity}g</h3>

              <NutrientSection
                title="Energy"
                className="energy-group"
                nutrients={grouped.energy}
                quantity={quantity}
                calculate={calculateNutrientValue}
              />
              <NutrientSection
                title="Macronutrients"
                className="macros-group"
                nutrients={grouped.macronutrients}
                quantity={quantity}
                calculate={calculateNutrientValue}
              />
              <NutrientSection
                title="Vitamins"
                className="vitamins-group"
                nutrients={grouped.vitamins}
                quantity={quantity}
                calculate={calculateNutrientValue}
              />
              <NutrientSection
                title="Minerals"
                className="minerals-group"
                nutrients={grouped.minerals}
                quantity={quantity}
                calculate={calculateNutrientValue}
              />
              <NutrientSection
                title="Other Nutrients"
                className="other-group"
                nutrients={grouped.other}
                quantity={quantity}
                calculate={calculateNutrientValue}
              />
            </div>
          )}

          {!loading && !error && allNutrients.length === 0 && selectedFood && (
            <p className="no-data-message">
              No nutritional data available for this food.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
