import { pool } from "../utils/db.js";

export const checkAdminPermission = async (req, res, next) => {
  try {
    const adminId = req.query.byAdmin;
    const courseId = req.params.courseId;

    let doesAdminOwnThisCourse = await pool.query(
      `
    SELECT EXISTS 
    (SELECT *
    FROM courses
    WHERE admin_id = $1 AND course_id = $2)
    `,
      [adminId, courseId]
    );
    doesAdminOwnThisCourse = doesAdminOwnThisCourse.rows[0].exists;
    if (!doesAdminOwnThisCourse) {
      return res.status(403).json({
        message: "You have no permission to CRUD on this course",
      });
    } else {
      next();
    }
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error on CheckAdminPermission Middleware",
    });
  }
};
