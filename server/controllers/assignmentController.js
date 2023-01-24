import { pool } from "../utils/db.js";

export const getAllHomework = async (req, res) => {
  try {
    const userId = req.query.byUser;
    const results = await pool.query(
      `
      SELECT courses.course_name, courses.course_id, lessons.lesson_name, sub_lessons.sub_lesson_id, sub_lessons.sub_lesson_name, 
      assignments.assignment_id, assignments.detail, sub_lessons.duration, 
      users_assignments.answer, users_assignments.accepted_date, users_assignments.submitted_date, users_assignments.updated_date, users_assignments.status, users_assignments.user_assignment_id
      FROM courses
      JOIN lessons
      ON courses.course_id = lessons.course_id
      JOIN sub_lessons
      ON lessons.lesson_id = sub_lessons.lesson_id
      JOIN assignments
      ON sub_lessons.sub_lesson_id = assignments.sub_lesson_id
      JOIN users_assignments 
      ON assignments.assignment_id = users_assignments.assignment_id
      WHERE users_assignments.user_id = $1
      ORDER BY updated_date desc`,
      [userId]
    );

    // *- Find deadline in date format -* //
    const findDeadline = (accepted_date, duration) => {
      const deadline = new Date(accepted_date);
      deadline.setDate(deadline.getDate() + parseInt(duration));
      return deadline;
    };

    const currentDate = new Date();

    // *- Find no. of days until deadline -* //
    const findDaysUntilDeadline = (currentDate, deadline) => {
      const dl = new Date(deadline);
      const cd = new Date(currentDate);
      const deadlineDateInMs = dl.getTime();
      const currentDateInMs = cd.getTime();
      const msDiff = deadlineDateInMs - currentDateInMs;
      const daysUntilDeadline = msDiff / (1000 * 60 * 60 * 24);
      return Math.round(daysUntilDeadline);
    };

    // *- Add assignment status, deadline and days until deadline -* //
    for (let assignment of results.rows) {
      assignment["deadline"] = findDeadline(
        assignment.accepted_date,
        assignment.duration
      );
      assignment["days_until_deadline"] = findDaysUntilDeadline(
        currentDate,
        assignment.deadline
      );

      if (!/overdue|submitted/i.test(assignment.status)) {
        let daysAfterAccepted = Math.abs(assignment.accepted_date - new Date());
        daysAfterAccepted = daysAfterAccepted / (1000 * 60 * 60 * 24);
        if (daysAfterAccepted >= assignment.duration) {
          assignment.status = "overdue";
          await pool.query(
            `
          UPDATE users_assignments
          SET status = 'overdue', updated_date = $1
          WHERE user_assignment_id = $2
          `,
            [new Date(), assignment.user_assignment_id]
          );
        }
      }
    }

    return res.json({
      data: results.rows,
    });
  } catch (error) {
    return res.sendStatus(500);
  }
};

export const putSubmitAssignment = async (req, res) => {
  try {
    const answer = req.body.answer;
    const submittedDate = new Date();
    const updatedDate = new Date();
    const assignmentId = req.params.assignmentId;
    const userId = req.query.byUser;
    let status = req.body.status;

    if (!/overdue/i.test(status)) {
      let queryAssignmentStatus = await pool.query(
        `
        SELECT sub_lessons.duration, users_assignments.accepted_date
        FROM assignments
        INNER JOIN users_assignments
        ON assignments.assignment_id = users_assignments.assignment_id
        INNER JOIN sub_lessons
        ON assignments.sub_lesson_id = sub_lessons.sub_lesson_id
        WHERE assignments.assignment_id = $1 AND users_assignments.user_id = $2
        `,
        [assignmentId, userId]
      );
      queryAssignmentStatus = queryAssignmentStatus.rows[0];
      let daysAfterAccepted = Math.abs(
        queryAssignmentStatus.accepted_date - new Date()
      );
      daysAfterAccepted = daysAfterAccepted / (1000 * 60 * 60 * 24);
      if (daysAfterAccepted >= queryAssignmentStatus.duration) {
        status = "overdue";
      } else {
        status = "submitted";
      }
    }

    await pool.query(
      `
    UPDATE users_assignments SET answer = $1, submitted_date = $2, updated_date = $3,status = $4
    WHERE assignment_id = $5 AND user_id = $6`,
      [answer, submittedDate, updatedDate, status, assignmentId, userId]
    );

    return res.json({
      message: "Assignment is submitted.",
    });
  } catch (error) {
    return res.sendStatus(500);
  }
};

export const putSaveDraftAssignment = async (req, res) => {
  try {
    const answer = req.body.answer;
    const updatedDate = new Date();
    const assignmentId = req.params.assignmentId;
    const userId = req.query.byUser;
    let status = req.body.status;

    if (!/overdue/i.test(status)) {
      let queryAssignmentStatus = await pool.query(
        `
        SELECT sub_lessons.duration, users_assignments.accepted_date
        FROM assignments
        INNER JOIN users_assignments
        ON assignments.assignment_id = users_assignments.assignment_id
        INNER JOIN sub_lessons
        ON assignments.sub_lesson_id = sub_lessons.sub_lesson_id
        WHERE assignments.assignment_id = $1 AND users_assignments.user_id = $2
        `,
        [assignmentId, userId]
      );
      queryAssignmentStatus = queryAssignmentStatus.rows[0];
      let daysAfterAccepted = Math.abs(
        queryAssignmentStatus.accepted_date - new Date()
      );
      daysAfterAccepted = daysAfterAccepted / (1000 * 60 * 60 * 24);
      if (daysAfterAccepted >= queryAssignmentStatus.duration) {
        status = "overdue";
      } else {
        status = "in progress";
      }
    }

    await pool.query(
      `
    UPDATE users_assignments SET answer = $1, updated_date = $2, status = $3
    WHERE assignment_id = $4 AND user_id = $5`,
      [answer, updatedDate, status, assignmentId, userId]
    );

    return res.json({
      message: "Assignment is saved.",
    });
  } catch (error) {
    return res.sendStatus(500);
  }
};
