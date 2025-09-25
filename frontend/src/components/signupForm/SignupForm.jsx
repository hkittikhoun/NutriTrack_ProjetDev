import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import "./SignupForm.css";

export default function Signup() {
  const [passwordAreNotEqual, setPasswordAreNotEqual] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    const fd = new FormData(event.target);
    const data = Object.fromEntries(fd.entries());

    if (data.password !== data["confirm-password"]) {
      setPasswordAreNotEqual(true);
      return;
    }

    setPasswordAreNotEqual(false);

    const { error: signupError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          first_name: data["first-name"],
          last_name: data["last-name"],
          full_name: `${data["first-name"]} ${data["last-name"]}`,
        },
      },
    });

    if (signupError) {
      setError("Error when signing up: " + signupError.message);
      return;
    }

    setSubmittedData({
      name: `${data["first-name"]} ${data["last-name"]}`,
      email: data.email,
    });
    event.target.reset();

    setTimeout(() => {
      navigate("/");
    }, 2000);
  }

  return (
    <>
      {submittedData && (
        <div className="success-message">
          <h3>Sign up successful! 🎉</h3>
          <p>Name: {submittedData.name}</p>
          <p>Email: {submittedData.email}</p>
          <p>Redirecting to the login page...</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <h2>Welcome on board!</h2>
        <p>
          We just need a little bit of information from you to get you started
          🚀
        </p>

        {error && (
          <div className="control-error">
            <p>{error}</p>
          </div>
        )}

        <div className="control">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" name="email" required />
        </div>

        <div className="control-row">
          <div className="control">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" name="password" required />
          </div>
          <div className="control">
            <label htmlFor="confirm-password">Confirm Password</label>
            <input
              id="confirm-password"
              type="password"
              name="confirm-password"
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
            <label htmlFor="first-name">First Name</label>
            <input type="text" id="first-name" name="first-name" required />
          </div>

          <div className="control">
            <label htmlFor="last-name">Last Name</label>
            <input type="text" id="last-name" name="last-name" required />
          </div>
        </div>

        <div className="control">
          <label htmlFor="terms-and-conditions">
            <input
              type="checkbox"
              id="terms-and-conditions"
              name="terms"
              required
            />{" "}
            I agree to the terms and conditions
          </label>
        </div>

        <p className="form-actions">
          <Link to="/login" className="button button-flat">
            Login
          </Link>
          <button type="submit" className="button">
            Sign up
          </button>
        </p>
      </form>
    </>
  );
}
