import useNotificationWatcher from "../hooks/useNotificationWatcher";
import { useEffect, useState } from "react";
import { FaBell, FaCalendarCheck, FaMoneyBillWave, FaFileMedical, FaFlask } from "react-icons/fa";
import api from "../services/api";
import NotificationSkeleton from "../components/NotificationSkeleton";
import {
    FaTrash,
    FaCheckCircle
} from "react-icons/fa";
import { hmsToast, TOAST_IDS } from "../utils/hmsToast";

export default function Notifications() {
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState([]);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");

    useNotificationWatcher((data) => {

        setNotifications(data);

        setLoading(false);

    }, 15000);

    async function loadNotifications() {

        try {

            const res = await api.get("/notifications");

            setNotifications(res.data || []);

        } catch (err) {

            console.error(err);

        } finally {


        }

    }

    async function markAllRead() {

        const toastId = hmsToast.loading(
            "Updating notifications...", TOAST_IDS.MARK_ALL
        );

        try {

            await api.put("/notifications/read-all");

            setNotifications(prev =>
                prev.map(item => ({
                    ...item,
                    unread: false,
                }))
            );

            hmsToast.updateSuccess(
                toastId,
                "Completed",
                "All notifications marked as read."
            );

        } catch {

            hmsToast.updateError(
                toastId,
                "Failed",
                "Unable to update notifications."
            );

        }

    }
    async function markRead(id) {

        const toastId = hmsToast.loading(
            "Marking as read...", TOAST_IDS.MARK_READ
        );

        try {

            await api.put(`/notifications/${id}/read`);

            setNotifications(prev =>
                prev.map(item =>
                    item.id === id
                        ? { ...item, unread: false }
                        : item
                )
            );

            hmsToast.updateSuccess(
                toastId,
                "Updated",
                "Notification marked as read."
            );

        } catch {

            hmsToast.updateError(
                toastId,
                "Failed",
                "Unable to update notification."
            );

        }

    }

    async function deleteNotification(id) {

        const toastId = hmsToast.loading(
            "Deleting notification...",
            TOAST_IDS.DELETE_NOTIFICATION
        );

        // Start delete animation
        setNotifications((prev) =>
            prev.map((item) =>
                item.id === id
                    ? {
                        ...item,
                        deleting: true,
                    }
                    : item
            )
        );

        setTimeout(async () => {

            try {

                await api.delete(`/notifications/${id}`);

                setNotifications((prev) =>
                    prev.filter((item) => item.id !== id)
                );

                hmsToast.updateSuccess(
                    toastId,
                    "Deleted",
                    "Notification removed successfully."
                );

            } catch {

                hmsToast.updateError(
                    toastId,
                    "Failed",
                    "Unable to delete notification."
                );

                loadNotifications();

            }

        }, 300);

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
                        className={`notification-card
                        ${item.unread ? "unread" : ""}
                        ${item.deleting ? "deleting" : ""}
                    `}
                    >

                        <div className={`notification-icon ${item.type}`}>
                            {icon(item.type)}
                        </div>

                        <div className="notification-body">

                            <h3>

                                {item.title}

                                {item.unread && (

                                    <span className="new-badge">

                                        NEW

                                    </span>

                                )}

                            </h3>

                            <p>{item.message}</p>

                            <span>
                                {new Date(item.created_at).toLocaleString()}
                            </span>

                        </div>

                        <div className="notification-actions">

                            {item.unread && (

                                <button
                                    className="read-btn"
                                    onClick={() => markRead(item.id)}
                                >
                                    <FaCheckCircle />
                                </button>

                            )}

                            <button
                                className="delete-btn"
                                onClick={() => deleteNotification(item.id)}
                            >
                                <FaTrash />
                            </button>

                        </div>

                    </div>

                ))

            )}

        </div>
    );
}