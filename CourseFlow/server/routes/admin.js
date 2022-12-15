import { Router } from "express";
import multer from "multer";
import * as admin_controller from "../controllers/adminController.js";
import { protect } from "../middlewares/protect.js";
import { checkAdminPermission } from "../middlewares/checkAdminPermission.js";

const adminRouter = Router();
const multerUpload = multer({ dest: "uploads/" });

const courseUpload = multerUpload.fields([
  { name: "cover_image", maxCount: 1 },
  { name: "video_trailer", maxCount: 1 },
  { name: "files", maxCount: 20 },
  { name: "sub_lesson_videos", maxCount: 200 },
]);

/* course CRUD */
adminRouter.get("/courses", protect, admin_controller.getAdminCourses);
adminRouter.post("/courses", protect, courseUpload, admin_controller.addCourse);
adminRouter.get("/courses/:courseId", protect, admin_controller.getCourse);
adminRouter.put(
  "/courses/:courseId",
  protect,
  courseUpload,
  admin_controller.updateCourse
);
adminRouter.delete(
  "/courses/:courseId",
  courseUpload,
  admin_controller.deleteCourse
);

/* lesson or sub-lesson CRUD */
adminRouter.post(
  "/courses/:courseId/lessons",
  protect,
  checkAdminPermission,
  courseUpload,
  admin_controller.addLesson
);
adminRouter.get(
  "/courses/:courseId/lessons/:lessonId",
  protect,
  checkAdminPermission,
  admin_controller.getLesson
);
adminRouter.put(
  "/courses/:courseId/lessons/:lessonId",
  protect,
  checkAdminPermission,
  courseUpload,
  admin_controller.editLesson
);
adminRouter.delete(
  "/courses/:courseId/lessons/:lessonId",
  courseUpload,
  admin_controller.deleteLesson
);

/* assignments CRUD */
adminRouter.get("/assignments", protect, admin_controller.getAllCoursesData);
adminRouter.post("/assignments", protect, admin_controller.addAssignment);
adminRouter.get(
  "/assignments/list",
  protect,
  admin_controller.getAllAssignment
);
adminRouter.get(
  "/assignments/:assignmentId",
  protect,
  admin_controller.getAssignmentById
);
adminRouter.put(
  "/assignments/:assignmentId",
  protect,
  admin_controller.editAssignment
);
adminRouter.delete(
  "/assignments/:assignmentId",
  protect,
  admin_controller.deleteAssignment
);

export default adminRouter;
