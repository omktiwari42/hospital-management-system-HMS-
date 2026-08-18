import {
    useEffect,
    useMemo,
    useRef,
    useState,
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
    FaTimes,
    FaChevronRight,
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
       SEARCH
    ===================================================== */

    const [searchQuery, setSearchQuery] =
        useState("");

    const [showSearchResults, setShowSearchResults] =
        useState(false);

    const searchRef = useRef(null);


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
       REQUEST ABORT CHECK
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
       LOAD CURRENT PROFILE
    ===================================================== */

    async function loadCurrentProfile() {

        /*
         * IMPORTANT:
         * Authentication is stored in sessionStorage.
         */
        const token =
            sessionStorage.getItem("token");


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


        /* ---------------------------------------------
           Show cached data immediately
        --------------------------------------------- */

        if (cachedName) {
            setFullName(cachedName);
        }

        if (cachedRole) {
            setRole(cachedRole);
        }

        if (cachedImage) {
            setProfileImage(cachedImage);
        }


        /* ---------------------------------------------
           No token
        --------------------------------------------- */

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


            sessionStorage.setItem(
                "full_name",
                String(name)
            );

            sessionStorage.setItem(
                "role",
                String(userRole)
            );


            if (user.profile_image) {

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

                setProfileImage(null);

                sessionStorage.removeItem(
                    "profile_image"
                );

                setImageLoading(
                    false
                );

            }

        } catch (error) {

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


            if (cachedName) {
                setFullName(cachedName);
            }

            if (cachedRole) {
                setRole(cachedRole);
            }

            if (cachedImage) {
                setProfileImage(cachedImage);
            }

        }
    }


    /* =====================================================
       RELOAD PROFILE ON ROUTE CHANGE
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
                setFullName(name);
            }

            if (userRole) {
                setRole(userRole);
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
       SEARCH DATA
    ===================================================== */

    const searchItems = useMemo(() => {

        const items = [

            {
                label: "Dashboard",
                description: "Open your main dashboard",
                keywords:
                    "dashboard home admin",
                path: "/dashboard",
                roles: ["admin"],
            },

            {
                label: "Patient Dashboard",
                description: "Open your patient dashboard",
                keywords:
                    "patient dashboard home",
                path: "/patient-dashboard",
                roles: ["patient"],
            },

            {
                label: "Doctor Dashboard",
                description: "Open doctor workspace",
                keywords:
                    "doctor dashboard",
                path: "/doctor-dashboard",
                roles: ["doctor"],
            },

            {
                label: "Reception Dashboard",
                description: "Open receptionist workspace",
                keywords:
                    "reception receptionist dashboard",
                path: "/reception-dashboard",
                roles: ["receptionist"],
            },

            {
                label: "Pharmacist Dashboard",
                description: "Open pharmacist workspace",
                keywords:
                    "pharmacist pharmacy dashboard",
                path: "/pharmacist-dashboard",
                roles: ["pharmacist"],
            },

            {
                label: "Lab Dashboard",
                description: "Open laboratory workspace",
                keywords:
                    "lab laboratory dashboard",
                path: "/lab-dashboard",
                roles: ["lab"],
            },

            {
                label: "Patients",
                description: "Manage hospital patients",
                keywords:
                    "patient patients records",
                path: "/patients",
                roles: ["admin"],
            },

            {
                label: "Doctors",
                description: "Manage doctors and specialists",
                keywords:
                    "doctor doctors specialist",
                path: "/doctors",
                roles: ["admin"],
            },

            {
                label: "Find a Doctor",
                description: "Find specialists and book a visit",
                keywords:
                    "doctor doctors specialist patient",
                path: "/patient-doctors",
                roles: ["patient"],
            },

            {
                label: "Appointments",
                description: "View and manage appointments",
                keywords:
                    "appointment appointments booking",
                path: "/appointments",
                roles: [
                    "admin",
                    "doctor",
                    "receptionist",
                    "pharmacist",
                    "lab",
                    "patient",
                ],
            },

            {
                label: "Book Appointment",
                description: "Schedule a doctor appointment",
                keywords:
                    "book appointment doctor consultation",
                path: "/book-appointment",
                roles: ["patient"],
            },

            {
                label: "My Appointments",
                description: "View your patient appointments",
                keywords:
                    "patient appointments upcoming completed",
                path: "/patient-appointments",
                roles: ["patient"],
            },

            {
                label: "Medical Reports",
                description: "View and manage medical reports",
                keywords:
                    "reports medical files documents",
                path: "/medical-reports",
                roles: [
                    "admin",
                    "doctor",
                ],
            },

            {
                label: "Prescriptions",
                description: "View your medicines and prescriptions",
                keywords:
                    "prescription prescriptions medicine medicines",
                path: "/patient-prescriptions",
                roles: ["patient"],
            },

            {
                label: "Billing",
                description: "Manage billing and payments",
                keywords:
                    "billing bill payment invoice",
                path: "/billing",
                roles: ["admin"],
            },

            {
                label: "Patient Billing",
                description: "View your bills and payments",
                keywords:
                    "patient billing payment invoice",
                path: "/patient-billing",
                roles: ["patient"],
            },

            {
                label: "Payment",
                description: "Open payment page",
                keywords:
                    "payment pay transaction razorpay",
                path: "/payment",
                roles: [
                    "admin",
                    "doctor",
                    "receptionist",
                    "pharmacist",
                    "lab",
                    "patient",
                ],
            },

            {
                label: "Medical History",
                description: "Manage patient medical history",
                keywords:
                    "medical history illness surgery allergy",
                path: "/patient-medical-history",
                roles: [
                    "admin",
                    "doctor",
                ],
            },

            {
                label: "Profile",
                description: "View and edit your profile",
                keywords:
                    "profile account personal details",
                path: "/profile",
                roles: [
                    "admin",
                    "doctor",
                    "receptionist",
                    "pharmacist",
                    "lab",
                    "patient",
                ],
            },

            {
                label: "Notifications",
                description: "View your latest notifications",
                keywords:
                    "notifications alerts messages",
                path: "/notifications",
                roles: [
                    "admin",
                    "doctor",
                    "receptionist",
                    "pharmacist",
                    "lab",
                    "patient",
                ],
            },

        ];


        const currentRole =
            String(
                role || "patient"
            ).toLowerCase();


        return items.filter(
            (item) =>
                item.roles.includes(
                    currentRole
                )
        );

    }, [role]);


    const filteredSearchItems =
        useMemo(() => {

            const query =
                searchQuery
                    .trim()
                    .toLowerCase();


            if (!query) {
                return [];
            }


            return searchItems
                .filter((item) => {

                    return (
                        item.label
                            .toLowerCase()
                            .includes(query) ||

                        item.description
                            .toLowerCase()
                            .includes(query) ||

                        item.keywords
                            .toLowerCase()
                            .includes(query)
                    );

                })
                .slice(0, 7);

        }, [
            searchItems,
            searchQuery,
        ]);


    function openSearchResult(path) {

        setSearchQuery("");

        setShowSearchResults(false);

        navigate(path);

    }


    /* =====================================================
       SEARCH OUTSIDE CLICK
    ===================================================== */

    useEffect(() => {

        function handleSearchOutside(
            event
        ) {

            if (
                searchRef.current &&
                !searchRef.current.contains(
                    event.target
                )
            ) {

                setShowSearchResults(
                    false
                );

            }

        }


        document.addEventListener(
            "mousedown",
            handleSearchOutside
        );


        return () => {

            document.removeEventListener(
                "mousedown",
                handleSearchOutside
            );

        };

    }, []);


    /* =====================================================
       NOTIFICATION OUTSIDE CLICK
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
       NOTIFICATIONS
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


            setUnreadCount(0);

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


        setFullName("User");
        setRole("");
        setProfileImage(null);


        window.location.href =
            "/login";

    }


    /* =====================================================
       PROFILE IMAGE
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
       PROFILE
    ===================================================== */

    function openProfile(event) {

        event.preventDefault();

        event.stopPropagation();

        setShowNotifications(false);

        setShowSearchResults(false);

        navigate("/profile");

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


                {/* =================================================
                    SEARCH
                ================================================= */}

                <div
                    className="navbar-search-wrapper"
                    ref={searchRef}
                >

                    <div
                        className={`navbar-search ${showSearchResults
                                ? "is-open"
                                : ""
                            }`}
                    >

                        <FaSearch
                            className="navbar-search-icon"
                        />


                        <input
                            type="text"
                            value={searchQuery}
                            placeholder="Search pages, appointments..."
                            autoComplete="off"

                            onFocus={() => {

                                if (
                                    searchQuery.trim()
                                ) {

                                    setShowSearchResults(
                                        true
                                    );

                                }

                            }}

                            onChange={(event) => {

                                const value =
                                    event.target.value;

                                setSearchQuery(
                                    value
                                );

                                setShowSearchResults(
                                    value.trim()
                                        .length > 0
                                );

                            }}

                            onKeyDown={(event) => {

                                if (
                                    event.key ===
                                    "Enter"
                                ) {

                                    if (
                                        filteredSearchItems.length >
                                        0
                                    ) {

                                        openSearchResult(
                                            filteredSearchItems[0]
                                                .path
                                        );

                                    }

                                    return;
                                }


                                if (
                                    event.key ===
                                    "Escape"
                                ) {

                                    setSearchQuery(
                                        ""
                                    );

                                    setShowSearchResults(
                                        false
                                    );

                                }

                            }}
                        />


                        {searchQuery && (

                            <button
                                type="button"
                                className="navbar-search-clear"
                                aria-label="Clear search"

                                onClick={() => {

                                    setSearchQuery(
                                        ""
                                    );

                                    setShowSearchResults(
                                        false
                                    );

                                }}
                            >
                                <FaTimes />

                            </button>

                        )}

                    </div>


                    {/* =================================================
                        SEARCH RESULTS
                    ================================================= */}

                    {showSearchResults && (

                        <div className="navbar-search-dropdown">

                            <div className="navbar-search-dropdown-header">

                                <span>
                                    Quick Navigation
                                </span>

                                {filteredSearchItems.length >
                                    0 && (

                                        <small>
                                            {filteredSearchItems.length}
                                            {" "}
                                            result
                                            {filteredSearchItems.length !==
                                                1
                                                ? "s"
                                                : ""}
                                        </small>

                                    )}

                            </div>


                            {filteredSearchItems.length >
                                0 ? (

                                <div className="navbar-search-results">

                                    {filteredSearchItems.map(
                                        (item) => (

                                            <button
                                                key={
                                                    item.path
                                                }
                                                type="button"
                                                className="navbar-search-result"

                                                onClick={() =>
                                                    openSearchResult(
                                                        item.path
                                                    )
                                                }
                                            >

                                                <span className="navbar-search-result-icon">
                                                    <FaSearch />
                                                </span>


                                                <span className="navbar-search-result-content">

                                                    <strong>
                                                        {
                                                            item.label
                                                        }
                                                    </strong>

                                                    <small>
                                                        {
                                                            item.description
                                                        }
                                                    </small>

                                                </span>


                                                <FaChevronRight
                                                    className="navbar-search-result-arrow"
                                                />

                                            </button>

                                        )
                                    )}

                                </div>

                            ) : (

                                <div className="navbar-search-empty">

                                    <span className="navbar-search-empty-icon">
                                        🔎
                                    </span>

                                    <strong>
                                        No results found
                                    </strong>

                                    <small>
                                        Try another page,
                                        feature or keyword.
                                    </small>

                                </div>

                            )}

                        </div>

                    )}

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

                                setShowSearchResults(
                                    false
                                );

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

                                onClick={() => {

                                    setShowNotifications(
                                        false
                                    );

                                    navigate(
                                        "/notifications"
                                    );

                                }}
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

                    onPointerDownCapture={(
                        event
                    ) => {
                        event.stopPropagation();
                    }}

                    onClickCapture={(
                        event
                    ) => {
                        openProfile(event);
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

                                    alt={
                                        `${fullName} profile`
                                    }

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