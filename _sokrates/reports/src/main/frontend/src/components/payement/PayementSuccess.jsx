import { useState, useEffect, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { AuthContext } from "../../context/auth-context";
import { API_BASE_URL } from "../../config/api";
import "./PayementSuccess.css";

function ActionButtons({ navigate }) {
  return (
    <div className="action-buttons">
      <button onClick={() => navigate("/login")} className="primary-button">
        Go to Login
      </button>
      <button onClick={() => navigate("/")} className="secondary-button">
        Return to Home
      </button>
    </div>
  );
}

function StatusCard({ type = "success", title, children }) {
  const cardClass = type === "error" ? "error-card" : "success-card";
  return (
    <div className={cardClass}>
      {type === "success" && title && <h3>{title}</h3>}
      {type === "error" && title && (
        <h3 style={{ color: "#00c3ffff" }}>{title}</h3>
      )}
      {children}
    </div>
  );
}

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();
  const auth = useContext(AuthContext);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const sessionId = searchParams.get("session_id");
        if (!sessionId) {
          setError("No payment session found");
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/verify-payment`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
        if (!response.ok) throw new Error("Payment verification failed");

        const result = await response.json();
        if (result.success) {
          const signupData = JSON.parse(
            sessionStorage.getItem("signupData") || "{}"
          );
          const { data, error: signupError } = await supabase.auth.signUp({
            email: result.customerEmail,
            password: signupData.password,
            options: {
              data: {
                first_name: signupData.firstName,
                last_name: signupData.lastName,
                full_name: `${signupData.firstName} ${signupData.lastName}`,
                stripe_customer_id: result.customerId,
                payment_status: "completed",
                subscription_status: "active",
                amount_paid: result.amountPaid,
                currency: result.currency,
              },
            },
          });

          if (signupError) {
            console.error("Signup error:", signupError);
            if (
              signupError.message.includes("already been registered") ||
              signupError.message.includes("Database error saving new user") ||
              signupError.message.includes("User already registered")
            ) {
              setError(
                "Your payment was successful! Please check your email for the confirmation link, then use the login page to access your account."
              );
            } else {
              setError(
                "Account creation failed. Please contact support with your payment confirmation."
              );
            }
            setLoading(false);
            return;
          }

          sessionStorage.removeItem("signupData");

          if (data.user && !data.session) {
            setEmailSent(true);
          } else if (data.session) {
            auth.login(data.user.id, data.session.access_token);
            setTimeout(() => navigate("/"), 3000);
          }
        } else {
          setError("Payment verification failed");
        }
      } catch (err) {
        console.error("Payment verification error:", err);
        setError("Payment verification error. Please contact support.");
      } finally {
        setLoading(false);
      }
    };
    verifyPayment();
  }, [searchParams, navigate, auth]);

  if (loading) {
    return (
      <div className="payment-success-container">
        <StatusCard title="Verifying your payment...">
          <div className="spinner"></div>
          <p>Please wait while we set up your account.</p>
        </StatusCard>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-success-container">
        <StatusCard type="error" title="Account Setup">
          <p>{error}</p>
          <ActionButtons navigate={navigate} />
        </StatusCard>
      </div>
    );
  }

  if (emailSent) {
    return (
      <div className="payment-success-container">
        <StatusCard title="Payment Successful!">
          <div className="email-icon">📧</div>
          <p>Your payment has been processed successfully.</p>

          <div className="email-confirmation-info">
            <h4>Please Check Your Email</h4>
            <p>
              We&apos;ve sent a confirmation email. Click the link to activate
              your NutriTrack account.
            </p>
            <div className="email-steps">
              <div className="step">
                <span className="step-number">1. </span>
                <span className="step-text">Check your inbox</span>
              </div>
              <div className="step">
                <span className="step-number">2. </span>
                <span className="step-text">Click the confirmation link</span>
              </div>
              <div className="step">
                <span className="step-number">3. </span>
                <span className="step-text">Return to login</span>
              </div>
            </div>
            <div className="email-note">
              <p>
                <strong>Note:</strong> The email may take a few minutes. Check
                your spam folder.
              </p>
            </div>
          </div>

          <ActionButtons navigate={navigate} />
        </StatusCard>
      </div>
    );
  }

  return (
    <div className="payment-success-container">
      <StatusCard title="Welcome to NutriTrack!">
        <div className="success-icon">✓</div>
        <p>
          Your account has been created successfully and you are now logged in.
        </p>
        <p>You will be redirected to the dashboard in a few seconds...</p>

        <div className="welcome-info">
          <h4>You can now:</h4>
          <ul>
            <li>Explore our complete food catalogue</li>
            <li>Use our nutrition calculators</li>
            <li>Start planning your meals</li>
          </ul>
        </div>

        <button
          onClick={() => navigate("/")}
          className="primary-button dashboard-button"
        >
          Continue to Dashboard
        </button>
      </StatusCard>
    </div>
  );
}
