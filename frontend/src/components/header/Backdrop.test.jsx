import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Backdrop from "./Backdrop";

// Prépare un conteneur de portail pour ReactDOM.createPortal
let portalRoot;

beforeEach(() => {
  portalRoot = document.createElement("div");
  portalRoot.setAttribute("id", "backdrop");
  document.body.appendChild(portalRoot);
});

afterEach(() => {
  portalRoot.remove();
  portalRoot = null;
});

describe("Backdrop", () => {
  it("rend le backdrop dans le portail cible", () => {
    render(<Backdrop />);
    const backdrop = portalRoot.querySelector(".backdrop");
    expect(backdrop).toBeInTheDocument();
  });

  it("déclenche onClick quand on clique sur le backdrop", async () => {
    const onClick = vi.fn();
    render(<Backdrop onClick={onClick} />);
    const backdrop = portalRoot.querySelector(".backdrop");
    await userEvent.click(backdrop);
    expect(onClick).toHaveBeenCalled();
  });
});
