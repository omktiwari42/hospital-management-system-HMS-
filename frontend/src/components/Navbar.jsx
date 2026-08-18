import {
    useState,
    useRef,
    useEffect
} from "react";

import { hmsToast } from "../utils/hmsToast";
import api from "../services/api";
import useRealtimeNotifications from "../hooks/useRealtimeNotifications";
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
        sessionStorage.getItem("full_name") || "User"
    );

    const [role, setRole] = useState(
        sessionStorage.getItem("role") || ""
    );

    const [profileImage, setProfileImage] = useState(
        sessionStorage.getItem("profile_image") || null
    );

    const [imageLoading, setImageLoading] = useState(
        Boolean(
            sessionStorage.getItem("profile_image")
        )
    );


    /* =========================
       NOTIFICATIONS
    ========================= */

    const [
        showNotifications,
        setShowNotifications
    ] = useState(false);

    const notificationRef =
        useRef(null);

    const [
        notifications,
        setNotifications
    ] = useState([]);

    const [
        loadingNotifications,
        setLoadingNotifications
    ] = useState(false);

    const [
        unreadCount,
        setUnreadCount
    ] = useState(0);

    const [
        bellAnimation,
        setBellAnimation
    ] = useState(false);


    /* =========================
       LOAD CURRENT PROFILE
    ========================= */

    useEffect(() => {

        async function loadProfile() {

            try {

                const token =
                    localStorage.getItem(
                        "token"
                    );

                if (!token) {
                    return;
                }

                const res =
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
                    res.data || {};


                /*
                 * Always use the database
                 * value as the source of truth.
                 */

                setFullName(
                    user.full_name ||
                    sessionStorage.getItem(
                        "full_name"
                    ) ||
                    "User"
                );


                setRole(
                    user.role ||
                    sessionStorage.getItem(
                        "role"
                    ) ||
                    ""
                );


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

                    setImageLoading(true);

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


                sessionStorage.setItem(
                    "full_name",
                    user.full_name ||
                    "User"
                );


                sessionStorage.setItem(
                    "role",
                    user.role || ""
                );


            } catch (error) {

                console.error(
                    "Navbar profile error:",
                    error
                );

            }

        }


        loadProfile();

    }, []);


    /* =========================
       REALTIME PROFILE UPDATE
    ========================= */

    useEffect(() => {

        function handleUserUpdated() {

            const image =
                sessionStorage.getItem(
                    "profile_image"
                ) || null;

            const name =
                sessionStorage.getItem(
                    "full_name"
                ) || "User";

            const userRole =
                sessionStorage.getItem(
                    "role"
                ) || "";


            setProfileImage(
                image
            );

            setFullName(
                name
            );

            setRole(
                userRole
            );

            setImageLoading(
                Boolean(image)
            );

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
       CLOSE NOTIFICATIONS
    ========================= */

    useEffect(() => {

        function handleClickOutside(
            e
        ) {

            if (
                notificationRef.current &&
                !notificationRef.current.contains(
                    e.target
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
                            unread: false
                        })
                    )
            );


            setUnreadCount(0);

        } catch (err) {

            console.error(
                err
            );

        }

    }


    /* =========================
       LOAD NOTIFICATIONS
    ========================= */

    async function loadNotifications() {

        try {

            setLoadingNotifications(
                true
            );


            const res =
                await api.get(
                    "/notifications"
                );


            const data =
                Array.isArray(
                    res.data
                )
                    ? res.data
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


        } catch (err) {

            console.error(
                "Notification Error:",
                err
            );

        } finally {

            setLoadingNotifications(
                false
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
       SSE NOTIFICATIONS
    ========================= */

    useRealtimeNotifications(
        (notification) => {

            setNotifications(
                (prev) => [
                    notification,
                    ...prev
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
                .catch(
                    () => { }
                );


            setBellAnimation(
                true
            );


            setTimeout(
                () => {
                    setBellAnimation(
                        false
                    );
                },
                600
            );

        }
    );


    /* =========================
       DARK MODE
    ========================= */

    function toggleDarkMode() {

        const value =
            !darkMode;


        setDarkMode(
            value
        );


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


        setProfileImage(
            null
        );

        setFullName(
            "User"
        );

        setRole(
            ""
        );

        setImageLoading(
            false
        );


        navigate(
            "/login"
        );

    }


    /* =========================
       UNREAD COUNT
    ========================= */

    async function loadUnreadCount() {

        try {

            const res =
                await api.get(
                    "/notifications/count"
                );


            setUnreadCount(
                Number(
                    res.data?.unread ||
                    0
                )
            );

        } catch (err) {

            console.log(
                err
            );

        }

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
       RENDER
    ========================= */

    return (

        <header className="top-navbar">


            {/* LEFT */}

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


            {/* RIGHT */}

            <div className="navbar-right">


                {/* DARK MODE */}

                <button
                    className="icon-btn"
                    onClick={
                        toggleDarkMode
                    }
                    aria-label="Toggle dark mode"
                >

                    {darkMode
                        ? <FaSun />
                        : <FaMoon />
                    }

                </button>


                {/* NOTIFICATIONS */}

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
                    >

                        <FaBell />


                        {unreadCount > 0 && (

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
                                                        "🔔"

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


                {/* PROFILE */}

                <div
                    className="profile-box"
                    onClick={() =>
                        navigate(
                            "/profile"
                        )
                    }
                    title="View Profile"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {

                        if (
                            e.key ===
                            "Enter" ||
                            e.key ===
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
                                    onLoad={() =>
                                        setImageLoading(
                                            false
                                        )
                                    }
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
                                                : "block"
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


                {/* LOGOUT */}

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