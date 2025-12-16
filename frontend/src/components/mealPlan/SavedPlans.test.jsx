import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import SavedPlans from "./SavedPlans";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "../../context/auth-context";

// Mock de navigate
const navigateMock = vi.fn();
vi.mock("react-router-dom", async (orig) => {
  const actual = await orig();
  return {
    ...actual,
    useNavigate: () => navigateMock,
    useLocation: () => ({
      state: null,
      pathname: "/mealplan",
    }),
  };
});

// File d'attente de réponses pour le mock Supabase
const nextResponses = [];
const pushResponse = (resp) => nextResponses.push(resp);
const popResponse = () => nextResponses.shift() || {};

// Mock Supabase
vi.mock("../../supabaseClient", () => ({
  supabase: {
    from: (table) => ({
      select: () => ({
        order: (col, opts) => {
          // Return a thenable that pops a response, and also has .eq() method
          const promise = Promise.resolve(popResponse());
          promise.eq = (col2, val) => Promise.resolve(popResponse());
          return promise;
        },
      }),
      delete: () => ({
        eq: (col, val) => ({
          eq: (col2, val2) => Promise.resolve(popResponse()),
        }),
      }),
    }),
  },
}));

const renderWithProviders = (auth = { userId: "user-1" }) => {
  return render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter>
        <SavedPlans />
      </MemoryRouter>
    </AuthContext.Provider>
  );
};

beforeEach(() => {
  nextResponses.length = 0;
  navigateMock.mockClear();
  window.confirm = vi.fn(() => true);
  window.alert = vi.fn();
});

describe("SavedPlans", () => {
  it("affiche les plans dans la liste 'All plans'", async () => {
    // Commentaire: Fournir une liste de plans
    pushResponse({
      data: [
        {
          id: "plan-1",
          title: "Monday Meals",
          author: "Chef",
          total_kcal: 2000,
          status: "daily",
          created_at: "2024-01-05T10:00:00",
          user_id: "user-2",
        },
        {
          id: "plan-2",
          title: "Week Plan",
          author: "Me",
          total_kcal: 2500,
          status: "weekly",
          created_at: "2024-01-04T10:00:00",
          user_id: "user-1",
        },
      ],
      error: null,
    });

    renderWithProviders();

    // Commentaire: Vérifie que les plans s'affichent
    await waitFor(() => {
      expect(screen.getByText(/Monday Meals/i)).toBeInTheDocument();
      expect(screen.getByText(/Week Plan/i)).toBeInTheDocument();
      expect(screen.getByText(/All plans \(2\)/i)).toBeInTheDocument();
    });
  });

  it("affiche le message si pas de plans", async () => {
    // Commentaire: Liste vide
    pushResponse({ data: [], error: null });

    renderWithProviders();

    // Commentaire: Vérifie le message d'absence de plans
    await waitFor(() => {
      expect(
        screen.getByText(/No plans available at the moment/i)
      ).toBeInTheDocument();
    });
  });

  it("affiche un message d'erreur si le chargement échoue", async () => {
    // Commentaire: Erreur lors du chargement
    pushResponse({ data: null, error: { message: "Failed to fetch" } });

    renderWithProviders();

    // Commentaire: Vérifie le rendu de l'erreur
    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch/i)).toBeInTheDocument();
    });
  });

  it("affiche le bouton 'My plans' si l'utilisateur est authentifié", async () => {
    // Commentaire: Plans pour affichage initial
    pushResponse({ data: [], error: null });

    renderWithProviders({ userId: "user-1" });

    // Commentaire: Vérifie la présence du bouton My plans
    await waitFor(() => {
      expect(screen.getByText(/My plans/i)).toBeInTheDocument();
    });
  });

  it("n'affiche pas le bouton 'My plans' si l'utilisateur n'est pas authentifié", async () => {
    // Commentaire: Utilisateur non authentifié
    pushResponse({ data: [], error: null });

    renderWithProviders(null);

    // Commentaire: Vérifie l'absence du bouton
    await waitFor(() => {
      expect(screen.queryByText(/My plans/i)).not.toBeInTheDocument();
    });
  });

  it("bascule vers 'My plans' et affiche seulement les plans de l'utilisateur", async () => {
    // Commentaire: Plans initiaux (tous)
    pushResponse({
      data: [
        {
          id: "plan-1",
          title: "Other Plan",
          author: "Someone",
          total_kcal: 2000,
          status: "daily",
          created_at: "2024-01-05T10:00:00",
          user_id: "user-2",
        },
        {
          id: "plan-2",
          title: "My Plan",
          author: "Me",
          total_kcal: 1800,
          status: "daily",
          created_at: "2024-01-04T10:00:00",
          user_id: "user-1",
        },
      ],
      error: null,
    });
    // Plans filtrés (My plans)
    pushResponse({
      data: [
        {
          id: "plan-2",
          title: "My Plan",
          author: "Me",
          total_kcal: 1800,
          status: "daily",
          created_at: "2024-01-04T10:00:00",
          user_id: "user-1",
        },
      ],
      error: null,
    });

    renderWithProviders({ userId: "user-1" });

    // Commentaire: Cliquer sur My plans
    await waitFor(() => {
      fireEvent.click(screen.getByText(/My plans/i));
    });

    // Commentaire: Vérifie que seul le plan de l'utilisateur s'affiche
    await waitFor(() => {
      expect(screen.getByText(/My Plan/i)).toBeInTheDocument();
      expect(screen.queryByText(/Other Plan/i)).not.toBeInTheDocument();
    });
  });

  it("affiche le badge 'Your plan' pour les plans de l'utilisateur", async () => {
    // Commentaire: Fournir des plans, certains appartenant à l'utilisateur
    pushResponse({
      data: [
        {
          id: "plan-1",
          title: "Others Plan",
          author: "Someone",
          total_kcal: 2000,
          status: "daily",
          created_at: "2024-01-05T10:00:00",
          user_id: "user-2",
        },
        {
          id: "plan-2",
          title: "My Own Plan",
          author: "Me",
          total_kcal: 1800,
          status: "daily",
          created_at: "2024-01-04T10:00:00",
          user_id: "user-1",
        },
      ],
      error: null,
    });

    renderWithProviders({ userId: "user-1" });

    // Commentaire: Vérifie le badge "Your plan"
    await waitFor(() => {
      const badges = screen.getAllByText(/Your plan/i);
      expect(badges.length).toBe(1);
    });
  });

  it("affiche le bouton View pour tous les plans", async () => {
    // Commentaire: Fournir des plans
    pushResponse({
      data: [
        {
          id: "plan-1",
          title: "Plan 1",
          author: "Author",
          total_kcal: 2000,
          status: "daily",
          created_at: "2024-01-05T10:00:00",
          user_id: "user-2",
        },
      ],
      error: null,
    });

    renderWithProviders();

    // Commentaire: Vérifie les boutons View
    await waitFor(() => {
      const viewButtons = screen.getAllByText(/^View$/i);
      expect(viewButtons.length).toBeGreaterThan(0);
    });
  });

  it("affiche les boutons Edit et Delete seulement pour les plans de l'utilisateur", async () => {
    // Commentaire: Fournir des plans, l'un appartenant à l'utilisateur
    pushResponse({
      data: [
        {
          id: "plan-1",
          title: "Others Plan",
          author: "Someone",
          total_kcal: 2000,
          status: "daily",
          created_at: "2024-01-05T10:00:00",
          user_id: "user-2",
        },
        {
          id: "plan-2",
          title: "My Plan",
          author: "Me",
          total_kcal: 1800,
          status: "daily",
          created_at: "2024-01-04T10:00:00",
          user_id: "user-1",
        },
      ],
      error: null,
    });

    renderWithProviders({ userId: "user-1" });

    // Commentaire: Vérifie Edit et Delete uniquement pour My Plan
    await waitFor(() => {
      const editButtons = screen.getAllByText(/Edit/i);
      const deleteButtons = screen.getAllByText(/Delete/i);
      expect(editButtons.length).toBe(1);
      expect(deleteButtons.length).toBe(1);
    });
  });

  it("navigue vers le détail du plan au clic sur View", async () => {
    // Commentaire: Fournir un plan
    pushResponse({
      data: [
        {
          id: "plan-123",
          title: "Test Plan",
          author: "Me",
          total_kcal: 2000,
          status: "daily",
          created_at: "2024-01-05T10:00:00",
          user_id: "user-1",
        },
      ],
      error: null,
    });

    renderWithProviders();

    // Commentaire: Cliquer sur View
    await waitFor(() => {
      fireEvent.click(screen.getByText(/^View$/i));
    });

    // Commentaire: Vérifie la navigation
    expect(navigateMock).toHaveBeenCalledWith("/mealplan/plan-123");
  });

  it("navigue vers l'édition du plan au clic sur Edit", async () => {
    // Commentaire: Fournir un plan de l'utilisateur
    pushResponse({
      data: [
        {
          id: "plan-456",
          title: "My Plan",
          author: "Me",
          total_kcal: 1800,
          status: "daily",
          created_at: "2024-01-04T10:00:00",
          user_id: "user-1",
        },
      ],
      error: null,
    });

    renderWithProviders({ userId: "user-1" });

    // Commentaire: Cliquer sur Edit
    await waitFor(() => {
      fireEvent.click(screen.getByText(/Edit/i));
    });

    // Commentaire: Vérifie la navigation vers l'édition
    expect(navigateMock).toHaveBeenCalledWith("/mealplan/plan-456?edit=true");
  });

  it("supprime un plan après confirmation", async () => {
    // Commentaire: Fournir un plan de l'utilisateur
    pushResponse({
      data: [
        {
          id: "plan-789",
          title: "To Delete",
          author: "Me",
          total_kcal: 2000,
          status: "daily",
          created_at: "2024-01-05T10:00:00",
          user_id: "user-1",
        },
      ],
      error: null,
    });
    // Réponse de suppression OK
    pushResponse({ error: null });

    renderWithProviders({ userId: "user-1" });

    // Commentaire: Cliquer sur Delete (utiliser le bouton par rôle pour éviter la confusion avec le titre)
    await waitFor(() => {
      fireEvent.click(screen.getByRole("button", { name: /Delete/i }));
    });

    // Commentaire: Vérifie la confirmation et la suppression
    expect(window.confirm).toHaveBeenCalled();

    // Commentaire: Vérifie que le plan est retiré de la liste
    await waitFor(() => {
      expect(screen.queryByText(/To Delete/i)).not.toBeInTheDocument();
      expect(screen.getByText(/Plan deleted/i)).toBeInTheDocument();
    });
  });

  it("affiche une notice de succès et l'efface après un délai", async () => {
    // Commentaire: Fournir un plan
    pushResponse({
      data: [
        {
          id: "plan-1",
          title: "Plan",
          author: "Me",
          total_kcal: 2000,
          status: "daily",
          created_at: "2024-01-05T10:00:00",
          user_id: "user-1",
        },
      ],
      error: null,
    });
    // Suppression OK
    pushResponse({ error: null });

    renderWithProviders({ userId: "user-1" });

    // Commentaire: Supprimer un plan
    await waitFor(() => {
      fireEvent.click(screen.getByText(/Delete/i));
    });

    // Commentaire: Vérifie l'apparition de la notice
    await waitFor(() => {
      expect(screen.getByText(/Plan deleted/i)).toBeInTheDocument();
    });

    // Commentaire: Attendre que la notice disparaisse (2s + buffer)
    await waitFor(
      () => {
        expect(screen.queryByText(/Plan deleted/i)).not.toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it("affiche une alerte d'erreur si la suppression échoue", async () => {
    // Commentaire: Fournir un plan
    pushResponse({
      data: [
        {
          id: "plan-999",
          title: "Plan",
          author: "Me",
          total_kcal: 2000,
          status: "daily",
          created_at: "2024-01-05T10:00:00",
          user_id: "user-1",
        },
      ],
      error: null,
    });
    // Suppression échoue
    pushResponse({ error: { message: "Permission denied" } });

    renderWithProviders({ userId: "user-1" });

    // Commentaire: Cliquer sur Delete (utiliser le bouton par rôle)
    await waitFor(() => {
      fireEvent.click(screen.getByRole("button", { name: /Delete/i }));
    });

    // Commentaire: Vérifie l'alerte d'erreur et le plan reste affiché
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        expect.stringContaining("Unable to delete plan")
      );
    });

    // Commentaire: Vérifie que le plan n'a pas été supprimé
    expect(screen.getByText(/^Plan$/i)).toBeInTheDocument();
  });

  it("affiche les métadonnées du plan (auteur, date, kcal)", async () => {
    // Commentaire: Fournir un plan avec des métadonnées
    pushResponse({
      data: [
        {
          id: "plan-1",
          title: "Meta Plan",
          author: "Chef Jean",
          total_kcal: 2500,
          status: "daily",
          created_at: "2024-01-15T14:30:00",
          user_id: "user-2",
        },
      ],
      error: null,
    });

    renderWithProviders();

    // Commentaire: Vérifie l'affichage des métadonnées
    await waitFor(() => {
      expect(screen.getByText(/Chef Jean/i)).toBeInTheDocument();
      expect(screen.getByText(/2500 kcal/i)).toBeInTheDocument();
    });
  });
});
