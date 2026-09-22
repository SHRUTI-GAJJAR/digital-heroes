import { BarChart3, HeartHandshake, LayoutDashboard, Trophy, Users, Medal } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import Navbar from "./Navbar";
const items = [["/admin", "Dashboard", LayoutDashboard], ["/admin/users", "Users", Users], ["/admin/charities", "Charities", HeartHandshake], ["/admin/draws", "Draws", Trophy], ["/admin/winners", "Winners", Medal], ["/admin/reports", "Reports", BarChart3]];
function AdminLayout() { return <><Navbar /><div className="app-layout admin-layout"><aside className="side-nav"><p>Administration</p>{items.map(([to,label,Icon]) => <NavLink end={to === "/admin"} to={to} key={to}><Icon size={17} />{label}</NavLink>)}</aside><main className="app-main"><Outlet /></main></div></>; }
export default AdminLayout;
