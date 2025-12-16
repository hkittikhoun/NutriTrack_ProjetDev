import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useUrlTabs } from "./useUrlTabs";

let searchParamsString = "";

vi.mock("react-router-dom", () => ({
  useSearchParams: () => {
    const params = new URLSearchParams(searchParamsString);
    const setSearchParams = vi.fn((newParams) => {
      if (typeof newParams === "object") {
        searchParamsString = newParams.toString();
      }
    });
    return [params, setSearchParams];
  },
}));

beforeEach(() => {
  searchParamsString = "";
  vi.clearAllMocks();
});

describe("useUrlTabs", () => {
  it("retourne l'onglet par défaut quand aucun tab dans l'URL", () => {
    const { result } = renderHook(() =>
      useUrlTabs(["home", "about", "contact"], "home")
    );

    expect(result.current.activeTab).toBe("home");
  });

  it("retourne l'onglet du paramètre URL s'il est valide", () => {
    searchParamsString = "tab=about";
    const { result } = renderHook(() =>
      useUrlTabs(["home", "about", "contact"], "home")
    );

    expect(result.current.activeTab).toBe("about");
  });

  it("retourne l'onglet par défaut si le tab URL n'est pas valide", () => {
    searchParamsString = "tab=invalid";
    const { result } = renderHook(() =>
      useUrlTabs(["home", "about", "contact"], "home")
    );

    expect(result.current.activeTab).toBe("home");
  });

  it("utilise le premier onglet comme défaut si defaultTab n'est pas spécifié", () => {
    const { result } = renderHook(() =>
      useUrlTabs(["recipes", "saved", "favorites"])
    );

    expect(result.current.activeTab).toBe("recipes");
  });

  it("utilise 'default' comme défaut si le tableau d'onglets est vide", () => {
    const { result } = renderHook(() => useUrlTabs([], "myDefault"));

    expect(result.current.activeTab).toBe("myDefault");
  });

  it("met à jour l'URL quand on change d'onglet", async () => {
    const { result } = renderHook(() =>
      useUrlTabs(["home", "about", "contact"], "home")
    );

    act(() => {
      result.current.setActiveTab("contact");
    });

    await waitFor(() => {
      expect(searchParamsString).toContain("tab=contact");
    });
  });

  it("retourne les searchParams", () => {
    searchParamsString = "tab=about&other=value";
    const { result } = renderHook(() =>
      useUrlTabs(["home", "about", "contact"], "home")
    );

    expect(result.current.searchParams).toBeDefined();
    expect(result.current.searchParams.get("tab")).toBe("about");
    expect(result.current.searchParams.get("other")).toBe("value");
  });

  it("fonctionne avec un seul onglet", () => {
    const { result } = renderHook(() => useUrlTabs(["settings"], "settings"));

    expect(result.current.activeTab).toBe("settings");

    act(() => {
      result.current.setActiveTab("settings");
    });

    expect(result.current.activeTab).toBe("settings");
  });
});
