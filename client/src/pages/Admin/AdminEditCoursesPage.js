import {
  Box,
  Flex,
  Input,
  Text,
  useToast,
  Image,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Textarea,
  Select,
  Button,
  Heading,
  FormHelperText,
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
import { CheckCircleIcon, ArrowBackIcon } from "@chakra-ui/icons";
import { useAdmin } from "../../contexts/admin.js";
import { Field, Form, Formik } from "formik";
import React from "react";
import { Sidebar } from "../../components/SidebarAdmin";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { useParams } from "react-router";
import { useAuth } from "../../contexts/authentication";
import LessonTable from "../../components/LessonsTable";
let action;

function AdminEditCourse() {
  const {
    editCourseFields,
    setEditCourseFields,
    filesEditCourse,
    setFilesEditCourse,
    setIsLoading,
    isLoading,
    addLesson,
  } = useAdmin();
  const { contextAdminState } = useAuth();
  const adminId = contextAdminState.user.admin_id;

  const navigate = useNavigate();
  const { courseId } = useParams();

  const [isDeleting, setIsDeleting] = useState(false);

  const {
    isOpen: isConfirmModalOpen,
    onOpen: onConfirmModalOpen,
    onClose: onConfirmModalClose,
  } = useDisclosure();
  const {
    isOpen: isSuccessModalOpen,
    onOpen: onSuccessModalOpen,
    onClose: onSuccessModalClose,
  } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    // this useEffect is for covert files from url to file object (blob)
    // since it only need to be convert only one time when this component mounting
    // so filesEditCourse context state needed to be reset
    async function convertFile() {
      const results = await convertToFileObj(
        filesEditCourse.filesMetaData,
        filesEditCourse.allMediaUrls
      );
      setEditCourseFields({
        ...editCourseFields,
        cover_image: results[0],
        video_trailer: results[1],
        files: results.slice(2),
      });
      setIsLoading(false);
    }
    if (Object.keys(filesEditCourse).length > 0) {
      convertFile();
      setFilesEditCourse({});
    }
  }, [filesEditCourse]);

  // Convert media urls into file objects:
  const convertToFileObj = async (filesMetaData, allMediaUrls) => {
    const filesObjects = [];
    const filesMetaDataFromCloudinary = [];
    for (let i = 0; i < allMediaUrls.length; i++) {
      filesMetaDataFromCloudinary.push(JSON.parse(allMediaUrls[i]));
      await fetch(filesMetaDataFromCloudinary[i].url).then(async (response) => {
        const blob = await response.blob();
        const file = new File([blob], filesMetaData[i].file_name, {
          type: blob.type,
        });
        filesObjects.push(file);
      });
    }
    return filesObjects;
  };

  const handleSubmit = async (values) => {
    const formData = new FormData();
    formData.append("course_name", values.course_name);
    formData.append("price", values.price);
    formData.append("learning_time", values.learning_time);
    formData.append("course_summary", values.course_summary);
    formData.append("course_detail", values.course_detail);
    formData.append("category", values.category);
    // if the user changes lessons' sequence:
    let i = 1;
    for (let lesson of addLesson) {
      lesson.sequence = i;
      i++;
    }
    addLesson.forEach((lesson) => {
      formData.append("lesson_id", lesson.lesson_id);
      formData.append("sequence", lesson.sequence);
    });
    // if the user changes any files (cover image, video trailer or attached files):
    if (action === "change") {
      formData.append("cover_image", values.cover_image);
      formData.append("video_trailer", values.video_trailer);
      values.files.forEach((file) => {
        formData.append("files", file);
      });
    }

    const result = await axios.put(
      `http://localhost:4000/admin/courses/${courseId}?byAdmin=${adminId}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    if (/success/i.test(result.data.message)) {
      onSuccessModalOpen();
      action = undefined;
    }
  };

  const handleVideoChange = (currentFile, setFieldValue) => {
    action = "change";
    if (currentFile) {
      if (/video/gi.test(currentFile.type)) {
        if (currentFile.size < 1e8) {
          setFieldValue("video_trailer", currentFile);
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

  const handleCoverImageChange = (currentFile, setFieldValue) => {
    action = "change";
    if (currentFile) {
      if (/jpeg|png/gi.test(currentFile.type)) {
        if (currentFile.size <= 2e6) {
          setFieldValue("cover_image", currentFile);
        } else {
          return toast({
            title: "File size must be less than 2MB!",
            status: "error",
            isClosable: true,
          });
        }
      } else {
        return toast({
          title: "File type must be JPG/PNG only!",
          status: "error",
          isClosable: true,
        });
      }
    }
  };

  const handleFilesChange = (newFiles, setFieldValue, currentFiles) => {
    action = "change";
    const validFiles = [...currentFiles];
    for (let newFile of newFiles) {
      if (/video/gi.test(newFile.type)) {
        if (newFile.size < 1e8) {
          validFiles.push(newFile);
        } else {
          return toast({
            title: "Video size must be less than 100MB!",
            status: "error",
            isClosable: true,
          });
        }
      } else {
        if (newFile.size < 1e7) {
          validFiles.push(newFile);
        } else {
          return toast({
            title: "File size must be less than 10MB!",
            status: "error",
            isClosable: true,
          });
        }
      }
    }
    setFieldValue("files", validFiles);
  };

  const handleDeleteCourse = async () => {
    setIsDeleting(true);
    const result = await axios.delete(
      `http://localhost:4000/admin/courses/${courseId}?byAdmin=${adminId}`
    );
    if (/deleted/i.test(result.data.message)) {
      onConfirmModalClose();
      navigate("/admin");
    }
    setIsDeleting(false);
  };

  // *- input validation -* //
  const validateCourseName = (value) => {
    let error;
    if (!value) {
      error = "Please specify course name";
    }
    return error;
  };

  const validatePrice = (value) => {
    let error;
    if (!value) {
      error = "Please specify price";
    } else if (value <= 0) {
      error = "Price can not be less than 0";
    }
    return error;
  };

  const validateLearningTime = (value) => {
    let error;
    if (!value) {
      error = "Please specify learning time ";
    } else if (value <= 0) {
      error = `Learning time can not be less than 0`;
    } else if (value % 1 !== 0) {
      error = "Learning time can not be decimal";
    }
    return error;
  };

  const validateCourseSummary = (value) => {
    let error;
    if (!value) {
      error = "Please specify course summary";
    } else if (value.length > 120) {
      error = "Character length must not be more than 120 characters";
    }
    return error;
  };

  const validateCourseDetail = (value) => {
    let error;
    if (!value) {
      error = "Please specify course detail";
    }
    return error;
  };

  const validateCategory = (value) => {
    let error;
    if (!value) {
      error = "Please specify course category";
    }
    return error;
  };

  const validateCoverImage = (value) => {
    let error;
    if (!value) {
      error = "Please upload course cover image";
    }
    return error;
  };

  const validateVideoTrailer = (value) => {
    let error;
    if (!value) {
      error = "Please upload course video trailer";
    }
    return error;
  };

  return (
    <>
      <Formik
        initialValues={{
          course_name: editCourseFields.course_name || "",
          price: editCourseFields.price || "",
          learning_time: editCourseFields.learning_time || "",
          course_summary: editCourseFields.course_summary || "",
          course_detail: editCourseFields.course_detail || "",
          category: editCourseFields.category || "",
          cover_image: editCourseFields.cover_image || null,
          video_trailer: editCourseFields.video_trailer || null,
          files: editCourseFields.files || [],
        }}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {(props) => {
          return (
            <Form>
              <Flex w="100vw">
                {/* Left Section */}
                <Sidebar />
                {/* Right Section */}
                <Flex direction="column" w="100%" h="100vh" overflowY="auto">
                  {/* Right-Top Section */}
                  {/* navbar */}
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
                    <Flex gap="16px" w="70%">
                      <Flex
                        gap="16px"
                        align="center"
                        cursor="pointer"
                        _hover={{ opacity: 0.5 }}
                        onClick={() => {
                          navigate("/admin");
                        }}
                      >
                        <ArrowBackIcon boxSize={6} color="gray.600" />
                        <Heading variant="headline3" color="gray.600">
                          Course
                        </Heading>
                      </Flex>
                      <Heading variant="headline3" noOfLines={1}>
                        {editCourseFields.course_name}
                      </Heading>
                    </Flex>
                    <Flex alignItems="center" gap="16px">
                      <Button
                        variant="secondary"
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
                  {/* navbar */}

                  {/* Right-Bottom Section */}
                  <Box bg="gray.100" w="100%">
                    {isLoading ? (
                      <Flex w="100%" h="100vh" py="45px" justify="center">
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
                        <Flex direction="column">
                          <Flex
                            m="40px"
                            pb="60px"
                            px="100px"
                            pt="40px"
                            bg="white"
                            minW="fit-content"
                            borderRadius="16px"
                          >
                            <Flex
                              className="input-fields"
                              w="920px"
                              gap="40px"
                              bg="white"
                              direction="column"
                            >
                              {/* Course name field */}
                              <Field
                                name="course_name"
                                validate={validateCourseName}
                              >
                                {({ field, form }) => (
                                  <FormControl
                                    isInvalid={
                                      form.errors.course_name &&
                                      form.touched.course_name
                                    }
                                  >
                                    <FormLabel variant="body2" color="black">
                                      Course name{" "}
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
                                      w="100%"
                                      h="48px"
                                      {...field}
                                      placeholder="Enter course name"
                                    />
                                    <FormErrorMessage>
                                      {form.errors.course_name}
                                    </FormErrorMessage>
                                  </FormControl>
                                )}
                              </Field>
                              <Flex gap="40px">
                                {/* Price field */}
                                <Field name="price" validate={validatePrice}>
                                  {({ field, form }) => (
                                    <FormControl
                                      isInvalid={
                                        form.errors.price && form.touched.price
                                      }
                                    >
                                      <FormLabel variant="body2" color="black">
                                        Price (Baht){" "}
                                        <Text
                                          variant="body2"
                                          as="span"
                                          color="red"
                                        >
                                          *
                                        </Text>
                                      </FormLabel>
                                      <Input
                                        type="number"
                                        w="100%"
                                        h="48px"
                                        {...field}
                                        placeholder="Enter course price"
                                      />
                                      <FormErrorMessage>
                                        {form.errors.price}
                                      </FormErrorMessage>
                                    </FormControl>
                                  )}
                                </Field>
                                {/* Total Learning Time field */}
                                <Field
                                  name="learning_time"
                                  validate={validateLearningTime}
                                >
                                  {({ field, form }) => (
                                    <FormControl
                                      isInvalid={
                                        form.errors.learning_time &&
                                        form.touched.learning_time
                                      }
                                    >
                                      <FormLabel variant="body2" color="black">
                                        Learning time (hours){" "}
                                        <Text
                                          variant="body2"
                                          as="span"
                                          color="red"
                                        >
                                          *
                                        </Text>
                                      </FormLabel>
                                      <Input
                                        type="number"
                                        w="100%"
                                        h="48px"
                                        {...field}
                                        placeholder="Enter course learning time"
                                      />
                                      <FormErrorMessage>
                                        {form.errors.learning_time}
                                      </FormErrorMessage>
                                    </FormControl>
                                  )}
                                </Field>
                              </Flex>
                              {/* Course Summary field */}
                              <Field
                                name="course_summary"
                                validate={validateCourseSummary}
                              >
                                {({ field, form }) => (
                                  <FormControl
                                    isInvalid={
                                      form.errors.course_summary &&
                                      form.touched.course_summary
                                    }
                                  >
                                    <FormLabel variant="body2" color="black">
                                      Course summary{" "}
                                      <Text
                                        variant="body2"
                                        as="span"
                                        color="red"
                                      >
                                        *
                                      </Text>
                                    </FormLabel>
                                    <Textarea
                                      type="text"
                                      w="100%"
                                      h="72px"
                                      resize="none"
                                      {...field}
                                      placeholder="Enter course summary"
                                    />
                                    <FormErrorMessage>
                                      {form.errors.course_summary}
                                    </FormErrorMessage>
                                    {form.errors.course_summary &&
                                    form.touched.course_summary ? null : (
                                      <FormHelperText>
                                        Character length must be not more than
                                        120 characters
                                      </FormHelperText>
                                    )}
                                  </FormControl>
                                )}
                              </Field>
                              {/* Course Detail field */}
                              <Field
                                name="course_detail"
                                validate={validateCourseDetail}
                              >
                                {({ field, form }) => (
                                  <FormControl
                                    isInvalid={
                                      form.errors.course_detail &&
                                      form.touched.course_detail
                                    }
                                  >
                                    <FormLabel variant="body2" color="black">
                                      Course detail{" "}
                                      <Text
                                        variant="body2"
                                        as="span"
                                        color="red"
                                      >
                                        *
                                      </Text>
                                    </FormLabel>
                                    <Textarea
                                      type="text"
                                      w="100%"
                                      h="192px"
                                      {...field}
                                      placeholder="Enter course detail"
                                    />
                                    <FormErrorMessage>
                                      {form.errors.course_detail}
                                    </FormErrorMessage>
                                  </FormControl>
                                )}
                              </Field>
                              {/* Category field */}
                              <Field
                                name="category"
                                validate={validateCategory}
                              >
                                {({ field, form }) => (
                                  <FormControl
                                    isInvalid={
                                      form.errors.category &&
                                      form.touched.category
                                    }
                                  >
                                    <FormLabel variant="body2" color="black">
                                      Category{" "}
                                      <Text
                                        variant="body2"
                                        as="span"
                                        color="red"
                                      >
                                        *
                                      </Text>
                                    </FormLabel>
                                    <Select
                                      w="920px"
                                      {...field}
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
                                        Select course category
                                      </option>
                                      <option value="science">Science</option>
                                      <option value="business">Business</option>
                                      <option value="technology">
                                        Software development
                                      </option>
                                    </Select>
                                    <FormErrorMessage>
                                      {form.errors.category}
                                    </FormErrorMessage>
                                  </FormControl>
                                )}
                              </Field>
                              {/* Cover Image Upload */}
                              <Field
                                name="cover_image"
                                validate={validateCoverImage}
                              >
                                {({ field, form }) => {
                                  return (
                                    <Flex
                                      className="cover-image-upload"
                                      direction="column"
                                      gap="8px"
                                    >
                                      <Text variant="body2" color="black">
                                        Cover Image{" "}
                                        <Text
                                          variant="body2"
                                          as="span"
                                          color="red"
                                        >
                                          *
                                        </Text>
                                      </Text>
                                      <Flex
                                        w="240px"
                                        h="240px"
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
                                          >
                                            <Image
                                              w="100%"
                                              src={URL.createObjectURL(
                                                field.value
                                              )}
                                              fit="contain"
                                              borderRadius="8px"
                                            />
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
                                                "&:hover": {
                                                  opacity: 0.5,
                                                },
                                              }}
                                              cursor="pointer"
                                              onClick={() => {
                                                form.setFieldValue(
                                                  "cover_image",
                                                  ""
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
                                              form.errors.cover_image &&
                                              form.touched.cover_image
                                            }
                                            w="100%"
                                            h="100%"
                                          >
                                            <label>
                                              <Input
                                                type="file"
                                                display="none"
                                                onChange={(event) => {
                                                  handleCoverImageChange(
                                                    event.currentTarget
                                                      .files[0],
                                                    form.setFieldValue
                                                  );
                                                }}
                                              />
                                              <Flex
                                                direction="column"
                                                justify="center"
                                                align="center"
                                                color="blue.400"
                                                cursor="pointer"
                                                w="100%"
                                                h="100%"
                                              >
                                                <Text fontSize="36px">+</Text>
                                                <Text variant="body2">
                                                  Upload Image
                                                </Text>
                                              </Flex>
                                            </label>
                                            <FormErrorMessage>
                                              {form.errors.cover_image}
                                            </FormErrorMessage>
                                          </FormControl>
                                        )}
                                      </Flex>
                                    </Flex>
                                  );
                                }}
                              </Field>
                              {/* Video Trailer Upload */}
                              <Field
                                name="video_trailer"
                                validate={validateVideoTrailer}
                              >
                                {({ field, form }) => {
                                  return (
                                    <Flex
                                      className="video-trailer-upload"
                                      direction="column"
                                      gap="8px"
                                    >
                                      <Text variant="body2" color="black">
                                        Video Trailer{" "}
                                        <Text
                                          variant="body2"
                                          as="span"
                                          color="red"
                                        >
                                          *
                                        </Text>
                                      </Text>
                                      <Flex
                                        w="240px"
                                        h="240px"
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
                                          >
                                            <video controls w="100%" h="100%">
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
                                                "&:hover": {
                                                  opacity: 0.5,
                                                },
                                              }}
                                              cursor="pointer"
                                              onClick={() => {
                                                form.setFieldValue(
                                                  "video_trailer",
                                                  ""
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
                                              form.errors.video_trailer &&
                                              form.touched.video_trailer
                                            }
                                            w="100%"
                                            h="100%"
                                          >
                                            <label>
                                              <Input
                                                type="file"
                                                display="none"
                                                onChange={(event) => {
                                                  handleVideoChange(
                                                    event.currentTarget
                                                      .files[0],
                                                    form.setFieldValue
                                                  );
                                                }}
                                              />
                                              <Flex
                                                direction="column"
                                                justify="center"
                                                align="center"
                                                color="blue.400"
                                                cursor="pointer"
                                                w="100%"
                                                h="100%"
                                              >
                                                <Text fontSize="36px">+</Text>
                                                <Text variant="body2">
                                                  Upload Video
                                                </Text>
                                              </Flex>
                                            </label>
                                            <FormErrorMessage>
                                              {form.errors.video_trailer}
                                            </FormErrorMessage>
                                          </FormControl>
                                        )}
                                      </Flex>
                                    </Flex>
                                  );
                                }}
                              </Field>
                              {/* File(s) Upload */}
                              <Field name="files">
                                {({ field, form }) => {
                                  return (
                                    <Flex
                                      className="files-upload"
                                      direction="column"
                                      gap="8px"
                                    >
                                      <Text variant="body2" color="black">
                                        Attach File (Optional)
                                      </Text>
                                      {field.value.length > 0 ? (
                                        <>
                                          <Flex
                                            wrap="wrap"
                                            w="100%"
                                            gap="20px 30px"
                                          >
                                            {field.value.map((file, key) => {
                                              return (
                                                <Flex
                                                  key={key}
                                                  position="relative"
                                                  display="flex"
                                                  alignItems="center"
                                                  h="82px"
                                                  w="240px"
                                                  bg="blue.100"
                                                  borderRadius="8px"
                                                  sx={{
                                                    "&:hover": {
                                                      bg: "blue.200",
                                                    },
                                                  }}
                                                >
                                                  <Flex
                                                    align="center"
                                                    gap="29px"
                                                    p="16px"
                                                    w="100%"
                                                    h="100%"
                                                  >
                                                    <Flex
                                                      w="50px"
                                                      h="50px"
                                                      bg="white"
                                                      borderRadius="4px"
                                                      justify="center"
                                                      align="center"
                                                    >
                                                      <Box w="20px">
                                                        {/^image/i.test(
                                                          file.type
                                                        ) ? (
                                                          <Image
                                                            src="../../../assets/course-detail-page/image-icon.svg"
                                                            alt="image icon"
                                                          />
                                                        ) : /^audio/i.test(
                                                            file.type
                                                          ) ? (
                                                          <Image
                                                            src="../../../assets/course-detail-page/audio-icon.svg"
                                                            alt="audio icon"
                                                          />
                                                        ) : /^video/i.test(
                                                            file.type
                                                          ) ? (
                                                          <Image
                                                            src="../../../assets/course-detail-page/video-icon.svg"
                                                            alt="video icon"
                                                          />
                                                        ) : (
                                                          <Image
                                                            src="/assets/course-detail-page/file-icon.svg"
                                                            alt="file icon"
                                                          />
                                                        )}
                                                      </Box>
                                                    </Flex>
                                                    <Text
                                                      variant="body3"
                                                      w="60%"
                                                      noOfLines={1}
                                                    >
                                                      {file.name}
                                                    </Text>
                                                  </Flex>
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
                                                      "&:hover": {
                                                        opacity: 0.5,
                                                      },
                                                    }}
                                                    cursor="pointer"
                                                    onClick={() => {
                                                      action = "change";
                                                      const newFieldValue = [
                                                        ...field.value,
                                                      ];
                                                      newFieldValue.splice(
                                                        key,
                                                        1
                                                      );
                                                      form.setFieldValue(
                                                        "files",
                                                        newFieldValue
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
                                              );
                                            })}
                                          </Flex>
                                          {/* Add more file */}
                                          <Flex>
                                            <label>
                                              <Input
                                                type="file"
                                                display="none"
                                                multiple
                                                onChange={(event) => {
                                                  handleFilesChange(
                                                    Object.values(
                                                      event.currentTarget.files
                                                    ),
                                                    form.setFieldValue,
                                                    field.value
                                                  );
                                                }}
                                              />
                                              <Text
                                                variant="add-more-files"
                                                cursor="pointer"
                                              >
                                                Add more files
                                              </Text>
                                            </label>
                                          </Flex>
                                        </>
                                      ) : (
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
                                          <label>
                                            <Input
                                              type="file"
                                              display="none"
                                              multiple
                                              onChange={(event) => {
                                                handleFilesChange(
                                                  Object.values(
                                                    event.currentTarget.files
                                                  ),
                                                  form.setFieldValue,
                                                  field.value
                                                );
                                              }}
                                            />
                                            <Flex
                                              direction="column"
                                              justify="center"
                                              align="center"
                                              color="blue.400"
                                              cursor="pointer"
                                              w="160px"
                                              h="160px"
                                            >
                                              <Text fontSize="36px">+</Text>
                                              <Text variant="body2">
                                                Upload file
                                              </Text>
                                            </Flex>
                                          </label>
                                        </Flex>
                                      )}
                                    </Flex>
                                  );
                                }}
                              </Field>
                            </Flex>
                          </Flex>
                          <LessonTable currentCourseData={props.values} />
                          <Flex w="100%" mb="87px" pr="40px" justify="flex-end">
                            <Link onClick={() => onConfirmModalOpen()}>
                              Delete Course
                            </Link>
                          </Flex>
                        </Flex>
                      </>
                    )}
                  </Box>
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
                      Do you want to delete this course?
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
                          handleDeleteCourse(courseId);
                        }}
                      >
                        Yes, I want to delete
                      </Button>
                    </Flex>
                  </ModalBody>
                </ModalContent>
              </Modal>
              <Modal
                isCentered
                isOpen={isSuccessModalOpen}
                onClose={onSuccessModalClose}
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
                    Course has been successfully edited.
                  </ModalBody>
                </ModalContent>
              </Modal>
            </Form>
          );
        }}
      </Formik>
    </>
  );
}

export default AdminEditCourse;
