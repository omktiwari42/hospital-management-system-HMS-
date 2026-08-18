import {
    useState,
    useRef,
    useEffect,
} from "react";

import {
    useLocation,
    useNavigate,
} from "react-router-dom";

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

    const location = useLocation();
    const navigate = useNavigate();


    /* =====================================================
       DARK MODE
    ===================================================== */

    const [darkMode, setDarkMode] = useState(
        localStorage.getItem("darkMode") === "true"
    );


    /* =====================================================
       USER
    ===================================================== */

    const [fullName, setFullName] = useState(
        sessionStorage.getItem("full_name") || "User"
    );

    const [role, setRole] = useState(
        sessionStorage.getItem("role") || ""
    );

    const [profileImage, setProfileImage] = useState(
        sessionStorage.getItem("profile_image") || null
    );

    const [imageLoading, setImageLoading] =
        useState(false);


    /* =====================================================
       NOTIFICATIONS
    ===================================================== */

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


    /* =====================================================
       ABORT ERROR CHECK
    ===================================================== */

    function isRequestAborted(error) {

        if (!error) {
            return false;
        }

        const message =
            String(
                error.message || ""
            ).toLowerCase();

        return (
            error.code === "ERR_CANCELED" ||
            error.name === "CanceledError" ||
            message.includes("request aborted") ||
            message === "canceled" ||
            message.includes("aborted")
        );
    }


    /* =====================================================
       LOAD CURRENT USER PROFILE
    ===================================================== */

    async function loadCurrentProfile() {

        const token =
            localStorage.getItem("token");


        const cachedName =
            sessionStorage.getItem(
                "full_name"
            );

        const cachedRole =
            sessionStorage.getItem(
                "role"
            );

        const cachedImage =
            sessionStorage.getItem(
                "profile_image"
            );


        /*
         * Show cached values immediately.
         */
        if (cachedName) {

            setFullName(
                cachedName
            );

        }

        if (cachedRole) {

            setRole(
                cachedRole
            );

        }

        if (cachedImage) {

            setProfileImage(
                cachedImage
            );

        }


        /*
         * No token.
         */
        if (!token) {

            setFullName(
                cachedName || "User"
            );

            setRole(
                cachedRole || ""
            );

            setProfileImage(
                cachedImage || null
            );

            setImageLoading(
                false
            );

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
             * Backend returns the user
             * object directly.
             */
            const name =
                user.full_name ||
                cachedName ||
                "User";


            const userRole =
                user.role ||
                cachedRole ||
                "patient";


            setFullName(
                String(name)
            );

            setRole(
                String(userRole)
            );


            /*
             * Keep session data synchronized.
             */
            sessionStorage.setItem(
                "full_name",
                String(name)
            );

            sessionStorage.setItem(
                "role",
                String(userRole)
            );


            /*
             * Profile image.
             */
            if (
                user.profile_image
            ) {

                setProfileImage(
                    user.profile_image
                );

                sessionStorage.setItem(
                    "profile_image",
                    user.profile_image
                );

                setImageLoading(
                    true
                );

            } else {

                setProfileImage(
                    null
                );

                sessionStorage.removeItem(
                    "profile_image"
                );

                setImageLoading(
                    false
                );

            }

        } catch (error) {

            /*
             * Ignore normal request
             * cancellation.
             */
            if (
                isRequestAborted(
                    error
                )
            ) {
                return;
            }


            console.error(
                "Navbar profile loading error:",
                error
            );


            /*
             * Keep cached data.
             */
            if (cachedName) {

                setFullName(
                    cachedName
                );

            }

            if (cachedRole) {

                setRole(
                    cachedRole
                );

            }

            if (cachedImage) {

                setProfileImage(
                    cachedImage
                );

            }

        }

    }


    /* =====================================================
       LOAD PROFILE WHEN ROUTE CHANGES
    ===================================================== */

    useEffect(() => {

        loadCurrentProfile();

    }, [
        location.pathname,
    ]);


    /* =====================================================
       PROFILE UPDATED EVENT
    ===================================================== */

    useEffect(() => {

        function handleUserUpdated() {

            const name =
                sessionStorage.getItem(
                    "full_name"
                );

            const userRole =
                sessionStorage.getItem(
                    "role"
                );

            const image =
                sessionStorage.getItem(
                    "profile_image"
                );


            if (name) {

                setFullName(
                    name
                );

            }

            if (userRole) {

                setRole(
                    userRole
                );

            }

            setProfileImage(
                image || null
            );


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


    /* =====================================================
       CLOSE NOTIFICATION DROPDOWN
    ===================================================== */

    useEffect(() => {

        function handleClickOutside(
            event
        ) {

            if (
                notificationRef.current &&
                !notificationRef.current.contains(
                    event.target
                )
            ) {

                setShowNotifications(
                    false
                );

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


    /* =====================================================
       LOAD NOTIFICATIONS
    ===================================================== */

    async function loadNotifications() {

        try {

            setLoadingNotifications(
                true
            );


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


            setNotifications(
                data
            );


            setUnreadCount(
                data.filter(
                    (item) =>
                        item.unread
                ).length
            );


        } catch (error) {

            if (
                isRequestAborted(
                    error
                )
            ) {
                return;
            }


            console.error(
                "Notification Error:",
                error
            );

        } finally {

            setLoadingNotifications(
                false
            );

        }

    }


    /* =====================================================
       LOAD UNREAD COUNT
    ===================================================== */

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

            if (
                isRequestAborted(
                    error
                )
            ) {
                return;
            }


            console.error(
                "Unread count error:",
                error
            );

        }

    }


    /* =====================================================
       INITIAL NOTIFICATIONS
    ===================================================== */

    useEffect(() => {

        loadNotifications();
        loadUnreadCount();

    }, []);


    /* =====================================================
       REALTIME NOTIFICATIONS
    ===================================================== */

    useRealtimeNotifications(
        (notification) => {

            setNotifications(
                (previous) => [
                    notification,
                    ...previous,
                ]
            );


            setUnreadCount(
                (previous) =>
                    previous + 1
            );


            const audio =
                new Audio(
                    "/notification.mp3"
                );


            audio
                .play()
                .catch(() => { });


            setBellAnimation(
                true
            );


            setTimeout(() => {

                setBellAnimation(
                    false
                );

            }, 600);

        }
    );


    /* =====================================================
       DARK MODE
    ===================================================== */

    function toggleDarkMode() {

        const value =
            !darkMode;


        setDarkMode(
            value
        );


        localStorage.setItem(
            "darkMode",
            String(value)
        );


        document.body.classList.toggle(
            "dark-mode",
            value
        );

    }


    /* =====================================================
       MARK ALL READ
    ===================================================== */

    async function markAllRead() {

        try {

            await api.put(
                "/notifications/read-all"
            );


            setNotifications(
                (previous) =>
                    previous.map(
                        (item) => ({
                            ...item,
                            unread:
                                false,
                        })
                    )
            );


            setUnreadCount(
                0
            );


        } catch (error) {

            if (
                isRequestAborted(
                    error
                )
            ) {
                return;
            }


            console.error(
                "Mark all read error:",
                error
            );

        }

    }


    /* =====================================================
       LOGOUT
    ===================================================== */

    function logout() {

        sessionStorage.clear();

        localStorage.removeItem(
            "token"
        );


        setFullName(
            "User"
        );

        setRole(
            ""
        );

        setProfileImage(
            null
        );


        window.location.href =
            "/login";
    }


    /* =====================================================
       PROFILE IMAGE URL
    ===================================================== */

    const API_URL =
        import.meta.env.VITE_API_URL ||
        "http://localhost:5000/api";


    const backendUrl =
        API_URL.replace(
            /\/api\/?$/,
            ""
        );


    const profileImageUrl =
        profileImage
            ? `${backendUrl}/uploads/${encodeURIComponent(
                profileImage
            )}`
            : null;


    /* =====================================================
       OPEN PROFILE
    ===================================================== */

    function openProfile(event) {

        event.preventDefault();
        event.stopPropagation();

        setShowNotifications(
            false
        );

        navigate(
            "/profile"
        );

    }


    /* =====================================================
       UI
    ===================================================== */

    return (

        <header className="top-navbar">

            {/* =================================================
                LEFT
            ================================================= */}

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


            {/* =================================================
                RIGHT
            ================================================= */}

            <div className="navbar-right">


                {/* =================================================
                    DARK MODE
                ================================================= */}

                <button
                    type="button"
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


                {/* =================================================
                    NOTIFICATIONS
                ================================================= */}

                <div
                    className="notification-wrapper"
                    ref={
                        notificationRef
                    }
                >

                    <button
                        type="button"
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


                        {unreadCount >
                            0 && (

                                <span className="notification-count">

                                    {unreadCount >
                                        99
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
                                    type="button"
                                    className="mark-read-btn"
                                    onClick={
                                        markAllRead
                                    }
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
                                                ] ||
                                                    "🔔"}

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
                                type="button"
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


                {/* =================================================
                    PROFILE
                ================================================= */}

                <button
                    type="button"
                    className="profile-box"
                    title="View Profile"
                    aria-label="Open Profile"

                    onPointerDownCapture={(event) => {
                        event.stopPropagation();
                    }}

                    onClickCapture={(event) => {
                        event.preventDefault();
                        event.stopPropagation();

                        navigate(
                            "/profile"
                        );
                    }}
                >

                    <span className="navbar-profile-avatar">

                        {profileImageUrl ? (

                            <>

                                {imageLoading && (
                                    <span className="navbar-profile-skeleton" />
                                )}


                                <img
                                    className="navbar-profile-image"
                                    src={
                                        profileImageUrl
                                    }
                                    alt={`${fullName} profile`}

                                    onLoad={() =>
                                        setImageLoading(
                                            false
                                        )
                                    }

                                    onError={() => {

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

                    </span>


                    <span className="navbar-profile-info">

                        <strong>

                            {fullName !==
                                "User"
                                ? fullName
                                : (
                                    sessionStorage.getItem(
                                        "full_name"
                                    ) ||
                                    "Patient"
                                )}

                        </strong>


                        <span>

                            {role
                                ? role.toUpperCase()
                                : "PATIENT"}

                        </span>

                    </span>

                </button>


                {/* =================================================
                    LOGOUT
                ================================================= */}

                <button
                    type="button"
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