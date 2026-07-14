import { useEffect } from "react";

export default function useRealtimeNotifications(onMessage) {

    useEffect(() => {

        const eventSource = new EventSource(

            `${import.meta.env.VITE_API_URL}/sse/notifications`

        );

        eventSource.onmessage = (event) => {

            const data = JSON.parse(event.data);

            onMessage(data);

        };

        eventSource.onerror = () => {

            eventSource.close();

        };

        return () => {

            eventSource.close();

        };

    }, []);

}