import { useState } from "react";
import { Link } from "react-router-dom";
import StripePayment from "../payement/StripePayement";
import "../shared/form.css";

export default function Signup() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    terms: false,
  });
  const [showPayment, setShowPayment] = useState(false);
  const [passwordAreNotEqual, setPasswordAreNotEqual] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setPasswordAreNotEqual(false);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setPasswordAreNotEqual(true);
      return;
    }

    if (!formData.terms) {
      setError("You must agree to the terms and conditions");
      return;
    }

    if (
      !formData.email ||
      !formData.password ||
      !formData.firstName ||
      !formData.lastName
    ) {
      setError("Please fill in all fields");
      return;
    }

    // Stocker les données temporairement et afficher le paiement
    sessionStorage.setItem("signupData", JSON.stringify(formData));
    setShowPayment(true);
  }

  const handlePaymentSuccess = () => {
    // La gestion du succès se fait dans PaymentSuccess.jsx
    console.log("Payment successful, redirecting...");
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
    sessionStorage.removeItem("signupData");
  };

  if (showPayment) {
    return (
      <StripePayment
        userEmail={formData.email}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentCancel={handlePaymentCancel}
      />
    );
  }

  return (
    <form className="signup-form" onSubmit={handleSubmit}>
      <h2>Welcome on board!</h2>
      <p>
        We just need a little bit of information from you to get you started 🚀
      </p>
      <p className="payment-notice">
        <strong>Registration fee: $5.00 CAD</strong> - One-time payment for
        lifetime access
      </p>

      {error && (
        <div className="control-error">
          <p>{error}</p>
        </div>
      )}

      <div className="control">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="control-row">
        <div className="control">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="control">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            required
          />
          {passwordAreNotEqual && (
            <div className="control-error">
              <p>Passwords must match.</p>
            </div>
          )}
        </div>
      </div>

      <hr />

      <div className="control-row">
        <div className="control">
          <label htmlFor="firstName">First Name</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="control">
          <label htmlFor="lastName">Last Name</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>

      <div className="control">
        <label htmlFor="terms-and-conditions">
          <input
            type="checkbox"
            id="terms-and-conditions"
            name="terms"
            checked={formData.terms}
            onChange={handleInputChange}
            required
          />{" "}
          I agree to the terms and conditions and the $5.00 CAD registration fee
        </label>
      </div>

      <p className="form-actions">
        <Link to="/login" className="button button-flat">
          Login
        </Link>
        <button type="submit" className="button button-payment">
          Continue to Payment
        </button>
      </p>
    </form>
  );
}
