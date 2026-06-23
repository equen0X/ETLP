const db = require("../config/db");

exports.searchCourses = async (req, res) => {

    try {

        const keyword = req.query.keyword || "";

        const [courses] = await db.query(
            `
            SELECT *
            FROM courses
            WHERE title LIKE ?
            OR description LIKE ?
            `,
            [
                `%${keyword}%`,
                `%${keyword}%`
            ]
        );

        res.json({
            success: true,
            count: courses.length,
            courses
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
};