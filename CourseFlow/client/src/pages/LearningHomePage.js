import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/authentication.js";
import { useEffect } from "react";
import axios from "axios";

function LearningHome() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [searchParam] = useSearchParams();
  const { contextState } = useAuth();

  const userId = contextState.user.user_id;

  useEffect(() => {
    /* If the request to this page was from my homework page, it will have a query parameter which is a sub lesson id of a assignment */
    const subLessonIdOfAssignment = searchParam.get("subLessonId");
    /* If the request to this page was from course detail page, it will not have a query parameter. So, it needs to query a latest sub lesson that user have learnt*/
    if (!Boolean(subLessonIdOfAssignment)) {
      async function getLatestSubLesson() {
        let latestSubLessonId = await axios.get(
          `http://localhost:4000/courses/${courseId}/learning/latest?byUser=${userId}`
        );
        latestSubLessonId = latestSubLessonId.data.data;
        navigate(`/courses/${courseId}/learning/${latestSubLessonId}`, {
          replace: true,
        });
      }
      getLatestSubLesson();
    } else {
      navigate(`/courses/${courseId}/learning/${subLessonIdOfAssignment}`, {
        replace: true,
      });
    }
  }, []);

  return <></>;
}

export default LearningHome;
