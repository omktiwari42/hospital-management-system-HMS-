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

    if (allowedOrigins.includes(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
    }

    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    res.flushHeaders();

    res.write("retry: 5000\n\n");

    clients.push(res);

    console.log("✅ SSE Client Connected");
    console.log("Connected Clients:", clients.length);

    const keepAlive = setInterval(() => {
        try {
            res.write(": keep-alive\n\n");
        } catch (err) {
            clearInterval(keepAlive);
        }
    }, 25000);

    req.on("close", () => {
        clearInterval(keepAlive);

        const index = clients.indexOf(res);

        if (index !== -1) {
            clients.splice(index, 1);
        }

        // console.log("❌ SSE Client Disconnected");
        // console.log("Connected Clients:", clients.length);

        res.end();
    });
});

function sendNotificationEvent(notification) {
    // console.log("📢 Sending Notification:", notification);

    clients.forEach((client) => {
        try {
            client.write(
                `data: ${JSON.stringify(notification)}\n\n`
            );
        } catch (err) {
            console.error("SSE Send Error:", err);
        }
    });
}

module.exports = {
    router,
    sendNotificationEvent,
};