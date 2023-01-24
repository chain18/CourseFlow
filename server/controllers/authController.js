import { pool } from "../utils/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  try {
    const newUser = { ...req.body };

    const emailExist = await pool.query(
      `select email from users where email ilike $1 `,
      [newUser.email]
    );

    if (emailExist.rowCount !== 0) {
      return res.json({
        message: "This email has already been taken.",
      });
    } else {
      const salt = await bcrypt.genSalt(10);
      newUser.password = await bcrypt.hash(newUser.password, salt);

      await pool.query(
        `insert into users (full_name, birthdate, education, email, password)
          values ($1, $2, $3, $4, $5)`,
        [
          newUser.full_name,
          newUser.birthdate,
          newUser.education,
          newUser.email,
          newUser.password,
        ]
      );

      return res.json({
        message: "Registered successfully",
      });
    }
  } catch (error) {
    return res.sendStatus(500);
  }
};

export const login = async (req, res) => {
  try {
    const loginInfo = { ...req.body };
    const user = await pool.query(`select * from users where email ilike $1 `, [
      loginInfo.email,
    ]);

    if (user.rowCount === 0) {
      return res.json({
        message: "Couldn't find your account",
      });
    }

    const isValidPassword = await bcrypt.compare(
      loginInfo.password,
      user.rows[0].password
    );

    if (!isValidPassword) {
      return res.json({
        message: "Wrong password. Please try again.",
      });
    }

    const token = jwt.sign(
      {
        user_id: user.rows[0].user_id,
        email: user.rows[0].email,
        full_name: user.rows[0].full_name,
        birthdate: user.rows[0].birthdate,
        education: user.rows[0].education,
        avatar_directory: JSON.parse(user.rows[0].avatar_directory),
      },
      process.env.SECRET_KEY,
      {
        expiresIn: "3600000",
      }
    );

    return res.json({
      message: "Login successfully",
      token,
    });
  } catch (error) {
    return res.sendStatus(500);
  }
};

export const loginAdmin = async (req, res) => {
  try {
    const loginInfo = { ...req.body };
    const admin = await pool.query(
      `select * from admins where username ilike $1 `,
      [loginInfo.username]
    );

    if (admin.rowCount === 0) {
      return res.json({
        message: "Couldn't find your account",
      });
    }
    if (loginInfo.password !== admin.rows[0].password) {
      return res.json({
        message: "Wrong password. Please try again.",
      });
    }

    const token = jwt.sign(
      {
        admin_id: admin.rows[0].admin_id,
        username: admin.rows[0].username,
      },
      process.env.SECRET_KEY,
      {
        expiresIn: "3600000",
      }
    );

    return res.json({
      message: "Login successfully",
      token,
    });
  } catch (error) {
    return res.sendStatus(500);
  }
};
