import { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import FoodCard from "../foodCard/FoodCard";
import "./Catalogue.css";

export default function Catalogue() {
  const [foodGroups, setFoodGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchFoodGroups() {
      try {
        setError(null);
        const { data, error: fetchError } = await supabase
          .from("food_group")
          .select("FoodGroupID, FoodGroupName")
          .order("FoodGroupName");
        if (fetchError) {
          setError("Failed to load food groups: " + fetchError.message);
          console.error("Supabase error:", fetchError);
          return;
        }
        setFoodGroups(data || []);
      } catch (err) {
        setError("An unexpected error occurred");
        console.error("Unexpected error:", err);
      }
    }
    fetchFoodGroups();
  }, []);

  useEffect(() => {
    if (!selectedGroup) {
      setFoods([]);
      return;
    }
    async function fetchFoods() {
      try {
        setLoading(true);
        setError(null);
        const { data: foodsWithNutrients, error: fetchError } = await supabase
          .from("food_name")
          .select(
            `
            FoodID,
            FoodDescription,
            nutrient_amount!inner(
              NutrientValue,
              nutrient_name!inner(NutrientSymbol, NutrientUnit, NutrientCode)
            )
          `
          )
          .eq("FoodGroupID", selectedGroup)
          .in("nutrient_amount.nutrient_name.NutrientCode", [203, 204, 208]);
        if (fetchError) {
          setError("Failed to load foods: " + fetchError.message);
          setLoading(false);
          return;
        }

        const foodsMap = new Map();
        foodsWithNutrients?.forEach((item) => {
          const foodId = item.FoodID;
          if (!foodsMap.has(foodId)) {
            foodsMap.set(foodId, {
              FoodID: item.FoodID,
              FoodDescription: item.FoodDescription,
              nutrients: [],
            });
          }
          item.nutrient_amount.forEach((nutrient) => {
            foodsMap.get(foodId).nutrients.push({
              NutrientSymbol: nutrient.nutrient_name.NutrientSymbol,
              NutrientUnit: nutrient.nutrient_name.NutrientUnit,
              NutrientValue: nutrient.NutrientValue,
            });
          });
        });

        setFoods(Array.from(foodsMap.values()));
        setLoading(false);
      } catch (err) {
        setError("An unexpected error occurred while loading foods");
        setLoading(false);
        console.error("Unexpected error:", err);
      }
    }
    fetchFoods();
  }, [selectedGroup]);

  return (
    <div className="catalogue-container">
      <h1>Food Catalogue</h1>

      <div className="dropdown-container">
        <label htmlFor="food-group-select">Choose a food group:</label>
        <select
          id="food-group-select"
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
        >
          <option value="">-- Select a group --</option>
          {foodGroups.map((group) => (
            <option key={group.FoodGroupID} value={group.FoodGroupID}>
              {group.FoodGroupName}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="error-message">{error}</p>}
      {loading && <p className="loading-message">Loading foods...</p>}

      {!loading && !error && foods.length === 0 && selectedGroup && (
        <p className="no-data-message">No foods found for this group.</p>
      )}

      <div className="foods-list">
        {foods.map((food) => (
          <FoodCard key={food.FoodID} food={food} />
        ))}
      </div>
    </div>
  );
}
