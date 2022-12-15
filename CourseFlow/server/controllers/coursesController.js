import { pool } from "../utils/db.js";
import format from "pg-format";

export const getAll = async (req, res) => {
  try {
    let keyword = req.query.keyword;
    keyword = "\\m" + keyword;
    const page = req.query.page;
    const coursesPerPage = 12;
    const offset = (page - 1) * coursesPerPage;

    let coursesCount = await pool.query(
      `
      SELECT COUNT(course_id) AS courses_count
      FROM courses
      WHERE course_name ~* $1
      `,
      [keyword]
    );
    coursesCount = Number(coursesCount.rows[0].courses_count);

    const results = await pool.query(
      `
      SELECT courses.course_id, courses.course_name, courses.summary, courses.cover_image_directory, courses.learning_time, count(lessons.lesson_id) as lessons_count
      FROM lessons
      INNER JOIN courses
      ON courses.course_id = lessons.course_id
      WHERE courses.course_name ~* $1
      GROUP BY courses.course_id
      ORDER BY courses.course_id DESC
      LIMIT $2 OFFSET $3
      `,
      [keyword, coursesPerPage, offset]
    );

    for (let course of results.rows) {
      course.cover_image_directory = JSON.parse(course.cover_image_directory);
    }

    return res.json({
      data: results.rows,
      count: coursesCount,
    });
  } catch (error) {
    return res.sendStatus(500);
  }
};

export const getById = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const userId = req.query.byUser;

    // Query course detail
    let course_data = await pool.query(
      `
          SELECT *
          FROM courses
          WHERE course_id = $1`,
      [courseId]
    );
    course_data = course_data.rows[0];
    course_data.video_trailer_directory = JSON.parse(
      course_data.video_trailer_directory
    ).url;

    const lessons = await pool.query(
      `
        SELECT lessons.lesson_id, lessons.lesson_name, sub_lessons.sub_lesson_id, sub_lessons.sub_lesson_name
        FROM courses
        INNER JOIN lessons 
        ON courses.course_id = lessons.course_id
        INNER JOIN sub_lessons 
        ON lessons.lesson_id = sub_lessons.lesson_id
        WHERE courses.course_id=$1
        ORDER BY lessons.sequence ASC, sub_lessons.sequence ASC`,
      [courseId]
    );

    course_data.lessons = {};
    lessons.rows.map((lesson) => {
      if (lesson.lesson_name in course_data.lessons) {
        course_data.lessons[lesson.lesson_name].push(lesson.sub_lesson_name);
      } else {
        course_data.lessons[lesson.lesson_name] = [];
        course_data.lessons[lesson.lesson_name].push(lesson.sub_lesson_name);
      }
    });

    const filterCategory = await pool.query(
      `
        SELECT courses.course_id, courses.course_name, courses.summary, courses.cover_image_directory, courses.learning_time, CAST(COUNT(lessons.lesson_id) AS INTEGER) AS lessons_count
        FROM courses
        INNER JOIN lessons
        ON courses.course_id = lessons.course_id
        WHERE courses.category = $1 AND courses.course_id != $2
        GROUP BY courses.course_id
        ORDER BY random()
        limit 3`,
      [course_data.category, courseId]
    );

    filterCategory.rows.map((item) => {
      item.cover_image_directory = JSON.parse(item.cover_image_directory);
    });

    const files = await pool.query(
      `
        SELECT file_name, size, directory, type
        FROM files
        WHERE course_id=$1
        ORDER BY type ASC, file_name ASC`,
      [courseId]
    );
    course_data.files = [];
    files.rows.map((file) => {
      file.directory = JSON.parse(file.directory).url;
      course_data.files.push(file);
    });

    // Query user's subscription/desire course status
    let subscribeStatus;
    let desireStatus;
    if (userId) {
      const coursesSubscription = await pool.query(
        `
        SELECT *
        FROM subscriptions
        WHERE course_id = $1 AND user_id = $2`,
        [courseId, userId]
      );
      if (Boolean(coursesSubscription.rowCount)) {
        subscribeStatus = true;
      } else {
        subscribeStatus = false;
      }

      const desiredCourses = await pool.query(
        `
        SELECT *
        FROM desired_courses
        WHERE course_id = $1 AND user_id = $2
              `,
        [courseId, userId]
      );
      if (Boolean(desiredCourses.rowCount)) {
        desireStatus = true;
      } else {
        desireStatus = false;
      }
    }

    return res.json({
      data: course_data,
      dataCategory: filterCategory.rows,
      subscribeStatus,
      desireStatus,
    });
  } catch (error) {
    return res.sendStatus(500);
  }
};

export const postSubscribeOrAddCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const userId = req.query.byUser;
    const action = req.body.action;

    let message;

    if (/subscribe/i.test(action)) {
      /* Checking that user has already added this course or not */
      let isCourseAdded = await pool.query(
        `
        SELECT EXISTS 
        (SELECT *
          FROM desired_courses
          WHERE user_id = $1 AND course_id = $2)
        `,
        [userId, courseId]
      );

      isCourseAdded = isCourseAdded.rows[0].exists;
      if (isCourseAdded) {
        await pool.query(
          `
          DELETE FROM desired_courses
          WHERE user_id = $1 AND course_id = $2
          `,
          [userId, courseId]
        );
      }
      await pool.query(
        `INSERT INTO subscriptions(user_id, course_id, status, created_date)
              VALUES ($1, $2, $3, $4)`,
        [userId, courseId, 0, new Date()]
      );
      message = "The course has been successfully subscribed";
    } else if (/add/i.test(action)) {
      await pool.query(
        `INSERT INTO desired_courses(user_id, course_id, created_date)
              VALUES ($1, $2, $3)`,
        [userId, courseId, new Date()]
      );
      message =
        "The course has been successfully added to the desired courses list";
    } else if (/remove/i.test(action)) {
      await pool.query(
        `DELETE FROM desired_courses WHERE user_id = $1 AND course_id = $2`,
        [userId, courseId]
      );
      message =
        "The course has been successfully deleted from the desired courses list";
    }

    return res.json({
      message,
    });
  } catch (error) {
    return res.sendStatus(500);
  }
};

export const getLearningById = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const userId = req.query.byUser;
    let course_data = await pool.query(
      `
      SELECT courses.course_id, courses.course_name, courses.summary
      FROM courses
      WHERE course_id = $1`,
      [courseId]
    );
    course_data = course_data.rows[0];

    let lessons = await pool.query(
      `
      SELECT  lessons.lesson_name, lessons.lesson_id, sub_lessons.sub_lesson_name , sub_lessons.sub_lesson_id , assignments.assignment_id , sub_lessons.video_directory, users_assignments.submitted_date
      FROM courses
      INNER JOIN lessons 
      ON courses.course_id = lessons.course_id
      INNER JOIN sub_lessons 
      ON lessons.lesson_id = sub_lessons.lesson_id
      LEFT JOIN assignments
      ON sub_lessons.sub_lesson_id = assignments.sub_lesson_id
      LEFT JOIN users_assignments
      ON users_assignments.assignment_id = assignments.assignment_id
      WHERE courses.course_id=$1
      ORDER BY lessons.sequence ASC, sub_lessons.sequence ASC`,
      [courseId]
    );
    lessons = lessons.rows;

    const lessonSequence = {};
    lessons.map((lesson) => {
      if (lesson.lesson_id in lessonSequence) {
        if (!lessonSequence[lesson.lesson_id].includes(lesson.sub_lesson_id)) {
          lessonSequence[lesson.lesson_id].push(lesson.sub_lesson_id);
        }
      } else {
        lessonSequence[lesson.lesson_id] = [];
        lessonSequence[lesson.lesson_id].push(lesson.sub_lesson_id);
      }
    });

    course_data.lessons = {};
    lessons.map((lesson) => {
      if (lesson.lesson_id in course_data.lessons) {
        course_data.lessons[lesson.lesson_id].sub_lessons = {
          ...course_data.lessons[lesson.lesson_id].sub_lessons,
          [lesson.sub_lesson_id]: {
            sub_lesson_name: lesson.sub_lesson_name,
            video_directory: lesson.video_directory,
            watched_status: "unwatched",
            assign_status: Boolean(lesson.assignment_id)
              ? "incompleted"
              : "no-assignment",
          },
        };
      } else {
        course_data.lessons[lesson.lesson_id] = {
          lesson_name: lesson.lesson_name,
          sub_lessons: {
            [lesson.sub_lesson_id]: {
              sub_lesson_name: lesson.sub_lesson_name,
              video_directory: lesson.video_directory,
              watched_status: "unwatched",
              assign_status: Boolean(lesson.assignment_id)
                ? "incompleted"
                : "no-assignment",
            },
          },
        };
      }
    });
    let checkWatchedStatus = await pool.query(
      `
      select users_sub_lessons.user_id,users_sub_lessons.sub_lesson_id,lessons.course_id,lessons.lesson_id
      from users_sub_lessons
      inner join sub_lessons
      on users_sub_lessons.sub_lesson_id = sub_lessons.sub_lesson_id
      inner join lessons
      on sub_lessons.lesson_id = lessons.lesson_id
      where users_sub_lessons.user_id = $1 AND lessons.course_id = $2
      `,
      [userId, courseId]
    );
    checkWatchedStatus = checkWatchedStatus.rows;

    for (let i = 0; i < checkWatchedStatus.length; i++) {
      course_data.lessons[String(checkWatchedStatus[i].lesson_id)].sub_lessons[
        String(checkWatchedStatus[i].sub_lesson_id)
      ].watched_status = "watched";
    }

    let checkAssignStatus = await pool.query(
      `
      SELECT lessons.lesson_id, sub_lessons.sub_lesson_id, assignments.assignment_id, users_assignments.submitted_date
      FROM lessons
      INNER JOIN sub_lessons
      ON lessons.lesson_id = sub_lessons.lesson_id
      INNER JOIN assignments
      ON sub_lessons.sub_lesson_id = assignments.sub_lesson_id
      INNER JOIN users_assignments
      ON assignments.assignment_id = users_assignments.assignment_id
      WHERE users_assignments.user_id = $1 AND lessons.course_id = $2
      ORDER BY lessons.sequence ASC, sub_lessons.sequence ASC
      `,
      [userId, courseId]
    );
    checkAssignStatus = checkAssignStatus.rows;
    const assignStatus = {};
    for (let i = 0; i < checkAssignStatus.length; i++) {
      if (checkAssignStatus[i].lesson_id in assignStatus) {
        if (
          checkAssignStatus[i].sub_lesson_id in
          assignStatus[checkAssignStatus[i].lesson_id]
        ) {
          assignStatus[checkAssignStatus[i].lesson_id][
            checkAssignStatus[i].sub_lesson_id
          ] = {
            ...assignStatus[checkAssignStatus[i].lesson_id][
              checkAssignStatus[i].sub_lesson_id
            ],
            [checkAssignStatus[i].assignment_id]:
              checkAssignStatus[i].submitted_date,
          };
        } else {
          assignStatus[checkAssignStatus[i].lesson_id][
            checkAssignStatus[i].sub_lesson_id
          ] = {
            [checkAssignStatus[i].assignment_id]:
              checkAssignStatus[i].submitted_date,
          };
        }
      } else {
        assignStatus[checkAssignStatus[i].lesson_id] = {
          [checkAssignStatus[i].sub_lesson_id]: {
            [checkAssignStatus[i].assignment_id]:
              checkAssignStatus[i].submitted_date,
          },
        };
      }
    }

    for (let lessonId in assignStatus) {
      for (let subLessonId in assignStatus[lessonId]) {
        if (
          !Object.values(assignStatus[lessonId][subLessonId]).includes(null)
        ) {
          course_data.lessons[lessonId].sub_lessons[subLessonId].assign_status =
            "completed";
        }
      }
    }

    return res.json({
      data: {
        ...course_data,
        percentProgress: res.locals.percentProgress,
        lessonSequence,
      },
    });
  } catch (error) {
    return res.sendStatus(500);
  }
};

export const getLatestSubLesson = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const userId = req.query.byUser;

    let latestSubLesson = await pool.query(
      `
      SELECT users_sub_lessons.sub_lesson_id AS latest_sub_lesson_id
      FROM lessons
      INNER JOIN sub_lessons
      ON lessons.lesson_id = sub_lessons.lesson_id
      INNER JOIN users_sub_lessons
      ON sub_lessons.sub_lesson_id = users_sub_lessons.sub_lesson_id
      WHERE users_sub_lessons.user_id = $1 and lessons.course_id = $2
      ORDER BY users_sub_lessons.created_date DESC
      LIMIT 1
      `,
      [userId, courseId]
    );
    latestSubLesson = latestSubLesson.rows[0];

    /* If there is no value of latest sub lesson, it means that user learns this course for the first time */
    if (Boolean(latestSubLesson)) {
      latestSubLesson = latestSubLesson.latest_sub_lesson_id;
      let subLessonList = await pool.query(
        `
        SELECT lessons.lesson_id, sub_lessons.sub_lesson_id
        FROM lessons
        INNER JOIN sub_lessons
        ON lessons.lesson_id = sub_lessons.lesson_id
        WHERE lessons.course_id = $1
        ORDER BY lessons.sequence ASC, sub_lessons.sequence ASC
        `,
        [courseId]
      );
      subLessonList = subLessonList.rows;

      /* Finding the next sub lesson of latest watched sub lesson */
      for (let i = 0; i < subLessonList.length; i++) {
        if (subLessonList[i].sub_lesson_id === latestSubLesson) {
          if (Boolean(subLessonList[i + 1])) {
            latestSubLesson = subLessonList[i + 1].sub_lesson_id;
          }
          break;
        }
      }
      return res.json({
        data: latestSubLesson,
      });
    } else {
      /* User learns this course for the first time => redirect to the first lesson */
      latestSubLesson = await pool.query(
        `
      SELECT sub_lessons.sub_lesson_id AS latest_sub_lesson_id
      FROM lessons
      INNER JOIN sub_lessons
      ON lessons.lesson_id = sub_lessons.lesson_id
      WHERE lessons.course_id = $1
      ORDER BY lessons.sequence ASC, sub_lessons.sequence ASC
      LIMIT 1
      `,
        [courseId]
      );
      latestSubLesson = latestSubLesson.rows[0].latest_sub_lesson_id;
      return res.json({
        data: latestSubLesson,
      });
    }
  } catch (error) {
    return res.sendStatus(500);
  }
};

export const postWatchedOrAccepted = async (req, res) => {
  try {
    const userId = req.query.byUser;
    const subLessonId = req.params.subLessonId;
    const action = req.body.action;
    const dateNow = new Date();

    if (/accepted/i.test(action)) {
      let result = await pool.query(
        `
      SELECT assignment_id
      FROM sub_lessons
      INNER JOIN assignments
      ON sub_lessons.sub_lesson_id = assignments.sub_lesson_id
      WHERE sub_lessons.sub_lesson_id = $1`,
        [subLessonId]
      );
      result = result.rows;

      const assignmentList = [];
      for (let i = 0; i < result.length; i++) {
        assignmentList.push(result[i].assignment_id);
      }

      const sqlStatement = format(
        `
        INSERT INTO users_assignments(user_id, assignment_id, accepted_date, updated_date, status)
        VALUES (%s, UNNEST(ARRAY[%s]), %L, %L, %L)`,
        userId,
        assignmentList,
        dateNow,
        dateNow,
        "pending"
      );

      await pool.query(sqlStatement);
      res.json({
        message: "Successfully insert data into users_assignments table",
      });
    } else if (/watched/i.test(action)) {
      const isExisted = await pool.query(
        `
        SELECT *
        FROM users_sub_lessons
        WHERE user_id = $1 AND sub_lesson_id = $2
        `,
        [userId, subLessonId]
      );
      if (!Boolean(isExisted.rowCount)) {
        await pool.query(
          `
            INSERT INTO users_sub_lessons(user_id, sub_lesson_id, created_date)
            VALUES ($1, $2, $3)`,
          [userId, subLessonId, dateNow]
        );
      } else {
        await pool.query(
          `
            UPDATE users_sub_lessons SET created_date = $1
            WHERE user_id = $2 AND sub_lesson_id = $3`,
          [dateNow, userId, subLessonId]
        );
      }
      return res.json({
        message: "Successfully insert data into users_sub_lessons table",
      });
    }
  } catch (error) {
    return res.sendStatus(500);
  }
};

export const getSubLesson = async (req, res) => {
  try {
    const userId = req.query.byUser;
    const subLessonId = req.params.subLessonId;
    const courseId = req.params.courseId;

    let querySubLesson = await pool.query(
      `
    SELECT sub_lessons.sub_lesson_name, sub_lessons.video_directory, assignments.assignment_id, assignments.detail, sub_lessons.duration
    FROM lessons
    INNER JOIN sub_lessons
    ON lessons.lesson_id = sub_lessons.lesson_id
    LEFT JOIN assignments
    ON sub_lessons.sub_lesson_id = assignments.sub_lesson_id
    WHERE lessons.course_id = $1 AND sub_lessons.sub_lesson_id = $2`,
      [courseId, subLessonId]
    );
    querySubLesson = querySubLesson.rows;
    const subLessonData = {
      sub_lesson_id: subLessonId,
      sub_lesson_name: querySubLesson[0].sub_lesson_name,
      video_directory: JSON.parse(querySubLesson[0].video_directory).url,
      duration: querySubLesson[0].duration,
      assignments: {},
    };
    querySubLesson.map((assignment) => {
      if (assignment.assignment_id !== null) {
        subLessonData.assignments[assignment.assignment_id] = {
          detail: assignment.detail,
        };
      } else {
        subLessonData.assignments = null;
      }
    });

    const findDaysUntilDeadline = (currentDate, deadline) => {
      const dl = new Date(deadline);
      const cd = new Date(currentDate);
      const deadlineDateInMs = dl.getTime();
      const currentDateInMs = cd.getTime();
      const msDiff = deadlineDateInMs - currentDateInMs;
      const daysUntilDeadline = msDiff / (1000 * 60 * 60 * 24);
      return Math.round(daysUntilDeadline);
    };

    let queryAssignmentStatus = await pool.query(
      `
    SELECT assignments.assignment_id, sub_lessons.duration, users_assignments.answer, users_assignments.accepted_date, users_assignments.status, users_assignments.user_assignment_id, users_assignments.answer, users_assignments.submitted_date
    FROM assignments
    INNER JOIN users_assignments
    ON assignments.assignment_id = users_assignments.assignment_id
    INNER JOIN sub_lessons
    ON assignments.sub_lesson_id = sub_lessons.sub_lesson_id
    WHERE assignments.sub_lesson_id = $1 AND users_assignments.user_id = $2
    `,
      [subLessonId, userId]
    );

    if (Boolean(queryAssignmentStatus.rowCount)) {
      subLessonData.assignment_status = "accepted";
      queryAssignmentStatus.rows.map((assignment) => {
        subLessonData.assignments[String(assignment.assignment_id)].answer =
          assignment.answer;
        subLessonData.assignments[
          String(assignment.assignment_id)
        ].submitted_date = assignment.submitted_date;
        // If an assignment status is overdue => Stored in response's data immediately (no need to check overdue status again)
        if (
          assignment.status === "overdue" ||
          assignment.status === "submitted"
        ) {
          subLessonData.assignments[String(assignment.assignment_id)].status =
            assignment.status;
        } else {
          // If an assignment status isn't overdue => Need to check whether it is overdue or not first
          let daysAfterAccepted = Math.abs(
            assignment.accepted_date - new Date()
          );
          daysAfterAccepted = daysAfterAccepted / (1000 * 60 * 60 * 24);
          // If it is overdue => Changed status to "overdue" then send into response's data and also update the database
          if (daysAfterAccepted >= assignment.duration) {
            assignment.status = "overdue";
            pool.query(
              `
            UPDATE users_assignments
            SET status = 'overdue', updated_date = $1
            WHERE user_assignment_id = $2
            `,
              [new Date(), assignment.user_assignment_id]
            );
          }
          subLessonData.assignments[String(assignment.assignment_id)].status =
            assignment.status;
          if (!/overdue/i.test(assignment.status)) {
            let deadlineDate = new Date(assignment.accepted_date);
            deadlineDate = new Date(
              deadlineDate.setDate(deadlineDate.getDate() + assignment.duration)
            );
            const deadlineDateString = deadlineDate.toLocaleString("en-GB");
            subLessonData.assignments[
              String(assignment.assignment_id)
            ].deadline = deadlineDateString;
            subLessonData.assignments[String(assignment.assignment_id)][
              "days_until_deadline"
            ] = findDaysUntilDeadline(new Date(), deadlineDate);
          }
        }
      });
    } else {
      /* In case of there is no assignment in that sub lesson, assignment_status will automatically be assigned as "accepted" */
      if (subLessonData.assignments === null) {
        subLessonData.assignment_status = "accepted";
      } else {
        subLessonData.assignment_status = "unaccepted";
      }
    }

    return res.json({ data: subLessonData });
  } catch (error) {
    return res.sendStatus(500);
  }
};
