frontend/src/components/cart/Cart.jsx [43:50]:
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        .from("cart_items")
        .select(
          `
          id,
          quantity,
          food:food_id(FoodID, FoodDescription)
        `
        )
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -



frontend/src/components/recipe/SavedRecipeDetails.jsx [119:126]:
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
              .from("cart_items")
              .select(
                `
                id,
                quantity,
                food:food_id(FoodID, FoodDescription)
              `
              )
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -



