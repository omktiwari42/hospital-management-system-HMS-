const express = require("express");

const router = express.Router();

const clients = [];

const allowedOrigins = [
    "http://localhost:5173",
    "https://myhms.online",
    "https://www.myhms.online",
];

router.get("/", (req, res) => {
    const origin = req.headers.origin;

    /*
     * CORS
     */
    if (origin && allowedOrigins.includes(origin)) {
        res.setHeader(
            "Access-Control-Allow-Origin",
            origin
        );

        res.setHeader(
            "Vary",
            "Origin"
        );
    }

    /*
     * SSE headers
     */
    res.setHeader(
        "Access-Control-Allow-Credentials",
        "true"
    );

    res.setHeader(
        "Content-Type",
        "text/event-stream; charset=utf-8"
    );

    res.setHeader(
        "Cache-Control",
        "no-cache, no-transform"
    );

    res.setHeader(
        "Connection",
        "keep-alive"
    );

    res.setHeader(
        "X-Accel-Buffering",
        "no"
    );

    res.setHeader(
        "Content-Encoding",
        "none"
    );

    /*
     * Send headers immediately
     */
    if (typeof res.flushHeaders === "function") {
        res.flushHeaders();
    }

    /*
     * Tell EventSource how long to wait
     * before reconnecting.
     */
    res.write("retry: 5000\n\n");

    /*
     * Initial heartbeat.
     */
    res.write(": connected\n\n");

    /*
     * Register client.
     */
    clients.push(res);

    let closed = false;

    /*
     * Keep SSE connection alive.
     */
    const keepAlive = setInterval(() => {
        if (closed || res.writableEnded) {
            clearInterval(keepAlive);
            return;
        }

        try {
            res.write(
                `: heartbeat ${Date.now()}\n\n`
            );
        } catch (error) {
            closed = true;

            clearInterval(keepAlive);

            const index =
                clients.indexOf(res);

            if (index !== -1) {
                clients.splice(index, 1);
            }

            try {
                res.end();
            } catch (_) { }
        }
    }, 20000);


    /*
     * Client disconnected.
     */
    req.on("close", () => {
        closed = true;

        clearInterval(keepAlive);

        const index =
            clients.indexOf(res);

        if (index !== -1) {
            clients.splice(index, 1);
        }

        if (!res.writableEnded) {
            try {
                res.end();
            } catch (_) { }
        }
    });
});


function sendNotificationEvent(
    notification
) {
    const payload =
        `data: ${JSON.stringify(
            notification
        )}\n\n`;

    /*
     * Remove dead clients while sending.
     */
    for (
        let i = clients.length - 1;
        i >= 0;
        i--
    ) {
        const client = clients[i];

        try {

            if (
                client.writableEnded ||
                client.destroyed
            ) {
                clients.splice(i, 1);
                continue;
            }

            client.write(payload);

        } catch (error) {

            clients.splice(i, 1);

            try {
                client.end();
            } catch (_) { }

        }
    }
}


module.exports = {
    router,
    sendNotificationEvent,
};