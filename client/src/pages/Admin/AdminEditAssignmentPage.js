import { Sidebar } from "../../components/SidebarAdmin.js";
import {
  Flex,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Select,
  Skeleton,
  Heading,
  Button,
  Text,
  Textarea,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Link,
  Divider,
} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { Field, Form, Formik } from "formik";
import axios from "axios";
import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/authentication.js";
import { CheckCircleIcon } from "@chakra-ui/icons";
import { useParams, useNavigate } from "react-router-dom";

function AdminEditAssignment() {
  const {
    isOpen: isSuccessModalOpen,
    onOpen: onSuccessModalOpen,
    onClose: onSuccessModalClose,
  } = useDisclosure();
  const {
    isOpen: isConfirmModalOpen,
    onOpen: onConfirmModalOpen,
    onClose: onConfirmModalClose,
  } = useDisclosure();
  const [courseData, setCourseData] = useState();
  const [assignmentData, setAssignmentData] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [modalMsg, setModalMsg] = useState();
  const { contextAdminState } = useAuth();
  const adminId = contextAdminState.user.admin_id;
  const { assignmentId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      await getCourseData();
      await getAssignmentData();
      setIsLoading(false);
    }
    fetchData();
  }, []);

  /* Querying a course data (course, lesson, sub-lesson, or duration) to display in drop-down box */
  const getCourseData = async () => {
    let result = await axios.get(
      `http://localhost:4000/admin/assignments?byAdmin=${adminId}`
    );
    setCourseData(result.data.data);
  };

  /* Querying an assignment data (detail) to display in assignment input box */
  const getAssignmentData = async () => {
    let result = await axios.get(
      `http://localhost:4000/admin/assignments/${assignmentId}?byAdmin=${adminId}`
    );
    setAssignmentData(result.data.data);
  };

  const handleSubmit = async (value) => {
    const body = {
      sub_lesson_id: Number(value.subLesson),
      detail: value.assignment,
      duration: value.duration,
    };
    const result = await axios.put(
      `http://localhost:4000/admin/assignments/${assignmentId}?byAdmin=${adminId}`,
      body
    );
    if (/successfully/i.test(result.data.message)) {
      setModalMsg("edited");
      onSuccessModalOpen();
    }
  };

  const handleDeleteAssignment = async () => {
    setIsDeleting(true);
    const result = await axios.delete(
      `http://localhost:4000/admin/assignments/${assignmentId}?byAdmin=${adminId}`
    );
    setIsDeleting(false);
    if (/successfully/i.test(result.data.message)) {
      onConfirmModalClose();
      setModalMsg("deleted");
      onSuccessModalOpen();
    }
  };

  return (
    <Formik
      enableReinitialize
      initialValues={{
        course: Boolean(assignmentData) ? assignmentData.course_id : "",
        lesson: Boolean(assignmentData) ? assignmentData.lesson_id : "",
        subLesson: Boolean(assignmentData) ? assignmentData.sub_lesson_id : "",
        assignment: Boolean(assignmentData) ? assignmentData.detail : "",
        duration:
          Boolean(assignmentData) && Boolean(courseData)
            ? courseData[assignmentData.course_id].lessons[
                assignmentData.lesson_id
              ].sub_lessons[assignmentData.sub_lesson_id].duration
              ? courseData[assignmentData.course_id].lessons[
                  assignmentData.lesson_id
                ].sub_lessons[assignmentData.sub_lesson_id].duration
              : 0
            : "",
      }}
      onSubmit={handleSubmit}
    >
      {(props) => {
        return (
          <Form>
            <Flex>
              {/* Left Section */}
              <Sidebar />
              {/* Right Section */}
              <Flex direction="column" w="100%">
                {/* Right-Top Section */}
                <Flex
                  w="100%"
                  h="92px"
                  bg="white"
                  justify="space-between"
                  align="center"
                  px="40px"
                  borderBottom="1px"
                  borderColor="gray.400"
                >
                  <Flex gap="16px" w="70%">
                    <Flex
                      gap="16px"
                      align="center"
                      cursor="pointer"
                      _hover={{ opacity: 0.5 }}
                      onClick={() => {
                        navigate("/admin/assignment");
                      }}
                    >
                      <ArrowBackIcon boxSize={6} color="gray.600" />
                      <Heading variant="headline3" color="gray.600">
                        Assignment
                      </Heading>
                    </Flex>
                    <Heading variant="headline3" noOfLines={1}>
                      {assignmentData ? assignmentData.detail : null}
                    </Heading>
                  </Flex>
                  <Flex>
                    <Button
                      variant="secondary"
                      mr="16px"
                      onClick={() => props.resetForm()}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      type="submit"
                      isLoading={props.isSubmitting}
                    >
                      Save
                    </Button>
                  </Flex>
                </Flex>
                {/* Right-Bottom Section */}
                <Skeleton
                  display="flex"
                  flexDirection="column"
                  h="100%"
                  px="40px"
                  pt="40px"
                  bg="gray.100"
                  isLoaded={!isLoading}
                >
                  <Flex
                    w="100%"
                    h="fit-content"
                    bg="white"
                    p="40px 100px 60px"
                    border="1px solid #E6E7EB"
                    borderRadius="16px"
                  >
                    {/* Right-Bottom-Input Section */}
                    <Flex direction="column" w="100%">
                      {/* Input Top Section */}
                      <Flex
                        direction="column"
                        w="100%"
                        className="input-top-section"
                        borderBottom="1px solid #D6D9E4"
                      >
                        {/*-- Course Input --*/}
                        <Field
                          name="course"
                          validate={(value) => {
                            let error;
                            if (!Boolean(value)) {
                              error = "Please select the course";
                            }
                            return error;
                          }}
                        >
                          {({ field, form }) => {
                            return (
                              <FormControl
                                isInvalid={
                                  form.errors.course && form.touched.course
                                }
                                isRequired
                              >
                                <FormLabel color="black">Course</FormLabel>
                                <Select
                                  w="440px"
                                  {...field}
                                  onChange={(event) => {
                                    props.setFieldValue(
                                      "course",
                                      event.target.value
                                    );
                                    props.setFieldTouched("course", false);
                                    props.setFieldValue("lesson", "");
                                    props.setFieldTouched("lesson", false);
                                    props.setFieldValue("subLesson", "");
                                    props.setFieldTouched("subLesson", false);
                                    props.setFieldValue("duration", "");
                                    props.setFieldTouched("duration", false);
                                  }}
                                  sx={
                                    Boolean(field.value)
                                      ? null
                                      : {
                                          "&": {
                                            color: "#9AA1B9",
                                          },
                                          "& > option:not(:first-of-type)": {
                                            color: "black",
                                          },
                                        }
                                  }
                                >
                                  <option disabled value="">
                                    Select course
                                  </option>
                                  {!Boolean(courseData)
                                    ? null
                                    : Object.keys(courseData).map(
                                        (courseId, key) => {
                                          return (
                                            <option key={key} value={courseId}>
                                              {courseData[courseId].course_name}
                                            </option>
                                          );
                                        }
                                      )}
                                </Select>
                                <FormErrorMessage>
                                  {form.errors.course}
                                </FormErrorMessage>
                              </FormControl>
                            );
                          }}
                        </Field>
                        <Flex
                          className="lesson-and-sub_lesson-input"
                          w="100%"
                          my="40px"
                        >
                          {/*-- Lesson Input --*/}
                          <Flex>
                            <Field
                              name="lesson"
                              validate={(value) => {
                                let error;
                                if (!Boolean(value)) {
                                  error = "Please select the lesson";
                                }
                                return error;
                              }}
                            >
                              {({ field, form }) => {
                                return (
                                  <FormControl
                                    isInvalid={
                                      form.errors.lesson && form.touched.lesson
                                    }
                                    isRequired
                                  >
                                    <FormLabel color="black">Lesson</FormLabel>
                                    <Select
                                      w="440px"
                                      {...field}
                                      onChange={(event) => {
                                        props.setFieldValue(
                                          "lesson",
                                          event.target.value
                                        );
                                        props.setFieldTouched("lesson", false);
                                        props.setFieldValue("subLesson", "");
                                        props.setFieldTouched(
                                          "subLesson",
                                          false
                                        );
                                        props.setFieldValue("duration", "");
                                        props.setFieldTouched(
                                          "duration",
                                          false
                                        );
                                      }}
                                      isDisabled={!Boolean(props.values.course)}
                                      sx={
                                        Boolean(field.value)
                                          ? null
                                          : {
                                              "&": {
                                                color: "#9AA1B9",
                                              },
                                              "& > option:not(:first-of-type)":
                                                {
                                                  color: "black",
                                                },
                                            }
                                      }
                                    >
                                      <option disabled value="">
                                        Select lesson
                                      </option>
                                      {!Boolean(courseData)
                                        ? null
                                        : !Boolean(props.values.course)
                                        ? null
                                        : Object.keys(
                                            courseData[props.values.course]
                                              .lessons
                                          ).map((lessonId, key) => {
                                            return (
                                              <option
                                                key={key}
                                                value={lessonId}
                                              >
                                                {
                                                  courseData[
                                                    props.values.course
                                                  ].lessons[lessonId]
                                                    .lesson_name
                                                }
                                              </option>
                                            );
                                          })}
                                    </Select>
                                    <FormErrorMessage>
                                      {form.errors.lesson}
                                    </FormErrorMessage>
                                  </FormControl>
                                );
                              }}
                            </Field>
                          </Flex>
                          {/*-- Sub Lesson Input --*/}
                          <Flex ml="40px">
                            <Field
                              name="subLesson"
                              validate={(value) => {
                                let error;
                                if (!Boolean(value)) {
                                  error = "Please select the sub-lesson";
                                }
                                return error;
                              }}
                            >
                              {({ field, form }) => {
                                return (
                                  <FormControl
                                    isInvalid={
                                      form.errors.subLesson &&
                                      form.touched.subLesson
                                    }
                                    isRequired
                                  >
                                    <FormLabel color="black">
                                      Sub-lesson
                                    </FormLabel>
                                    <Select
                                      w="440px"
                                      {...field}
                                      isDisabled={!Boolean(props.values.lesson)}
                                      onChange={(event) => {
                                        props.setFieldValue(
                                          "subLesson",
                                          event.target.value
                                        );
                                        props.setFieldTouched(
                                          "subLesson",
                                          false
                                        );
                                        props.setFieldValue(
                                          "duration",
                                          Number(
                                            courseData[props.values.course]
                                              .lessons[props.values.lesson]
                                              .sub_lessons[event.target.value]
                                              .duration
                                          )
                                        );
                                      }}
                                      sx={
                                        Boolean(field.value)
                                          ? null
                                          : {
                                              "&": {
                                                color: "#9AA1B9",
                                              },
                                              "& > option:not(:first-of-type)":
                                                {
                                                  color: "black",
                                                },
                                            }
                                      }
                                    >
                                      <option disabled value="">
                                        Select sub-lesson
                                      </option>
                                      {Boolean(courseData) &&
                                      Boolean(props.values.course) &&
                                      Boolean(props.values.lesson)
                                        ? Object.keys(
                                            courseData[props.values.course]
                                              .lessons[props.values.lesson]
                                              .sub_lessons
                                          ).map((subLessonId, key) => {
                                            return (
                                              <option
                                                key={key}
                                                value={subLessonId}
                                              >
                                                {
                                                  courseData[
                                                    props.values.course
                                                  ].lessons[props.values.lesson]
                                                    .sub_lessons[subLessonId]
                                                    .sub_lesson_name
                                                }
                                              </option>
                                            );
                                          })
                                        : null}
                                    </Select>
                                    <FormErrorMessage>
                                      {form.errors.subLesson}
                                    </FormErrorMessage>
                                  </FormControl>
                                );
                              }}
                            </Field>
                          </Flex>
                        </Flex>
                      </Flex>
                      {/* Input Bottom Section */}
                      <Flex
                        className="input-bottom-section"
                        w="100%"
                        direction="column"
                      >
                        <Text
                          variant="body1"
                          color="gray.700"
                          fontWeight="600"
                          my="40px"
                        >
                          Assignment detail
                        </Text>
                        {/* Assignment Input */}
                        <Flex>
                          <Field
                            name="assignment"
                            validate={(value) => {
                              let error;
                              if (!Boolean(value)) {
                                error = "Please enter the assignment";
                              }
                              return error;
                            }}
                          >
                            {({ field, form }) => {
                              return (
                                <FormControl
                                  isInvalid={
                                    form.errors.assignment &&
                                    form.touched.assignment
                                  }
                                  isRequired
                                >
                                  <FormLabel color="black">
                                    Assignment
                                  </FormLabel>
                                  <Textarea
                                    {...field}
                                    placeholder="Enter assignment"
                                    resize="none"
                                  />
                                  <FormErrorMessage>
                                    {form.errors.assignment}
                                  </FormErrorMessage>
                                </FormControl>
                              );
                            }}
                          </Field>
                        </Flex>
                        {/* Assignment Duration Input */}
                        <Flex w="440px" mt="40px">
                          <Field
                            name="duration"
                            validate={(value) => {
                              let error;
                              if (!value >= 1 || !Boolean(value)) {
                                error =
                                  "Please enter the duration of assignment 1 day at least";
                              }
                              return error;
                            }}
                          >
                            {({ field, form }) => {
                              return (
                                <FormControl
                                  isInvalid={
                                    form.errors.duration &&
                                    form.touched.duration
                                  }
                                  isRequired
                                >
                                  <FormLabel color="black">
                                    Duration of assignment (days)
                                  </FormLabel>
                                  <NumberInput
                                    min={1}
                                    {...field}
                                    onChange={(val) => {
                                      props.setFieldValue(
                                        "duration",
                                        Number(val)
                                      );
                                    }}
                                  >
                                    <NumberInputField />
                                    <NumberInputStepper>
                                      <NumberIncrementStepper />
                                      <NumberDecrementStepper />
                                    </NumberInputStepper>
                                  </NumberInput>
                                  <FormErrorMessage w="max-content">
                                    {form.errors.duration}
                                  </FormErrorMessage>
                                </FormControl>
                              );
                            }}
                          </Field>
                        </Flex>
                        <Text color="gray.600">
                          Note: The duration of an assignment needs to be the
                          same as the other assignments in the same sub-lesson.
                          If you changed the duration, all of the assignments in
                          the same sub-lesson will be also changed.
                        </Text>
                      </Flex>
                    </Flex>
                  </Flex>
                  <Flex alignSelf="end" mt="60px">
                    <Link onClick={() => onConfirmModalOpen()}>
                      Delete Assignment
                    </Link>
                  </Flex>
                </Skeleton>
              </Flex>
            </Flex>
            <Modal
              isCentered
              isOpen={isSuccessModalOpen}
              onClose={onSuccessModalClose}
              onCloseComplete={async () => {
                if (/deleted/i.test(modalMsg)) {
                  navigate("/admin/assignment");
                } else if (/edited/i.test(modalMsg)) {
                  setIsLoading(true);
                  await getCourseData();
                  await getAssignmentData();
                  setIsLoading(false);
                }
              }}
              preserveScrollBarGap
            >
              <ModalOverlay />
              <ModalContent borderRadius="24px">
                <ModalHeader
                  bg="blue.500"
                  color="white"
                  textAlign="center"
                  borderRadius="24px 24px 0px 0px"
                  fontSize="1.5rem"
                >
                  <CheckCircleIcon mr="0.5em" />
                  Success
                </ModalHeader>
                <ModalBody
                  textAlign="center"
                  my="2em"
                  color="black"
                  fontSize="1rem"
                >
                  Assignment has been successfully {modalMsg}.
                </ModalBody>
              </ModalContent>
            </Modal>
            <Modal
              isCentered
              isOpen={isConfirmModalOpen}
              onClose={onConfirmModalClose}
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
                  <Text variant="body2" color="gray.700" as="span">
                    Do you want to delete this assignment?
                  </Text>
                  <Flex mt="24px" width="600px">
                    <Button variant="secondary" onClick={onConfirmModalClose}>
                      No, I don't
                    </Button>
                    <Button
                      ml="16px"
                      isLoading={isDeleting}
                      variant="primary"
                      onClick={() => {
                        handleDeleteAssignment();
                      }}
                    >
                      Yes, I want to delete
                    </Button>
                  </Flex>
                </ModalBody>
              </ModalContent>
            </Modal>
          </Form>
        );
      }}
    </Formik>
  );
}

export default AdminEditAssignment;
