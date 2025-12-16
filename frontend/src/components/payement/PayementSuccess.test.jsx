import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import PaymentSuccess from "./PayementSuccess";
import { AuthContext } from "../../context/auth-context";

const mockNavigate = vi.fn();
let searchParamsString = "";

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useSearchParams: () => [new URLSearchParams(searchParamsString), vi.fn()],
}));

vi.mock("../../config/api", () => ({
  API_BASE_URL: "http://localhost",
}));

const mockSignUp = vi.fn();
vi.mock("../../supabaseClient", () => ({
  supabase: {
    auth: {
      signUp: (...args) => mockSignUp(...args),
    },
  },
}));

function renderWithAuth(ui) {
  return render(
    <AuthContext.Provider value={{ login: vi.fn() }}>{ui}</AuthContext.Provider>
  );
}

beforeEach(() => {
  mockNavigate.mockReset();
  mockSignUp.mockReset();
  vi.restoreAllMocks();
  sessionStorage.clear();
});

afterEach(() => {
  vi.resetModules();
});

describe("PayementSuccess", () => {
  it("affiche une erreur quand il manque le session_id", async () => {
    searchParamsString = "";
    global.fetch = vi.fn();

    renderWithAuth(<PaymentSuccess />);

    expect(
      await screen.findByText(/no payment session found/i)
    ).toBeInTheDocument();
  });

  it("affiche le message de succès avec email envoyée", async () => {
    searchParamsString = "session_id=abc";
    sessionStorage.setItem(
      "signupData",
      JSON.stringify({ password: "pass", firstName: "John", lastName: "Doe" })
    );

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        customerEmail: "john@example.com",
        customerId: "cid123",
        amountPaid: 500,
        currency: "CAD",
      }),
    });

    mockSignUp.mockResolvedValue({
      data: { user: { id: "u1" }, session: null },
      error: null,
    });

    renderWithAuth(<PaymentSuccess />);

    expect(await screen.findByText(/payment successful!/i)).toBeInTheDocument();
    expect(screen.getByText(/check your email/i)).toBeInTheDocument();
  });

  it("affiche une erreur si la vérification échoue", async () => {
    searchParamsString = "session_id=abc";
    global.fetch = vi.fn().mockResolvedValue({ ok: false });

    renderWithAuth(<PaymentSuccess />);

    expect(
      await screen.findByText(/payment verification error/i)
    ).toBeInTheDocument();
  });
});
