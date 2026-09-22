import { Heart, LogOut, Menu, X } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./SharedChrome.css";

function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const close = () => setOpen(false);
  const signOut = () => { logout(); close(); navigate("/"); };
  const publicLinks = [{ label: "How it works", href: "/#how-it-works" }, { label: "Charities", to: "/charities" }, { label: "Draw", href: "/#draw" }];
  const memberLinks = [{ label: "Dashboard", to: "/dashboard" }, { label: "Scores", to: "/scores" }, { label: "Charities", to: "/charities" }, { label: "Draws", to: "/draws" }, { label: "Winners", to: "/winners" }, { label: "Subscription", to: "/subscription" }];
  const links = user ? memberLinks : publicLinks;
  return <header className="navbar"><div className="nav-container">
    <Link to="/" className="brand" onClick={close}><span className="brand-mark"><Heart size={18} strokeWidth={2.5} /></span><span>Digital Heroes</span></Link>
    <button className="nav-toggle" aria-label={open ? "Close navigation" : "Open navigation"} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
    <div className={`nav-mobile-panel ${open ? "open" : ""}`}>
    <nav className="nav-links">{links.map((link) => link.to ? <NavLink key={link.label} to={link.to} onClick={close}>{link.label}</NavLink> : <a key={link.label} href={link.href} onClick={close}>{link.label}</a>)}</nav>
    <div className="nav-actions">{user ? <>
      {isAdmin && <Link className="admin-link" to="/admin" onClick={close}>Admin</Link>}
      <span className="nav-user" title={user.email}>{user.name?.split(" ")[0] || "Profile"}</span><button className="logout-button" onClick={signOut}><LogOut size={16} /> <span>Log out</span></button>
    </> : <><Link to="/login" className="login-link" onClick={close}>Sign in</Link><Link to="/register" className="nav-cta" onClick={close}>Become a Digital Hero</Link></>}</div>
    </div>
  </div></header>;
}

export default Navbar;
