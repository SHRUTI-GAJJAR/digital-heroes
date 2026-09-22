import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, Heart, LogIn } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "./Register.css";
import "../components/SharedChrome.css";

function Login() {
  const { login, user, loading: checkingSession } = useAuth();
  const navigate = useNavigate(); const location = useLocation();
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [showPassword, setShowPassword] = useState(false); const [submitting, setSubmitting] = useState(false); const [error, setError] = useState("");
  if (!checkingSession && user) return <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} replace />;
  const submit = async (event) => { event.preventDefault(); if (!email.trim() || !password) return setError("Please enter your email and password."); try { setSubmitting(true); setError(""); const signedInUser = await login(email.trim(), password); const from = location.state?.from?.pathname; navigate(from || (signedInUser.role === "admin" ? "/admin" : "/dashboard"), { replace: true }); } catch (err) { setError(err.response?.data?.message || err.message || "Unable to sign in. Please try again."); } finally { setSubmitting(false); } };
  return <main className="register-page"><Link to="/" className="brand register-home"><span className="brand-mark"><Heart size={18} strokeWidth={2.5} /></span><span>Digital Heroes</span></Link><div className="register-container"><section className="register-intro"><span className="register-eyebrow"><LogIn size={16} /> Welcome back</span><h1>Keep playing.<br /><em>Keep giving.</em></h1><p>Sign in to manage your subscription, scores and the charities you support.</p></section><section className="register-card"><div className="register-card-header"><h2>Sign in</h2><p>Welcome back, Digital Hero.</p></div><form onSubmit={submit}><div className="register-field"><label htmlFor="email">Email address</label><input id="email" type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }} autoComplete="email" placeholder="you@example.com" /></div><div className="register-field"><label htmlFor="password">Password</label><div className="password-input"><input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => { setPassword(e.target.value); setError(""); }} autoComplete="current-password" placeholder="Enter your password" /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>{error && <div className="register-error" role="alert">{error}</div>}<button className="register-submit" type="submit" disabled={submitting}>{submitting ? "Signing in…" : <>Sign in <ArrowRight size={18} /></>}</button></form><p className="register-login">New to Digital Heroes? <Link to="/register">Create an account</Link></p></section></div></main>;
}
export default Login;
