import { useEffect, useRef } from "react";
import api from "../services/api";

export default function useNotificationWatcher(
    onNotifications,
    interval = 15000
) {
    const timer = useRef(null);
    const running = useRef(false);

    const fetchNotifications = async () => {
        if (running.current) return;

        running.current = true;

        try {
            const res = await api.get("/notifications");

            if (Array.isArray(res.data)) {
                onNotifications(res.data);
            } else {
                onNotifications([]);
            }
        } catch (err) {
            console.error("Notification Watcher:", err);
        } finally {
            running.current = false;
        }
    };

    useEffect(() => {
        fetchNotifications();

        timer.current = setInterval(() => {
            if (!document.hidden) {
                fetchNotifications();
            }
        }, interval);

        const visibilityChanged = () => {
            if (!document.hidden) {
                fetchNotifications();
            }
        };

        document.addEventListener(
            "visibilitychange",
            visibilityChanged
        );

        return () => {
            clearInterval(timer.current);

            document.removeEventListener(
                "visibilitychange",
                visibilityChanged
            );
        };
    }, [interval]);
}