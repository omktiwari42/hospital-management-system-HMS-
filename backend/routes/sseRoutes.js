import express from "express";

const router = express.Router();

let clients = [];

router.get("/notifications", (req, res) => {

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    res.flushHeaders();

    clients.push(res);

    req.on("close", () => {

        clients = clients.filter(client => client !== res);

    });

});

export function sendNotificationEvent(notification) {

    clients.forEach(client => {

        client.write(
            `data:${JSON.stringify(notification)}\n\n`
        );

    });

}

export default router; import express from "express";

const router = express.Router();

let clients = [];

router.get("/notifications", (req, res) => {

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    res.flushHeaders();

    clients.push(res);

    req.on("close", () => {

        clients = clients.filter(client => client !== res);

    });

});

export function sendNotificationEvent(notification) {

    clients.forEach(client => {

        client.write(
            `data:${JSON.stringify(notification)}\n\n`
        );

    });

}

export default router;