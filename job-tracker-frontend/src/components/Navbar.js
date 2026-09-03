import { NavLink, useNavigate } from "react-router-dom";
import { FaBriefcase, FaPlus, FaSignOutAlt } from "react-icons/fa";
import { clearSession, getStoredUser } from "../auth";
import "./Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const user = getStoredUser();

  const logout = () => {
    clearSession();
    navigate("/login", { replace: true });
  };

  return (
    <header className="navbar">
      <div className="nav-inner">
        <NavLink to="/dashboard" className="brand">
          <span className="brand-icon"><FaBriefcase /></span>
          <span>The Job Log</span>
        </NavLink>
        <nav className="nav-links">
          <NavLink to="/dashboard" end className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Dashboard</NavLink>
          <NavLink to="/add-job" className="nav-add"><FaPlus /> Add Job</NavLink>
          <div className="user-menu">
            <span className="user-name">{user?.name || "Account"}</span>
            <button className="logout-button" onClick={logout} title="Logout" aria-label="Logout"><FaSignOutAlt /></button>
          </div>
        </nav>
      </div>
    </header>
  );
}
