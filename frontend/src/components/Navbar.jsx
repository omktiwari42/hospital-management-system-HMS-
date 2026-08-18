import {
    useState,
    useRef,
    useEffect,
} from "react";

import {
    useNavigate,
    useLocation,
} from "react-router-dom";

import { hmsToast } from "../utils/hmsToast";
import api from "../services/api";
import useRealtimeNotifications from "../hooks/useRealtimeNotifications";

import {
    FaBell,
    FaMoon,
    FaSun,
    FaUserCircle,
    FaSignOutAlt,
    FaSearch,
} from "react-icons/fa";


function Navbar() {

    const navigate = useNavigate();
    const location = useLocation();


    /* =========================
       DARK MODE
    ========================= */

    const [darkMode, setDarkMode] = useState(
        localStorage.getItem("darkMode") === "true"
    );


    /* =========================
       USER
    ========================= */

    const [fullName, setFullName] = useState(
        sessionStorage.getItem("full_name") ||
        "User"
    );

    const [role, setRole] = useState(
        sessionStorage.getItem("role") ||
        ""
    );

    const [profileImage, setProfileImage] = useState(
        sessionStorage.getItem("profile_image") ||
        null
    );

    const [imageLoading, setImageLoading] = useState(
        Boolean(
            sessionStorage.getItem(
                "profile_image"
            )
        )
    );


    /* =========================
       NOTIFICATIONS
    ========================= */

    const [
        showNotifications,
        setShowNotifications,
    ] = useState(false);

    const notificationRef =
        useRef(null);

    const [
        notifications,
        setNotifications,
    ] = useState([]);

    const [
        loadingNotifications,
        setLoadingNotifications,
    ] = useState(false);

    const [
        unreadCount,
        setUnreadCount,
    ] = useState(0);

    const [
        bellAnimation,
        setBellAnimation,
    ] = useState(false);


    /* =========================
       LOAD CURRENT USER PROFILE
    ========================= */

    async function loadCurrentProfile() {

        const token =
            localStorage.getItem("token");

        /*
         * Not logged in.
         */
        if (!token) {

            setProfileImage(null);

            setFullName("User");

            setRole("");

            setImageLoading(false);

            return;
        }

        try {

            const response =
                await api.get(
                    "/profile",
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`,
                        },
                    }
                );


            const user =
                response.data || {};


            /*
             * Full name
             */
            const name =
                user.full_name ||
                "User";

            setFullName(name);

            sessionStorage.setItem(
                "full_name",
                name
            );


            /*
             * Role
             */
            const userRole =
                user.role || "";

            setRole(userRole);

            sessionStorage.setItem(
                "role",
                userRole
            );


            /*
             * Profile image
             *
             * DATABASE IS THE SOURCE OF TRUTH.
             */
            if (user.profile_image) {

                setProfileImage(
                    user.profile_image
                );

                sessionStorage.setItem(
                    "profile_image",
                    user.profile_image
                );

                /*
                 * Image exists, so start image loading.
                 */
                setImageLoading(true);

            } else {

                /*
                 * No image in database.
                 */
                setProfileImage(null);

                sessionStorage.removeItem(
                    "profile_image"
                );

                setImageLoading(false);

            }

        } catch (error) {

            console.error(
                "Navbar profile loading error:",
                error
            );

            /*
             * Only clear the profile UI for
             * authentication failures.
             */
            if (
                error.response?.status === 401 ||
                error.response?.status === 403
            ) {

                setProfileImage(null);

                setImageLoading(false);

            }

        }

    }


    /* =========================
       LOAD PROFILE AFTER LOGIN
       AND ON ROUTE CHANGE
    ========================= */

    useEffect(() => {

        loadCurrentProfile();

    }, [location.pathname]);


    /* =========================
       PROFILE UPDATED EVENT
    ========================= */

    useEffect(() => {

        function handleUserUpdated() {

            /*
             * Refresh directly from DB.
             * Do not depend only on sessionStorage.
             */
            loadCurrentProfile();

        }


        window.addEventListener(
            "userUpdated",
            handleUserUpdated
        );


        return () => {

            window.removeEventListener(
                "userUpdated",
                handleUserUpdated
            );

        };

    }, []);


    /* =========================
       CLICK OUTSIDE NOTIFICATIONS
    ========================= */

    useEffect(() => {

        function handleClickOutside(event) {

            if (
                notificationRef.current &&
                !notificationRef.current.contains(
                    event.target
                )
            ) {

                setShowNotifications(false);

            }

        }


        document.addEventListener(
            "mousedown",
            handleClickOutside
        );


        return () => {

            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );

        };

    }, []);


    /* =========================
       MARK ALL READ
    ========================= */

    async function markAllRead() {

        try {

            await api.put(
                "/notifications/read-all"
            );


            setNotifications(
                (prev) =>
                    prev.map(
                        (item) => ({
                            ...item,
                            unread: false,
                        })
                    )
            );


            setUnreadCount(0);

        } catch (error) {

            console.error(
                "Mark all read error:",
                error
            );

        }

    }


    /* =========================
       LOAD NOTIFICATIONS
    ========================= */

    async function loadNotifications() {

        try {

            setLoadingNotifications(true);


            const response =
                await api.get(
                    "/notifications"
                );


            const data =
                Array.isArray(
                    response.data
                )
                    ? response.data
                    : [];


            setNotifications(data);


            setUnreadCount(
                data.filter(
                    (item) =>
                        item.unread
                ).length
            );

        } catch (error) {

            console.error(
                "Notification Error:",
                error
            );

        } finally {

            setLoadingNotifications(false);

        }

    }


    /* =========================
       UNREAD COUNT
    ========================= */

    async function loadUnreadCount() {

        try {

            const response =
                await api.get(
                    "/notifications/count"
                );


            setUnreadCount(
                Number(
                    response.data?.unread ||
                    0
                )
            );

        } catch (error) {

            console.error(
                "Unread count error:",
                error
            );

        }

    }


    /* =========================
       INITIAL NOTIFICATIONS
    ========================= */

    useEffect(() => {

        loadNotifications();
        loadUnreadCount();

    }, []);


    /* =========================
       REALTIME SSE
    ========================= */

    useRealtimeNotifications(
        (notification) => {

            setNotifications(
                (prev) => [
                    notification,
                    ...prev,
                ]
            );


            setUnreadCount(
                (prev) =>
                    prev + 1
            );


            const audio =
                new Audio(
                    "/notification.mp3"
                );


            audio
                .play()
                .catch(() => { });


            setBellAnimation(true);


            setTimeout(() => {

                setBellAnimation(false);

            }, 600);

        }
    );


    /* =========================
       DARK MODE
    ========================= */

    function toggleDarkMode() {

        const value =
            !darkMode;


        setDarkMode(value);


        localStorage.setItem(
            "darkMode",
            value
        );


        document.body.classList.toggle(
            "dark-mode",
            value
        );

    }


    /* =========================
       LOGOUT
    ========================= */

    function logout() {

        sessionStorage.clear();

        localStorage.removeItem(
            "token"
        );


        setProfileImage(null);

        setFullName("User");

        setRole("");

        setImageLoading(false);


        navigate("/login");

    }


    /* =========================
       PROFILE IMAGE URL
    ========================= */

    const profileImageUrl =
        profileImage
            ? `${import.meta.env.VITE_API_URL.replace(
                /\/api\/?$/,
                ""
            )}/uploads/${encodeURIComponent(
                profileImage
            )}`
            : null;


    /* =========================
       UI
    ========================= */

    return (

        <header className="top-navbar">


            {/* =========================
                LEFT
            ========================= */}

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


            {/* =========================
                RIGHT
            ========================= */}

            <div className="navbar-right">


                {/* DARK MODE */}

                <button
                    className="icon-btn"
                    onClick={
                        toggleDarkMode
                    }
                    aria-label="Toggle dark mode"
                >

                    {darkMode ? (
                        <FaSun />
                    ) : (
                        <FaMoon />
                    )}

                </button>


                {/* =========================
                    NOTIFICATIONS
                ========================= */}

                <div
                    className="notification-wrapper"
                    ref={
                        notificationRef
                    }
                >

                    <button
                        className={`icon-btn navbar-bell ${bellAnimation
                                ? "ring"
                                : ""
                            }`}
                        onClick={() => {

                            const value =
                                !showNotifications;


                            setShowNotifications(
                                value
                            );


                            if (value) {

                                loadNotifications();
                                loadUnreadCount();

                            }

                        }}
                        aria-label="Notifications"
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

                                <h3>
                                    Notifications
                                </h3>


                                <button
                                    onClick={
                                        markAllRead
                                    }
                                    className="mark-read-btn"
                                >
                                    Mark all read
                                </button>

                            </div>


                            {loadingNotifications ? (

                                <div className="empty-notification">

                                    Loading Notifications...

                                </div>

                            ) : notifications.length ===
                                0 ? (

                                <div className="empty-notification">

                                    No Notifications

                                </div>

                            ) : (

                                notifications.map(
                                    (item) => (

                                        <div
                                            key={
                                                item.id
                                            }
                                            className={`notification-item ${item.unread
                                                    ? "unread"
                                                    : ""
                                                }`}
                                        >

                                            <div className="notification-icon">

                                                {{
                                                    appointment:
                                                        "📅",

                                                    payment:
                                                        "💳",

                                                    prescription:
                                                        "💊",

                                                    report:
                                                        "🧪",

                                                    general:
                                                        "🔔",

                                                }[
                                                    item.type
                                                ] || "🔔"}

                                            </div>


                                            <div className="notification-content">

                                                <h4>
                                                    {String(
                                                        item.title ||
                                                        "Notification"
                                                    )}
                                                </h4>


                                                <p>
                                                    {String(
                                                        item.message ||
                                                        ""
                                                    )}
                                                </p>


                                                <small>

                                                    {item.created_at
                                                        ? new Date(
                                                            item.created_at
                                                        ).toLocaleString()
                                                        : "Just now"}

                                                </small>

                                            </div>

                                        </div>

                                    )
                                )

                            )}


                            <button
                                className="view-all-btn"
                                onClick={() =>
                                    navigate(
                                        "/notifications"
                                    )
                                }
                            >
                                View All Notifications
                            </button>

                        </div>

                    )}

                </div>


                {/* =========================
                    PROFILE
                ========================= */}

                <div
                    className="profile-box"
                    onClick={() =>
                        navigate("/profile")
                    }
                    title="View Profile"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {

                        if (
                            event.key ===
                            "Enter" ||
                            event.key ===
                            " "
                        ) {

                            navigate(
                                "/profile"
                            );

                        }

                    }}
                >


                    <div className="navbar-profile-avatar">


                        {profileImageUrl ? (

                            <>

                                {imageLoading && (

                                    <div className="navbar-profile-skeleton"></div>

                                )}


                                <img
                                    className="navbar-profile-image"
                                    src={
                                        profileImageUrl
                                    }
                                    alt={`${fullName} profile`}
                                    onLoad={() => {

                                        setImageLoading(
                                            false
                                        );

                                    }}
                                    onError={() => {

                                        console.error(
                                            "Profile image failed:",
                                            profileImageUrl
                                        );

                                        setImageLoading(
                                            false
                                        );

                                        setProfileImage(
                                            null
                                        );

                                        sessionStorage.removeItem(
                                            "profile_image"
                                        );

                                    }}
                                    style={{
                                        display:
                                            imageLoading
                                                ? "none"
                                                : "block",
                                    }}
                                />

                            </>

                        ) : (

                            <FaUserCircle
                                className="navbar-default-avatar"
                            />

                        )}

                    </div>


                    <div className="navbar-profile-info">

                        <strong>
                            {fullName}
                        </strong>


                        <p>
                            {role
                                ? role.toUpperCase()
                                : "USER"}
                        </p>

                    </div>

                </div>


                {/* =========================
                    LOGOUT
                ========================= */}

                <button
                    className="logout-btn"
                    onClick={
                        logout
                    }
                >

                    <FaSignOutAlt />

                    Logout

                </button>


            </div>

        </header>

    );

}


export default Navbar;