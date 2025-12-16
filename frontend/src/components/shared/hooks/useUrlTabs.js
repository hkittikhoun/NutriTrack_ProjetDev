import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

/**
 * Synchronise l'onglet actif avec ?tab= dans l'URL.
 * tabs: liste des ids d’onglets, defaultTab: onglet par défaut.
 */
export function useUrlTabs(tabs = [], defaultTab = tabs[0] ?? "default") {
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = useMemo(() => {
    const t = searchParams.get("tab");
    return t && tabs.includes(t) ? t : defaultTab;
  }, [searchParams, tabs, defaultTab]);

  useEffect(() => {
    const current = searchParams.get("tab");
    if (!current || !tabs.includes(current)) {
      const sp = new URLSearchParams(searchParams);
      sp.set("tab", activeTab);
      setSearchParams(sp, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const setActiveTab = (tabId) => {
    const sp = new URLSearchParams(searchParams);
    sp.set("tab", tabId);
    setSearchParams(sp);
  };

  return { activeTab, setActiveTab, searchParams };
}
