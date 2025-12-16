import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Signup from "./SignupForm";

vi.mock("../payement/StripePayement", () => ({
  default: ({ userEmail }) => <div>StripePayment Mock - {userEmail}</div>,
}));

beforeEach(() => {
  sessionStorage.clear();
});

describe("Signup form", () => {
  const setup = () =>
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );

  const submitForm = () => {
    const form = screen.getByText(/welcome on board/i).closest("form");
    if (form) {
      form.noValidate = true;
      fireEvent.submit(form);
    }
  };

  it("affiche les champs principaux", () => {
    setup();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/terms and conditions/i)).toBeInTheDocument();
  });

  it("affiche une erreur si les mots de passe ne correspondent pas", async () => {
    setup();
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "a@a.com" },
    });
    fireEvent.change(screen.getByLabelText(/first name/i), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByLabelText(/last name/i), {
      target: { value: "Doe" },
    });
    fireEvent.click(screen.getByLabelText(/terms and conditions/i));
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "abc" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "def" },
    });
    submitForm();
    expect(
      await screen.findByText(/passwords must match\.?/i)
    ).toBeInTheDocument();
  });

  it("affiche une erreur si les conditions ne sont pas acceptées", async () => {
    setup();
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "a@a.com" },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "abc" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "abc" },
    });
    fireEvent.change(screen.getByLabelText(/first name/i), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByLabelText(/last name/i), {
      target: { value: "Doe" },
    });
    submitForm();
    expect(
      await screen.findByText(/you must agree to the terms and conditions/i)
    ).toBeInTheDocument();
  });

  it("passe en mode paiement après soumission valide", () => {
    setup();
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "a@a.com" },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "abc" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "abc" },
    });
    fireEvent.change(screen.getByLabelText(/first name/i), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByLabelText(/last name/i), {
      target: { value: "Doe" },
    });
    fireEvent.click(screen.getByLabelText(/terms and conditions/i));
    fireEvent.click(
      screen.getByRole("button", { name: /continue to payment/i })
    );
    expect(screen.getByText(/StripePayment Mock/i)).toBeInTheDocument();
  });
});
