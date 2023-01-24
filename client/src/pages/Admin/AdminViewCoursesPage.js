import { Sidebar } from "../../components/SidebarAdmin";
import {
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Text,
  Image,
  Spinner,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Button,
  Divider,
} from "@chakra-ui/react";
import AdminNavbar from "../../components/AdminNavbar";
import axios from "axios";
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/authentication";
let course_id;

function AdminViewCourses() {
  const { contextAdminState } = useAuth();
  const adminId = contextAdminState.user.admin_id;
  const [adminCourses, setAdminCourses] = useState();
  const [isLoading, setIsLoadeing] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const {
    isOpen: isConfirmModalOpen,
    onOpen: onConfirmModalOpen,
    onClose: onConfirmModalClose,
  } = useDisclosure();
  const columnNames = [
    "Image",
    "Course name",
    "Lesson",
    "Price",
    "Created date",
    "Updated date",
    "Action",
  ];

  useEffect(() => {
    getAdminCourses(searchParams.get("search"));
  }, [searchParams.get("search")]);

  const getAdminCourses = async (searchText) => {
    /* In case of no searchText => transform searchText into empty string (instead of null) */
    if (!searchText) {
      searchText = "";
    }
    setIsLoadeing(true);
    const query = new URLSearchParams();
    query.append("searchText", searchText);
    query.append("byAdmin", adminId);
    const results = await axios.get(
      `http://localhost:4000/admin/courses?${query.toString()}`
    );
    setAdminCourses(results.data.data);
    setIsLoadeing(false);
  };

  const handleDeleteCourse = async (courseId) => {
    setIsDeleting(true);
    const result = await axios.delete(
      `http://localhost:4000/admin/courses/${courseId}?byAdmin=${adminId}`
    );
    setIsDeleting(false);
    if (/deleted/i.test(result.data.message)) {
      onConfirmModalClose();
      getAdminCourses(searchParams.get("search"));
    }
  };

  return (
    <Flex w="100vw">
      {/* Left Section */}
      <Sidebar selectedTab={1} />
      {/* Right Section */}
      <Flex direction="column" w="100%">
        {/* Right-Top Section */}
        <AdminNavbar
          heading="Course"
          action="+ Add Course"
          url="add-course"
          searchParams={searchParams}
        />
        {/* Right-Bottom Section */}
        <Flex
          bg="gray.100"
          w="100%"
          h="100%"
          px="2.5%"
          py="45px"
          align="start"
          justify="center"
        >
          {isLoading || !Boolean(adminCourses) ? (
            <Spinner
              thickness="4px"
              speed="0.65s"
              emptyColor="gray.200"
              color="blue.500"
              size="xl"
            />
          ) : adminCourses.length === 0 ? (
            <Text as="i">Course not found!</Text>
          ) : (
            <TableContainer
              bg="white"
              borderRadius="8px"
              maxW="80vw"
              maxH="80vh"
              overflowY="auto"
            >
              <Table>
                <Thead bg="gray.300" h="41px">
                  <Tr>
                    <Th p="10px 16px"></Th>
                    {columnNames.map((columnName, key) => {
                      return (
                        <Th
                          key={key}
                          textTransform="capitalize"
                          color="gray.800"
                          fontSize="14px"
                          fontWeight="400"
                          p="10px 16px"
                        >
                          {columnName}
                        </Th>
                      );
                    })}
                  </Tr>
                </Thead>
                <Tbody>
                  {adminCourses.map((course, key) => {
                    return (
                      <Tr key={key}>
                        <Td maxW="48px" fontSize="15px" color="black">
                          {key + 1}
                        </Td>
                        <Td maxW="96px">
                          <Image src={course.cover_image_directory.url} />
                        </Td>
                        <Td
                          maxW="268px"
                          overflow="hidden"
                          textOverflow="ellipsis"
                          p="32px 16px"
                          color="black"
                          fontSize="15px"
                        >
                          {course.course_name}
                        </Td>
                        <Td
                          maxW="105px"
                          overflow="hidden"
                          textOverflow="ellipsis"
                          p="32px 16px"
                          color="black"
                          fontSize="15px"
                        >
                          {course.lessons_count} Lessons
                        </Td>
                        <Td
                          maxW="105px"
                          overflow="hidden"
                          textOverflow="ellipsis"
                          p="32px 16px"
                          color="black"
                          fontSize="15px"
                        >
                          {course.price.toLocaleString("en", {
                            minimumFractionDigits: 2,
                          })}
                        </Td>
                        <Td
                          maxW="200px"
                          overflow="hidden"
                          textOverflow="ellipsis"
                          p="32px 16px"
                          color="black"
                          fontSize="15px"
                        >
                          {course.created_date}
                        </Td>
                        <Td
                          maxW="200px"
                          overflow="hidden"
                          textOverflow="ellipsis"
                          p="32px 16px"
                          color="black"
                          fontSize="15px"
                        >
                          {course.updated_date}
                        </Td>
                        <Td maxW="150px" p="0px">
                          <Flex gap="20%" justify="center">
                            <Image
                              src="../../../assets/admin-page/bin.svg"
                              alt="bin"
                              cursor="pointer"
                              _hover={{ opacity: 0.5 }}
                              onClick={() => {
                                course_id = course.course_id;
                                onConfirmModalOpen();
                              }}
                            />
                            <Image
                              src="../../../assets/admin-page/edit.svg"
                              alt="edit"
                              cursor="pointer"
                              _hover={{ opacity: 0.5 }}
                              onClick={() =>
                                navigate(
                                  `/admin/edit-course/${course.course_id}`
                                )
                              }
                            />
                          </Flex>
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </TableContainer>
          )}
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
                  handleDeleteCourse(course_id);
                }}
              >
                Yes, I want to delete
              </Button>
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Flex>
  );
}

export default AdminViewCourses;
