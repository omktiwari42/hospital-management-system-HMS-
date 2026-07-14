const express = require("express");

const router = express.Router();

const clients = [];

router.get("/", (req, res) => {
    // CORS headers for SSE
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
    res.setHeader("Access-Control-Allow-Credentials", "true");

    // SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Prevent proxy buffering
    res.setHeader("X-Accel-Buffering", "no");

    res.flushHeaders();

    // Retry after 5 seconds if disconnected
    res.write("retry: 5000\n\n");

    clients.push(res);

    // Keep the connection alive
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