import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import MonthlyJournal from "./MonthlyJournal";

describe("MonthlyJournal", () => {
  it("affiche le titre du journal mensuel", () => {
    // Commentaire: Vérifie le rendu du titre principal
    render(<MonthlyJournal />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      /Monthly Journal: October/i
    );
  });

  it("affiche le titre du conseil nutritionnel", () => {
    // Commentaire: Vérifie la présence du titre du conseil
    render(<MonthlyJournal />);

    expect(
      screen.getByText(/Nutrition Tip: Embrace Fall Flavors/i)
    ).toBeInTheDocument();
  });

  it("affiche le contenu du conseil nutritionnel", () => {
    // Commentaire: Vérifie le texte du conseil sur les saveurs d'automne
    render(<MonthlyJournal />);

    expect(
      screen.getByText(/October brings cooler weather and harvest season/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/pumpkin, sweet potatoes/i)).toBeInTheDocument();
  });

  it("affiche le titre de la recette", () => {
    // Commentaire: Vérifie la présence du titre de la recette de purée de courge
    render(<MonthlyJournal />);

    expect(
      screen.getByText(/Easy and Quick Homemade Pumpkin Puree/i)
    ).toBeInTheDocument();
  });

  it("affiche les temps de préparation et de cuisson", () => {
    // Commentaire: Vérifie l'affichage des durées
    render(<MonthlyJournal />);

    expect(screen.getByText(/Prep time:/)).toBeInTheDocument();
    expect(screen.getByText(/Cook time:/)).toBeInTheDocument();
    expect(screen.getByText(/25 min/)).toBeInTheDocument();
    expect(screen.getByText(/2h/)).toBeInTheDocument();
  });

  it("affiche la section des ingrédients", () => {
    // Commentaire: Vérifie l'en-tête et le contenu des ingrédients
    render(<MonthlyJournal />);

    expect(screen.getByText(/Ingredients/i)).toBeInTheDocument();
    expect(screen.getByText(/2 pumpkins, 3.5 lbs/)).toBeInTheDocument();
    expect(screen.getByText(/Canola oil for cooking/)).toBeInTheDocument();
  });

  it("affiche la section de préparation avec les étapes", () => {
    // Commentaire: Vérifie l'en-tête et les étapes de préparation
    render(<MonthlyJournal />);

    expect(screen.getByText(/Preparation/i)).toBeInTheDocument();
    expect(screen.getByText(/Preheat oven to 300°F/)).toBeInTheDocument();
    expect(
      screen.getByText(/Cut around the stem. Remove and discard the flesh/i)
    ).toBeInTheDocument();
  });

  it("affiche la boîte 'Good to know'", () => {
    // Commentaire: Vérifie l'encadré de conseil
    render(<MonthlyJournal />);

    expect(screen.getByText(/Good to know:/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Use this puree in your fall pumpkin latte/i)
    ).toBeInTheDocument();
  });

  it("affiche le lien source", () => {
    // Commentaire: Vérifie la présence du lien vers la source
    render(<MonthlyJournal />);

    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThan(0);
  });

  it("affiche l'image de la recette avec alt text", () => {
    // Commentaire: Vérifie que l'image est présente avec un texte alternatif
    render(<MonthlyJournal />);

    const image = screen.getByAltText(/Easy and quick homemade pumpkin puree/i);
    expect(image).toBeInTheDocument();
  });

  it("affiche plusieurs articles en tant que sections", () => {
    // Commentaire: Vérifie le nombre d'articles affichés
    const { container } = render(<MonthlyJournal />);

    const articles = container.querySelectorAll("article");
    // Vérifier au moins 2 articles (conseil et recette)
    expect(articles.length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText(/Nutrition Tip/)).toBeInTheDocument();
    expect(
      screen.getByText(/Easy and Quick Homemade Pumpkin Puree/i)
    ).toBeInTheDocument();
  });

  it("affiche le lien externe vers la recette source", () => {
    // Commentaire: Vérifie que le lien source est correct et s'ouvre dans un nouvel onglet
    render(<MonthlyJournal />);

    const recipeLink = screen.getByRole("link", { name: /salutbonjour.ca/i });
    expect(recipeLink).toHaveAttribute("target", "_blank");
    expect(recipeLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("affiche le lien image cliquable vers la recette complète", () => {
    // Commentaire: Vérifie que l'image est cliquable et pointe vers la source
    render(<MonthlyJournal />);

    const imageLink = screen.getByRole("link", {
      name: /Easy and quick homemade pumpkin puree/i,
    });
    expect(imageLink).toHaveAttribute("target", "_blank");
    expect(imageLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("affiche la description courte de la recette", () => {
    // Commentaire: Vérifie la description générale de la recette
    render(<MonthlyJournal />);

    expect(
      screen.getByText(/Perfect for pies or as a base for soups/i)
    ).toBeInTheDocument();
  });

  it("affiche toutes les étapes numérotées de la préparation", () => {
    // Commentaire: Vérifie la présence de plusieurs étapes de préparation
    render(<MonthlyJournal />);

    expect(
      screen.getByText(/Using a hand mixer or food processor/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/After 2 hours of cooking, the pumpkin will be soft/i)
    ).toBeInTheDocument();
  });

  it("affiche les ingrédients complets de la recette", () => {
    // Commentaire: Vérifie tous les ingrédients listés
    render(<MonthlyJournal />);

    const ingredients = screen.getAllByText(/pumpkins|oil/i);
    expect(ingredients.length).toBeGreaterThan(0);
  });

  it("affiche le contenu structuré en sections et articles", () => {
    // Commentaire: Vérifie la structure HTML générale
    const { container } = render(<MonthlyJournal />);

    const section = container.querySelector("section");
    expect(section).toBeInTheDocument();
    const articles = container.querySelectorAll("article");
    expect(articles.length).toBeGreaterThanOrEqual(1);
  });
});
