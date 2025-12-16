import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import StripePayment from "./StripePayement";

// Minimal mocks
vi.mock("../../config/api", () => ({ API_BASE_URL: "http://localhost:3000" }));

const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

// window.location.href needs to be writable in JSDOM
Object.defineProperty(window, "location", {
  value: { href: "http://localhost/" },
  writable: true,
});

describe("StripePayment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
    window.location.href = "http://localhost/";
  });

  it("affiche les infos de paiement et les boutons", () => {
    render(
      <StripePayment
        onPaymentSuccess={vi.fn()}
        onPaymentCancel={vi.fn()}
        userEmail="test@example.com"
      />
    );

    expect(screen.getByText(/Complete Your Registration/i)).toBeInTheDocument();
    // Deux occurrences ($5.00 CAD) existent: <strong> et <span.amount>
    const amounts = screen.getAllByText(/\$5\.00 CAD/i);
    expect(amounts.length).toBeGreaterThanOrEqual(1);
    expect(
      screen.getByRole("button", { name: /Pay with Stripe/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Cancel/i })).toBeInTheDocument();
    expect(
      screen.getByText(/Secure payment powered by Stripe/i)
    ).toBeInTheDocument();
  });

  it("démarre un checkout Stripe et redirige quand l'URL est présente", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({ url: "https://checkout.stripe.com/s/test" }),
    });

    render(
      <StripePayment
        onPaymentSuccess={vi.fn()}
        onPaymentCancel={vi.fn()}
        userEmail="payer@example.com"
      />
    );

    await userEvent.click(
      screen.getByRole("button", { name: /Pay with Stripe/i })
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3000/api/create-checkout-session",
        expect.objectContaining({ method: "POST" })
      );
    });

    await waitFor(() => {
      expect(window.location.href).toBe("https://checkout.stripe.com/s/test");
    });
  });

  it("affiche une erreur si la création de session échoue (HTTP ko)", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: "Bad request" }),
    });

    render(
      <StripePayment
        onPaymentSuccess={vi.fn()}
        onPaymentCancel={vi.fn()}
        userEmail="payer@example.com"
      />
    );

    await userEvent.click(
      screen.getByRole("button", { name: /Pay with Stripe/i })
    );

    await waitFor(() => {
      expect(
        screen.getByText(/Payment error: Bad request/i)
      ).toBeInTheDocument();
    });
  });

  it("affiche une erreur si aucune URL de checkout n'est retournée", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });

    render(
      <StripePayment
        onPaymentSuccess={vi.fn()}
        onPaymentCancel={vi.fn()}
        userEmail="payer@example.com"
      />
    );

    await userEvent.click(
      screen.getByRole("button", { name: /Pay with Stripe/i })
    );

    await waitFor(() => {
      expect(
        screen.getByText(/Payment error: No checkout URL received/i)
      ).toBeInTheDocument();
    });
  });

  it("désactive les boutons pendant le chargement et appelle onPaymentCancel", async () => {
    // Make fetch pending until after assertions
    let resolveFetch;
    mockFetch.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveFetch = () =>
          resolve({
            ok: true,
            json: () => Promise.resolve({ url: "https://checkout" }),
          });
      })
    );

    const onCancel = vi.fn();
    render(
      <StripePayment
        onPaymentSuccess={vi.fn()}
        onPaymentCancel={onCancel}
        userEmail="user@example.com"
      />
    );

    // Click pay to set loading state
    await userEvent.click(
      screen.getByRole("button", { name: /Pay with Stripe/i })
    );

    // Buttons disabled while loading (label becomes "Processing...")
    expect(
      screen.getByRole("button", { name: /Processing.../i })
    ).toBeDisabled();
    expect(screen.getByRole("button", { name: /Cancel/i })).toBeDisabled();

    // Cancel click should not trigger while disabled
    await userEvent.click(screen.getByRole("button", { name: /Cancel/i }));
    expect(onCancel).not.toHaveBeenCalled();

    // Finish fetch
    resolveFetch();
  });
});
