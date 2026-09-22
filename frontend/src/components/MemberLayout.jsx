import { LayoutDashboard, Trophy, HeartHandshake, Gift, CreditCard, Medal } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const items = [["/dashboard", "Dashboard", LayoutDashboard], ["/scores", "Scores", Trophy], ["/donations", "Donations", HeartHandshake], ["/draws", "Draws", Gift], ["/winners", "Winners", Medal], ["/subscription", "Subscription", CreditCard]];
function MemberLayout() { return <><Navbar /><div className="app-layout"><aside className="side-nav"><p>Member area</p>{items.map(([to,label,Icon]) => <NavLink end={to === "/dashboard"} to={to} key={to}><Icon size={17} />{label}</NavLink>)}</aside><main className="app-main"><Outlet /></main></div></>; }
export default MemberLayout;
