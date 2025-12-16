import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { usePrefillAuthor } from "./usePrefillAuthors";

vi.mock("../../../supabaseClient", () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
  },
}));

import { supabase } from "../../../supabaseClient";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("usePrefillAuthor", () => {
  it("ne change pas l'auteur s'il est déjà rempli", async () => {
    const setAuthor = vi.fn();
    const auth = { userId: "user1" };

    renderHook(() => usePrefillAuthor("John Doe", setAuthor, auth));

    await waitFor(() => {
      expect(setAuthor).not.toHaveBeenCalled();
    });
  });

  it("rempli avec full_name depuis user_metadata", async () => {
    const setAuthor = vi.fn();
    const auth = { userId: "user1" };

    supabase.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: "u123",
          email: "test@example.com",
          user_metadata: { full_name: "Jane Smith" },
        },
      },
      error: null,
    });

    renderHook(() => usePrefillAuthor("", setAuthor, auth));

    await waitFor(() => {
      expect(setAuthor).toHaveBeenCalledWith("Jane Smith");
    });
  });

  it("utilise l'email si aucun nom disponible", async () => {
    const setAuthor = vi.fn();
    const auth = { userId: "user1" };

    supabase.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: "u123",
          email: "john@example.com",
          user_metadata: {},
        },
      },
      error: null,
    });

    renderHook(() => usePrefillAuthor("", setAuthor, auth));

    await waitFor(() => {
      expect(setAuthor).toHaveBeenCalledWith("john@example.com");
    });
  });

  it("utilise l'userId si getUser échoue", async () => {
    const setAuthor = vi.fn();
    const auth = { userId: "fallback_user" };

    supabase.auth.getUser.mockResolvedValue({
      data: null,
      error: { message: "Auth error" },
    });

    renderHook(() => usePrefillAuthor("", setAuthor, auth));

    await waitFor(() => {
      expect(setAuthor).toHaveBeenCalledWith("fallback_user");
    });
  });

  it("utilise userId du auth si pas de user data", async () => {
    const setAuthor = vi.fn();
    const auth = { userId: "fallback_user" };

    supabase.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: "u123",
          email: "test@example.com",
          user_metadata: {},
        },
      },
      error: null,
    });

    renderHook(() => usePrefillAuthor("", setAuthor, auth));

    await waitFor(() => {
      expect(setAuthor).toHaveBeenCalled();
    });
  });

  it("n'appelle pas setAuthor si le hook est nettoyé", async () => {
    const setAuthor = vi.fn();
    const auth = { userId: "user1" };

    supabase.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: "u123",
          email: "test@example.com",
          user_metadata: { full_name: "Jane" },
        },
      },
      error: null,
    });

    const { unmount } = renderHook(() => usePrefillAuthor("", setAuthor, auth));

    // Unmount avant la résolution de getUser
    unmount();

    await new Promise((resolve) => setTimeout(resolve, 100));

    // setAuthor ne devrait pas être appelé après unmount
    expect(setAuthor).not.toHaveBeenCalled();
  });
});
