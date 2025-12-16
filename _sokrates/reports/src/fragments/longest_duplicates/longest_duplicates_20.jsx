frontend/src/components/mealPlan/SavedPlans.jsx [25:33]:
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
          .order("created_at", { ascending: false });

        if (viewMode === "mine" && auth?.userId) {
          query = query.eq("user_id", auth.userId);
        }

        const { data, error } = await query;

        if (error) {
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -



frontend/src/components/recipe/SavedRecipe.jsx [28:35]:
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
          .order("created_at", { ascending: false });

        if (viewMode === "mine" && auth?.userId) {
          query = query.eq("user_id", auth.userId);
        }

        const { data, error } = await query;
        if (error) {
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -



