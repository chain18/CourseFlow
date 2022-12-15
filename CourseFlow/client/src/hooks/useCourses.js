import { useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const useCourses = () => {
  const [courses, setCourses] = useState({});
  const [course, setCourse] = useState({});
  const [category, setCategory] = useState([]);
  const [isError, setIsError] = useState(null);
  const [isLoading, setIsLoading] = useState(null);
  const [desiredCourses, setDesiredCourses] = useState({});
  const params = useParams();

  const getCourses = async (keyword, page) => {
    try {
      /* In case of no keyword => transform keyword into empty string (instead of null) */
      if (!keyword) {
        keyword = "";
      }
      /* If there is no page value => set its value to be 1 (first page) */
      if (!page) {
        page = 1;
      }
      setIsLoading(true);
      const query = new URLSearchParams();
      query.append("keyword", keyword);
      query.append("page", page);
      const results = await axios.get(
        `http://localhost:4000/courses?${query.toString()}`
      );
      setCourses({ data: results.data.data, count: results.data.count });
      setIsLoading(false);
    } catch (error) {
      setIsError(true);
      setIsLoading(false);
    }
  };

  const getCourseById = async (userId) => {
    try {
      setIsError(false);
      setIsLoading(true);
      let apiRoute;
      if (userId) {
        apiRoute = `http://localhost:4000/courses/${params.courseId}?byUser=${userId}`;
      } else {
        apiRoute = `http://localhost:4000/courses/${params.courseId}`;
      }

      //*---- Query course data ----*//
      const courseData = await axios.get(apiRoute);
      setCourse(courseData.data.data);
      setCategory(courseData.data.dataCategory);

      //*---- Query user's subscribe/desire status ----*//
      const status = {
        subscribe: false,
        desire: false,
      };
      if (courseData.data.subscribeStatus) {
        status.subscribe = true;
      }
      if (courseData.data.desireStatus) {
        status.desire = true;
      }
      setIsLoading(false);
      return status;
    } catch (error) {
      setIsError(true);
      setIsLoading(false);
    }
  };

  const getDesiredCourses = async (userId, page) => {
    try {
      /* If there is no page value => set its value to be 1 (first page) */
      if (!page) {
        page = 1;
      }
      setIsLoading(true);
      const desireCourseData = await axios.get(
        `http://localhost:4000/user/desired?byUser=${userId}&page=${page}`
      );
      setDesiredCourses({
        data: desireCourseData.data.data,
        count: desireCourseData.data.count,
      });
      setIsLoading(false);
    } catch (error) {
      setIsError(true);
      setIsLoading(false);
    }
  };

  const getCourseLearningById = async (userId) => {
    try {
      setIsLoading(true);
      setIsError(false);
      const results = await axios.get(
        `http://localhost:4000/courses/${params.courseId}/learning?byUser=${userId}`
      );
      setCourse(results.data.data);
      setIsLoading(false);
      return results.data.data;
    } catch (error) {
      setIsError(true);
      setIsLoading(false);
    }
  };

  return {
    courses,
    course,
    category,
    getCourses,
    getCourseById,
    getCourseLearningById,
    isLoading,
    setIsLoading,
    isError,
    setIsError,
    getDesiredCourses,
    desiredCourses,
  };
};

export default useCourses;
