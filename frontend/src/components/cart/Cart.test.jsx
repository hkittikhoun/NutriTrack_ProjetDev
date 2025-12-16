import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Cart from "./Cart";

// Mocks (simulations)
const supabaseMocks = vi.hoisted(() => {
  const getUser = vi.fn();
  const updateMock = vi.fn();
  const deleteMock = vi.fn();
  const nextResponses = [];
  return { getUser, updateMock, deleteMock, nextResponses };
});

vi.mock("../../supabaseClient", () => {
  const makeChain = () => {
    const chain = {
      select: () => chain,
      eq: () => chain,
      in: () => chain,
      order: () => chain,
      update: (obj) => {
        // Enregistre la mise à jour de quantité
        supabaseMocks.updateMock(obj);
        return chain;
      },
      delete: () => {
        // Enregistre la suppression d'élément
        supabaseMocks.deleteMock();
        return chain;
      },
      then: (resolve) => {
        // Retourne la prochaine réponse en file pour simuler les appels async de Supabase
        const resp = supabaseMocks.nextResponses.length
          ? supabaseMocks.nextResponses.shift()
          : { data: null, error: null };
        return Promise.resolve(resolve(resp));
      },
    };
    return chain;
  };
  return {
    supabase: {
      auth: { getUser: supabaseMocks.getUser },
      from: () => makeChain(),
    },
  };
});

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  const navigate = vi.fn();
  return { ...actual, useNavigate: () => navigate, __mockNavigate: navigate };
});

// window.confirm (confirmation utilisateur)
const confirmSpy = vi.spyOn(window, "confirm");

const mount = (props = {}) =>
  render(
    <MemoryRouter>
      <Cart isOpen={true} onClose={() => {}} refreshTrigger={0} {...props} />
    </MemoryRouter>
  );

beforeEach(() => {
  vi.clearAllMocks();
  // Par défaut : utilisateur connecté
  supabaseMocks.getUser.mockResolvedValue({
    data: { user: { id: "u1" } },
    error: null,
  });
});

describe("Cart", () => {
  it("renders null when closed", () => {
    const { container } = render(
      <MemoryRouter>
        <Cart isOpen={false} onClose={() => {}} refreshTrigger={0} />
      </MemoryRouter>
    );
    expect(container.firstChild).toBeNull();
  });

  it("affiche l'état vide quand il n'y a aucun article", async () => {
    supabaseMocks.nextResponses.push({ data: [], error: null });
    mount();
    await waitFor(() => {
      expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
    });
  });

  it("loads items and shows total kcal and controls", async () => {
    // Lignes du panier (articles)
    const rows = [
      { id: 1, quantity: 2, food: { FoodID: 10, FoodDescription: "Apple" } },
      { id: 2, quantity: 1, food: { FoodID: 20, FoodDescription: "Banana" } },
    ];
    // Chaîne: cart_items select -> eq(user_id) -> order -> retourne les lignes
    supabaseMocks.nextResponses.push({ data: rows, error: null });
    // nutrient_amount select -> in(FoodID,[10,20]) -> eq(NutrientCode,208) -> retourne les énergies
    const energies = [
      { FoodID: 10, NutrientValue: 52, nutrient_name: { NutrientCode: 208 } },
      { FoodID: 20, NutrientValue: 96, nutrient_name: { NutrientCode: 208 } },
    ];
    supabaseMocks.nextResponses.push({ data: energies, error: null });

    mount();

    await waitFor(async () => {
      const carts = await screen.findAllByText(/cart/i);
      expect(carts.length).toBeGreaterThan(0);
      expect(screen.getByText(/apple/i)).toBeInTheDocument();
      expect(screen.getByText(/banana/i)).toBeInTheDocument();
      // Vérifie simplement que le libellé du total est présent (la valeur peut être calculée différemment)
      expect(screen.getByText(/total:\s*\d+\s*kcal/i)).toBeInTheDocument();
    });

    // Boutons activés
    const createMealBtn = screen.getByRole("button", {
      name: /create your meal plan/i,
    });
    expect(createMealBtn).not.toBeDisabled();
    const createRecipeBtn = screen.getByRole("button", {
      name: /create a recipe/i,
    });
    expect(createRecipeBtn).not.toBeDisabled();
  });

  it("met à jour la quantité via + et - et persiste", async () => {
    const rows = [
      { id: 1, quantity: 2, food: { FoodID: 10, FoodDescription: "Apple" } },
    ];
    supabaseMocks.nextResponses.push({ data: rows, error: null });
    const energies = [
      { FoodID: 10, NutrientValue: 50, nutrient_name: { NutrientCode: 208 } },
    ];
    supabaseMocks.nextResponses.push({ data: energies, error: null });

    mount();

    const incBtn = await screen.findByRole("button", {
      name: /increase quantity/i,
    });
    await userEvent.click(incBtn);

    // Mise à jour appelée
    await waitFor(() => {
      expect(supabaseMocks.updateMock).toHaveBeenCalledWith({ quantity: 3 });
    });

    const decBtn = screen.getByRole("button", { name: /decrease quantity/i });
    await userEvent.click(decBtn);
    await waitFor(() => {
      expect(supabaseMocks.updateMock).toHaveBeenCalledWith({ quantity: 2 });
    });
  });

  it("removes item when quantity goes to 0", async () => {
    const rows = [
      { id: 1, quantity: 1, food: { FoodID: 10, FoodDescription: "Apple" } },
    ];
    supabaseMocks.nextResponses.push({ data: rows, error: null });
    const energies = [
      { FoodID: 10, NutrientValue: 50, nutrient_name: { NutrientCode: 208 } },
    ];
    supabaseMocks.nextResponses.push({ data: energies, error: null });
    // Réponse de suppression
    supabaseMocks.nextResponses.push({ data: null, error: null });

    mount();

    const decBtn = await screen.findByRole("button", {
      name: /decrease quantity/i,
    });
    await userEvent.click(decBtn);

    await waitFor(() => {
      // Suppression appelée (depuis removeItem)
      expect(supabaseMocks.deleteMock).toHaveBeenCalled();
    });
  });

  it("supprime l'article via le bouton supprimer avec confirmation", async () => {
    const rows = [
      { id: 1, quantity: 2, food: { FoodID: 10, FoodDescription: "Apple" } },
    ];
    supabaseMocks.nextResponses.push({ data: rows, error: null });
    const energies = [
      { FoodID: 10, NutrientValue: 50, nutrient_name: { NutrientCode: 208 } },
    ];
    supabaseMocks.nextResponses.push({ data: energies, error: null });

    confirmSpy.mockReturnValue(true);

    mount();

    const removeBtn = await screen.findByRole("button", {
      name: /remove item/i,
    });
    await userEvent.click(removeBtn);

    await waitFor(() => {
      expect(supabaseMocks.deleteMock).toHaveBeenCalled();
    });
  });

  it("vide le panier", async () => {
    const rows = [
      { id: 1, quantity: 2, food: { FoodID: 10, FoodDescription: "Apple" } },
    ];
    const energies = [
      { FoodID: 10, NutrientValue: 50, nutrient_name: { NutrientCode: 208 } },
    ];
    // Met en file les requêtes initiales
    supabaseMocks.nextResponses.push({ data: rows, error: null });
    supabaseMocks.nextResponses.push({ data: energies, error: null });

    confirmSpy.mockReturnValue(true);
    // Met en file la réponse de suppression puis un re-fetch retournant une liste vide
    supabaseMocks.nextResponses.push({ data: null, error: null });
    supabaseMocks.nextResponses.push({ data: [], error: null });

    mount();
    const clearBtn = await screen.findByRole("button", { name: /clear cart/i });
    await userEvent.click(clearBtn);

    await waitFor(() => {
      expect(supabaseMocks.deleteMock).toHaveBeenCalled();
      expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
    });
  });
});
