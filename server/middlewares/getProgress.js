import { pool } from "../utils/db.js";

export const getProgress = async (req, res, next) => {
  try {
    const courseId = req.params.courseId;
    const userId = req.query.byUser;

    let totalSubLesson = await pool.query(
      `
      SELECT COUNT(sub_lessons.sub_lesson_id) as sub_lessons_count
      FROM lessons
      INNER JOIN sub_lessons
      ON lessons.lesson_id = sub_lessons.lesson_id
      WHERE lessons.course_id = $1`,
      [courseId]
    );
    totalSubLesson = Number(totalSubLesson.rows[0].sub_lessons_count);

    let totalAssignment = await pool.query(
      `
      SELECT COUNT(assignments.assignment_id) as assignments_count
      FROM lessons
      INNER JOIN sub_lessons
      ON lessons.lesson_id = sub_lessons.lesson_id
      INNER JOIN assignments
      ON sub_lessons.sub_lesson_id = assignments.sub_lesson_id
      WHERE lessons.course_id = $1`,
      [courseId]
    );
    totalAssignment = Number(totalAssignment.rows[0].assignments_count);

    const totalTask = totalSubLesson + totalAssignment;

    let totalCompletedSubLesson = await pool.query(
      `
      SELECT COUNT(users_sub_lessons.user_sub_lesson_id) as completed_sub_lessons_count
      FROM lessons
      INNER JOIN sub_lessons
      ON lessons.lesson_id = sub_lessons.lesson_id
      INNER JOIN users_sub_lessons
      ON sub_lessons.sub_lesson_id = users_sub_lessons.sub_lesson_id
      WHERE lessons.course_id = $1 AND users_sub_lessons.user_id = $2`,
      [courseId, userId]
    );
    totalCompletedSubLesson = Number(
      totalCompletedSubLesson.rows[0].completed_sub_lessons_count
    );

    let totalCompletedAssignment = await pool.query(
      `
        SELECT COUNT(users_assignments.user_assignment_id) as completed_assignments_count
        FROM lessons
        INNER JOIN sub_lessons
        ON lessons.lesson_id = sub_lessons.lesson_id
        INNER JOIN assignments
        ON assignments.sub_lesson_id = sub_lessons.sub_lesson_id
        INNER JOIN users_assignments
        ON users_assignments.assignment_id = assignments.assignment_id
        WHERE lessons.course_id = $1 AND users_assignments.user_id = $2 AND users_assignments.submitted_date IS NOT NULL`,
      [courseId, userId]
    );
    totalCompletedAssignment = Number(
      totalCompletedAssignment.rows[0].completed_assignments_count
    );

    const totalCompletedTask =
      totalCompletedSubLesson + totalCompletedAssignment;

    const percentProgress = Math.floor((totalCompletedTask * 100) / totalTask);

    if (percentProgress === 100) {
      await pool.query(
        `
          UPDATE subscriptions
          SET status = $1
          WHERE course_id = $2 AND user_id = $3`,
        [true, courseId, userId]
      );
    }

    res.locals.percentProgress = percentProgress;
    next();
  } catch (error) {
    return res.sendStatus(500);
  }
};
