import { Sidebar } from "../../components/SidebarAdmin.js";
import {
  Flex,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Select,
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
  useDisclosure,
} from "@chakra-ui/react";
import { Field, Form, Formik } from "formik";
import axios from "axios";
import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/authentication.js";
import { CheckCircleIcon } from "@chakra-ui/icons";

function AdminAddAssignment() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [courseData, setCourseData] = useState();
  const { contextAdminState } = useAuth();
  const adminId = contextAdminState.user.admin_id;

  useEffect(() => {
    getCourseData();
  }, []);

  /* Querying a course data (course, lesson, sub-lesson) to display in drop-down box */
  const getCourseData = async () => {
    let result = await axios.get(
      `http://localhost:4000/admin/assignments?byAdmin=${adminId}`
    );
    setCourseData(result.data.data);
  };

  const handleSubmit = async (value) => {
    const body = {
      sub_lesson_id: Number(value.subLesson),
      detail: value.assignment,
      duration: value.duration,
    };
    const result = await axios.post(
      `http://localhost:4000/admin/assignments?byAdmin=${adminId}`,
      body
    );
    if (/successfully/i.test(result.data.message)) {
      onOpen();
      getCourseData();
    }
  };

  return (
    <Formik
      initialValues={{
        course: "",
        lesson: "",
        subLesson: "",
        assignment: "",
        duration: "",
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
                  <Heading variant="headline3">Add Assignment</Heading>
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
                      Add
                    </Button>
                  </Flex>
                </Flex>
                {/* Right-Bottom Section */}
                <Flex h="100%" bg="gray.100">
                  <Flex
                    w="100%"
                    h="fit-content"
                    bg="white"
                    p="40px 100px 60px"
                    mx="40px"
                    mt="40px"
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
                </Flex>
              </Flex>
            </Flex>
            <Modal
              isCentered
              isOpen={isOpen}
              onClose={onClose}
              onCloseComplete={() => {
                props.setFieldValue("assignment", "");
                props.setFieldTouched("assignment", false);
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
                  Assignment has been successfully created.
                </ModalBody>
              </ModalContent>
            </Modal>
          </Form>
        );
      }}
    </Formik>
  );
}

export default AdminAddAssignment;
