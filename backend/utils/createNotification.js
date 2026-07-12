const db = require("../db");

async function createNotification(
    userId,
    title,
    message,
    type = "general"
) {

    try {

        await db.query(
            `
            INSERT INTO notifications
            (
                user_id,
                title,
                message,
                type,
                unread,
                created_at
            )
            VALUES
            (
                $1,
                $2,
                $3,
                $4,
                TRUE,
                NOW()
            )
            `,
            [
                userId,
                title,
                message,
                type
            ]
        );

        return true;

    } catch (err) {

        console.error("Notification Error:", err);

        return false;

    }

}

module.exports = createNotification;