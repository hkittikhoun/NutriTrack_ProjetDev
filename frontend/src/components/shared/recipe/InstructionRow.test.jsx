import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { InstructionRow } from "./InstructionRow";

describe("InstructionRow", () => {
  const baseProps = {
    index: 0,
    value: "",
    onUpdate: vi.fn(),
    onRemove: vi.fn(),
    disableRemove: false,
  };

  it("affiche le label de l'étape", () => {
    render(<InstructionRow {...baseProps} />);
    expect(screen.getByText("Step 1 *")).toBeInTheDocument();
  });

  it("affiche la zone de texte avec le placeholder", () => {
    render(<InstructionRow {...baseProps} />);
    expect(screen.getByPlaceholderText("Describe this step...")).toBeInTheDocument();
  });

  it("affiche la valeur existante", () => {
    render(<InstructionRow {...baseProps} value="Mix ingredients" />);
    expect(screen.getByPlaceholderText("Describe this step...")).toHaveValue("Mix ingredients");
  });

  it("appelle onUpdate quand le texte change", () => {
    const onUpdate = vi.fn();
    render(<InstructionRow {...baseProps} onUpdate={onUpdate} />);
    fireEvent.change(screen.getByPlaceholderText("Describe this step..."), {
      target: { value: "Preheat oven" },
    });
    expect(onUpdate).toHaveBeenCalledWith(0, "Preheat oven");
  });

  it("appelle onRemove au clic sur Remove", () => {
    const onRemove = vi.fn();
    render(<InstructionRow {...baseProps} onRemove={onRemove} />);
    fireEvent.click(screen.getByRole("button", { name: /remove/i }));
    expect(onRemove).toHaveBeenCalledWith(0);
  });

  it("désactive le bouton Remove quand disableRemove est true", () => {
    render(<InstructionRow {...baseProps} disableRemove />);
    expect(screen.getByRole("button", { name: /remove/i })).toBeDisabled();
  });

  it("affiche le bon numéro d'étape pour un index non nul", () => {
    render(<InstructionRow {...baseProps} index={2} />);
    expect(screen.getByText("Step 3 *")).toBeInTheDocument();
  });
});
