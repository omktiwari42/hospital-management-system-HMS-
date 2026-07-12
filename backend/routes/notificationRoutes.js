const express = require("express");
const router = express.Router();

const db = require("../db");

/* ===========================
   GET NOTIFICATIONS
=========================== */

router.get("/", async (req, res) => {
    try {

        const result = await db.query(
            `
            SELECT
                id,
                user_id,
                title,
                message,
                type,
                unread,
                created_at
            FROM notifications
            WHERE user_id = $1
            ORDER BY created_at DESC
            `,
            [req.user.id]
        );

        res.json(result.rows);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Server Error"
        });

    }
});

/* ===========================
   MARK ALL AS READ
=========================== */

router.put("/read-all", async (req, res) => {

    try {

        await db.query(
            `
            UPDATE notifications
            SET unread = FALSE
            WHERE user_id = $1
            `,
            [req.user.id]
        );

        res.json({
            success: true
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Server Error"
        });

    }

});

/* ===========================
   UNREAD COUNT
=========================== */

router.get("/count", async (req, res) => {

    try {

        const result = await db.query(
            `
            SELECT COUNT(*) AS total
            FROM notifications
            WHERE user_id = $1
            AND unread = TRUE
            `,
            [req.user.id]
        );

        res.json({
            unread: Number(result.rows[0].total)
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Server Error"
        });

    }

});

module.exports = router;