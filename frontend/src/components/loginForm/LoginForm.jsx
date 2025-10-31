import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { AuthContext } from "../../context/auth-context";
import "./LoginForm.css";

export default function LoginForm() {
  const [entredValues, setEntredValues] = useState({
    user: "",
    password: "",
  });
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const auth = useContext(AuthContext);

  const handleInputChange = (identifier, value) => {
    setEntredValues((prevValue) => ({
      ...prevValue,
      [identifier]: value,
    }));
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: entredValues.user,
      password: entredValues.password,
    });

    if (error) {
      setError("Invalid credentials !");
      return;
    }

    auth.login(data.user.id, data.session.access_token);
    navigate("/");
  };

  const handleSignInClick = (event) => {
    event.preventDefault();
    navigate("/signup");
  };

  return (
    <form onSubmit={handleLogin}>
      <h2 className="title">LOGIN</h2>
      {error && <div style={{ color: "red" }}>{error}</div>}

      <div className="control">
        <label htmlFor="user">Email</label>
        <input
          id="user"
          type="email"
          name="user"
          placeholder="Enter your email"
          onChange={(event) => handleInputChange("user", event.target.value)}
          value={entredValues.user}
          required
        />
      </div>

      <div className="control">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          name="password"
          placeholder="Enter your password"
          onChange={(event) =>
            handleInputChange("password", event.target.value)
          }
          value={entredValues.password}
          required
        />
      </div>

      <p className="form-actions">
        <button className="button" type="submit">
          LOG IN
        </button>
        <button className="button" onClick={handleSignInClick}>
          SIGN UP
        </button>
      </p>
    </form>
  );
}
