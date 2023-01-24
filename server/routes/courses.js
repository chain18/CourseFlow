import { Router } from "express";
import * as courses_controller from "../controllers/coursesController.js";
import { protect } from "../middlewares/protect.js";
import { getProgress } from "../middlewares/getProgress.js";
import { checkSubscription } from "../middlewares/checkSubscription.js";

const coursesRouter = Router();

coursesRouter.get("/", courses_controller.getAll);

coursesRouter.get("/:courseId", courses_controller.getById);

coursesRouter.post(
  "/:courseId",
  protect,
  courses_controller.postSubscribeOrAddCourse
);

coursesRouter.get(
  "/:courseId/learning",
  protect,
  checkSubscription,
  getProgress,
  courses_controller.getLearningById
);

coursesRouter.get(
  "/:courseId/learning/latest",
  protect,
  checkSubscription,
  courses_controller.getLatestSubLesson
);

coursesRouter.get(
  "/:courseId/learning/:subLessonId",
  protect,
  checkSubscription,
  courses_controller.getSubLesson
);

coursesRouter.post(
  "/:courseId/learning/:subLessonId",
  protect,
  checkSubscription,
  courses_controller.postWatchedOrAccepted
);

export default coursesRouter;
