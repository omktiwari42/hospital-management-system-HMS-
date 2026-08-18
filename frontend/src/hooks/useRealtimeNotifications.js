import { useEffect, useRef } from "react";

export default function useRealtimeNotifications(onMessage) {
    const onMessageRef = useRef(onMessage);

    useEffect(() => {
        onMessageRef.current = onMessage;
    }, [onMessage]);


    useEffect(() => {

        const API_URL = (
            import.meta.env.VITE_API_URL ||
            "https://hospital-backend-8pek.onrender.com/api"
        ).replace(/\/+$/, "");


        let eventSource = null;
        let reconnectTimer = null;

        let stopped = false;
        let isConnecting = false;

        let reconnectDelay = 5000;

        const MAX_RECONNECT_DELAY = 30000;


        /* =====================================================
           CLEANUP CONNECTION
        ===================================================== */

        function closeConnection() {

            if (!eventSource) {
                return;
            }

            eventSource.onopen = null;
            eventSource.onmessage = null;
            eventSource.onerror = null;

            try {
                eventSource.close();
            } catch (_) {
                // Ignore already closed EventSource.
            }

            eventSource = null;
            isConnecting = false;
        }


        /* =====================================================
           CLEAR RECONNECT TIMER
        ===================================================== */

        function clearReconnectTimer() {

            if (reconnectTimer) {

                clearTimeout(
                    reconnectTimer
                );

                reconnectTimer = null;
            }
        }


        /* =====================================================
           SCHEDULE RECONNECT
        ===================================================== */

        function scheduleReconnect() {

            if (
                stopped ||
                reconnectTimer
            ) {
                return;
            }


            reconnectTimer = setTimeout(() => {

                reconnectTimer = null;

                if (!stopped) {
                    connect();
                }

            }, reconnectDelay);


            reconnectDelay = Math.min(
                reconnectDelay * 2,
                MAX_RECONNECT_DELAY
            );
        }


        /* =====================================================
           CONNECT
        ===================================================== */

        function connect() {

            if (
                stopped ||
                isConnecting ||
                eventSource
            ) {
                return;
            }


            isConnecting = true;


            try {

                const source =
                    new EventSource(
                        `${API_URL}/sse`
                    );


                eventSource = source;


                /* =================================================
                   CONNECTION OPEN
                ================================================= */

                source.onopen = () => {

                    if (
                        stopped ||
                        source !== eventSource
                    ) {
                        return;
                    }


                    isConnecting = false;

                    /*
                     * Connection succeeded.
                     * Reset exponential backoff.
                     */
                    reconnectDelay = 5000;

                };


                /* =================================================
                   MESSAGE
                ================================================= */

                source.onmessage = (event) => {

                    if (
                        stopped ||
                        source !== eventSource
                    ) {
                        return;
                    }


                    if (
                        !event ||
                        !event.data
                    ) {
                        return;
                    }


                    try {

                        const data =
                            JSON.parse(
                                event.data
                            );


                        /*
                         * Ignore our backend's initial
                         * connection event.
                         */
                        if (
                            data &&
                            data.connected === true
                        ) {
                            return;
                        }


                        if (
                            typeof onMessageRef.current ===
                            "function"
                        ) {

                            onMessageRef.current(
                                data
                            );

                        }

                    } catch (_) {

                        /*
                         * Ignore heartbeat/comments or
                         * malformed non-JSON SSE messages.
                         */

                    }

                };


                /* =================================================
                   ERROR / DISCONNECT
                ================================================= */

                source.onerror = () => {

                    /*
                     * IMPORTANT:
                     *
                     * Do NOT console.error here.
                     *
                     * Firefox can report:
                     *
                     * NS_BINDING_ABORTED
                     * CORS request did not succeed
                     * connection interrupted
                     *
                     * while Render is waking up or the
                     * page is navigating.
                     */

                    if (
                        stopped ||
                        source !== eventSource
                    ) {
                        return;
                    }


                    closeConnection();

                    scheduleReconnect();

                };


            } catch (_) {

                /*
                 * EventSource construction failed.
                 * Retry quietly.
                 */

                isConnecting = false;

                scheduleReconnect();

            }

        }


        /* =====================================================
           START
        ===================================================== */

        connect();


        /* =====================================================
           CLEANUP WHEN COMPONENT UNMOUNTS
        ===================================================== */

        return () => {

            /*
             * Set this FIRST.
             * This is important because closing EventSource
             * can trigger onerror in some browsers.
             */
            stopped = true;


            clearReconnectTimer();


            closeConnection();

        };

    }, []);
}