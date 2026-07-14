import { useEffect, useRef } from "react";
import api from "../services/api";

export default function useNotificationWatcher(
    onNotifications,
    interval = 15000
) {

    const timer = useRef(null);

    const running = useRef(false);

    async function fetchNotifications() {

        if (running.current) return;

        running.current = true;

        try {

            const res = await api.get("/notifications");

            onNotifications(res.data || []);

        } catch (err) {

            console.error(
                "Notification Watcher:",
                err
            );

        } finally {

            running.current = false;

        }

    }

    useEffect(() => {

        fetchNotifications();

        timer.current = setInterval(() => {

            if (!document.hidden) {

                fetchNotifications();

            }

        }, interval);

        function visibilityChanged() {

            if (!document.hidden) {

                fetchNotifications();

            }

        }

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

    }, []);

}