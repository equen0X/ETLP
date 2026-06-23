const db = require("../config/db");

exports.addRating = async (req, res) => {

    try {

        const { course_id, rating, review } = req.body;

        await db.query(
            `
            INSERT INTO course_ratings
            (user_id,course_id,rating,review)
            VALUES(?,?,?,?)
            `,
            [
                req.user.id,
                course_id,
                rating,
                review
            ]
        );

        res.status(201).json({
            success: true,
            message: "Rating Added"
        });

    } catch (error) {

        res.status(500).json({
            success: false
        });
    }
};

exports.getRatings = async (req, res) => {

    try {

        const [ratings] = await db.query(
            `
            SELECT *
            FROM course_ratings
            WHERE course_id=?
            `,
            [req.params.courseId]
        );

        res.json({
            success: true,
            ratings
        });

    } catch (error) {

        res.status(500).json({
            success: false
        });
    }
};