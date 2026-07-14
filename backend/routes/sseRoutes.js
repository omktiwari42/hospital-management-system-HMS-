const express = require("express");

const router = express.Router();

const clients = [];

router.get("/", (req, res) => {
    const origin = req.headers.origin;

    const allowedOrigins = [
        "http://localhost:5173",
        "https://myhms.online",
        "https://www.myhms.online",
    ];

    if (allowedOrigins.includes(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
    }

    res.setHeader("Access-Control-Allow-Credentials", "true");

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    res.flushHeaders();

    res.write("retry: 5000\n\n");

    clients.push(res);

    const keepAlive = setInterval(() => {
        res.write(": ping\n\n");
    }, 30000);

    req.on("close", () => {
        clearInterval(keepAlive);

        const index = clients.indexOf(res);
        if (index !== -1) {
            clients.splice(index, 1);
        }

        res.end();
    });
});

function sendNotificationEvent(notification) {
    clients.forEach((client) => {
        client.write(`data: ${JSON.stringify(notification)}\n\n`);
    });
}

module.exports = {
    router,
    sendNotificationEvent,
};