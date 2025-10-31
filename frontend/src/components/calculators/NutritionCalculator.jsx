import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { useNutrition } from "../../context/nutrition";
import "./NutritionCalculator.css";

export default function NutritionCalculator() {
  const { selectedFood, clearSelectedFood } = useNutrition();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(100); // Quantité par défaut: 100g
  const [allNutrients, setAllNutrients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAllNutrients = async () => {
      if (!selectedFood?.FoodID) return;

      try {
        setLoading(true);
        setError("");

        // Récupérer tous les nutriments pour cet aliment
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

        const sortedNutrients = (nutrients || []).sort((a, b) => {
          return a.nutrient_name.NutrientCode - b.nutrient_name.NutrientCode;
        });

        setAllNutrients(sortedNutrients);
      } catch (err) {
        setError("An unexpected error occurred");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (selectedFood) {
      fetchAllNutrients();
    }
  }, [selectedFood]);

  const handleGoToCatalogue = () => {
    navigate("/catalogue");
  };

  const handleClearFood = () => {
    clearSelectedFood();
    setAllNutrients([]);
    setQuantity(100);
  };

  const calculateNutrientValue = (baseValue, quantity) => {
    // Les valeurs dans la base sont pour 100g, on calcule selon la quantité
    return ((baseValue * quantity) / 100).toFixed(2);
  };

  // Grouper les nutriments par catégorie
  const groupNutrients = (nutrients) => {
    const groups = {
      energy: [],
      macronutrients: [],
      vitamins: [],
      minerals: [],
      other: [],
    };

    nutrients.forEach((nutrient) => {
      const code = nutrient.nutrient_name.NutrientCode;
      const name = nutrient.nutrient_name.NutrientName?.toLowerCase() || "";
      const symbol = nutrient.nutrient_name.NutrientSymbol?.toLowerCase() || "";

      if (code === 208) {
        // Énergie (calories)
        groups.energy.push(nutrient);
      } else if ([203, 204, 205, 291, 269].includes(code)) {
        // Protéines, lipides, glucides, fibres, sucres
        groups.macronutrients.push(nutrient);
      } else if (
        name.includes("vitamin") ||
        symbol.includes("vit") ||
        [401, 404, 405, 406, 410, 415, 418].includes(code)
      ) {
        // Vitamines
        groups.vitamins.push(nutrient);
      } else if ([301, 303, 304, 305, 306, 307, 309, 312, 315].includes(code)) {
        // Minéraux
        groups.minerals.push(nutrient);
      } else {
        groups.other.push(nutrient);
      }
    });

    return groups;
  };

  const groupedNutrients = groupNutrients(allNutrients);

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
          {/* Aliment sélectionné */}
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

          {/* Sélection de quantité */}
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

          {/* Résultats nutritionnels */}
          {loading && (
            <p className="loading-message">Loading nutritional data...</p>
          )}
          {error && <p className="error-message">{error}</p>}

          {!loading && !error && allNutrients.length > 0 && (
            <div className="nutrition-results">
              <h3>Nutritional Values for {quantity}g</h3>

              {/* Énergie */}
              {groupedNutrients.energy.length > 0 && (
                <div className="nutrient-group energy-group">
                  <h4>Energy</h4>
                  <div className="nutrients-grid">
                    {groupedNutrients.energy.map((nutrient, index) => (
                      <div key={index} className="nutrient-card energy">
                        <span className="nutrient-name">
                          {nutrient.nutrient_name.NutrientSymbol}
                        </span>
                        <span className="nutrient-value">
                          {calculateNutrientValue(
                            nutrient.NutrientValue,
                            quantity
                          )}{" "}
                          {nutrient.nutrient_name.NutrientUnit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Macronutriments */}
              {groupedNutrients.macronutrients.length > 0 && (
                <div className="nutrient-group macros-group">
                  <h4>Macronutrients</h4>
                  <div className="nutrients-grid">
                    {groupedNutrients.macronutrients.map((nutrient, index) => (
                      <div key={index} className="nutrient-card macro">
                        <span className="nutrient-name">
                          {nutrient.nutrient_name.NutrientSymbol}
                        </span>
                        <span className="nutrient-value">
                          {calculateNutrientValue(
                            nutrient.NutrientValue,
                            quantity
                          )}{" "}
                          {nutrient.nutrient_name.NutrientUnit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Vitamines */}
              {groupedNutrients.vitamins.length > 0 && (
                <div className="nutrient-group vitamins-group">
                  <h4>Vitamins</h4>
                  <div className="nutrients-grid">
                    {groupedNutrients.vitamins.map((nutrient, index) => (
                      <div key={index} className="nutrient-card vitamin">
                        <span className="nutrient-name">
                          {nutrient.nutrient_name.NutrientSymbol}
                        </span>
                        <span className="nutrient-value">
                          {calculateNutrientValue(
                            nutrient.NutrientValue,
                            quantity
                          )}{" "}
                          {nutrient.nutrient_name.NutrientUnit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Minéraux */}
              {groupedNutrients.minerals.length > 0 && (
                <div className="nutrient-group minerals-group">
                  <h4>Minerals</h4>
                  <div className="nutrients-grid">
                    {groupedNutrients.minerals.map((nutrient, index) => (
                      <div key={index} className="nutrient-card mineral">
                        <span className="nutrient-name">
                          {nutrient.nutrient_name.NutrientSymbol}
                        </span>
                        <span className="nutrient-value">
                          {calculateNutrientValue(
                            nutrient.NutrientValue,
                            quantity
                          )}{" "}
                          {nutrient.nutrient_name.NutrientUnit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Autres nutriments */}
              {groupedNutrients.other.length > 0 && (
                <div className="nutrient-group other-group">
                  <h4>Other Nutrients</h4>
                  <div className="nutrients-grid">
                    {groupedNutrients.other.map((nutrient, index) => (
                      <div key={index} className="nutrient-card other">
                        <span className="nutrient-name">
                          {nutrient.nutrient_name.NutrientSymbol}
                        </span>
                        <span className="nutrient-value">
                          {calculateNutrientValue(
                            nutrient.NutrientValue,
                            quantity
                          )}{" "}
                          {nutrient.nutrient_name.NutrientUnit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
