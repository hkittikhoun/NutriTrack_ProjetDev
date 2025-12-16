/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";
import { supabase } from "../../../supabaseClient";

export function usePrefillAuthor(author, setAuthor, auth) {
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (author && author.trim() !== "") return;
        const { data: authData, error: authErr } =
          await supabase.auth.getUser();
        if (authErr || !authData?.user) {
          if (!cancelled && auth?.userId) setAuthor(auth.userId);
          return;
        }
        const user = authData.user;
        const meta = user.user_metadata || {};
        const name =
          meta.full_name || meta.fullName || meta.name || user.email || user.id;
        if (!cancelled && name) setAuthor(name);
      } catch {
        if (!cancelled && auth?.userId) setAuthor(auth.userId);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [author, auth]);
}
