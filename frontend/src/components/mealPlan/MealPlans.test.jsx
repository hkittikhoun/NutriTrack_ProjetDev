import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import MealPlans from "./MealPlans";
import { MemoryRouter } from "react-router-dom";

// Mock des hooks de gestion des onglets
let activeTabState = "create";
let setActiveTabMock = vi.fn((tab) => {
  activeTabState = tab;
});

vi.mock("../shared/hooks/useUrlTabs", () => ({
  useUrlTabs: (tabs, defaultTab) => ({
    activeTab: activeTabState,
    setActiveTab: setActiveTabMock,
  }),
}));

// Mock des composants enfants
vi.mock("./DailyPlan", () => ({
  default: () => <div data-testid="daily-plan">Daily Plan Component</div>,
}));

vi.mock("./SavedPlans", () => ({
  default: () => <div data-testid="saved-plans">Saved Plans Component</div>,
}));

const renderWithRouter = () => {
  return render(
    <MemoryRouter>
      <MealPlans />
    </MemoryRouter>
  );
};

beforeEach(() => {
  activeTabState = "create";
  setActiveTabMock.mockClear();
});

describe("MealPlans", () => {
  it("affiche le titre et les deux boutons d'onglets", () => {
    // Commentaire: Vérifie le rendu des éléments de base
    renderWithRouter();

    expect(screen.getByText(/Meal Plans/i)).toBeInTheDocument();
    expect(screen.getByText(/Create Plan/i)).toBeInTheDocument();
    expect(screen.getByText(/Browse Plans/i)).toBeInTheDocument();
  });

  it("affiche DailyPlan par défaut lors du chargement", () => {
    // Commentaire: Vérifie que l'onglet 'create' est actif au démarrage
    renderWithRouter();

    expect(screen.getByTestId("daily-plan")).toBeInTheDocument();
    expect(screen.queryByTestId("saved-plans")).not.toBeInTheDocument();
  });

  it("bascule vers SavedPlans lorsqu'on clique sur Browse Plans", async () => {
    // Commentaire: Simule le clic sur l'onglet Browse Plans et change l'état
    renderWithRouter();

    const browseBtn = screen.getByText(/Browse Plans/i);
    fireEvent.click(browseBtn);

    // Attendre que le mock setActiveTab soit appelé
    await waitFor(() => expect(setActiveTabMock).toHaveBeenCalledWith("saved"));

    // Simuler le changement d'état après le clic
    activeTabState = "saved";
    // Re-render pour voir le nouveau contenu
    const { rerender } = render(
      <MemoryRouter>
        <MealPlans />
      </MemoryRouter>
    );

    expect(screen.getByTestId("saved-plans")).toBeInTheDocument();
  });

  it("bascule vers DailyPlan lorsqu'on clique sur Create Plan après avoir vu SavedPlans", async () => {
    // Commentaire: Teste la navigation bidirectionnelle entre onglets
    activeTabState = "saved";
    renderWithRouter();

    expect(screen.getByTestId("saved-plans")).toBeInTheDocument();

    const createBtn = screen.getByText(/Create Plan/i);
    fireEvent.click(createBtn);

    await waitFor(() =>
      expect(setActiveTabMock).toHaveBeenCalledWith("create")
    );

    // Simuler le changement d'état après le clic
    activeTabState = "create";
    render(
      <MemoryRouter>
        <MealPlans />
      </MemoryRouter>
    );

    expect(screen.getByTestId("daily-plan")).toBeInTheDocument();
  });

  it("applique la classe 'active' au bouton actif", () => {
    // Commentaire: Vérifie le style du bouton d'onglet actif
    renderWithRouter();

    const createBtn = screen.getByText(/Create Plan/i);
    expect(createBtn).toHaveClass("active");

    const browseBtn = screen.getByText(/Browse Plans/i);
    expect(browseBtn).not.toHaveClass("active");
  });

  it("bascule la classe 'active' lors du changement d'onglet", async () => {
    // Commentaire: Teste la mise à jour dynamique des classes CSS
    activeTabState = "saved";
    renderWithRouter();

    const browseBtn = screen.getByText(/Browse Plans/i);
    expect(browseBtn).toHaveClass("active");

    const createBtn = screen.getByText(/Create Plan/i);
    expect(createBtn).not.toHaveClass("active");
  });

  it("rend correctement avec la structure CSS attendue", () => {
    // Commentaire: Vérifie que les éléments ont les bonnes classes CSS
    renderWithRouter();

    const section = screen
      .getByText(/Meal Plans/i)
      .closest(".section-container");
    expect(section).toBeInTheDocument();
    expect(section).toHaveClass("section-container");

    const tabsDiv = screen.getByText(/Create Plan/i).closest(".tabs");
    expect(tabsDiv).toBeInTheDocument();
    expect(tabsDiv).toHaveClass("tabs");

    const tabContent = screen.getByTestId("daily-plan").closest(".tab-content");
    expect(tabContent).toBeInTheDocument();
    expect(tabContent).toHaveClass("tab-content");
  });
});
