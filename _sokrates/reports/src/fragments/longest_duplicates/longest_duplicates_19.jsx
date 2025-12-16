frontend/src/components/cart/Cart.jsx [26:32]:
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    try {
      setLoading(true);
      setError(null);

      const { data: authData, error: authErr } = await supabase.auth.getUser();
      if (authErr) {
        setError("Failed to get user: " + authErr.message);
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -



frontend/src/components/cart/Cart.jsx [125:131]:
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    try {
      setLoading(true);
      setError(null);

      const { data: authData, error: authErr } = await supabase.auth.getUser();
      if (authErr) {
        setError("Failed to get user: " + authErr.message);
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -



