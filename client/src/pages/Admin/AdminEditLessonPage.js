import { useState, useEffect } from "react";
import { Sidebar } from "../../components/SidebarAdmin";
import {
  Flex,
  Text,
  Image,
  Heading,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Divider,
  Link,
  Spinner,
} from "@chakra-ui/react";
import { DragHandleIcon } from "@chakra-ui/icons";
import { Field, Form, Formik, FieldArray } from "formik";
import { useAdmin } from "../../contexts/admin.js";
import { useAuth } from "../../contexts/authentication";
import { useNavigate, useParams } from "react-router-dom";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import axios from "axios";

function AdminEditLesson() {
  const { addLesson, setAddLesson, editCourseFields } = useAdmin();
  const { contextAdminState } = useAuth();
  const adminId = contextAdminState.user.admin_id;

  const {
    isOpen: isConfirmModalOpen,
    onOpen: onConfirmModalOpen,
    onClose: onConfirmModalClose,
  } = useDisclosure();
  const toast = useToast();

  const navigate = useNavigate();
  const { courseId, lessonId } = useParams();

  const [videoKey, setVideoKey] = useState(0); // this state is for forcing video elements to be re-render after dragged and dropped
  const [isLoading, setIsLoding] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [lessonData, setLessonData] = useState();

  const forceUpdateVideo = () => {
    setVideoKey(videoKey + 1);
  };

  useEffect(() => {
    if (courseId) {
      fetchLessonData();
    }
  }, []);

  const fetchLessonData = async () => {
    setIsLoding(true);
    const result = await axios.get(
      `http://localhost:4000/admin/courses/${courseId}/lessons/${lessonId}?byAdmin=${adminId}`
    );
    const dataWithFilesObj = await convertToFileObj(result.data.data);
    setLessonData(dataWithFilesObj);
    setIsLoding(false);
  };

  // Convert media urls into file objects:
  const convertToFileObj = async (lesson) => {
    let i = 0;
    for (let subLesson of lesson.sub_lessons) {
      await fetch(subLesson.video).then(async (res) => {
        const blob = await res.blob();
        const file = new File([blob], `sub_lesson_video_${i + 1}`, {
          type: blob.type,
        });
        subLesson.video = file;
        i++;
      });
    }
    return lesson;
  };

  const handleVideoChange = (currentFile, index, setFieldValue) => {
    if (currentFile) {
      if (/video/gi.test(currentFile.type)) {
        if (currentFile.size < 1e8) {
          setFieldValue(`sub_lessons.${index}.video`, currentFile);
        } else {
          return toast({
            title: "Video size must be less than 100MB!",
            status: "error",
            isClosable: true,
          });
        }
      } else {
        return toast({
          title: "File type must be video only!",
          status: "error",
          isClosable: true,
        });
      }
    }
  };

  const handleSubmit = async (values) => {
    if (Boolean(courseId)) {
      const formData = new FormData();
      formData.append("lesson_name", values.lesson_name);
      for (let subLesson of values.sub_lessons) {
        formData.append("sub_lesson_id", subLesson.sub_lesson_id);
        formData.append("sub_lesson_names", subLesson.sub_lesson_name);
        formData.append("sub_lesson_videos", subLesson.video);
      }
      const result = await axios.put(
        `http://localhost:4000/admin/courses/${courseId}/lessons/${lessonId}?byAdmin=${adminId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      if (/success/i.test(result.data.message)) {
        setAddLesson(result.data.data);
        navigate(`/admin/edit-course/${courseId}`);
      }
    } else {
      const newLesson = [...addLesson];
      newLesson[lessonId - 1] = values;
      setAddLesson(newLesson);
      navigate(`/admin/add-course`);
    }
  };

  /* Drag & drop */
  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  const onDragEnd = (result, sub_lessons, setFieldValue) => {
    if (!result.destination) {
      return;
    }
    const items = reorder(
      sub_lessons,
      result.source.index,
      result.destination.index
    );
    setFieldValue("sub_lessons", items);
    /* Since the video won't re-render after dragging was end, it have to force re-render by following code */
    forceUpdateVideo();
  };

  const handleDeleteLesson = async (lessonId, courseId, adminId) => {
    setIsDeleting(true);
    const result = await axios.delete(
      `http://localhost:4000/admin/courses/${courseId}/lessons/${lessonId}?byAdmin=${adminId}`
    );
    if (/success/.test(result.data.message)) {
      setIsDeleting(false);
      onConfirmModalClose();
      setAddLesson(result.data.data);
      navigate(`/admin/edit-course/${courseId}`);
    } else {
      onConfirmModalClose();
    }
  };

  /* Input Validation */
  const validateLessonName = (value) => {
    let error;
    if (!value) {
      error = "Please specify lesson name";
    }
    return error;
  };

  const validateSubLessonName = (value) => {
    let error;
    if (!value) {
      error = "Please specify sub-lesson name";
    }
    return error;
  };

  const validateVideo = (value) => {
    let error;
    if (!value) {
      error = "Please upload sub-lesson video";
    }
    return error;
  };

  return (
    <Formik
      initialValues={
        courseId
          ? lessonData
            ? {
                lesson_name: lessonData.lesson_name,
                sub_lessons: lessonData.sub_lessons,
              }
            : {
                lesson_name: "",
                sub_lessons: [
                  {
                    sub_lesson_name: "",
                    video: null,
                  },
                ],
              }
          : {
              lesson_name: addLesson[lessonId - 1].lesson_name,
              sub_lessons: [...addLesson[lessonId - 1].sub_lessons],
            }
      }
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({ values, resetForm, isSubmitting, setFieldValue }) => {
        return (
          <Form>
            <Flex w="100vw">
              {/* Left Section */}
              <Sidebar />
              {/* Right Section */}
              <Flex direction="column" w="100%" h="100vh" overflow="auto">
                {/* Right-Top Section */}
                <Flex
                  w="100%"
                  minW="1200px"
                  bg="white"
                  justify="space-between"
                  align="center"
                  px="40px"
                  py="16px"
                  borderBottom="1px"
                  borderColor="gray.400"
                  position="sticky"
                  top="0"
                  zIndex="sticky"
                >
                  {/* Heading */}
                  <Flex gap="20px" w="70%">
                    <Image
                      src="/assets/admin-lesson-page/arrow.svg"
                      arc="arrow"
                      cursor="pointer"
                      _hover={{ opacity: 0.5 }}
                      onClick={() => {
                        if (Boolean(courseId)) {
                          navigate(`/admin/edit-course/${courseId}`);
                        } else {
                          navigate(`/admin/add-course`);
                        }
                      }}
                    />
                    <Flex direction="column">
                      {Boolean(courseId) ? (
                        <Flex gap="8px">
                          <Text variant="body3" color="gray.600">
                            Course
                          </Text>
                          <Text variant="body3" color="black">
                            {editCourseFields.course_name}
                          </Text>
                        </Flex>
                      ) : null}
                      <Heading variant="headline3">Edit Lesson</Heading>
                    </Flex>
                  </Flex>
                  {/* Button */}
                  <Flex gap="16px">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        resetForm();
                        setVideoKey(videoKey + 1);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" isLoading={isSubmitting}>
                      Save
                    </Button>
                  </Flex>
                </Flex>
                {/* Form Section */}
                <Flex
                  w="100%"
                  minW="1200px"
                  bg="gray.100"
                  p="40px"
                  direction="column"
                  gap="80px"
                >
                  {isLoading ? (
                    <Flex w="100%" h="100vh" justify="center">
                      <Spinner
                        thickness="4px"
                        speed="0.65s"
                        emptyColor="gray.200"
                        color="blue.500"
                        size="xl"
                      />
                    </Flex>
                  ) : (
                    <>
                      <Flex
                        w="100%"
                        direction="column"
                        borderRadius="16px"
                        border="1px solid #E6E7EB"
                        bg="white"
                        p="40px 100px"
                      >
                        {/* Lesson name field */}
                        <Flex
                          w="920px"
                          borderBottom="1px"
                          borderColor="gray.400"
                          pb="40px"
                        >
                          <Field
                            name="lesson_name"
                            validate={validateLessonName}
                          >
                            {({ field, form }) => {
                              return (
                                <FormControl
                                  isInvalid={
                                    form.errors.lesson_name &&
                                    form.touched.lesson_name
                                  }
                                >
                                  <FormLabel variant="body2" color="black">
                                    Lesson name{" "}
                                    <Text variant="body2" as="span" color="red">
                                      *
                                    </Text>
                                  </FormLabel>
                                  <Input
                                    type="text"
                                    h="48px"
                                    placeholder="Enter lesson name"
                                    {...field}
                                  />
                                  <FormErrorMessage>
                                    {form.errors.lesson_name}
                                  </FormErrorMessage>
                                </FormControl>
                              );
                            }}
                          </Field>
                        </Flex>
                        <DragDropContext
                          onDragEnd={(e) => {
                            onDragEnd(e, values.sub_lessons, setFieldValue);
                          }}
                        >
                          <Droppable droppableId="sub_lessons_list">
                            {(provided) => {
                              return (
                                <Flex
                                  direction="column"
                                  ref={provided.innerRef}
                                >
                                  <Text
                                    my="40px"
                                    fontSize="20px"
                                    fontWeight="600"
                                    color="gray.700"
                                  >
                                    Sub-Lesson
                                  </Text>
                                  <FieldArray name="sub_lessons">
                                    {(forms) => {
                                      return (
                                        <>
                                          {values.sub_lessons.map(
                                            (sub_lesson, index) => {
                                              return (
                                                <Draggable
                                                  key={index}
                                                  draggableId={String(index)}
                                                  index={index}
                                                >
                                                  {(provided) => (
                                                    <Flex
                                                      direction="column"
                                                      align="start"
                                                      justify="center"
                                                      pl="66px"
                                                      pt="24px"
                                                      pb="36px"
                                                      w="920px"
                                                      bg="gray.100"
                                                      borderRadius="16px"
                                                      borderColor="gray.300"
                                                      borderWidth="1px"
                                                      position="relative"
                                                      gap="24px"
                                                      mb="24px"
                                                      ref={provided.innerRef}
                                                      {...provided.draggableProps}
                                                      {...provided.dragHandleProps}
                                                    >
                                                      <Text
                                                        cursor={
                                                          index === 0
                                                            ? "not-allowed"
                                                            : "pointer"
                                                        }
                                                        color={
                                                          index === 0
                                                            ? "gray.500"
                                                            : "blue.500"
                                                        }
                                                        fontWeight="700"
                                                        fontSize="16px"
                                                        position="absolute"
                                                        right="24px"
                                                        top="28px"
                                                        zIndex="1"
                                                        onClick={() => {
                                                          if (index !== 0) {
                                                            forms.remove(index);
                                                          }
                                                        }}
                                                      >
                                                        Delete
                                                      </Text>
                                                      <DragHandleIcon
                                                        position="absolute"
                                                        left="24px"
                                                        top="54px"
                                                        color="gray.500"
                                                        fontSize="16px"
                                                      />
                                                      {/* Sub-lesson name field */}
                                                      <Field
                                                        name={`sub_lessons.${index}.sub_lesson_name`}
                                                        validate={
                                                          validateSubLessonName
                                                        }
                                                      >
                                                        {({ field, form }) => {
                                                          let isFormInValid = false;
                                                          if (
                                                            form.errors
                                                              .sub_lessons &&
                                                            form.touched
                                                              .sub_lessons
                                                          ) {
                                                            if (
                                                              form.errors
                                                                .sub_lessons[
                                                                index
                                                              ] &&
                                                              form.touched
                                                                .sub_lessons[
                                                                index
                                                              ]
                                                            ) {
                                                              isFormInValid =
                                                                form.errors
                                                                  .sub_lessons[
                                                                  index
                                                                ]
                                                                  .sub_lesson_name &&
                                                                form.touched
                                                                  .sub_lessons[
                                                                  index
                                                                ]
                                                                  .sub_lesson_name;
                                                            }
                                                          }
                                                          return (
                                                            <FormControl
                                                              isInvalid={
                                                                isFormInValid
                                                              }
                                                            >
                                                              <FormLabel
                                                                variant="body2"
                                                                color="black"
                                                              >
                                                                Sub-lesson name{" "}
                                                                <Text
                                                                  variant="body2"
                                                                  as="span"
                                                                  color="red"
                                                                >
                                                                  *
                                                                </Text>
                                                              </FormLabel>
                                                              <Input
                                                                type="text"
                                                                w="530px"
                                                                h="48px"
                                                                {...field}
                                                                placeholder="Enter sub-lesson name"
                                                              />
                                                              <FormErrorMessage>
                                                                {isFormInValid
                                                                  ? form.errors
                                                                      .sub_lessons[
                                                                      index
                                                                    ]
                                                                      .sub_lesson_name
                                                                  : null}
                                                              </FormErrorMessage>
                                                            </FormControl>
                                                          );
                                                        }}
                                                      </Field>
                                                      {/* Sub-lesson video upload field */}
                                                      <Field
                                                        name={`sub_lessons.${index}.video`}
                                                        validate={validateVideo}
                                                      >
                                                        {({ field, form }) => {
                                                          let isFormInValid = false;
                                                          if (
                                                            form.errors
                                                              .sub_lessons &&
                                                            form.touched
                                                              .sub_lessons
                                                          ) {
                                                            if (
                                                              form.errors
                                                                .sub_lessons[
                                                                index
                                                              ] &&
                                                              form.touched
                                                                .sub_lessons[
                                                                index
                                                              ]
                                                            ) {
                                                              isFormInValid =
                                                                form.errors
                                                                  .sub_lessons[
                                                                  index
                                                                ].video &&
                                                                form.touched
                                                                  .sub_lessons[
                                                                  index
                                                                ].video;
                                                            }
                                                          }
                                                          return (
                                                            <Flex
                                                              direction="column"
                                                              gap="8px"
                                                            >
                                                              <Text
                                                                fontSize="16px"
                                                                fontWeight="400"
                                                                color="black"
                                                              >
                                                                Video{" "}
                                                                <Text
                                                                  as="span"
                                                                  color="red"
                                                                >
                                                                  *
                                                                </Text>
                                                              </Text>
                                                              <Flex
                                                                w="160px"
                                                                h="160px"
                                                                direction="column"
                                                                justify="center"
                                                                align="center"
                                                                color="blue.400"
                                                                bg="gray.100"
                                                                borderRadius="8px"
                                                              >
                                                                {field.value ? (
                                                                  <Flex
                                                                    w="100%"
                                                                    h="100%"
                                                                    position="relative"
                                                                    bg="gray.200"
                                                                    borderRadius="8px"
                                                                  >
                                                                    <video
                                                                      controls
                                                                      w="100%"
                                                                      h="100%"
                                                                      key={
                                                                        videoKey
                                                                      }
                                                                    >
                                                                      <source
                                                                        src={URL.createObjectURL(
                                                                          field.value
                                                                        )}
                                                                      />
                                                                    </video>
                                                                    <Flex
                                                                      w="32px"
                                                                      h="32px"
                                                                      borderRadius="full"
                                                                      position="absolute"
                                                                      top="-18px"
                                                                      right="-18px"
                                                                      bg="purple"
                                                                      justify="center"
                                                                      align="center"
                                                                      sx={{
                                                                        "&:hover":
                                                                          {
                                                                            opacity: 0.5,
                                                                          },
                                                                      }}
                                                                      cursor="pointer"
                                                                      onClick={() => {
                                                                        form.setFieldValue(
                                                                          `sub_lessons.${index}.video`,
                                                                          null
                                                                        );
                                                                      }}
                                                                    >
                                                                      <Image
                                                                        src="/assets/misc/close-button.svg"
                                                                        alt="close button"
                                                                        w="11px"
                                                                        h="11px"
                                                                      />
                                                                    </Flex>
                                                                  </Flex>
                                                                ) : (
                                                                  <FormControl
                                                                    isInvalid={
                                                                      isFormInValid
                                                                    }
                                                                    w="100%"
                                                                    h="100%"
                                                                  >
                                                                    <label>
                                                                      <Input
                                                                        type="file"
                                                                        hidden
                                                                        onChange={(
                                                                          event
                                                                        ) => {
                                                                          handleVideoChange(
                                                                            event
                                                                              .currentTarget
                                                                              .files[0],
                                                                            index,
                                                                            form.setFieldValue
                                                                          );
                                                                        }}
                                                                      />
                                                                      <Flex
                                                                        w="100%"
                                                                        h="100%"
                                                                        direction="column"
                                                                        justify="center"
                                                                        align="center"
                                                                        color="blue.400"
                                                                        cursor="pointer"
                                                                        bg="gray.200"
                                                                        borderRadius="8px"
                                                                      >
                                                                        <Text
                                                                          fontSize="36px"
                                                                          fontWeight="200"
                                                                        >
                                                                          +
                                                                        </Text>
                                                                        <Text
                                                                          fontSize="14px"
                                                                          fontWeight="500"
                                                                        >
                                                                          Upload
                                                                          Video
                                                                        </Text>
                                                                      </Flex>
                                                                    </label>
                                                                    <FormErrorMessage w="max-content">
                                                                      {isFormInValid
                                                                        ? form
                                                                            .errors
                                                                            .sub_lessons[
                                                                            index
                                                                          ]
                                                                            .video
                                                                        : null}
                                                                    </FormErrorMessage>
                                                                  </FormControl>
                                                                )}
                                                              </Flex>
                                                            </Flex>
                                                          );
                                                        }}
                                                      </Field>
                                                    </Flex>
                                                  )}
                                                </Draggable>
                                              );
                                            }
                                          )}
                                          {provided.placeholder}
                                          {/* ! --------------- Add Form END----------------  */}
                                          <Button
                                            w="208px"
                                            h="60px"
                                            variant="secondary"
                                            onClick={() => {
                                              forms.push({
                                                sub_lesson_id: undefined,
                                                sub_lesson_name: "",
                                                video: null,
                                              });
                                            }}
                                          >
                                            + Add Sub-lesson
                                          </Button>
                                        </>
                                      );
                                    }}
                                  </FieldArray>
                                </Flex>
                              );
                            }}
                          </Droppable>
                        </DragDropContext>
                      </Flex>
                      {!lessonData ? null : lessonData.lesson_sequence ===
                        1 ? null : (
                        <Link
                          alignSelf="end"
                          onClick={() => onConfirmModalOpen()}
                        >
                          Delete lesson
                        </Link>
                      )}
                      {courseId ? null : Number(lessonId) === 1 ? null : (
                        <Link
                          alignSelf="end"
                          onClick={() => onConfirmModalOpen()}
                        >
                          Delete lesson
                        </Link>
                      )}
                    </>
                  )}
                </Flex>
              </Flex>
            </Flex>
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
                    Do you want to delete this lesson?
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
                        if (Boolean(courseId)) {
                          handleDeleteLesson(lessonId, courseId, adminId);
                        } else {
                          const newLessonsList = [...addLesson];
                          newLessonsList.splice(lessonId - 1, 1);
                          setAddLesson(newLessonsList);
                          navigate(`/admin/add-course`);
                        }
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

export default AdminEditLesson;
