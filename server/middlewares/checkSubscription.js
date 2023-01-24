import { pool } from "../utils/db.js";

export const checkSubscription = async (req, res, next) => {
  try {
    const courseId = req.params.courseId;
    const userId = req.query.byUser;

    let isSubscribed = await pool.query(
      `
        SELECT EXISTS 
        (SELECT * 
            FROM subscriptions 
            WHERE course_id = $1 AND user_id = $2)`,
      [courseId, userId]
    );
    isSubscribed = isSubscribed.rows[0].exists;
    if (isSubscribed) {
      next();
    } else {
      return res.status(403).json({
        message: "You haven't subscribed this course yet",
      });
    }
  } catch (error) {
    return res.sendStatus(500);
  }
};
