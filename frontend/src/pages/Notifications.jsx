import { useEffect, useState } from "react";
import { FaBell, FaCalendarCheck, FaMoneyBillWave, FaFileMedical, FaFlask } from "react-icons/fa";
import api from "../services/api";
import NotificationSkeleton from "../components/NotificationSkeleton";

export default function Notifications() {
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState([]);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        loadNotifications();
    }, []);

    async function loadNotifications() {
        try {
            const res = await api.get("/notifications");
            setNotifications(res.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    async function markAllRead() {
        try {
            await api.put("/notifications/read-all");

            setNotifications((prev) =>
                prev.map((item) => ({
                    ...item,
                    unread: false,
                }))
            );
        } catch (err) {
            console.error(err);
        }
    }
    const filteredNotifications = notifications.filter((item) => {

        const matchesSearch =
            item.title.toLowerCase().includes(search.toLowerCase()) ||
            item.message.toLowerCase().includes(search.toLowerCase());

        const matchesFilter =
            filter === "all"
                ? true
                : filter === "unread"
                    ? item.unread
                    : item.type === filter;

        return matchesSearch && matchesFilter;

    });
    const icon = (type) => {
        switch (type) {
            case "appointment":
                return <FaCalendarCheck />;
            case "payment":
                return <FaMoneyBillWave />;
            case "prescription":
                return <FaFileMedical />;
            case "report":
                return <FaFlask />;
            default:
                return <FaBell />;
        }
    };

    if (loading) return <NotificationSkeleton />;

    return (
        <div className="notifications-page">

            <div className="notifications-header">

                <div>
                    <h1>Notifications</h1>
                    <p>Recent updates from your Hospital Management System</p>
                </div>

                <button
                    className="mark-all-btn"
                    onClick={markAllRead}
                >
                    Mark All Read
                </button>

            </div>
            <div className="notification-toolbar">

                <input
                    type="text"
                    placeholder="Search notifications..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="notification-search"
                />

                <div className="notification-filters">

                    <button
                        className={filter === "all" ? "active" : ""}
                        onClick={() => setFilter("all")}
                    >
                        All
                    </button>

                    <button
                        className={filter === "unread" ? "active" : ""}
                        onClick={() => setFilter("unread")}
                    >
                        Unread
                    </button>

                    <button
                        className={filter === "appointment" ? "active" : ""}
                        onClick={() => setFilter("appointment")}
                    >
                        Appointments
                    </button>

                    <button
                        className={filter === "payment" ? "active" : ""}
                        onClick={() => setFilter("payment")}
                    >
                        Payments
                    </button>

                    <button
                        className={filter === "prescription" ? "active" : ""}
                        onClick={() => setFilter("prescription")}
                    >
                        Prescription
                    </button>

                    <button
                        className={filter === "report" ? "active" : ""}
                        onClick={() => setFilter("report")}
                    >
                        Reports
                    </button>

                </div>

            </div>

            {filteredNotifications.length === 0 ? (

                <div className="empty-notification-page">
                    <FaBell size={60} />
                    <h2>No Notifications</h2>
                    <p>You're all caught up.</p>
                </div>

            ) : (

                filteredNotifications.map((item) => (

                    <div
                        key={item.id}
                        className={`notification-card ${item.unread ? "unread" : ""
                            }`}
                    >

                        <div className="notification-icon">
                            {icon(item.type)}
                        </div>

                        <div className="notification-body">

                            <h3>{item.title}</h3>

                            <p>{item.message}</p>

                            <span>
                                {new Date(item.created_at).toLocaleString()}
                            </span>

                        </div>

                        {item.unread && (
                            <div className="notification-dot"></div>
                        )}

                    </div>

                ))

            )}

        </div>
    );
}