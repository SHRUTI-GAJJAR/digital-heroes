import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2, Eye, EyeOff, Heart } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "./Register.css";
import "../components/SharedChrome.css";

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!form.email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await register(
        form.name.trim(),
        form.email.trim(),
        form.password
      );

      navigate("/dashboard", { replace: true });
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "We couldn’t create your account. Please try again.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="register-page">
      <Link to="/" className="brand register-home">
        <span className="brand-mark">
          <Heart size={18} strokeWidth={2.5} />
        </span>
        <span>Digital Heroes</span>
      </Link>
      <div className="register-container">
        <section className="register-intro">
          <span className="register-eyebrow">
            <CheckCircle2 size={16} />
            Join Digital Heroes
          </span>

          <h1>
            Play with purpose.
            <br />
            <em>Make a difference.</em>
          </h1>

          <p>
            Create your account and turn your golf journey into
            something that gives back.
          </p>

          <div className="register-benefits">
            <div>
              <CheckCircle2 size={18} />
              <span>Track your golf scores</span>
            </div>

            <div>
              <CheckCircle2 size={18} />
              <span>Support a charity you care about</span>
            </div>

            <div>
              <CheckCircle2 size={18} />
              <span>Take part in monthly draws</span>
            </div>
          </div>
        </section>

        <section className="register-card">
          <div className="register-card-header">
            <h2>Create your account</h2>
            <p>Start your Digital Heroes journey.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="register-field">
              <label htmlFor="name">Full name</label>
              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                autoComplete="name"
              />
            </div>

            <div className="register-field">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <div className="register-field">
              <label htmlFor="password">Password</label>

              <div className="password-input">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            <div className="register-field">
              <label htmlFor="confirmPassword">
                Confirm password
              </label>

              <div className="password-input">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      (current) => !current
                    )
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="register-error" role="alert">
                {error}
              </div>
            )}

            <button
              className="register-submit"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                "Creating account…"
              ) : (
                <>
                  Create account
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p className="register-login">
            Already have an account?{" "}
            <Link to="/login">Sign in</Link>
          </p>
        </section>
      </div>
    </main>
  );
}

export default Register;