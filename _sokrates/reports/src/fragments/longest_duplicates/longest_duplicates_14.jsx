frontend/src/components/mealPlan/SavedPlanDetails.jsx [55:60]:
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
          .from("meal_plan_items")
          .select(
            "id, food_id, quantity, meal_type, food:food_id(FoodID, FoodDescription)"
          )
          .eq("meal_plan_id", id)
          .order("id", { ascending: true });
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -



frontend/src/components/mealPlan/SavedPlanDetails.jsx [246:251]:
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        .from("meal_plan_items")
        .select(
          "id, food_id, quantity, meal_type, food:food_id(FoodID, FoodDescription)"
        )
        .eq("meal_plan_id", id)
        .order("id", { ascending: true });
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -



