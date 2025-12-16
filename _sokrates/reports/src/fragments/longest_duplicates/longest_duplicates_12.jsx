frontend/src/components/mealPlan/DailyPlan.jsx [53:58]:
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    const mapped = prefillFromCartToMealPlans(cartFoods);
    if (!mapped) {
      setNotice("No items in cart to prefill.");
      setTimeout(() => setNotice(null), 2000);
      return;
    }
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -



frontend/src/components/mealPlan/SavedPlanDetails.jsx [152:157]:
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    const mapped = prefillFromCartToMealPlans(cartFoods);
    if (!mapped) {
      setNotice("No items in cart to prefill.");
      setTimeout(() => setNotice(null), 2000);
      return;
    }
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -



