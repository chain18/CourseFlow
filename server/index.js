import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import authRouter from "./routes/auth.js";
import coursesRouter from "./routes/courses.js";
import userRouter from "./routes/user.js";
import dotenv from "dotenv";
import cloudinary from "cloudinary";
import assignmentRouter from "./routes/assignment.js";
import adminRouter from "./routes/admin.js";

async function init() {
  dotenv.config();
  cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
    secure: true,
  });

  const app = express();
  const port = 4000;

  app.use(cors());
  app.use(bodyParser.json());

  app.use("/auth", authRouter);
  app.use("/courses", coursesRouter);
  app.use("/user", userRouter);
  app.use("/assignment", assignmentRouter);
  app.use("/admin", adminRouter);

  app.get("*", (req, res) => {
    res.status(404).send("Not found");
  });

  app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });
}

init();
