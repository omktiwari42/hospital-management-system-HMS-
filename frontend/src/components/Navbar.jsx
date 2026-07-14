import { useState, useRef, useEffect } from "react";
import api from "../services/api";
import useNotificationWatcher from "../hooks/useNotificationWatcher";
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
    /* ===========================
NOTIFICATIONS
=========================== */

    const [showNotifications, setShowNotifications] = useState(false);

    const notificationRef = useRef(null);

    const [notifications, setNotifications] = useState([]);
    const [loadingNotifications, setLoadingNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const [bellAnimation, setBellAnimation] =
        useState(false);


    /* Close dropdown when clicking outside */

    useEffect(() => {

        function handleClickOutside(e) {

            if (
                notificationRef.current &&
                !notificationRef.current.contains(e.target)
            ) {
                setShowNotifications(false);
            }

        }

        document.addEventListener(
            "mousedown",
            handleClickOutside
        );

        return () =>
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );

    }, []);

    async function markAllRead() {

        try {

            await api.put("/notifications/read-all");

            setNotifications(prev =>
                prev.map(item => ({
                    ...item,
                    unread: false
                }))
            );
            setUnreadCount(0);
        } catch (err) {

            console.error(err);

        }

    }
    async function loadNotifications() {

        try {

            setLoadingNotifications(true);

            const res = await api.get("/notifications");

            setNotifications(res.data || []);
            setUnreadCount(
                res.data.filter(item => item.unread).length
            );

        } catch (err) {

            console.error("Notification Error:", err);

        } finally {

            setLoadingNotifications(false);

        }

    }

    useEffect(() => {

        loadNotifications();

    }, []);
    useEffect(() => {

        loadUnreadCount();

    }, []);
    useNotificationWatcher((notifications) => {



        setUnreadCount(unread);

        setBellAnimation(true);

        setTimeout(() => {

            setBellAnimation(false);

        }, 600);

    }, 15000);

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

    async function loadUnreadCount() {

        try {

            const res =
                await api.get("/notifications/count");

            setUnreadCount(res.data.unread);

        } catch (err) {

            console.log(err);

        }

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

                <div
                    className="notification-wrapper"
                    ref={notificationRef}
                >

                    <button
                        className={`icon-btn navbar-bell ${bellAnimation ? "ring" : ""
                            }`}
                        onClick={() => {

                            const value = !showNotifications;

                            setShowNotifications(value);

                            if (value) {

                                loadNotifications();
                                loadUnreadCount();

                            }

                        }}
                    >

                        <FaBell />

                        {unreadCount > 0 && (

                            <span className="notification-count">

                                {unreadCount > 99
                                    ? "99+"
                                    : unreadCount}

                            </span>

                        )}

                    </button>

                    {showNotifications && (

                        <div className="notification-dropdown">

                            <div className="notification-header">

                                <h3>Notifications</h3>

                                <button
                                    onClick={markAllRead}
                                    className="mark-read-btn"
                                >
                                    Mark all read
                                </button>

                            </div>

                            {loadingNotifications ? (

                                <div className="empty-notification">

                                    Loading Notifications...

                                </div>

                            ) : notifications.length === 0 ? (

                                <div className="empty-notification">

                                    No Notifications

                                </div>

                            ) : (

                                notifications.map(item => (

                                    <div
                                        key={item.id}
                                        className={`notification-item ${item.unread ? "unread" : ""
                                            }`}
                                    >

                                        <div className="notification-icon">
                                            {{
                                                appointment: "📅",
                                                payment: "💳",
                                                prescription: "💊",
                                                report: "🧪",
                                                general: "🔔"
                                            }[item.type] || "🔔"}
                                        </div>
                                        <div className="notification-content">

                                            <h4>{item.title}</h4>

                                            <p>{item.message}</p>

                                            <small>
                                                {new Date(item.created_at).toLocaleString()}
                                            </small>
                                        </div>

                                    </div>

                                ))

                            )}

                            <button
                                className="view-all-btn"
                                onClick={() => navigate("/notifications")}
                            >
                                View All Notifications
                            </button>

                        </div>

                    )}

                </div>

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