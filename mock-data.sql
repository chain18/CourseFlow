-- Mocking Data

CREATE TABLE admins (
  admin_id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  username VARCHAR ( 25 ) UNIQUE NOT NULL,
  password  TEXT NOT NULL
);

CREATE TABLE users (
  user_id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  full_name VARCHAR ( 128 ) NOT NULL,
  birthdate  TIMESTAMPTZ NOT NULL,
  education VARCHAR ( 50 ) NOT NULL,
  email VARCHAR (255) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  avatar_directory TEXT
);

CREATE TABLE courses (
  course_id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  admin_id INT REFERENCES admins(admin_id) ON DELETE CASCADE,
  name VARCHAR ( 50 ) NOT NULL,
  summary  VARCHAR ( 90 ) NOT NULL,
  detail TEXT NOT NULL,
  price INT NOT NULL,
  learning_time INT NOT NULL,
  cover_image_directory TEXT NOT NULL,
  video_trailer_directory TEXT NOT NULL,
  created_date TIMESTAMPTZ NOT NULL,
  updated_date TIMESTAMPTZ,
  category VARCHAR (25) NOT NULL
);

CREATE TABLE lessons (
  lesson_id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  course_id INT REFERENCES courses(course_id) ON DELETE CASCADE,
  name VARCHAR ( 255 ) NOT NULL
);

CREATE TABLE sub_lessons (
  sub_lesson_id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  lesson_id INT REFERENCES lessons(lesson_id) ON DELETE CASCADE,
  name VARCHAR ( 255 ) NOT NULL,
  video_directory TEXT NOT NULL
);

CREATE TABLE subscriptions (
  subscription_id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
  course_id INT REFERENCES courses(course_id) ON DELETE CASCADE,
  status BOOLEAN NOT NULL
);

CREATE TABLE files (
  file_id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  course_id INT REFERENCES courses(course_id) ON DELETE CASCADE,
  name VARCHAR ( 255 ) NOT NULL,
  type VARCHAR (25) NOT NULL,
  size INT NOT NULL,
  directory TEXT NOT NULL
);