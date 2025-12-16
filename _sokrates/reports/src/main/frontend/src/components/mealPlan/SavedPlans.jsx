import { useEffect, useState, useContext } from "react";
import { supabase } from "../../supabaseClient";
import { AuthContext } from "../../context/auth-context";
import { useLocation, useNavigate } from "react-router-dom";
import "./SavedPlans.css";

export default function SavedPlans() {
  const auth = useContext(AuthContext);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const location = useLocation();
  const [notice, setNotice] = useState(location?.state?.notice || null);
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState("all");

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);

        let query = supabase
          .from("meal_plans")
          .select("id, title, author, total_kcal, status, created_at, user_id")
          .order("created_at", { ascending: false });

        if (viewMode === "mine" && auth?.userId) {
          query = query.eq("user_id", auth.userId);
        }

        const { data, error } = await query;

        if (error) {
          setError(error.message || "Failed to load plans");
          return;
        }
        setPlans(data || []);
      } catch (e) {
        console.error(e);
        setError("Unexpected error");
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [auth?.userId, viewMode]);

  const isOwner = (plan) => {
    return auth?.userId && plan.user_id === auth.userId;
  };

  return (
    <div className="saved-plans">
      {notice && <div className="notice success">{notice}</div>}
      {loading && <div>Loading...</div>}
      {error && <div className="error">{error}</div>}

      <div className="view-filters">
        <button
          className={`filter-btn ${viewMode === "all" ? "active" : ""}`}
          onClick={() => setViewMode("all")}
        >
          All plans ({plans.length})
        </button>
        {auth?.userId && (
          <button
            className={`filter-btn ${viewMode === "mine" ? "active" : ""}`}
            onClick={() => setViewMode("mine")}
          >
            My plans
          </button>
        )}
      </div>

      {!loading && !error && plans.length === 0 && (
        <div className="no-plans-message">
          {viewMode === "mine"
            ? "You haven't created any plans yet."
            : "No plans available at the moment."}
        </div>
      )}

      <ul className="plans-list">
        {plans.map((p) => (
          <li key={p.id} className="plan-item">
            <div className="plan-header">
              <div className="plan-title">{p.title || "(Untitled)"}</div>
              {isOwner(p) && <span className="owner-badge">Your plan</span>}
            </div>
            <div className="plan-meta">
              <span className="plan-author">By: {p.author || "Anonymous"}</span>
              <span className="plan-date">
                {p.created_at ? new Date(p.created_at).toLocaleString() : ""}
              </span>
              <span className="plan-kcal">{p.total_kcal ?? "—"} kcal</span>
            </div>
            <div className="plan-actions">
              <button
                onClick={() => navigate(`/mealplan/${p.id}`)}
                className="view-btn"
              >
                View
              </button>
              {isOwner(p) && (
                <>
                  <button
                    onClick={() => navigate(`/mealplan/${p.id}?edit=true`)}
                    className="edit-btn"
                  >
                    Edit
                  </button>
                  <button
                    onClick={async () => {
                      const ok = window.confirm("Delete this plan?");
                      if (!ok) return;
                      try {
                        const { error } = await supabase
                          .from("meal_plans")
                          .delete()
                          .eq("id", p.id)
                          .eq("user_id", auth.userId);
                        if (error) {
                          alert("Unable to delete plan: " + error.message);
                          return;
                        }
                        setPlans((prev) => prev.filter((x) => x.id !== p.id));
                        setNotice("Plan deleted.");
                        setTimeout(() => setNotice(null), 2000);
                      } catch (e) {
                        console.error(e);
                        alert("Error while deleting");
                      }
                    }}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
