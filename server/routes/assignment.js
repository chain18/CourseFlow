import { Router } from "express";
import * as assignment_controller from "../controllers/assignmentController.js";
import { protect } from "../middlewares/protect.js";
import { checkSubscription } from "../middlewares/checkSubscription.js";

const assignmentRouter = Router();

assignmentRouter.get("/", protect, assignment_controller.getAllHomework);

assignmentRouter.put(
  "/:courseId/submit/:assignmentId",
  protect,
  checkSubscription,
  assignment_controller.putSubmitAssignment
);

assignmentRouter.put(
  "/:courseId/save/:assignmentId",
  protect,
  checkSubscription,
  assignment_controller.putSaveDraftAssignment
);

export default assignmentRouter;
