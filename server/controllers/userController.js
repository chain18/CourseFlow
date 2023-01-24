import { pool } from "../utils/db.js";
import { cloudinaryUpload } from "../utils/upload.js";
import jwt from "jsonwebtoken";

export const updateProfile = async (req, res) => {
  try {
    const userId = req.params.userId;
    const action = req.body.action;
    const updatedUser = {
      full_name: req.body.full_name,
      birthdate: req.body.birthdate,
      education: req.body.education,
      email: req.body.email,
    };

    /* 
      An action for avatar uploading
      - if action is "change" 
        • delete an old one from cloud(?) + upload new one to cloud + update new one in database
      - if action is "remove"
        • delete from cloud + update database
      - if action is "undefined"
        • nothing changed
      */

    // *- Checking birthdate and education whether they are empty string or not? If they are, covert them into null -* //
    if (!updatedUser.birthdate) {
      updatedUser.birthdate = null;
    }
    if (!updatedUser.education) {
      updatedUser.education = null;
    }

    // *- Checking duplicated email -* //
    const currentUserInfo = await pool.query(
      `
          SELECT email, avatar_directory
          FROM users
          WHERE user_id = $1`,
      [userId]
    );
    const prevEmail = currentUserInfo.rows[0].email;
    const regEx = new RegExp(prevEmail, "i");
    let prevAvatar;
    if (currentUserInfo.rows[0].avatar_directory !== null) {
      prevAvatar = JSON.parse(
        currentUserInfo.rows[0].avatar_directory
      ).public_id;
    } else {
      prevAvatar = null;
    }

    // *- Checking that the updated email and previous email are the same or not -* //
    if (regEx.test(updatedUser.email)) {
      // Email doesn't be changed => Can be updated immediately
      if (!action) {
        await pool.query(
          `
              UPDATE users
              SET full_name = $1,
              birthdate = $2,
              education = $3
              WHERE user_id = $4`,
          [
            updatedUser.full_name,
            updatedUser.birthdate,
            updatedUser.education,
            userId,
          ]
        );
      } else {
        if (/change/i.test(action)) {
          if (prevAvatar !== null) {
            await cloudinaryUpload(prevAvatar, "delete", "avatar");
          }
          updatedUser.avatar = await cloudinaryUpload(
            ...req.files.avatar,
            "upload",
            "avatar"
          );
        } else if (/delete/.test(action)) {
          if (prevAvatar !== null) {
            await cloudinaryUpload(prevAvatar, "delete", "avatar");
          }
          updatedUser.avatar = null;
        }
        await pool.query(
          `
              UPDATE users
              SET full_name = $1, 
              birthdate = $2, 
              education = $3, 
              avatar_directory = $4 
              WHERE user_id = $5`,
          [
            updatedUser.full_name,
            updatedUser.birthdate,
            updatedUser.education,
            updatedUser.avatar,
            userId,
          ]
        );
      }
    } else {
      // Email is changed => Need to check that the updated email is already existed or not
      let hasNewEmailAlreadyExisted = await pool.query(
        `
          SELECT email
          FROM users
          WHERE email = $1`,
        [updatedUser.email]
      );
      hasNewEmailAlreadyExisted = Boolean(hasNewEmailAlreadyExisted.rowCount);
      if (hasNewEmailAlreadyExisted) {
        return res.json({
          message: "This email has already been taken.",
        });
      } else {
        if (!action) {
          await pool.query(
            `
                UPDATE users
                SET full_name = $1,
                birthdate = $2,
                education = $3, 
                email = $4 
                WHERE user_id = $5`,
            [
              updatedUser.full_name,
              updatedUser.birthdate,
              updatedUser.education,
              updatedUser.email,
              userId,
            ]
          );
        } else {
          if (/change/i.test(action)) {
            if (prevAvatar !== null) {
              await cloudinaryUpload(prevAvatar, "delete", "avatar");
            }
            updatedUser.avatar = await cloudinaryUpload(
              ...req.files.avatar,
              "upload",
              "avatar"
            );
          } else if (/delete/.test(action)) {
            if (prevAvatar !== null) {
              await cloudinaryUpload(prevAvatar, "delete", "avatar");
            }
            updatedUser.avatar = null;
          }
          await pool.query(
            `
                UPDATE users
                SET full_name = $1, 
                birthdate = $2, 
                education = $3, 
                email = $4, 
                avatar_directory = $5
                WHERE user_id = $6`,
            [
              updatedUser.full_name,
              updatedUser.birthdate,
              updatedUser.education,
              updatedUser.email,
              updatedUser.avatar,
              userId,
            ]
          );
        }
      }
    }

    const updatedUserInfo = await pool.query(
      `
        SELECT *
        FROM users
        WHERE user_id = $1`,
      [userId]
    );

    const token = jwt.sign(
      {
        user_id: userId,
        email: updatedUserInfo.rows[0].email,
        full_name: updatedUserInfo.rows[0].full_name,
        birthdate: updatedUserInfo.rows[0].birthdate,
        education: updatedUserInfo.rows[0].education,
        avatar_directory: JSON.parse(updatedUserInfo.rows[0].avatar_directory),
      },
      process.env.SECRET_KEY,
      {
        expiresIn: "3600000",
      }
    );

    return res.json({
      message: "Your profile has been updated successfully.",
      token,
    });
  } catch (error) {
    return res.json({
      message: "Internal Server Error. Please try again later.",
    });
  }
};

export const subscribedCourses = async (req, res) => {
  try {
    const userId = req.query.byUser;

    let subscribedCourses = await pool.query(
      `
      SELECT courses.course_id, courses.course_name, courses.summary, courses.cover_image_directory, courses.learning_time, CAST(COUNT(lessons.lesson_id) AS INTEGER ) AS lessons_count
      FROM lessons
      INNER JOIN courses
      ON courses.course_id = lessons.course_id
      INNER JOIN subscriptions
      ON courses.course_id = subscriptions.course_id
      WHERE subscriptions.user_id = $1
      GROUP BY courses.course_id, subscriptions.created_date
      ORDER BY subscriptions.created_date DESC`,
      [userId]
    );
    for (let course of subscribedCourses.rows) {
      course.cover_image_directory = JSON.parse(course.cover_image_directory);
    }
    subscribedCourses = subscribedCourses.rows;

    let coursesStatus = await pool.query(
      `
      SELECT course_id, status
      FROM subscriptions
      WHERE user_id = $1
      ORDER BY course_id asc`,
      [userId]
    );
    coursesStatus = coursesStatus.rows;

    subscribedCourses.map((course) => {
      for (let i = 0; i < coursesStatus.length; i++) {
        if (course.course_id === coursesStatus[i].course_id) {
          course.status = coursesStatus[i].status;
        }
      }
    });

    let subCoursesCount = await pool.query(
      `
      SELECT status, CAST(COUNT(subscription_id) AS INTEGER) AS courses_count
      FROM subscriptions
      WHERE user_id = $1
      GROUP BY status`,
      [userId]
    );

    let coursesCount = {};
    subCoursesCount.rows.map((item) => {
      if (!item.status) {
        coursesCount["in progress"] = item.courses_count;
      } else {
        coursesCount["completed"] = item.courses_count;
      }
    });

    return res.json({
      data: subscribedCourses,
      coursesCount,
    });
  } catch (error) {
    return res.sendStatus(500);
  }
};

export const desiredCourses = async (req, res) => {
  try {
    const userId = req.query.byUser;
    const page = req.query.page;
    const coursesPerPage = 6;
    const offset = (page - 1) * coursesPerPage;

    let coursesCount = await pool.query(
      `
      SELECT COUNT(course_id) AS courses_count
      FROM desired_courses
      WHERE user_id = $1
      `,
      [userId]
    );
    coursesCount = Number(coursesCount.rows[0].courses_count);

    let desiredCourses = await pool.query(
      `
    SELECT desired_courses.course_id, courses.course_name, courses.summary, courses.cover_image_directory, courses.learning_time, COUNT(lessons.lesson_id)
    FROM desired_courses
    INNER JOIN courses
    ON courses.course_id = desired_courses.course_id
    INNER JOIN lessons
    ON courses.course_id = lessons.course_id
    WHERE desired_courses.user_id = $1
    GROUP BY desired_courses.course_id, courses.course_id, desired_courses.created_date
    ORDER BY desired_courses.created_date DESC
    LIMIT $2 OFFSET $3`,
      [userId, coursesPerPage, offset]
    );
    desiredCourses = desiredCourses.rows;

    for (let course of desiredCourses) {
      course.cover_image_directory = JSON.parse(course.cover_image_directory);
    }

    return res.json({
      data: desiredCourses,
      count: coursesCount,
    });
  } catch (err) {
    return res.sendStatus(500);
  }
};
