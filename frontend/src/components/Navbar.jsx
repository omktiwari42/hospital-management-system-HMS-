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
       STORED IN SESSION STORAGE
    ===================================================== */

    const [darkMode, setDarkMode] = useState(() => {
        return (
            sessionStorage.getItem("darkMode") ===
            "true"
        );
    });


    /* =====================================================
       USER
    ===================================================== */

    const [fullName, setFullName] = useState(
        sessionStorage.getItem("full_name") ||
        "User"
    );

    const [role, setRole] = useState(
        sessionStorage.getItem("role") || ""
    );


    /* =====================================================
       PROFILE IMAGE
    ===================================================== */

    const [profileImage, setProfileImage] =
        useState(
            sessionStorage.getItem(
                "profile_image"
            ) || null
        );

    const [imageLoading, setImageLoading] =
        useState(false);

    const [imageError, setImageError] =
        useState(false);


    /* =====================================================
       SEARCH
    ===================================================== */

    const [searchQuery, setSearchQuery] =
        useState("");

    const [
        showSearchResults,
        setShowSearchResults,
    ] = useState(false);

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
       APPLY DARK MODE GLOBALLY
    ===================================================== */

    useEffect(() => {

        document.documentElement.classList.toggle(
            "dark-mode",
            darkMode
        );

        document.body.classList.toggle(
            "dark-mode",
            darkMode
        );

        sessionStorage.setItem(
            "darkMode",
            String(darkMode)
        );

    }, [darkMode]);


    /* =====================================================
       REQUEST ABORT CHECK
    ===================================================== */

    function isRequestAborted(error) {

        if (!error) {
            return false;
        }

        const message = String(
            error.message || ""
        ).toLowerCase();

        return (
            error.code === "ERR_CANCELED" ||
            error.name === "CanceledError" ||
            message.includes("request aborted") ||
            message.includes("aborted") ||
            message.includes("canceled")
        );
    }


    /* =====================================================
       LOAD PROFILE
    ===================================================== */

    async function loadCurrentProfile() {

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
           USE CACHE IMMEDIATELY
        --------------------------------------------- */

        if (cachedName) {
            setFullName(cachedName);
        }

        if (cachedRole) {
            setRole(cachedRole);
        }

        if (cachedImage) {
            setProfileImage(cachedImage);
            setImageError(false);
            setImageLoading(true);
        } else {
            setProfileImage(null);
            setImageError(false);
            setImageLoading(false);
        }


        /* ---------------------------------------------
           NO TOKEN
        --------------------------------------------- */

        if (!token) {
            setFullName(
                cachedName || "User"
            );

            setRole(
                cachedRole || ""
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


            /* -----------------------------------------
               PROFILE IMAGE
            ----------------------------------------- */

            if (user.profile_image) {

                const image =
                    String(
                        user.profile_image
                    ).trim();

                setProfileImage(image);

                setImageError(false);

                setImageLoading(true);

                sessionStorage.setItem(
                    "profile_image",
                    image
                );

            } else {

                setProfileImage(null);

                setImageError(false);

                setImageLoading(false);

                sessionStorage.removeItem(
                    "profile_image"
                );

            }

        } catch (error) {

            if (
                isRequestAborted(error)
            ) {
                return;
            }

            console.error(
                "Navbar profile loading error:",
                error
            );


            /* -----------------------------------------
               FALLBACK TO CACHE
            ----------------------------------------- */

            setFullName(
                cachedName || "User"
            );

            setRole(
                cachedRole || ""
            );

            setProfileImage(
                cachedImage || null
            );

            setImageError(false);

            setImageLoading(
                Boolean(cachedImage)
            );
        }
    }


    /* =====================================================
       PROFILE IMAGE SAFETY TIMEOUT
       MAX 2.5 SECONDS
    ===================================================== */

    useEffect(() => {

        if (!profileImage) {
            setImageLoading(false);
            return;
        }


        setImageLoading(true);
        setImageError(false);


        const timer = setTimeout(() => {

            setImageLoading(false);

            setImageError(true);

        }, 2500);


        return () => {
            clearTimeout(timer);
        };

    }, [profileImage]);


    /* =====================================================
       API / IMAGE URL
    ===================================================== */

    const API_URL =
        import.meta.env.VITE_API_URL ||
        "https://hospital-backend-8pek.onrender.com/api";


    const backendUrl =
        API_URL.replace(
            /\/api\/?$/,
            ""
        );


    const profileImageUrl = useMemo(() => {

        if (!profileImage) {
            return null;
        }


        const value =
            String(
                profileImage
            ).trim();


        if (!value) {
            return null;
        }


        /* Full URL */

        if (
            value.startsWith(
                "http://"
            ) ||
            value.startsWith(
                "https://"
            ) ||
            value.startsWith(
                "blob:"
            ) ||
            value.startsWith(
                "data:image/"
            )
        ) {
            return value;
        }


        /* /uploads/photo.jpg */

        if (
            value.startsWith(
                "/uploads/"
            )
        ) {
            return `${backendUrl}${value}`;
        }


        /* uploads/photo.jpg */

        if (
            value.startsWith(
                "uploads/"
            )
        ) {
            return `${backendUrl}/${value}`;
        }


        /* filename only */

        return `${backendUrl}/uploads/${encodeURIComponent(
            value
        )}`;

    }, [
        profileImage,
        backendUrl,
    ]);


    /* =====================================================
       LOAD PROFILE WHEN ROUTE CHANGES
    ===================================================== */

    useEffect(() => {

        loadCurrentProfile();

    }, [
        location.pathname,
    ]);


    /* =====================================================
       USER UPDATED
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


            if (image) {

                setProfileImage(image);

                setImageError(false);

                setImageLoading(true);

            } else {

                setProfileImage(null);

                setImageError(false);

                setImageLoading(false);
            }


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
       SEARCH ITEMS
    ===================================================== */

    const searchItems = useMemo(() => {

        const items = [

            {
                label: "Dashboard",
                description:
                    "Open your main dashboard",
                keywords:
                    "dashboard home admin",
                path: "/dashboard",
                roles: ["admin"],
            },

            {
                label:
                    "Patient Dashboard",
                description:
                    "Open your patient dashboard",
                keywords:
                    "patient dashboard home",
                path: "/patient-dashboard",
                roles: ["patient"],
            },

            {
                label:
                    "Doctor Dashboard",
                description:
                    "Open doctor workspace",
                keywords:
                    "doctor dashboard",
                path: "/doctor-dashboard",
                roles: ["doctor"],
            },

            {
                label:
                    "Reception Dashboard",
                description:
                    "Open receptionist workspace",
                keywords:
                    "reception receptionist dashboard",
                path: "/reception-dashboard",
                roles: ["receptionist"],
            },

            {
                label:
                    "Pharmacist Dashboard",
                description:
                    "Open pharmacist workspace",
                keywords:
                    "pharmacist pharmacy dashboard",
                path: "/pharmacist-dashboard",
                roles: ["pharmacist"],
            },

            {
                label:
                    "Lab Dashboard",
                description:
                    "Open laboratory workspace",
                keywords:
                    "lab laboratory dashboard",
                path: "/lab-dashboard",
                roles: ["lab"],
            },

            {
                label: "Patients",
                description:
                    "Manage hospital patients",
                keywords:
                    "patient patients records",
                path: "/patients",
                roles: ["admin"],
            },

            {
                label: "Doctors",
                description:
                    "Manage doctors and specialists",
                keywords:
                    "doctor doctors specialist",
                path: "/doctors",
                roles: ["admin"],
            },

            {
                label:
                    "Find a Doctor",
                description:
                    "Find specialists",
                keywords:
                    "doctor specialist",
                path: "/patient-doctors",
                roles: ["patient"],
            },

            {
                label:
                    "Appointments",
                description:
                    "View and manage appointments",
                keywords:
                    "appointment booking",
                path: "/appointments",
                roles: [
                    "admin",
                    "doctor",
                    "receptionist",
                    "pharmacist",
                    "lab",
                ],
            },

            {
                label:
                    "Book Appointment",
                description:
                    "Schedule a consultation",
                keywords:
                    "book appointment doctor consultation",
                path: "/book-appointment",
                roles: ["patient"],
            },

            {
                label:
                    "My Appointments",
                description:
                    "View your appointments",
                keywords:
                    "patient appointment upcoming",
                path: "/patient-appointments",
                roles: ["patient"],
            },

            {
                label:
                    "Medical Reports",
                description:
                    "View medical reports",
                keywords:
                    "medical reports files",
                path: "/medical-reports",
                roles: [
                    "admin",
                    "doctor",
                ],
            },

            {
                label:
                    "Prescriptions",
                description:
                    "View prescriptions",
                keywords:
                    "medicine prescription",
                path: "/patient-prescriptions",
                roles: ["patient"],
            },

            {
                label: "Billing",
                description:
                    "Manage billing",
                keywords:
                    "billing invoice payment",
                path: "/billing",
                roles: ["admin"],
            },

            {
                label:
                    "Patient Billing",
                description:
                    "View your bills",
                keywords:
                    "patient bill invoice payment",
                path: "/patient-billing",
                roles: ["patient"],
            },

            {
                label:
                    "Medical History",
                description:
                    "View patient history",
                keywords:
                    "medical history allergy surgery",
                path: "/patient-medical-history",
                roles: [
                    "admin",
                    "doctor",
                ],
            },

            {
                label:
                    "Notifications",
                description:
                    "View notifications",
                keywords:
                    "notification alert message",
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

            {
                label:
                    "Profile",
                description:
                    "Manage your profile",
                keywords:
                    "profile account user",
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
        ];


        const currentRole =
            String(
                role || "patient"
            ).toLowerCase();


        return items.filter(
            item =>
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
                .filter(item =>
                    item.label
                        .toLowerCase()
                        .includes(query) ||

                    item.description
                        .toLowerCase()
                        .includes(query) ||

                    item.keywords
                        .toLowerCase()
                        .includes(query)
                )
                .slice(0, 7);

        }, [
            searchItems,
            searchQuery,
        ]);


    function openSearchResult(path) {

        setSearchQuery("");

        setShowSearchResults(
            false
        );

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
                    item => item.unread
                ).length
            );

        } catch (error) {

            if (
                isRequestAborted(error)
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
                isRequestAborted(error)
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
        notification => {

            setNotifications(
                previous => [
                    notification,
                    ...previous,
                ]
            );


            setUnreadCount(
                previous =>
                    previous + 1
            );


            setBellAnimation(true);


            setTimeout(() => {

                setBellAnimation(false);

            }, 600);

        }
    );


    /* =====================================================
       DARK MODE
    ===================================================== */

    function toggleDarkMode() {

        setDarkMode(
            previous => !previous
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
                previous =>
                    previous.map(
                        item => ({
                            ...item,
                            unread: false,
                        })
                    )
            );


            setUnreadCount(0);

        } catch (error) {

            if (
                isRequestAborted(error)
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
        setImageLoading(false);
        setImageError(false);


        window.location.href =
            "/login";
    }


    /* =====================================================
       PROFILE NAVIGATION
    ===================================================== */

    function openProfile(event) {

        event.preventDefault();
        event.stopPropagation();


        setShowNotifications(
            false
        );

        setShowSearchResults(
            false
        );


        navigate("/profile");
    }


    /* =====================================================
       FALLBACK AVATAR
    ===================================================== */

    const avatarLetter =
        fullName &&
            fullName !== "User"
            ? fullName
                .trim()
                .charAt(0)
                .toUpperCase()
            : "U";


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


                {/* SEARCH */}

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

                            onChange={event => {

                                const value =
                                    event.target.value;

                                setSearchQuery(
                                    value
                                );

                                setShowSearchResults(
                                    value.trim().length >
                                    0
                                );
                            }}

                            onKeyDown={event => {

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

                                    setSearchQuery("");

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

                                onClick={() => {

                                    setSearchQuery("");

                                    setShowSearchResults(
                                        false
                                    );
                                }}
                            >
                                <FaTimes />
                            </button>
                        )}

                    </div>


                    {/* SEARCH DROPDOWN */}

                    {showSearchResults && (

                        <div className="navbar-search-dropdown">

                            <div className="navbar-search-dropdown-header">

                                <span>
                                    Quick Navigation
                                </span>

                                <small>
                                    {
                                        filteredSearchItems.length
                                    }{" "}
                                    result
                                    {
                                        filteredSearchItems.length !==
                                            1
                                            ? "s"
                                            : ""
                                    }
                                </small>

                            </div>


                            {filteredSearchItems.length >
                                0 ? (

                                <div className="navbar-search-results">

                                    {filteredSearchItems.map(
                                        item => (

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

                                    <span>
                                        🔎
                                    </span>

                                    <strong>
                                        No results found
                                    </strong>

                                    <small>
                                        Try another keyword.
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


                {/* DARK MODE */}

                <button
                    type="button"
                    className="icon-btn"
                    onClick={
                        toggleDarkMode
                    }
                    aria-label={
                        darkMode
                            ? "Switch to light mode"
                            : "Switch to dark mode"
                    }
                >

                    {darkMode ? (
                        <FaSun />
                    ) : (
                        <FaMoon />
                    )}

                </button>


                {/* NOTIFICATIONS */}

                <div
                    className="notification-wrapper"
                    ref={notificationRef}
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
                    >

                        <FaBell />


                        {unreadCount > 0 && (

                            <span className="notification-count">
                                {
                                    unreadCount > 99
                                        ? "99+"
                                        : unreadCount
                                }
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

                            ) : notifications.length === 0 ? (

                                <div className="empty-notification">
                                    No Notifications
                                </div>

                            ) : (

                                notifications.map(
                                    item => (

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
                                                    {
                                                        item.title ||
                                                        "Notification"
                                                    }
                                                </h4>

                                                <p>
                                                    {
                                                        item.message ||
                                                        ""
                                                    }
                                                </p>

                                                <small>
                                                    {
                                                        item.created_at
                                                            ? new Date(
                                                                item.created_at
                                                            ).toLocaleString()
                                                            : "Just now"
                                                    }
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


                {/* PROFILE */}

                <button
                    type="button"
                    className="profile-box"
                    title="Open Profile"
                    aria-label="Open Profile"

                    onClick={
                        openProfile
                    }
                >

                    <span className="navbar-profile-avatar">

                        {profileImageUrl &&
                            !imageError ? (

                            <>
                                {imageLoading && (
                                    <span
                                        className="navbar-profile-skeleton"
                                        aria-hidden="true"
                                    />
                                )}

                                <img
                                    src={
                                        profileImageUrl
                                    }

                                    alt={`${fullName} profile`}

                                    className="navbar-profile-image"

                                    onLoad={() => {

                                        setImageLoading(
                                            false
                                        );

                                        setImageError(
                                            false
                                        );

                                    }}

                                    onError={event => {

                                        console.error(
                                            "Profile image failed:",
                                            event.currentTarget.src
                                        );

                                        setImageLoading(
                                            false
                                        );

                                        setImageError(
                                            true
                                        );

                                        setProfileImage(
                                            null
                                        );

                                        sessionStorage.removeItem(
                                            "profile_image"
                                        );

                                    }}
                                />
                            </>

                        ) : (

                            <span className="navbar-avatar-fallback">
                                {avatarLetter}
                            </span>

                        )}

                    </span>


                    <span className="navbar-profile-info">

                        <strong>
                            {fullName}
                        </strong>

                        <span>
                            {
                                role
                                    ? role.toUpperCase()
                                    : "PATIENT"
                            }
                        </span>

                    </span>

                </button>


                {/* LOGOUT */}

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