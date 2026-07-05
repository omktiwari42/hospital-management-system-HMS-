import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaBell,
    FaMoon,
    FaSun,
    FaUserCircle,
    FaSignOutAlt,
    FaSearch
} from "react-icons/fa";

function Navbar() {
    const navigate = useNavigate();

    const [darkMode, setDarkMode] = useState(
        localStorage.getItem("darkMode") === "true"
    );

    const fullName =
        sessionStorage.getItem("full_name") || "User";

    const role =
        sessionStorage.getItem("role") || "";

    function toggleDarkMode() {
        const value = !darkMode;

        setDarkMode(value);

        localStorage.setItem("darkMode", value);

        document.body.classList.toggle(
            "dark-mode",
            value
        );
    }

    function logout() {
        sessionStorage.clear();
        localStorage.removeItem("token");
        navigate("/login");
    }

    return (
        <header className="top-navbar">

            <div className="navbar-left">

                <h2 className="navbar-logo">
                    🏥 HMS
                </h2>

                <div className="navbar-search">

                    <FaSearch />

                    <input
                        type="text"
                        placeholder="Search..."
                    />

                </div>

            </div>

            <div className="navbar-right">

                <button
                    className="icon-btn"
                    onClick={toggleDarkMode}
                >
                    {darkMode ? <FaSun /> : <FaMoon />}
                </button>

                <button className="icon-btn">
                    <FaBell />
                </button>

                <div className="profile-box">

                    <FaUserCircle size={34} />

                    <div>

                        <strong>{fullName}</strong>

                        <p>{role.toUpperCase()}</p>

                    </div>

                </div>

                <button
                    className="logout-btn"
                    onClick={logout}
                >
                    <FaSignOutAlt />
                    Logout
                </button>

            </div>

        </header>
    );
}

export default Navbar;