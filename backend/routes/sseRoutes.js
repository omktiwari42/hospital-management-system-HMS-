const express = require("express");

const router = express.Router();

const clients = [];

const allowedOrigins = new Set([
    "http://localhost:5173",
    "https://myhms.online",
    "https://www.myhms.online",
]);


/* =====================================================
   SSE CONNECTION
===================================================== */

router.get("/", (req, res) => {

    const origin =
        req.headers.origin;


    /* ================================================
       CORS
    ================================================ */

    if (
        origin &&
        allowedOrigins.has(origin)
    ) {
        res.setHeader(
            "Access-Control-Allow-Origin",
            origin
        );

        res.setHeader(
            "Access-Control-Allow-Credentials",
            "true"
        );

        res.setHeader(
            "Vary",
            "Origin"
        );
    }


    /* ================================================
       SSE HEADERS
    ================================================ */

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
        "Access-Control-Allow-Headers",
        "Cache-Control"
    );


    /* ================================================
       SEND HEADERS
    ================================================ */

    if (
        typeof res.flushHeaders ===
        "function"
    ) {
        res.flushHeaders();
    }


    /* ================================================
       EVENTSOURCE RECONNECT DELAY
    ================================================ */

    res.write(
        "retry: 5000\n\n"
    );


    /* ================================================
       INITIAL CONNECTION EVENT
    ================================================ */

    res.write(
        "event: connected\n"
    );

    res.write(
        `data: ${JSON.stringify({
            connected: true,
            timestamp: new Date().toISOString(),
        })}\n\n`
    );


    /* ================================================
       REGISTER CLIENT
    ================================================ */

    clients.push(res);

    let closed = false;


    /* ================================================
       KEEP ALIVE
    ================================================ */

    const keepAlive =
        setInterval(() => {

            if (
                closed ||
                res.writableEnded ||
                res.destroyed
            ) {
                clearInterval(
                    keepAlive
                );

                return;
            }


            try {

                res.write(
                    `: heartbeat ${Date.now()}\n\n`
                );

            } catch (error) {

                closed = true;

                clearInterval(
                    keepAlive
                );


                const index =
                    clients.indexOf(res);

                if (index !== -1) {
                    clients.splice(
                        index,
                        1
                    );
                }


                try {
                    res.end();
                } catch (_) { }

            }

        }, 20000);


    /* ================================================
       CLIENT DISCONNECT
    ================================================ */

    req.on(
        "close",
        () => {

            closed = true;


            clearInterval(
                keepAlive
            );


            const index =
                clients.indexOf(res);

            if (index !== -1) {

                clients.splice(
                    index,
                    1
                );

            }


            if (
                !res.writableEnded
            ) {

                try {
                    res.end();
                } catch (_) { }

            }

        }
    );

});


/* =====================================================
   SEND NOTIFICATION
===================================================== */

function sendNotificationEvent(
    notification
) {

    const message =
        `data: ${JSON.stringify(
            notification
        )}\n\n`;


    for (
        let i = clients.length - 1;
        i >= 0;
        i--
    ) {

        const client =
            clients[i];


        try {

            if (
                client.writableEnded ||
                client.destroyed
            ) {

                clients.splice(
                    i,
                    1
                );

                continue;
            }


            client.write(
                message
            );


        } catch (error) {

            clients.splice(
                i,
                1
            );


            try {
                client.end();
            } catch (_) { }

        }

    }

}


/* =====================================================
   EXPORT
===================================================== */

module.exports = {
    router,
    sendNotificationEvent,
};