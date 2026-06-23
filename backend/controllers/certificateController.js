const db = require("../config/db");

/* Generate Certificate */

exports.generateCertificate = async (req, res) => {

    try {

        const userId = req.user.id;
        const { course_id } = req.body;

        const [progress] = await db.query(
            `SELECT * FROM progress_tracking
             WHERE user_id=? AND course_id=?`,
            [userId, course_id]
        );

        if (
            progress.length === 0 ||
            progress[0].completion_percentage < 100
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Course must be completed before certificate generation"
            });
        }

        const certificateCode =
            "CERT-" +
            Date.now() +
            "-" +
            userId;

        await db.query(
            `INSERT INTO certificates
            (user_id,course_id,certificate_code)
            VALUES(?,?,?)`,
            [
                userId,
                course_id,
                certificateCode
            ]
        );

        res.status(201).json({
            success: true,
            certificateCode
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

/* Verify Certificate */

exports.verifyCertificate = async (req, res) => {

    try {

        const { code } = req.params;

        const [certificate] = await db.query(
            `
            SELECT
            c.certificate_code,
            c.issue_date,
            u.name,
            co.title
            FROM certificates c
            JOIN users u
            ON c.user_id=u.id
            JOIN courses co
            ON c.course_id=co.id
            WHERE c.certificate_code=?
            `,
            [code]
        );

        if (certificate.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Certificate Not Found"
            });

        }

        res.json({
            success: true,
            certificate: certificate[0]
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

/* My Certificates */

exports.getMyCertificates = async (req, res) => {

    try {

        const [certificates] = await db.query(
            `
            SELECT
            c.*,
            co.title
            FROM certificates c
            JOIN courses co
            ON c.course_id=co.id
            WHERE c.user_id=?
            `,
            [req.user.id]
        );

        res.json({
            success: true,
            certificates
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};