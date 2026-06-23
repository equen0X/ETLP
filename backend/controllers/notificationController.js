const db = require("../config/db");

exports.getNotifications = async (req, res) => {

    try {

        const [notifications] =
        await db.query(
            `
            SELECT *
            FROM notifications
            WHERE user_id=?
            ORDER BY created_at DESC
            `,
            [req.user.id]
        );

        res.json({
            success: true,
            notifications
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

exports.markAsRead = async (req, res) => {

    try {

        await db.query(
            `
            UPDATE notifications
            SET is_read=TRUE
            WHERE id=?
            `,
            [req.params.id]
        );

        res.json({
            success: true,
            message: "Notification Updated"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false
        });
    }
};