import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import "./SharedChrome.css";

function Footer() {
  return <footer className="footer"><div className="footer-container"><div className="footer-brand"><Link to="/" className="brand"><span className="brand-mark"><Heart size={18} strokeWidth={2.5} /></span><span>Digital Heroes</span></Link><p>Play with purpose. Make an impact.</p></div><div className="footer-links"><Link to="/charities">Charities</Link><Link to="/draws">Draws</Link><Link to="/login">Sign in</Link><Link to="/register">Subscribe</Link></div><div className="footer-bottom">© {new Date().getFullYear()} Digital Heroes. All rights reserved.</div></div></footer>;
}

export default Footer;
