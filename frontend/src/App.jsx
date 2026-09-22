import { Route, Routes } from "react-router-dom";
import AdminLayout from "./components/AdminLayout";
import AdminRoute from "./components/AdminRoute";
import MemberLayout from "./components/MemberLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import "./components/AppLayout.css";
import Home from "./pages/Home"; import Login from "./pages/Login"; import Register from "./pages/Register"; import Charities from "./pages/Charities"; import CharityDetails from "./pages/CharityDetails"; import Dashboard from "./pages/Dashboard"; import Scores from "./pages/Scores"; import Subscription from "./pages/Subscription"; import Donations from "./pages/Donations"; import Draws from "./pages/Draws"; import DrawDetails from "./pages/DrawDetails"; import Winners from "./pages/Winners"; import WinnerVerification from "./pages/WinnerVerification"; import NotFound from "./pages/NotFound";
import AdminDashboard from "./admin/AdminDashboard"; import Users from "./admin/Users"; import CharityManagement from "./admin/CharityManagement"; import DrawManagement from "./admin/DrawManagement"; import AdminWinners from "./admin/Winners"; import Reports from "./admin/Reports";
function App() { return <Routes>
  <Route path="/" element={<Home />} /><Route path="/login" element={<Login />} /><Route path="/register" element={<Register />} /><Route path="/charities" element={<Charities />} /><Route path="/charities/:id" element={<CharityDetails />} />
  <Route element={<ProtectedRoute />}><Route element={<MemberLayout />}><Route path="/dashboard" element={<Dashboard />} /><Route path="/scores" element={<Scores />} /><Route path="/subscription" element={<Subscription />} /><Route path="/donations" element={<Donations />} /><Route path="/draws" element={<Draws />} /><Route path="/draws/:id" element={<DrawDetails />} /><Route path="/winners" element={<Winners />} /><Route path="/winners/:id" element={<WinnerVerification />} /></Route></Route>
  <Route element={<AdminRoute />}><Route element={<AdminLayout />}><Route path="/admin" element={<AdminDashboard />} /><Route path="/admin/users" element={<Users />} /><Route path="/admin/charities" element={<CharityManagement />} /><Route path="/admin/draws" element={<DrawManagement />} /><Route path="/admin/winners" element={<AdminWinners />} /><Route path="/admin/reports" element={<Reports />} /></Route></Route>
  <Route path="*" element={<NotFound />} />
</Routes>; }
export default App;
