import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import MonthlyJournal from "./MonthlyJournal";

describe("MonthlyJournal", () => {
  it("affiche le titre du journal mensuel", () => {
    render(<MonthlyJournal />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      /Monthly Journal: December/i
    );
  });

  it("affiche le titre de la recette", () => {
    render(<MonthlyJournal />);
    expect(screen.getByText(/Garden Harvest Soup/i)).toBeInTheDocument();
  });

  it("affiche la section des ingrédients", () => {
    render(<MonthlyJournal />);
    expect(screen.getByText(/Ingredients/i)).toBeInTheDocument();
    expect(screen.getByText(/olive oil/i)).toBeInTheDocument();
    expect(
      screen
        .getAllByText(/Parmesan cheese/i)
        .some((el) => el.textContent.includes("shredded or grated"))
    ).toBe(true);
  });

  it("affiche la section de préparation", () => {
    render(<MonthlyJournal />);
    expect(screen.getByText(/Preparation/i)).toBeInTheDocument();
    expect(
      screen.getByText(/heat the oil over medium heat/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Sprinkle each serving with Parmesan cheese/i)
    ).toBeInTheDocument();
  });

  it("affiche les infos nutritionnelles", () => {
    render(<MonthlyJournal />);
    expect(screen.getByText(/Calories: 95/i)).toBeInTheDocument();
    expect(screen.getByText(/Protein: 3g/i)).toBeInTheDocument();
  });

  it("affiche le lien source", () => {
    render(<MonthlyJournal />);
    const link = screen.getByRole("link", { name: /powershealth.org/i });
    expect(link).toHaveAttribute(
      "href",
      expect.stringContaining("powershealth.org")
    );
  });

  it("affiche l'image de la soupe", () => {
    render(<MonthlyJournal />);
    const image = screen.getByAltText(/Garden Harvest Soup/i);
    expect(image).toBeInTheDocument();
  });
});
