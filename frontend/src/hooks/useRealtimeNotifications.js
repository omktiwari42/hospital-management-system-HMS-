import { useEffect } from "react";

export default function useRealtimeNotifications(onMessage) {
    useEffect(() => {
        const API_URL =
            import.meta.env.VITE_API_URL ||
            "https://your-render-backend.onrender.com/api";

        let eventSource;

        const connect = () => {
            console.log("Connecting to:", `${API_URL}/sse`);

            eventSource = new EventSource(`${API_URL}/sse`);

            eventSource.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    onMessage(data);
                } catch (err) {
                    console.error("Invalid SSE data:", err);
                }
            };

            eventSource.onerror = (err) => {
                console.error("SSE Error:", err);

                eventSource.close();

                // Reconnect after 5 seconds
                setTimeout(connect, 5000);
            };
        };

        connect();

        return () => {
            if (eventSource) {
                eventSource.close();
            }
        };
    }, [onMessage]);
}