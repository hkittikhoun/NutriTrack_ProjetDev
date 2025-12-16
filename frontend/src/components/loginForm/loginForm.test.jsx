import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import LoginForm from "./LoginForm";
import { AuthContext } from "../../context/auth-context";

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

// Mock Supabase auth avec file de réponses
const supabaseMocks = vi.hoisted(() => ({ nextResponses: [] }));
vi.mock("../../supabaseClient", () => {
  const authChain = {
    signInWithPassword: () => authChain,
    then: (resolve) => {
      const resp = supabaseMocks.nextResponses.length
        ? supabaseMocks.nextResponses.shift()
        : { data: null, error: null };
      return Promise.resolve(resolve(resp));
    },
  };
  return {
    supabase: {
      auth: authChain,
    },
  };
});

// Helper de rendu avec AuthContext
const renderWithAuth = (ui, authValue = { login: vi.fn() }) =>
  render(
    <MemoryRouter>
      <AuthContext.Provider value={authValue}>{ui}</AuthContext.Provider>
    </MemoryRouter>
  );

beforeEach(() => {
  vi.clearAllMocks();
  supabaseMocks.nextResponses.length = 0;
});

describe("LoginForm", () => {
  it("affiche le formulaire et champs requis", () => {
    renderWithAuth(<LoginForm />);
    expect(screen.getByRole("heading", { name: /login/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign up/i })
    ).toBeInTheDocument();
  });

  it("soumet et connecte en cas de succès", async () => {
    const auth = { login: vi.fn() };
    // Réponse de succès: data.user.id et data.session.access_token
    supabaseMocks.nextResponses.push({
      data: { user: { id: "u1" }, session: { access_token: "tok" } },
      error: null,
    });

    renderWithAuth(<LoginForm />, auth);

    await userEvent.type(screen.getByLabelText(/email/i), "user@example.com");
    await userEvent.type(screen.getByLabelText(/password/i), "secret");
    await userEvent.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(auth.login).toHaveBeenCalledWith("u1", "tok");
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  it("affiche une erreur en cas d'échec d'authentification", async () => {
    supabaseMocks.nextResponses.push({
      data: null,
      error: { message: "Invalid" },
    });

    renderWithAuth(<LoginForm />);

    await userEvent.type(screen.getByLabelText(/email/i), "bad@example.com");
    await userEvent.type(screen.getByLabelText(/password/i), "wrong");
    await userEvent.click(screen.getByRole("button", { name: /log in/i }));

    expect(await screen.findByText(/invalid/i)).toBeInTheDocument();
  });

  it("redirige vers signup sur SIGN UP", async () => {
    renderWithAuth(<LoginForm />);
    await userEvent.click(screen.getByRole("button", { name: /sign up/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/signup");
  });
});
