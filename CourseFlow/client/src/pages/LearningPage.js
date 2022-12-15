import {
  Flex,
  Box,
  Image,
  Text,
  Heading,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionIcon,
  AccordionPanel,
  UnorderedList,
  Button,
  Textarea,
  Spacer,
  Progress,
  AspectRatio,
  Badge,
  Divider,
  Modal,
  ModalOverlay,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure,
  Skeleton,
  Link,
} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { Navbar } from "../components/Navbar.js";
import { Footer } from "../components/Footer.js";
import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import useCourses from "../hooks/useCourses";
import { useAuth } from "../contexts/authentication.js";
import axios from "axios";
let assignment_id;

function LearningPage() {
  const [userAssignment, setUserAssignment] = useState({});
  const [subLessonData, setSubLessonData] = useState({});
  const [answer, setAnswer] = useState("");
  const [isCourseLoading, setIsCourseLoading] = useState(false);
  const [sequence, setSequence] = useState([]);
  const [openAccordionIndex, setOpenAccordionIndex] = useState();
  const {
    isOpen: isAcceptOpen,
    onOpen: onAcceptOpen,
    onClose: onAcceptClose,
  } = useDisclosure();
  const {
    isOpen: isSubmitOpen,
    onOpen: onSubmitOpen,
    onClose: onSubmitClose,
  } = useDisclosure();
  const { getCourseLearningById, course, isLoading, setIsLoading } =
    useCourses();
  const { contextState } = useAuth();
  const userId = contextState.user.user_id;
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    async function fetchCourseData() {
      setIsCourseLoading(true);
      const result = await getCourseLearningById(userId);
      let i = 0;
      for (let lessonId in result.lessons) {
        if (params.subLessonId in result.lessons[lessonId].sub_lessons) {
          setOpenAccordionIndex([Number(i)]);
          break;
        }
        i++;
      }
      let subLessonSequence = [];
      Object.values(result.lessonSequence).map((subLessonIDs) => {
        subLessonSequence.push(...subLessonIDs);
      });
      setSequence(subLessonSequence);
      setIsCourseLoading(false);
    }
    fetchCourseData();
  }, []);

  useEffect(() => {
    async function fetchSubLessonData() {
      await handleSubLesson(params.subLessonId);
    }
    fetchSubLessonData();
  }, [location.pathname]);

  const handleSubLesson = async (subLessonId) => {
    setIsLoading(true);
    const result = await axios.get(
      `http://localhost:4000/courses/${params.courseId}/learning/${subLessonId}?byUser=${userId}`
    );
    setUserAssignment({
      assignment_status: result.data.data.assignment_status,
      assignments: result.data.data.assignments,
    });
    setSubLessonData({
      sub_lesson_id: result.data.data.sub_lesson_id,
      sub_lesson_name: result.data.data.sub_lesson_name,
      video_directory: result.data.data.video_directory,
      duration: result.data.data.duration,
    });
    if (result.data.data.assignments !== null) {
      const allAnswer = {};
      Object.keys(result.data.data.assignments).map((assignmentId) => {
        allAnswer[assignmentId] =
          result.data.data.assignments[assignmentId].answer || "";
      });
      setAnswer(allAnswer);
    }
    setIsLoading(false);
  };

  const handleAcceptAssignment = async (subLessonId) => {
    setIsLoading(true);
    await axios.post(
      `http://localhost:4000/courses/${course.course_id}/learning/${subLessonId}?byUser=${userId}`,
      { action: "accepted" }
    );
    handleSubLesson(subLessonId);
  };

  const handleVideoEnded = async (subLessonId) => {
    await axios.post(
      `http://localhost:4000/courses/${course.course_id}/learning/${subLessonId}?byUser=${userId}`,
      { action: "watched" }
    );
    await getCourseLearningById(userId);
  };

  const handleSaveDraft = async (assignmentId, status) => {
    setIsLoading(true);
    const body = { answer: answer[assignmentId], status: status };
    if (!Boolean(body.answer)) {
      alert(`Please fill out the answer`);
      setIsLoading(false);
      return;
    }
    await axios.put(
      `http://localhost:4000/assignment/${course.course_id}/save/${assignmentId}?byUser=${userId}`,
      body
    );
    handleSubLesson(subLessonData.sub_lesson_id);
  };

  const handleSubmit = async (assignmentId, status) => {
    setIsLoading(true);
    const body = { answer: answer[assignmentId], status: status };
    if (!Boolean(body.answer)) {
      alert(`Please fill out the answer`);
      setIsLoading(false);
      return;
    }
    await axios.put(
      `http://localhost:4000/assignment/${course.course_id}/submit/${assignmentId}?byUser=${userId}`,
      body
    );
    handleSubLesson(subLessonData.sub_lesson_id);
    await getCourseLearningById(userId);
  };

  return (
    <>
      <Navbar />
      <Skeleton isLoaded={!isCourseLoading}>
        <Flex
          flexDirection="row"
          alignItems="start"
          justifyContent="center"
          pt="100px"
        >
          {/* //------------------------- Left Column ----------------------// */}
          <Flex direction="column">
            <Flex mb="12px">
              <Link
                pl="12px"
                onClick={() => navigate(`/courses/${params.courseId}`)}
              >
                <ArrowBackIcon mr="10px" color="blue.500" />
                Back
              </Link>
            </Flex>
            <Flex
              flexDirection="column"
              alignItems="start"
              justifyContent="start"
              width="372px"
              height="1035px"
              shadow="shadow1"
              mr="25px"
              pl="24px"
              overflowY="auto"
            >
              <Text
                mt="32px"
                color="orange.500"
                fontSize="14px"
                fontWeight="400"
              >
                Course
              </Text>
              <Heading variant="headline3" mt="24px">
                {course.course_name}
              </Heading>
              <Text variant="body2" color="gray.700" mt="8px">
                {course.summary}
              </Text>
              <Text variant="body3" mt="24px">
                {course.percentProgress}% Complete
              </Text>
              <Box>
                <Progress
                  mt="8px"
                  height="10px"
                  width="309px"
                  value={course.percentProgress}
                  sx={{
                    ".css-1jrtelv": {
                      background:
                        "linear-gradient(109.54deg, #95BEFF 18.21%, #0040E6 95.27%)",
                      borderRadius: "full",
                    },
                  }}
                />
              </Box>
              {!Boolean(openAccordionIndex) ? null : (
                <Accordion
                  index={openAccordionIndex}
                  allowMultiple
                  w="300px"
                  mt="24px"
                >
                  {Object.keys(course).length === 0
                    ? null
                    : Object.values(course.lessons).map((lesson, key) => {
                        let numberLesson = null;
                        if (key < 10) {
                          numberLesson = "0" + (key + 1);
                        } else {
                          numberLesson = key + 1;
                        }
                        return (
                          <AccordionItem border="0px" key={key}>
                            <AccordionButton
                              _hover={{ backgroundColor: "gray.100" }}
                              borderBottom="1px solid #D6D9E4"
                              pl="0"
                              pt="12px"
                              onClick={() => {
                                if (openAccordionIndex.includes(key)) {
                                  const newAccordion = [...openAccordionIndex];
                                  newAccordion.splice(
                                    newAccordion.indexOf(key),
                                    1
                                  );
                                  setOpenAccordionIndex(newAccordion);
                                } else {
                                  setOpenAccordionIndex([
                                    ...openAccordionIndex,
                                    key,
                                  ]);
                                }
                              }}
                            >
                              <Box
                                flex="1"
                                textAlign="left"
                                display="flex"
                                color="black"
                              >
                                <Text
                                  color="gray.700"
                                  display="flex"
                                  variant="body2"
                                >
                                  {numberLesson}
                                </Text>
                                <Text ml="24px" variant="body2">
                                  {lesson.lesson_name}
                                </Text>
                              </Box>
                              <AccordionIcon />
                            </AccordionButton>
                            <AccordionPanel p={0}>
                              <UnorderedList m="16px 0px">
                                {Object.keys(lesson.sub_lessons).map(
                                  (subLessonId, keySub) => {
                                    return (
                                      <Flex
                                        flexDirection="row"
                                        alignItems="start"
                                        justifyContent="start"
                                        p="8px 24px"
                                        key={keySub}
                                        _hover={{
                                          backgroundColor: "gray.200",
                                        }}
                                        _active={{
                                          backgroundColor: "gray.100",
                                        }}
                                        bg={
                                          subLessonId === params.subLessonId
                                            ? "gray.200"
                                            : "white"
                                        }
                                      >
                                        {(lesson.sub_lessons[subLessonId]
                                          .watched_status === "watched" &&
                                          lesson.sub_lessons[subLessonId]
                                            .assign_status === "completed") ||
                                        (lesson.sub_lessons[subLessonId]
                                          .watched_status === "watched" &&
                                          lesson.sub_lessons[subLessonId]
                                            .assign_status ===
                                            "no-assignment") ? (
                                          <Image
                                            src="/assets/learning-page/success-circle.svg"
                                            alt="success-circle"
                                            mt="3px"
                                            mr="15px"
                                          />
                                        ) : lesson.sub_lessons[subLessonId]
                                            .watched_status === "watched" ||
                                          lesson.sub_lessons[subLessonId]
                                            .assign_status === "completed" ? (
                                          <Image
                                            src="/assets/learning-page/half-circle.svg"
                                            alt="half-circle"
                                            mt="3px"
                                            mr="15px"
                                          />
                                        ) : (
                                          <Image
                                            src="/assets/learning-page/circle.svg"
                                            alt="empty-circle"
                                            mt="3px"
                                            mr="15px"
                                          />
                                        )}

                                        <Text
                                          cursor="pointer"
                                          variant="body2"
                                          onClick={() => {
                                            navigate(
                                              `/courses/${params.courseId}/learning/${subLessonId}`
                                            );
                                          }}
                                        >
                                          {
                                            lesson.sub_lessons[subLessonId]
                                              .sub_lesson_name
                                          }
                                        </Text>
                                      </Flex>
                                    );
                                  }
                                )}
                              </UnorderedList>
                            </AccordionPanel>
                          </AccordionItem>
                        );
                      })}
                </Accordion>
              )}
            </Flex>
          </Flex>
          {/* //---------------------------- Right Column -----------------------// */}

          <Skeleton isLoaded={!isLoading}>
            <Flex
              flexDirection="column"
              alignItems="start"
              width="770px"
              height="1035px"
              overflowY="auto"
            >
              <Heading mb="33px" variant="headline2">
                {subLessonData.sub_lesson_name}
              </Heading>
              <AspectRatio w="739px" ratio={16 / 9} mb="80px">
                <video
                  controls
                  onEnded={() => handleVideoEnded(subLessonData.sub_lesson_id)}
                >
                  <source src={subLessonData.video_directory} />
                </video>
              </AspectRatio>
              {Object.keys(userAssignment).length ===
              0 ? null : !/^accepted/i.test(
                  userAssignment.assignment_status
                ) ? (
                <Flex
                  bg="blue.100"
                  width="739px"
                  flexDirection="column"
                  alignItems="start"
                  pl="24px"
                  borderRadius="8px"
                >
                  <Text variant="body1" mt="25px">
                    Assignment
                  </Text>
                  <Text variant="body2" mt="25px">
                    There are {Object.keys(userAssignment.assignments).length}{" "}
                    assignments in this sub lesson.
                  </Text>
                  <Flex
                    direction="rows"
                    justify="space-between"
                    width="691px"
                    my="25px"
                  >
                    <Button
                      height="60px"
                      onClick={() => {
                        onAcceptOpen();
                      }}
                    >
                      Accept Assignment
                    </Button>
                    <Text color="gray.700" alignSelf="end">
                      After accepted the assignment, you need to complete within{" "}
                      {subLessonData.duration} days
                    </Text>
                  </Flex>
                </Flex>
              ) : userAssignment.assignments === null ? (
                <Text variant="body2" as="i">
                  No assignment in this sub lesson
                </Text>
              ) : (
                Object.keys(userAssignment.assignments).map(
                  (assignmentId, key) => {
                    return (
                      <Flex
                        bg="blue.100"
                        width="739px"
                        flexDirection="column"
                        alignItems="start"
                        pl="24px"
                        mb={
                          key ===
                          Object.keys(userAssignment.assignments).length - 1
                            ? "60px"
                            : "15px"
                        }
                        borderRadius="8px"
                        key={key}
                      >
                        <Flex
                          flexDirection="row"
                          alignItems="start"
                          mt="24px"
                          width="691px"
                        >
                          <Text variant="body1" color="black">
                            Assignment
                          </Text>
                          <Spacer />
                          <Badge
                            variant={
                              userAssignment.assignments[assignmentId].status
                            }
                            textTransform="capitalize"
                            fontWeight="500"
                          >
                            {userAssignment.assignments[assignmentId].status}
                          </Badge>
                        </Flex>
                        <Text variant="body2" mt="25px" color="black">
                          {userAssignment.assignments[assignmentId].detail}
                        </Text>
                        <Textarea
                          mt="4px"
                          width="691px"
                          height="100px"
                          resize="none"
                          placeholder="Answer..."
                          size="16px"
                          fontWeight="400"
                          fontStyle={
                            userAssignment.assignments[assignmentId]
                              .submitted_date === null
                              ? "normal"
                              : "italic"
                          }
                          color={
                            userAssignment.assignments[assignmentId]
                              .submitted_date === null
                              ? "black"
                              : "gray.600"
                          }
                          bg={
                            userAssignment.assignments[assignmentId]
                              .submitted_date === null
                              ? "white"
                              : "blue.100"
                          }
                          p="12px 16px 12px 12px"
                          border={
                            userAssignment.assignments[assignmentId]
                              .submitted_date === null
                              ? "1px solid"
                              : "0px"
                          }
                          borderColor="gray.400"
                          borderRadius="8px"
                          _focus={{ borderColor: "gray.100" }}
                          value={answer[assignmentId]}
                          onChange={(e) =>
                            setAnswer({
                              ...answer,
                              [assignmentId]: e.target.value,
                            })
                          }
                          isReadOnly={
                            userAssignment.assignments[assignmentId]
                              .submitted_date === null
                              ? false
                              : true
                          }
                        />
                        {userAssignment.assignments[assignmentId]
                          .submitted_date === null ? (
                          <Flex
                            flexDirection="row"
                            alignItems="start"
                            justifyContent="center"
                            width="691px"
                            mt="25px"
                            mb="24px"
                          >
                            <Button
                              height="60px"
                              onClick={() => {
                                assignment_id = assignmentId;
                                onSubmitOpen();
                              }}
                            >
                              Send Assignment
                            </Button>
                            <Button
                              variant="save draft"
                              ml="20px"
                              height="60px"
                              onClick={() => {
                                handleSaveDraft(
                                  assignmentId,
                                  userAssignment.assignments[assignmentId]
                                    .status
                                );
                              }}
                              isLoading={isLoading}
                            >
                              Save Draft
                            </Button>
                            <Spacer />
                            <Flex direction="column" align="end">
                              <Text pt="20px" color="gray.700" variant="body3">
                                {userAssignment.assignments[assignmentId]
                                  .days_until_deadline === 0
                                  ? `Submit within today`
                                  : userAssignment.assignments[assignmentId]
                                      .days_until_deadline === 1
                                  ? `Submit with 1 day`
                                  : userAssignment.assignments[assignmentId]
                                      .days_until_deadline > 1
                                  ? `Submit within ${userAssignment.assignments[assignmentId].days_until_deadline} days`
                                  : null}
                              </Text>
                              <Text color="gray.700" variant="body4">
                                {userAssignment.assignments[assignmentId]
                                  .days_until_deadline >= 0
                                  ? `Deadline: ${userAssignment.assignments[assignmentId].deadline}`
                                  : null}
                              </Text>
                            </Flex>
                          </Flex>
                        ) : null}
                      </Flex>
                    );
                  }
                )
              )}
            </Flex>
          </Skeleton>
        </Flex>
      </Skeleton>
      <Flex
        flexDirection="row"
        alignItems="center"
        justifyContent="center"
        shadow="shadow1"
        width="100vw"
        height="100px"
      >
        {/* If the sub lesson was the first one of a course, there will be no previous sub lesson button */}
        {sequence.indexOf(Number(params.subLessonId)) === 0 ? null : (
          <Link
            ml="68px"
            onClick={() => {
              let prevLessonId =
                sequence[sequence.indexOf(Number(params.subLessonId)) - 1];
              navigate(`/courses/${params.courseId}/learning/${prevLessonId}`);
              window.scrollTo(0, 150);
              let i = 0;
              for (let lessonId in course.lessons) {
                if (prevLessonId in course.lessons[lessonId].sub_lessons) {
                  setOpenAccordionIndex([Number(i)]);
                  break;
                }
                i++;
              }
            }}
          >
            {Object.keys(course).length === 0
              ? null
              : Object.keys(course.lessonSequence).map((lessonId) => {
                  if (
                    course.lessonSequence[lessonId].includes(
                      Number(params.subLessonId)
                    )
                  ) {
                    if (
                      Object.values(course.lessonSequence[lessonId]).indexOf(
                        Number(params.subLessonId)
                      ) === 0
                    ) {
                      return `Previous Lesson`;
                    } else {
                      return `Previous Sub-lesson`;
                    }
                  }
                })}
          </Link>
        )}

        <Spacer />
        {/* If the sub lesson was the last one of a course, there will be no next sub lesson button */}
        {sequence.indexOf(Number(params.subLessonId)) ===
        sequence.length - 1 ? null : (
          <Button
            height="60px"
            mr="68px"
            onClick={() => {
              let nextLessonId =
                sequence[sequence.indexOf(Number(params.subLessonId)) + 1];
              navigate(`/courses/${params.courseId}/learning/${nextLessonId}`);
              window.scrollTo(0, 150);
              let i = 0;
              for (let lessonId in course.lessons) {
                if (nextLessonId in course.lessons[lessonId].sub_lessons) {
                  setOpenAccordionIndex([Number(i)]);
                  break;
                }
                i++;
              }
            }}
          >
            {Object.keys(course).length === 0
              ? null
              : Object.keys(course.lessonSequence).map((lessonId) => {
                  if (
                    course.lessonSequence[lessonId].includes(
                      Number(params.subLessonId)
                    )
                  ) {
                    if (
                      Object.values(course.lessonSequence[lessonId]).indexOf(
                        Number(params.subLessonId)
                      ) ===
                      Object.values(course.lessonSequence[lessonId]).length - 1
                    ) {
                      return `Next Lesson`;
                    } else {
                      return `Next Sub-lesson`;
                    }
                  }
                })}
          </Button>
        )}
      </Flex>
      <Footer />
      <Modal
        isCentered
        isOpen={isAcceptOpen}
        onClose={onAcceptClose}
        closeOnOverlayClick={false}
        preserveScrollBarGap
      >
        <ModalOverlay />
        <ModalContent borderRadius="24px">
          <ModalHeader borderRadius="24px 24px 0px 0px">
            <Text variant="body1" color="black">
              Confirmation
            </Text>
          </ModalHeader>
          <Divider sx={{ borderColor: "gray.300" }} />
          <ModalCloseButton color="gray.500" />
          <ModalBody p="24px 50px 24px 24px" color="black">
            <Text variant="body2" color="gray.700">
              Do you want to accept the assignment?
            </Text>
            <Box mt="24px" width="600px">
              <Button variant="secondary" onClick={onAcceptClose}>
                No, I don't.
              </Button>
              <Button
                ml="16px"
                isLoading={isLoading}
                variant="primary"
                onClick={() => {
                  onAcceptClose();
                  handleAcceptAssignment(subLessonData.sub_lesson_id);
                }}
              >
                Yes, I want to accept.
              </Button>
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
      <Modal
        isCentered
        isOpen={isSubmitOpen}
        onClose={onSubmitClose}
        closeOnOverlayClick={false}
        preserveScrollBarGap
      >
        <ModalOverlay />
        <ModalContent borderRadius="24px">
          <ModalHeader borderRadius="24px 24px 0px 0px">
            <Text variant="body1" color="black">
              Confirmation
            </Text>
          </ModalHeader>
          <Divider sx={{ borderColor: "gray.300" }} />
          <ModalCloseButton color="gray.500" />
          <ModalBody p="24px 50px 24px 24px" color="black">
            <Text variant="body2" color="gray.700">
              Do you want to submit the assignment?
            </Text>
            <Box mt="24px" width="600px">
              <Button variant="secondary" onClick={onSubmitClose}>
                No, I don't.
              </Button>
              <Button
                ml="16px"
                isLoading={isLoading}
                variant="primary"
                onClick={() => {
                  onSubmitClose();
                  handleSubmit(
                    assignment_id,
                    userAssignment.assignments[assignment_id].status
                  );
                }}
              >
                Yes, I want to submit.
              </Button>
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}

export default LearningPage;
