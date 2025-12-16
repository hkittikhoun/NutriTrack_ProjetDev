import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import SavedPlanDetails from "./SavedPlanDetails";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AuthContext } from "../../context/auth-context";

// Mock de navigate
const navigateMock = vi.fn();
vi.mock("react-router-dom", async (orig) => {
  const actual = await orig();
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

// File d'attente de réponses pour le mock Supabase
const nextResponses = [];
const pushResponse = (resp) => nextResponses.push(resp);
const popResponse = () => nextResponses.shift() || {};

// Mock des hooks
let currentCart = { cartFoods: [], loadingCart: false, cartError: null };
vi.mock("../shared/hooks/useCartFoods", () => ({
  useCartFoods: () => currentCart,
}));

vi.mock("../shared/hooks/useCartPrefill", () => ({
  prefillFromCartToMealPlans: (cartFoods) => {
    if (!cartFoods || cartFoods.length === 0) return null;
    return {
      morning: cartFoods.map((f) => ({
        id: Date.now() + Math.random(),
        foodId: String(f.id || f.food_id || ""),
        quantity: Number(f.quantity || 100),
        mealType: "morning",
      })),
      lunch: [],
      dinner: [],
    };
  },
}));

vi.mock("../shared/mealPlan/mapUtils", () => ({
  mapItemsToEditMealPlans: (items) => {
    if (!items || items.length === 0) {
      return { morning: [], lunch: [], dinner: [] };
    }
    const result = { morning: [], lunch: [], dinner: [] };
    items.forEach((item) => {
      if (result[item.meal_type]) {
        result[item.meal_type].push({
          id: item.id,
          foodId: String(item.food_id || ""),
          quantity: item.quantity,
          mealType: item.meal_type,
        });
      }
    });
    return result;
  },
}));

// Mock MealPlanEditor
vi.mock("../shared/mealPlan/MealPlanEditor", () => ({
  MealPlanEditor: ({
    mealPlans,
    addItemToMeal,
    removeItemFromMeal,
    updateMealItem,
    onPrefillFromCart,
    titleProps,
    saveProps,
    onCancel,
  }) => (
    <div data-testid="meal-plan-editor">
      <input
        aria-label="Edit Titre"
        value={titleProps.title}
        onChange={(e) => titleProps.setTitle(e.target.value)}
      />
      <input
        aria-label="Edit Auteur"
        value={titleProps.author}
        onChange={(e) => titleProps.setAuthor(e.target.value)}
      />
      <button onClick={() => saveProps.onSave()}>Enregistrer</button>
      <button onClick={onCancel}>Annuler Edit</button>
      <button onClick={() => onPrefillFromCart()}>Préremplir panier</button>
    </div>
  ),
}));

// Mock Supabase
vi.mock("../../supabaseClient", () => ({
  supabase: {
    from: (table) => ({
      select: () => ({
        eq: (col, val) => ({
          single: () => Promise.resolve(popResponse()),
          order: () => Promise.resolve(popResponse()),
          in: () => ({ eq: () => Promise.resolve(popResponse()) }),
        }),
        in: () => ({
          eq: () => Promise.resolve(popResponse()),
        }),
        order: () => Promise.resolve(popResponse()),
      }),
      update: () => ({
        eq: (col, val) => ({
          eq: (col2, val2) => Promise.resolve(popResponse()),
        }),
      }),
      delete: () => ({
        eq: () => Promise.resolve(popResponse()),
      }),
      insert: () => Promise.resolve(popResponse()),
    }),
  },
}));

const renderWithProviders = (auth = { userId: "user-1" }) => {
  return render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter initialEntries={["/plans/plan-1"]}>
        <Routes>
          <Route path="/plans/:id" element={<SavedPlanDetails />} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
};

beforeEach(() => {
  nextResponses.length = 0;
  currentCart = { cartFoods: [], loadingCart: false, cartError: null };
  navigateMock.mockClear();
});

describe("SavedPlanDetails", () => {
  it("affiche le titre et les informations du plan", async () => {
    // Commentaire: Fournir les réponses Supabase pour le chargement du plan
    pushResponse({
      data: {
        id: "plan-1",
        title: "Monday Meals",
        author: "Chef",
        total_kcal: 2000,
        status: "daily",
        created_at: "2024-01-01T10:00:00",
        user_id: "user-1",
      },
      error: null,
    });
    // Items vides
    pushResponse({ data: [], error: null });
    // Foods disponibles
    pushResponse({
      data: [
        { FoodID: 1, FoodDescription: "Apple" },
        { FoodID: 2, FoodDescription: "Bread" },
      ],
      error: null,
    });

    renderWithProviders();

    // Commentaire: Vérifie le rendu du titre et des informations du plan
    await waitFor(() => {
      expect(screen.getByText(/Monday Meals/i)).toBeInTheDocument();
      expect(screen.getByText(/Chef/i)).toBeInTheDocument();
      expect(screen.getByText(/2000 kcal/i)).toBeInTheDocument();
    });
  });

  it("affiche le badge 'Your plan' si l'utilisateur est propriétaire", async () => {
    // Commentaire: Mêmes réponses que le test précédent
    pushResponse({
      data: {
        id: "plan-1",
        title: "Test Plan",
        author: "Me",
        total_kcal: 1500,
        status: "daily",
        created_at: "2024-01-01T10:00:00",
        user_id: "user-1",
      },
      error: null,
    });
    pushResponse({ data: [], error: null });
    pushResponse({
      data: [{ FoodID: 1, FoodDescription: "Banana" }],
      error: null,
    });

    renderWithProviders({ userId: "user-1" });

    // Commentaire: Vérifie la présence du badge propriétaire
    await waitFor(() => {
      expect(screen.getByText(/Your plan/i)).toBeInTheDocument();
    });
  });

  it("n'affiche pas le badge si l'utilisateur n'est pas propriétaire", async () => {
    // Commentaire: Propriétaire différent
    pushResponse({
      data: {
        id: "plan-1",
        title: "Someone Else's Plan",
        author: "Other",
        total_kcal: 1800,
        status: "daily",
        created_at: "2024-01-01T10:00:00",
        user_id: "user-2",
      },
      error: null,
    });
    pushResponse({ data: [], error: null });

    renderWithProviders({ userId: "user-1" });

    // Commentaire: Vérifie l'absence du badge
    await waitFor(() => {
      expect(screen.queryByText(/Your plan/i)).not.toBeInTheDocument();
    });
  });

  it("affiche les items du plan par type de repas", async () => {
    // Commentaire: Fournir un plan avec des items
    pushResponse({
      data: {
        id: "plan-1",
        title: "Full Plan",
        author: "Chef",
        total_kcal: 2500,
        status: "daily",
        created_at: "2024-01-01T10:00:00",
        user_id: "user-1",
      },
      error: null,
    });
    // Items avec données de nourriture
    pushResponse({
      data: [
        {
          id: 1,
          food_id: 10,
          quantity: 200,
          meal_type: "morning",
          food: { FoodID: 10, FoodDescription: "Oatmeal" },
        },
        {
          id: 2,
          food_id: 11,
          quantity: 300,
          meal_type: "lunch",
          food: { FoodID: 11, FoodDescription: "Chicken Salad" },
        },
      ],
      error: null,
    });
    // Foods pour édition (query avec .order())
    pushResponse({
      data: [
        { FoodID: 10, FoodDescription: "Oatmeal" },
        { FoodID: 11, FoodDescription: "Chicken Salad" },
      ],
      error: null,
    });

    renderWithProviders();

    // Commentaire: Vérifie l'affichage des items par repas
    await waitFor(() => {
      expect(screen.getByText(/Oatmeal/i)).toBeInTheDocument();
      expect(screen.getByText(/Chicken Salad/i)).toBeInTheDocument();
      expect(screen.getByText(/🌅 Morning/i)).toBeInTheDocument();
      expect(screen.getByText(/🌞 Lunch/i)).toBeInTheDocument();
    });
  });

  it("passe en mode édition lorsqu'on clique sur Edit", async () => {
    // Commentaire: Charger un plan éditable
    pushResponse({
      data: {
        id: "plan-1",
        title: "Edit Test",
        author: "Me",
        total_kcal: 2000,
        status: "daily",
        created_at: "2024-01-01T10:00:00",
        user_id: "user-1",
      },
      error: null,
    });
    pushResponse({ data: [], error: null });
    pushResponse({
      data: [{ FoodID: 1, FoodDescription: "Apple" }],
      error: null,
    });

    renderWithProviders({ userId: "user-1" });

    // Commentaire: Cliquer sur Edit
    await waitFor(() => {
      fireEvent.click(screen.getByText(/^Edit$/i));
    });

    // Commentaire: Vérifie que l'éditeur de plan apparaît
    await waitFor(() => {
      expect(screen.getByTestId("meal-plan-editor")).toBeInTheDocument();
    });
  });

  it("annule l'édition et retourne à la vue normale", async () => {
    // Commentaire: Charger et lancer le mode édition
    pushResponse({
      data: {
        id: "plan-1",
        title: "Cancel Test",
        author: "Me",
        total_kcal: 1500,
        status: "daily",
        created_at: "2024-01-01T10:00:00",
        user_id: "user-1",
      },
      error: null,
    });
    pushResponse({ data: [], error: null });
    pushResponse({
      data: [{ FoodID: 1, FoodDescription: "Apple" }],
      error: null,
    });

    renderWithProviders({ userId: "user-1" });

    // Commentaire: Cliquer sur Edit et ensuite sur Annuler Edit
    await waitFor(() => {
      fireEvent.click(screen.getByText(/^Edit$/i));
    });

    await waitFor(() => {
      fireEvent.click(screen.getByText(/Annuler Edit/i));
    });

    // Commentaire: Vérifie le retour à la vue normale
    await waitFor(() => {
      expect(screen.getByText(/^Edit$/i)).toBeInTheDocument();
    });
  });

  it("affiche un message d'erreur si le plan n'existe pas", async () => {
    // Commentaire: Fournir une erreur lors du chargement
    pushResponse({
      data: null,
      error: { message: "Plan not found" },
    });

    renderWithProviders();

    // Commentaire: Vérifie le message d'erreur
    await waitFor(() => {
      expect(screen.getByText(/Plan not found/i)).toBeInTheDocument();
    });
  });

  it("affiche le bouton Back et navigue en arrière", async () => {
    // Commentaire: Charger un plan simple
    pushResponse({
      data: {
        id: "plan-1",
        title: "Back Test",
        author: "Me",
        total_kcal: 2000,
        status: "daily",
        created_at: "2024-01-01T10:00:00",
        user_id: "user-1",
      },
      error: null,
    });
    pushResponse({ data: [], error: null });
    pushResponse({
      data: [{ FoodID: 1, FoodDescription: "Apple" }],
      error: null,
    });

    renderWithProviders();

    // Commentaire: Cliquer sur Back (utiliser getByRole pour éviter de matcher le titre)
    await waitFor(() => {
      fireEvent.click(screen.getByRole("button", { name: /Back/i }));
    });

    // Commentaire: Vérifie que navigate(-1) a été appelé
    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith(-1);
    });
  });

  it("affiche un message de notice lors de la pré-remplissage depuis le panier", async () => {
    // Commentaire: Fournir un panier et charger un plan éditable
    currentCart = {
      cartFoods: [{ id: 20, quantity: 150 }],
      loadingCart: false,
      cartError: null,
    };

    pushResponse({
      data: {
        id: "plan-1",
        title: "Prefill Test",
        author: "Me",
        total_kcal: 1500,
        status: "daily",
        created_at: "2024-01-01T10:00:00",
        user_id: "user-1",
      },
      error: null,
    });
    pushResponse({ data: [], error: null });
    pushResponse({
      data: [{ FoodID: 20, FoodDescription: "Rice" }],
      error: null,
    });

    renderWithProviders({ userId: "user-1" });

    // Commentaire: Cliquer sur Edit, puis Préremplir panier
    await waitFor(() => {
      fireEvent.click(screen.getByText(/^Edit$/i));
    });

    await waitFor(() => {
      fireEvent.click(screen.getByText(/Préremplir panier/i));
    });

    // Commentaire: Vérifie le message de notice
    await waitFor(() => {
      expect(screen.getByText(/Prefilled with/i)).toBeInTheDocument();
    });
  });

  it("affiche une erreur si la mise à jour du plan échoue", async () => {
    // Charger un plan éditable
    pushResponse({
      data: {
        id: "plan-1",
        title: "Edit Error",
        author: "Me",
        total_kcal: 1500,
        status: "daily",
        created_at: "2024-01-01T10:00:00",
        user_id: "user-1",
      },
      error: null,
    });
    pushResponse({ data: [], error: null });
    pushResponse({
      data: [{ FoodID: 1, FoodDescription: "Apple" }],
      error: null,
    });
    // Mock update qui échoue
    nextResponses.push({ error: { message: "Update failed" } });

    renderWithProviders({ userId: "user-1" });

    await waitFor(() => {
      fireEvent.click(screen.getByText(/^Edit$/i));
    });
    await waitFor(() => {
      fireEvent.click(screen.getByText(/Enregistrer/i));
    });
    await waitFor(() => {
      expect(screen.getByText(/Update failed/i)).toBeInTheDocument();
    });
  });

  it("affiche une erreur si la suppression des items échoue", async () => {
    pushResponse({
      data: {
        id: "plan-1",
        title: "Delete Error",
        author: "Me",
        total_kcal: 1500,
        status: "daily",
        created_at: "2024-01-01T10:00:00",
        user_id: "user-1",
      },
      error: null,
    });
    pushResponse({ data: [], error: null });
    pushResponse({
      data: [{ FoodID: 1, FoodDescription: "Apple" }],
      error: null,
    });
    // update OK, delete échoue
    nextResponses.push({ error: null }); // update
    nextResponses.push({ error: { message: "Delete failed" } }); // delete

    renderWithProviders({ userId: "user-1" });

    await waitFor(() => {
      fireEvent.click(screen.getByText(/^Edit$/i));
    });
    await waitFor(() => {
      fireEvent.click(screen.getByText(/Enregistrer/i));
    });
    await waitFor(() => {
      expect(screen.getByText(/Delete failed/i)).toBeInTheDocument();
    });
  });

  it("affiche 'No items' si aucun aliment n'est présent dans un repas", async () => {
    pushResponse({
      data: {
        id: "plan-1",
        title: "Empty Meals",
        author: "Me",
        total_kcal: 1500,
        status: "daily",
        created_at: "2024-01-01T10:00:00",
        user_id: "user-1",
      },
      error: null,
    });
    pushResponse({ data: [], error: null });
    pushResponse({ data: [], error: null });

    renderWithProviders({ userId: "user-1" });

    await waitFor(() => {
      expect(screen.getAllByText(/No items/i).length).toBe(3);
    });
  });
});
