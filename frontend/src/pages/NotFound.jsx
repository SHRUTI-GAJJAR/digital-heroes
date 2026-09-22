import { Compass } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
function NotFound() { return <><Navbar /><main className="not-found"><Compass size={38} /><span className="page-eyebrow">404 · Lost your way?</span><h1>This page isn’t on the course.</h1><p>Let’s get you back to the Digital Heroes community.</p><Link className="nav-cta" to="/">Back to home</Link></main><Footer /></>; }
export default NotFound;
