import { pool } from "../utils/db.js";
import { cloudinaryUpload } from "../utils/upload.js";

export const addCourse = async (req, res) => {
  try {
    const adminId = req.query.byAdmin;

    const newCourse = {
      courseName: req.body.course_name,
      price: req.body.price,
      learningTime: req.body.learning_time,
      summary: req.body.course_summary,
      detail: req.body.course_detail,
      category: req.body.category,
    };
    newCourse.coverImageDir = await cloudinaryUpload(
      ...req.files.cover_image,
      "upload",
      "course_cover_images"
    );
    newCourse.videoTrailerDir = await cloudinaryUpload(
      ...req.files.video_trailer,
      "upload",
      "course_video_trailers"
    );

    // Insert course data into courses table
    let courseId = await pool.query(
      `
    INSERT INTO courses (admin_id, course_name, summary, detail, price, learning_time, cover_image_directory, video_trailer_directory, created_date, updated_date, category)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING course_id
    `,
      [
        adminId,
        newCourse.courseName,
        newCourse.summary,
        newCourse.detail,
        newCourse.price,
        newCourse.learningTime,
        newCourse.coverImageDir,
        newCourse.videoTrailerDir,
        new Date(),
        new Date(),
        newCourse.category,
      ]
    );
    courseId = courseId.rows[0].course_id;

    // Insert lessons data into lessons table
    const lessons = JSON.parse(req.body.lessons);
    const lessonName = [];
    const lessonSequence = [];

    for (let i = 0; i < lessons.length; i++) {
      lessonName.push(lessons[i].lesson_name);
      lessonSequence.push(i + 1);
    }

    let lessonId = await pool.query(
      `
    INSERT INTO lessons (course_id, lesson_name, sequence)
    VALUES ($1, UNNEST($2::text[]), UNNEST($3::int[]))
    RETURNING lesson_id
    `,
      [courseId, lessonName, lessonSequence]
    );
    lessonId = lessonId.rows.map((item) => {
      return item.lesson_id;
    });

    // Insert sub-lessons data into sub_lessons table
    const lessonIdSequence = [];
    const subLessonName = [];
    const subLessonSequence = [];
    const subLessonVideoDir = [];

    for (let i = 0; i < lessons.length; i++) {
      for (let j = 0; j < lessons[i].sub_lessons.length; j++) {
        lessonIdSequence.push(lessonId[i]);
        subLessonName.push(lessons[i].sub_lessons[j].sub_lesson_name);
        subLessonSequence.push(j + 1);
      }
    }

    for (let file of req.files.sub_lesson_videos) {
      const fileUploadMeta = await cloudinaryUpload(
        file,
        "upload",
        "course_sub_lesson_videos"
      );
      subLessonVideoDir.push(fileUploadMeta);
    }

    await pool.query(
      `
    INSERT INTO sub_lessons (lesson_id, sub_lesson_name, video_directory, sequence, duration)
    VALUES (UNNEST($1::int[]), UNNEST($2::text[]), UNNEST($3::text[]), UNNEST($4::int[]), $5)
    `,
      [lessonIdSequence, subLessonName, subLessonVideoDir, subLessonSequence, 0]
    );

    // Upload attached files into cloudinary and insert those data into the files table
    if (req.files.files) {
      const fileName = [];
      const fileType = [];
      const fileSize = [];
      const fileDir = [];
      for (let file of req.files.files) {
        const fileUploadMeta = await cloudinaryUpload(
          file,
          "upload",
          "course_attached_files"
        );
        fileName.push(file.originalname);
        fileType.push(file.mimetype);
        fileSize.push(file.size);
        fileDir.push(fileUploadMeta);
      }
      await pool.query(
        `
      INSERT INTO files (course_id, file_name, type, size, directory)
      VALUES ($1, UNNEST($2::text[]), UNNEST($3::text[]), UNNEST($4::int[]), UNNEST($5::text[]))
      `,
        [courseId, fileName, fileType, fileSize, fileDir]
      );
    }
    return res.json({
      message: "Course has been created successfully",
    });
  } catch (error) {
    return res.sendStatus(500);
  }
};

export const getCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const adminId = req.query.byAdmin;

    const courseData = await pool.query(
      `
      SELECT *, detail AS course_detail, summary AS course_summary from courses
      WHERE course_id = $1 AND admin_id = $2`,
      [courseId, adminId]
    );

    const lessonsAndSubCount = await pool.query(
      `
      SELECT lessons.lesson_id, lessons.lesson_name, lessons.sequence, COUNT(sub_lessons.sub_lesson_id)
      FROM courses
      INNER JOIN lessons
      ON courses.course_id = lessons.course_id
      INNER JOIN sub_lessons
      ON lessons.lesson_id = sub_lessons.lesson_id
      WHERE courses.course_id = $1
      GROUP BY lessons.lesson_id
      ORDER BY lessons.sequence asc
      `,
      [courseId]
    );

    const courseAttachedFiles = await pool.query(
      `
      SELECT * 
      FROM files 
      WHERE course_id = $1`,
      [courseId]
    );

    let arrOfFilesDirectory = [];
    for (let file of courseAttachedFiles.rows) {
      arrOfFilesDirectory.push(file.directory);
    }

    const filesMetaData = courseAttachedFiles.rows;
    filesMetaData.unshift(
      {
        file_name: "cover image",
        cover_image_directory: courseData.rows[0].cover_image_directory,
      },
      {
        file_name: "video trailer",
        video_directory: courseData.rows[0].video_trailer_directory,
      }
    );

    return res.json({
      data: courseData.rows[0],
      lessonsAndSubCount: lessonsAndSubCount.rows,
      filesMetaData: filesMetaData,
      allMediaUrls: [
        courseData.rows[0].cover_image_directory,
        courseData.rows[0].video_trailer_directory,
        ...arrOfFilesDirectory,
      ],
    });
  } catch (error) {
    return res.sendStatus(500);
  }
};

export const updateCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const adminId = req.query.byAdmin;
    const mediaFiles = req.files;

    const updatedCourse = {
      courseName: req.body.course_name,
      price: req.body.price,
      learningTime: req.body.learning_time,
      courseSummary: req.body.course_summary,
      detail: req.body.course_detail,
      category: req.body.category,
      courseAttachFiles: [],
    };

    let lessonId;
    let sequence;
    if (!Array.isArray(req.body.lesson_id)) {
      lessonId = [req.body.lesson_id];
    } else {
      lessonId = req.body.lesson_id;
    }
    if (!Array.isArray(req.body.sequence)) {
      sequence = [req.body.sequence];
    } else {
      sequence = req.body.sequence;
    }

    const updatedLesson = {
      lessonId,
      sequence,
    };

    if (Object.keys(mediaFiles).length === 0) {
      // if admin did not change any media
      await pool.query(
        `
        WITH course_update as (
          UPDATE courses
          SET course_name = $1, summary = $2,
          detail = $3, price = $4, learning_time = $5,
          updated_date= $6, category = $7
          WHERE course_id = $8 AND admin_id = $9
          RETURNING course_id
        )
        UPDATE lessons AS l
        SET sequence = l2.sequence
        FROM (SELECT UNNEST($10::int[]) as lesson_id, UNNEST($11::int[]) AS sequence) AS l2
        WHERE l.lesson_id = l2.lesson_id
        `,
        [
          updatedCourse.courseName,
          updatedCourse.courseSummary,
          updatedCourse.detail,
          updatedCourse.price,
          updatedCourse.learningTime,
          new Date(),
          updatedCourse.category,
          courseId,
          adminId,
          updatedLesson.lessonId,
          updatedLesson.sequence,
        ]
      );
      return res.json({
        message: "updated successfully",
      });
    } else {
      const courseMediaFiles = await pool.query(
        `
        SELECT courses.cover_image_directory, courses.video_trailer_directory
        FROM courses
        WHERE courses.course_id = $1 AND admin_id = $2
        `,
        [courseId, adminId]
      );

      let filesForDelete = [];

      const courseAttachedFiles = await pool.query(
        `
        SELECT * from files where course_id = $1
        `,
        [courseId]
      );

      for (let file of courseAttachedFiles.rows) {
        filesForDelete.push({
          public_id: JSON.parse(file.directory).public_id,
          fileType: file.type,
        });
      }

      for (let publicId of Object.values(courseMediaFiles.rows[0])) {
        filesForDelete.push({
          public_id: JSON.parse(publicId).public_id,
        });
      }

      for (let file of filesForDelete) {
        await cloudinaryUpload(
          file.public_id,
          "delete",
          undefined,
          file.fileType
        );
      }

      await pool.query(
        `
        DELETE FROM files WHERE course_id = $1
        `,
        [courseId]
      );

      // upload everything to cloudinary again
      updatedCourse.courseCoverImage = await cloudinaryUpload(
        ...req.files.cover_image,
        "upload",
        "course_cover_images"
      );

      updatedCourse.courseVideoTrailer = await cloudinaryUpload(
        ...req.files.video_trailer,
        "upload",
        "course_video_trailers"
      );

      // update the files' directory except for attached files
      await pool.query(
        `
        WITH course_update AS (
          UPDATE courses
          SET course_name = $1, summary = $2,
          detail = $3, price = $4, learning_time = $5,
          cover_image_directory = $6, video_trailer_directory = $7,
          updated_date= $8, category = $9
          WHERE course_id = $10 AND admin_id = $11
          RETURNING course_id
        )
        UPDATE lessons AS l
        SET sequence = l2.sequence
        FROM (SELECT UNNEST($12::int[]) AS lesson_id, UNNEST($13::int[]) AS sequence) AS l2
        WHERE l.lesson_id = l2.lesson_id
        `,
        [
          updatedCourse.courseName,
          updatedCourse.courseSummary,
          updatedCourse.detail,
          updatedCourse.price,
          updatedCourse.learningTime,
          updatedCourse.courseCoverImage,
          updatedCourse.courseVideoTrailer,
          new Date(),
          updatedCourse.category,
          courseId,
          adminId,
          updatedLesson.lessonId,
          updatedLesson.sequence,
        ]
      );

      let fileName = [];
      let fileType = [];
      let fileSize = [];

      if (req.files.files != undefined) {
        for (let file of req.files.files) {
          updatedCourse.courseAttachFiles.push(
            JSON.stringify(
              await cloudinaryUpload(file, "upload", "course_attached_files")
            )
          );

          fileName.push(file.originalname);
          fileType.push(file.mimetype);
          fileSize.push(file.size);
        }

        await pool.query(
          `
          INSERT INTO files (course_id, file_name, type, size, directory)
          VALUES ( $1, unnest($2::text[]), unnest($3::text[]), unnest($4::int[]), unnest($5::text[]));
          `,
          [
            courseId,
            fileName,
            fileType,
            fileSize,
            updatedCourse.courseAttachFiles,
          ]
        );
      }

      return res.json({
        message: "updated successfully",
      });
    }
  } catch (error) {
    return res.sendStatus(500);
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const adminId = req.query.byAdmin;

    // Step1: Delete all media related to that course from cloudinary
    const courseMediaFiles = await pool.query(
      `
      SELECT cover_image_directory, video_trailer_directory
      FROM courses
      WHERE course_id = $1 AND admin_id = $2
      `,
      [courseId, adminId]
    );

    const subLessonMediaFiles = await pool.query(
      `
      SELECT sub_lessons.video_directory
      FROM courses
      INNER join lessons
      ON lessons.course_id = courses.course_id
      INNER JOIN sub_lessons
      ON sub_lessons.lesson_id = lessons.lesson_id
      WHERE courses.course_id = $1 AND courses.admin_id = $2
      `,
      [courseId, adminId]
    );

    const courseAttachedFiles = await pool.query(
      `
      SELECT * 
      FROM files 
      WHERE course_id = $1
      `,
      [courseId]
    );

    let filesForDelete = [];

    for (let videoDir of Object.values(courseMediaFiles.rows[0])) {
      filesForDelete.push({ public_id: JSON.parse(videoDir).public_id });
    }

    for (let lessonVideoDir of subLessonMediaFiles.rows) {
      filesForDelete.push({
        public_id: JSON.parse(Object.values(lessonVideoDir)[0]).public_id,
      });
    }

    for (let file of courseAttachedFiles.rows) {
      filesForDelete.push({
        public_id: JSON.parse(file.directory).public_id,
        type: file.type,
      });
    }

    for (let file of filesForDelete) {
      await cloudinaryUpload(file.public_id, "delete", undefined, file.type);
    }

    // Step2: Delete course from database
    await pool.query(
      `
      DELETE FROM courses 
      WHERE course_id = $1 AND admin_id = $2`,
      [courseId, adminId]
    );

    return res.json({
      message: "Course has been successfully deleted",
    });
  } catch (eror) {
    return res.sendStatus(500);
  }
};

export const getAdminCourses = async (req, res) => {
  try {
    let searchText = req.query.searchText || "";
    searchText = "\\m" + searchText;
    const adminId = req.query.byAdmin;

    // Change ISO date to normal date before sending data to FE
    const changeDateFormat = (iso_Date) => {
      if (iso_Date === null) {
        return "null";
      }
      const isoDate = new Date(iso_Date);
      let year = isoDate.getFullYear();
      let month = isoDate.getMonth() + 1;
      let date = isoDate.getDate();
      let time = isoDate.toLocaleString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      });

      if (date < 10) {
        date = "0" + date;
      }

      if (month < 10) {
        month = "0" + month;
      }

      let normalDate = date + "/" + month + "/" + year + " " + time;

      return normalDate;
    };

    const results = await pool.query(
      `
      SELECT courses.cover_image_directory, courses.course_name, count(lessons.lesson_id) as lessons_count, courses.price, courses.created_date, courses.updated_date, courses.course_id
      FROM lessons
      INNER JOIN courses
      ON courses.course_id = lessons.course_id
      WHERE courses.course_name ~* $1 AND courses.admin_id = $2
      GROUP BY courses.course_id
      ORDER BY courses.updated_date DESC
        `,
      [searchText, adminId]
    );

    for (let course of results.rows) {
      course.cover_image_directory = JSON.parse(course.cover_image_directory);
      course.created_date = changeDateFormat(course.created_date);
      course.updated_date = changeDateFormat(course.updated_date);
    }

    return res.json({
      data: results.rows,
    });
  } catch (error) {
    return res.sendStatus(500);
  }
};

export const getAllCoursesData = async (req, res) => {
  try {
    const adminId = req.query.byAdmin;

    let fetchAllCoursesData = await pool.query(
      `
      SELECT courses.course_id, courses.course_name, lessons.lesson_id, lessons.lesson_name, sub_lessons.sub_lesson_id, sub_lessons.sub_lesson_name, sub_lessons.duration
      FROM courses
      INNER JOIN lessons
      ON courses.course_id = lessons.course_id
      INNER JOIN sub_lessons
      ON lessons.lesson_id = sub_lessons.lesson_id
      WHERE courses.admin_id = $1
      ORDER BY courses.course_id ASC, lessons.sequence ASC, sub_lessons.sequence ASC
      `,
      [adminId]
    );
    fetchAllCoursesData = fetchAllCoursesData.rows;

    /* Transform data structure from array of objects to purely object */
    const allCoursesData = {};
    fetchAllCoursesData.map((item) => {
      if (item.course_id in allCoursesData) {
        if (item.lesson_id in allCoursesData[item.course_id].lessons) {
          allCoursesData[item.course_id].lessons[item.lesson_id].sub_lessons = {
            ...allCoursesData[item.course_id].lessons[item.lesson_id]
              .sub_lessons,
            [item.sub_lesson_id]: {
              sub_lesson_name: item.sub_lesson_name,
              duration: item.duration,
            },
          };
        } else {
          allCoursesData[item.course_id].lessons[item.lesson_id] = {
            lesson_name: item.lesson_name,
            sub_lessons: {
              [item.sub_lesson_id]: {
                sub_lesson_name: item.sub_lesson_name,
                duration: item.duration,
              },
            },
          };
        }
      } else {
        allCoursesData[item.course_id] = {
          course_name: item.course_name,
          lessons: {
            [item.lesson_id]: {
              lesson_name: item.lesson_name,
              sub_lessons: {
                [item.sub_lesson_id]: {
                  sub_lesson_name: item.sub_lesson_name,
                  duration: item.duration,
                },
              },
            },
          },
        };
      }
    });
    return res.json({ data: allCoursesData });
  } catch (error) {
    return res.sendStatus(500);
  }
};

export const addAssignment = async (req, res) => {
  try {
    const admin_id = req.query.byAdmin;
    const sub_lesson_id = req.body.sub_lesson_id;
    const detail = req.body.detail;
    const duration = req.body.duration;

    /* Validate whether this admin owned the course or not */
    let doesAdminOwnThisCourse = await pool.query(
      `
      SELECT EXISTS 
      (SELECT *
        FROM courses
      INNER JOIN lessons
      ON courses.course_id = lessons.course_id
      INNER JOIN sub_lessons
      ON lessons.lesson_id = sub_lessons.lesson_id
      WHERE courses.admin_id = $1 AND sub_lessons.sub_lesson_id = $2)
      `,
      [admin_id, sub_lesson_id]
    );
    doesAdminOwnThisCourse = doesAdminOwnThisCourse.rows[0].exists;
    if (!doesAdminOwnThisCourse) {
      return res
        .status(403)
        .json({ message: "You have no permission to manipulate this course" });
    }

    /* Update duration of assignments in "sub_lessons" table */
    await pool.query(
      `
      UPDATE sub_lessons
      SET duration = $1
      WHERE sub_lesson_id = $2
      `,
      [duration, sub_lesson_id]
    );

    /* Insert new assignment into "assignments" table */
    let assignmentId = await pool.query(
      `
      INSERT INTO assignments(sub_lesson_id, detail, created_date, updated_date)
      VALUES ($1, $2, $3, $4)
      RETURNING assignment_id
      `,
      [sub_lesson_id, detail, new Date(), new Date()]
    );
    assignmentId = assignmentId.rows[0].assignment_id;

    /* Checking whether there is any user that already accepted assignment(s) in this sub-lesson
    If so, insert this new assignment into users_assignments */
    let acceptedDateOfUsers = await pool.query(
      `
      SELECT users_assignments.user_id, users_assignments.accepted_date 
      FROM users_assignments
      INNER JOIN assignments
      ON users_assignments.assignment_id = assignments.assignment_id
      WHERE assignments.sub_lesson_id = $1
      GROUP BY users_assignments.user_id, users_assignments.accepted_date
      `,
      [sub_lesson_id]
    );
    acceptedDateOfUsers = acceptedDateOfUsers.rows;
    const arrayOfUserId = [];
    const arrayOfAcceptedDate = [];
    for (let acceptedDateOfEachUser of acceptedDateOfUsers) {
      arrayOfUserId.push(acceptedDateOfEachUser.user_id);
      arrayOfAcceptedDate.push(acceptedDateOfEachUser.accepted_date);
    }

    await pool.query(
      `
      INSERT INTO users_assignments (user_id, assignment_id, accepted_date, updated_date, status)
      VALUES (UNNEST($1::int[]), $2, UNNEST($3::timestamp with time zone[]), UNNEST($3::timestamp with time zone[]), $4)
      `,
      [arrayOfUserId, assignmentId, arrayOfAcceptedDate, "pending"]
    );

    return res.json({ message: "Assignment has been successfully added" });
  } catch (error) {
    return res.sendStatus(500);
  }
};

export const getAllAssignment = async (req, res) => {
  try {
    let searchText = req.query.searchText || "";
    searchText = "\\m" + searchText;
    const adminId = req.query.byAdmin;

    const changeDateFormat = (iso_Date) => {
      if (iso_Date === null) {
        return "null";
      }
      const isoDate = new Date(iso_Date);
      let year = isoDate.getFullYear();
      let month = isoDate.getMonth() + 1;
      let date = isoDate.getDate();
      let time = isoDate.toLocaleString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      });

      if (date < 10) {
        date = "0" + date;
      }

      if (month < 10) {
        month = "0" + month;
      }

      let normalDate = date + "/" + month + "/" + year + " " + time;

      return normalDate;
    };

    const result = await pool.query(
      `SELECT assignments.detail, courses.course_name, lessons.lesson_name, sub_lessons.sub_lesson_name, assignments.created_date, assignments.updated_date, assignments.assignment_id
      FROM courses
      INNER JOIN lessons
      ON lessons.course_id = courses.course_id
      INNER JOIN sub_lessons
      ON sub_lessons.lesson_id = lessons.lesson_id
      INNER JOIN assignments
      ON assignments.sub_lesson_id = sub_lessons.sub_lesson_id
      WHERE assignments.detail ~* $1 and courses.admin_id = $2
      ORDER BY assignments.updated_date DESC`,
      [searchText, adminId]
    );

    for (let course of result.rows) {
      course.created_date = changeDateFormat(course.created_date);
      course.updated_date = changeDateFormat(course.updated_date);
    }

    return res.json({
      data: result.rows,
    });
  } catch (error) {
    return res.sendStatus(500);
  }
};

export const getAssignmentById = async (req, res) => {
  try {
    const admin_id = req.query.byAdmin;
    const assignment_id = req.params.assignmentId;

    /* Validate whether this admin owned the course or not */
    let doesAdminOwnThisCourse = await pool.query(
      `
  SELECT EXISTS 
  (SELECT *
    FROM courses
  INNER JOIN lessons
  ON courses.course_id = lessons.course_id
  INNER JOIN sub_lessons
  ON lessons.lesson_id = sub_lessons.lesson_id
  INNER JOIN assignments
  ON sub_lessons.sub_lesson_id = assignments.sub_lesson_id
  WHERE courses.admin_id = $1 AND assignments.assignment_id = $2)
  `,
      [admin_id, assignment_id]
    );
    doesAdminOwnThisCourse = doesAdminOwnThisCourse.rows[0].exists;
    if (!doesAdminOwnThisCourse) {
      return res
        .status(403)
        .json({ message: "You have no permission to see this assignment" });
    }

    let data = await pool.query(
      `
    SELECT courses.course_id, lessons.lesson_id, sub_lessons.sub_lesson_id, assignments.detail
    FROM courses
    INNER JOIN lessons
    ON courses.course_id = lessons.course_id
    INNER JOIN sub_lessons
    ON lessons.lesson_id = sub_lessons.lesson_id
    INNER JOIN assignments
    ON sub_lessons.sub_lesson_id = assignments.sub_lesson_id
    WHERE courses.admin_id = $1 AND assignments.assignment_id = $2
    `,
      [admin_id, assignment_id]
    );

    data = data.rows[0];
    data = {
      ...data,
      course_id: String(data.course_id),
      lesson_id: String(data.lesson_id),
      sub_lesson_id: String(data.sub_lesson_id),
    };
    return res.json({ data });
  } catch (error) {
    return res.sendStatus(500);
  }
};

export const editAssignment = async (req, res) => {
  try {
    const admin_id = req.query.byAdmin;
    const assignment_id = req.params.assignmentId;
    const sub_lesson_id = req.body.sub_lesson_id;
    const detail = req.body.detail;
    const duration = req.body.duration;

    /* Validate whether this admin owned the course or not */
    let doesAdminOwnThisCourse = await pool.query(
      `
    SELECT EXISTS 
    (SELECT *
      FROM courses
    INNER JOIN lessons
    ON courses.course_id = lessons.course_id
    INNER JOIN sub_lessons
    ON lessons.lesson_id = sub_lessons.lesson_id
    WHERE courses.admin_id = $1 AND sub_lessons.sub_lesson_id = $2)
    `,
      [admin_id, sub_lesson_id]
    );
    doesAdminOwnThisCourse = doesAdminOwnThisCourse.rows[0].exists;
    if (!doesAdminOwnThisCourse) {
      return res
        .status(403)
        .json({ message: "You have no permission to edit this course" });
    }

    /* Update duration of assignments in "sub_lessons" table */
    await pool.query(
      `
    UPDATE sub_lessons
    SET duration = $1
    WHERE sub_lesson_id = $2
    `,
      [duration, sub_lesson_id]
    );

    /* Update an assignment in "assignments" table */
    await pool.query(
      `
    UPDATE assignments
    SET sub_lesson_id = $1,
        detail = $2,
        updated_date = $3
    WHERE assignment_id = $4
    `,
      [sub_lesson_id, detail, new Date(), assignment_id]
    );

    return res.json({ message: "Assignment has been successfully edited" });
  } catch (error) {
    return res.sendStatus(500);
  }
};

export const deleteAssignment = async (req, res) => {
  try {
    const admin_id = req.query.byAdmin;
    const assignment_id = req.params.assignmentId;

    /* Validate whether this admin owned the course or not */
    let doesAdminOwnThisCourse = await pool.query(
      `
    SELECT EXISTS 
    (SELECT *
      FROM courses
    INNER JOIN lessons
    ON courses.course_id = lessons.course_id
    INNER JOIN sub_lessons
    ON lessons.lesson_id = sub_lessons.lesson_id
    INNER JOIN assignments
    ON sub_lessons.sub_lesson_id = assignments.sub_lesson_id
    WHERE courses.admin_id = $1 AND assignments.assignment_id = $2)
    `,
      [admin_id, assignment_id]
    );
    doesAdminOwnThisCourse = doesAdminOwnThisCourse.rows[0].exists;
    if (!doesAdminOwnThisCourse) {
      return res
        .status(403)
        .json({ message: "You have no permission to delete this assignment" });
    }

    /* Checking whether this assignment is the last assignment of a sub-lesson or not
    If so, restart a duration of sub-lesson to be 0 */
    let assignmentCount = await pool.query(
      `
      WITH get_sub_lesson_id AS (
        SELECT sub_lesson_id
        FROM assignments
        WHERE assignment_id = $1
      ) 
      SELECT COUNT(assignment_id)
      FROM assignments
      WHERE sub_lesson_id in (SELECT sub_lesson_id FROM get_sub_lesson_id)
      `,
      [assignment_id]
    );
    assignmentCount = assignmentCount.rows[0].count;

    if (Number(assignmentCount) === 1) {
      await pool.query(
        `
        WITH get_sub_lesson_id AS (
          SELECT sub_lesson_id
          FROM assignments
          WHERE assignment_id = $1
        ) 
        UPDATE sub_lessons
        SET duration = 0
        WHERE sub_lesson_id in (SELECT sub_lesson_id FROM get_sub_lesson_id)
        `,
        [assignment_id]
      );
    }

    /* Delete an assignment from "assignments" table */
    await pool.query(
      `
    DELETE FROM assignments
    WHERE assignment_id = $1
    `,
      [assignment_id]
    );

    return res.json({ message: "Assignment has been successfully deleted" });
  } catch (error) {
    return res.sendStatus(500);
  }
};

export const addLesson = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const lessonName = req.body.lesson_name;
    let arrayOfSubLessonName;
    if (!Array.isArray(req.body.sub_lesson_names)) {
      arrayOfSubLessonName = [req.body.sub_lesson_names];
    } else {
      arrayOfSubLessonName = req.body.sub_lesson_names;
    }
    const arrayOfSubLessonVideo = req.files.sub_lesson_videos;
    const arrayOfSubLessonVideoDir = [];
    const arrayOfSubLessonSequence = [];

    // Upload files to cloudinary
    for (let video of arrayOfSubLessonVideo) {
      const metaData = await cloudinaryUpload(
        video,
        "upload",
        "course_sub_lesson_videos"
      );
      arrayOfSubLessonVideoDir.push(metaData);
    }

    // Get a sequence of sub-lessons
    for (let i = 0; i < arrayOfSubLessonName.length; i++) {
      arrayOfSubLessonSequence.push(i);
    }

    // Query the lesson last sequence number first so that we could append it
    let lessonId = await pool.query(
      `
      WITH get_last_sequence AS (
        SELECT sequence
        FROM lessons
        WHERE course_id = $1
        ORDER BY sequence DESC
        LIMIT 1
      ) 
      INSERT INTO lessons (course_id, lesson_name, sequence)
      SELECT $1, $2, sequence + 1
      FROM get_last_sequence
      RETURNING lesson_id
      `,
      [courseId, lessonName]
    );
    lessonId = lessonId.rows[0].lesson_id;

    await pool.query(
      `
      INSERT INTO sub_lessons (lesson_id, sub_lesson_name, video_directory, sequence, duration)
      VALUES ($1, UNNEST($2::text[]), UNNEST($3::text[]), UNNEST($4::int[]), 0)
      `,
      [
        lessonId,
        arrayOfSubLessonName,
        arrayOfSubLessonVideoDir,
        arrayOfSubLessonSequence,
      ]
    );

    await pool.query(
      `
      UPDATE courses
      SET updated_date = $1
      WHERE course_id = $2
      `,
      [new Date(), courseId]
    );

    let resultAfterAdded = await pool.query(
      `
      SELECT lessons.lesson_id, lessons.lesson_name, lessons.sequence, COUNT(sub_lessons.sub_lesson_id)
      FROM lessons
      INNER JOIN sub_lessons
      ON lessons.lesson_id = sub_lessons.lesson_id
      WHERE lessons.course_id = $1
      GROUP BY lessons.lesson_id
      ORDER BY lessons.sequence ASC;
      `,
      [courseId]
    );
    resultAfterAdded = resultAfterAdded.rows;

    return res.json({
      message: "Lesson has been successfully created",
      data: resultAfterAdded,
    });
  } catch (error) {
    return res.sendStatus(500);
  }
};

export const getLesson = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const lessonId = req.params.lessonId;

    const lessonData = await pool.query(
      `
    SELECT lesson_name, sequence
    FROM lessons
    WHERE course_id = $1 AND lesson_id =$2
    `,
      [courseId, lessonId]
    );
    const lessonName = lessonData.rows[0].lesson_name;
    const lessonSequence = lessonData.rows[0].sequence;

    let subLessonData = await pool.query(
      `
    SELECT sub_lessons.sub_lesson_name AS name, sub_lessons.video_directory AS dir, sub_lessons.sub_lesson_id AS id
    FROM lessons
    INNER JOIN sub_lessons
    ON lessons.lesson_id = sub_lessons.lesson_id
    WHERE lessons.course_id = $1 AND lessons.lesson_id = $2
    ORDER BY sub_lessons.sequence ASC
    `,
      [courseId, lessonId]
    );
    subLessonData = subLessonData.rows;
    const subLessons = [];
    for (let subLesson of subLessonData) {
      subLessons.push({
        sub_lesson_id: subLesson.id,
        sub_lesson_name: subLesson.name,
        video: JSON.parse(subLesson.dir).url,
      });
    }
    return res.json({
      data: {
        lesson_name: lessonName,
        lesson_sequence: lessonSequence,
        sub_lessons: subLessons,
      },
    });
  } catch (error) {
    return res.sendStatus(500);
  }
};

export const editLesson = async (req, res) => {
  try {
    /* 
    --- Step ---
    0. Initialize a variable
    1. Delete all of the sub-lesson videos
    2. Upload new videos
    3. DELETE a sub-lesson that users deleted
    4. Categorize between sub-lesson that already have a data in database (has sub_lesson_id) and one that doesn't (sub_lesson_id is undefined)
    5. Insert sub-lesson that are undefined into the database, then stored its sub_lesson_id in the variable
    6. Substitute an undefined with sub_lesson_id that previously stored
    7. Using UPDATE statement to update all of the sub-lessons
    8. UPDATE lesson_name in lessons table
    9. Return a new data of lesson/sub-lesson to update state in FE
    */

    // 0. Initialize a variable
    const courseId = req.params.courseId;
    const lessonId = req.params.lessonId;
    const lessonName = req.body.lesson_name;
    let arrayOfSubLessonName;
    if (!Array.isArray(req.body.sub_lesson_names)) {
      arrayOfSubLessonName = [req.body.sub_lesson_names];
    } else {
      arrayOfSubLessonName = req.body.sub_lesson_names;
    }
    let arrayOfSubLessonId;
    if (!Array.isArray(req.body.sub_lesson_id)) {
      arrayOfSubLessonId = [req.body.sub_lesson_id];
    } else {
      arrayOfSubLessonId = req.body.sub_lesson_id;
    }
    const arrayOfSubLessonVideo = req.files.sub_lesson_videos;
    const arrayOfSubLessonVideoDir = [];
    const arrayOfSubLessonSequence = [];

    for (let i = 0; i < arrayOfSubLessonVideo.length; i++) {
      arrayOfSubLessonSequence.push(i + 1);
    }

    // 1. Delete all of the sub-lesson videos
    let oldSubLessonVideo = await pool.query(
      `
      SELECT video_directory AS dir
      FROM sub_lessons
      INNER JOIN lessons
      ON sub_lessons.lesson_id = lessons.lesson_id
      WHERE lessons.course_id = $1 AND sub_lessons.lesson_id = $2
      `,
      [courseId, lessonId]
    );
    oldSubLessonVideo = oldSubLessonVideo.rows;
    for (let i = 0; i < oldSubLessonVideo.length; i++) {
      oldSubLessonVideo[i] = JSON.parse(oldSubLessonVideo[i].dir).public_id;
      await cloudinaryUpload(oldSubLessonVideo[i], "delete");
    }

    // 2. Upload new videos
    for (let subLessonVideo of arrayOfSubLessonVideo) {
      arrayOfSubLessonVideoDir.push(
        JSON.stringify(
          await cloudinaryUpload(
            subLessonVideo,
            "upload",
            "course_sub_lesson_videos"
          )
        )
      );
    }

    // 3. DELETE a sub-lesson that users deleted
    const deletedSubLesson = [];
    let allCurrentSubLessonId = await pool.query(
      `
      SELECT sub_lesson_id AS id
      FROM sub_lessons
      WHERE lesson_id = $1
      `,
      [lessonId]
    );
    allCurrentSubLessonId = allCurrentSubLessonId.rows;
    for (let i = 0; i < allCurrentSubLessonId.length; i++) {
      allCurrentSubLessonId[i] = allCurrentSubLessonId[i].id;
      if (!arrayOfSubLessonId.includes(String(allCurrentSubLessonId[i]))) {
        deletedSubLesson.push(allCurrentSubLessonId[i]);
      }
    }
    await pool.query(
      `
      DELETE FROM sub_lessons
      WHERE sub_lesson_id IN (SELECT * FROM UNNEST($1::int[]))
      `,
      [deletedSubLesson]
    );

    // 4. Categorize between sub-lesson that already have a data in database (has sub_lesson_id) and one that doesn't (sub_lesson_id is undefined)
    const indexOfUndefined = [];
    for (let i = 0; i < arrayOfSubLessonId.length; i++) {
      if (arrayOfSubLessonId[i] === "undefined") {
        indexOfUndefined.push(i);
      }
    }
    const arrayOfSubLessonNameUndefined = [];
    for (let i = 0; i < indexOfUndefined.length; i++) {
      arrayOfSubLessonNameUndefined.push(
        arrayOfSubLessonName[indexOfUndefined[i]]
      );
    }

    // 5. Insert sub-lesson that are undefined into the database, then stored its sub_lesson_id in the variable
    let newSubLessonId = await pool.query(
      `
      INSERT INTO sub_lessons (lesson_id, sub_lesson_name, duration)
      VALUES ($1, UNNEST($2::text[]), 0)
      RETURNING sub_lesson_id
      `,
      [lessonId, arrayOfSubLessonNameUndefined]
    );
    newSubLessonId = newSubLessonId.rows;
    for (let i = 0; i < newSubLessonId.length; i++) {
      newSubLessonId[i] = newSubLessonId[i].sub_lesson_id;
    }

    // 6. Substitute an undefined with sub_lesson_id that previously stored
    let j = 0;
    for (let i = 0; i < arrayOfSubLessonId.length; i++) {
      if (arrayOfSubLessonId[i] === "undefined") {
        arrayOfSubLessonId[i] = newSubLessonId[j];
        j++;
      }
    }

    // 7. Using UPDATE statement to update all of the sub-lessons
    await pool.query(
      `
      UPDATE sub_lessons AS l
      SET sequence = l2.sequence,
          sub_lesson_name = l2.sub_lesson_name,
          video_directory = l2.video_directory
      FROM (SELECT UNNEST($1::int[]) as sub_lesson_id, UNNEST($2::int[]) AS sequence, UNNEST($3::text[]) AS sub_lesson_name, UNNEST($4::text[]) AS video_directory) AS l2
      WHERE l.sub_lesson_id = l2.sub_lesson_id
      `,
      [
        arrayOfSubLessonId,
        arrayOfSubLessonSequence,
        arrayOfSubLessonName,
        arrayOfSubLessonVideoDir,
      ]
    );

    // 8. UPDATE lesson_name in lessons table
    await pool.query(
      `
      UPDATE lessons
      SET lesson_name = $1
      WHERE lesson_id = $2
      `,
      [lessonName, lessonId]
    );

    // 9. Return a new data of lesson/sub-lesson to update state in FE
    let resultAfterAdded = await pool.query(
      `
      SELECT lessons.lesson_id, lessons.lesson_name, lessons.sequence, COUNT(sub_lessons.sub_lesson_id)
      FROM lessons
      INNER JOIN sub_lessons
      ON lessons.lesson_id = sub_lessons.lesson_id
      WHERE lessons.course_id = $1
      GROUP BY lessons.lesson_id
      ORDER BY lessons.sequence ASC;
      `,
      [courseId]
    );
    resultAfterAdded = resultAfterAdded.rows;

    await pool.query(
      `
      UPDATE courses
      SET updated_date = $1
      WHERE course_id = $2
      `,
      [new Date(), courseId]
    );

    return res.json({
      message: "Lesson has been editied successfully",
      data: resultAfterAdded,
    });
  } catch (error) {
    return res.sendStatus(500);
  }
};

export const deleteLesson = async (req, res) => {
  try {
    const lessonId = req.params.lessonId;
    const courseId = req.params.courseId;
    const adminId = req.query.byAdmin;

    /* Validate whether this admin owned the course or not */
    let doesAdminOwnThisCourse = await pool.query(
      `
      SELECT EXISTS 
      (SELECT *
        FROM courses
      INNER JOIN lessons
      ON courses.course_id = lessons.course_id
      INNER JOIN sub_lessons
      ON lessons.lesson_id = sub_lessons.lesson_id
      WHERE courses.admin_id = $1 AND courses.course_id = $2)
      `,
      [adminId, courseId]
    );
    doesAdminOwnThisCourse = doesAdminOwnThisCourse.rows[0].exists;
    if (!doesAdminOwnThisCourse) {
      return res
        .status(403)
        .json({ message: "You have no permission to delete this assignment" });
    }

    // Step1 here
    const result = await pool.query(
      `
      SELECT video_directory 
      FROM sub_lessons 
      WHERE lesson_id = $1
      `,
      [lessonId]
    );

    const videoMetaDataFromCloudinary = result.rows;
    for (let video of videoMetaDataFromCloudinary) {
      let public_id = JSON.parse(video.video_directory).public_id;
      await cloudinaryUpload(public_id, "delete");
    }

    // Step2 here
    await pool.query(
      `
      DELETE 
      FROM lessons
      WHERE lessons.lesson_id = $1 AND lessons.course_id = $2 
      `,
      [lessonId, courseId]
    );

    // Step3 reorder sequence after delete
    let newLessonList = await pool.query(
      `
      SELECT lesson_id
      FROM lessons
      WHERE course_id = $1
      ORDER BY sequence ASC
      `,
      [courseId]
    );
    newLessonList = newLessonList.rows;
    const arrayOfNewLesson = [];
    const arrayOfSequence = [];
    for (let i = 0; i < newLessonList.length; i++) {
      arrayOfNewLesson.push(newLessonList[i].lesson_id);
      arrayOfSequence.push(i + 1);
    }

    await pool.query(
      `
      UPDATE lessons AS l
      SET sequence = l2.sequence
      FROM (SELECT UNNEST($1::int[]) as lesson_id, UNNEST($2::int[]) AS sequence) AS l2
      WHERE l.lesson_id = l2.lesson_id
      `,
      [arrayOfNewLesson, arrayOfSequence]
    );

    let resultAfterAdded = await pool.query(
      `
      SELECT lessons.lesson_id, lessons.lesson_name, lessons.sequence, COUNT(sub_lessons.sub_lesson_id)
      FROM lessons
      INNER JOIN sub_lessons
      ON lessons.lesson_id = sub_lessons.lesson_id
      WHERE lessons.course_id = $1
      GROUP BY lessons.lesson_id
      ORDER BY lessons.sequence ASC;
      `,
      [courseId]
    );
    resultAfterAdded = resultAfterAdded.rows;

    await pool.query(
      `
      UPDATE courses
      SET updated_date = $1
      WHERE course_id = $2
      `,
      [new Date(), courseId]
    );

    return res.json({
      message: "Lesson deleted successfully",
      data: resultAfterAdded,
    });
  } catch (error) {
    return res.sendStatus(500);
  }
};
