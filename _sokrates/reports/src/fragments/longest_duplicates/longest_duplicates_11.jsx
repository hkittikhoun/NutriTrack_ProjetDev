frontend/src/components/mealPlan/DailyPlan.jsx [1:6]:
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { AuthContext } from "../../context/auth-context";
import { usePrefillAuthor } from "../shared/hooks/usePrefillAuthors";
import { useCartFoods } from "../shared/hooks/useCartFoods";
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -



frontend/src/components/recipe/CreateRecipe.jsx [1:6]:
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { AuthContext } from "../../context/auth-context";
import { usePrefillAuthor } from "../shared/hooks/usePrefillAuthors";
import { useCartFoods } from "../shared/hooks/useCartFoods";
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -



