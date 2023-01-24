import {
  Heading,
  Button,
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
  Center,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Divider,
} from "@chakra-ui/react";
import { DragHandleIcon } from "@chakra-ui/icons";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useAdmin } from "../contexts/admin.js";
import { useAuth } from "../contexts/authentication.js";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
let lessonDeleteId;
let lessonDeleteIndex;

const LessonTable = ({ currentCourseData, innerRef }) => {
  const { addLesson, setAddLesson, setAddCourseFields, setEditCourseFields } =
    useAdmin();
  const { contextAdminState } = useAuth();
  const adminId = contextAdminState.user.admin_id;

  const navigate = useNavigate();
  const { courseId } = useParams();

  const {
    isOpen: isConfirmModalOpen,
    onOpen: onConfirmModalOpen,
    onClose: onConfirmModalClose,
  } = useDisclosure();
  const [isDeleting, setIsDeleting] = useState(false);

  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  const getItemStyle = (isDragging, draggableStyle) => ({
    background: isDragging ? "#F6F7FC" : null,
    display: isDragging ? "table" : null,
    ...draggableStyle,
  });

  const onDragEnd = (result) => {
    if (!result.destination) {
      return;
    }
    const items = reorder(
      addLesson,
      result.source.index,
      result.destination.index
    );

    setAddLesson(items);
  };

  const handleDeleteLesson = async (lessonId, courseId, adminId) => {
    setIsDeleting(true);
    const result = await axios.delete(
      `http://localhost:4000/admin/courses/${courseId}/lessons/${lessonId}?byAdmin=${adminId}`
    );
    if (/success/.test(result.data.message)) {
      setIsDeleting(false);
      const newLessonsList = [...addLesson];
      newLessonsList.splice(lessonDeleteIndex, 1);
      setAddLesson(newLessonsList);
    }
    onConfirmModalClose();
  };

  return (
    <Flex direction="column" mx="40px" my="50px">
      {/* Lesson Heading & Add Lesson Button */}
      <Flex justify="space-between" align="center">
        <Heading variant="headline3" w="933.5px">
          Lesson
        </Heading>
        <Button
          ref={innerRef}
          variant="primary"
          onClick={() => {
            if (courseId) {
              setEditCourseFields(currentCourseData);
            } else {
              setAddCourseFields(currentCourseData); // Preserved add course field values even page was navigated to another route
            }
            navigate("./add-lesson");
          }}
        >
          + Add Lesson
        </Button>
      </Flex>
      {/* Lesson Table */}
      <TableContainer bg="white" borderRadius="8px" mt="40px">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="lessons_list">
            {(provided) => {
              return (
                <Table ref={provided.innerRef}>
                  <Thead py="10px" bg="gray.300">
                    <Tr>
                      <Th></Th>
                      <Th></Th>
                      <Th color="gray.800">Lesson name</Th>
                      <Th color="gray.800">Sub-lesson</Th>
                      <Th color="gray.800">Action</Th>
                    </Tr>
                  </Thead>

                  <Tbody>
                    {addLesson.map((row, index) => {
                      return (
                        <Draggable
                          key={index}
                          draggableId={String(index)}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <Tr
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={getItemStyle(
                                snapshot.isDragging,
                                provided.draggableProps.style
                              )}
                            >
                              <Td w="5%">
                                <Center>
                                  <DragHandleIcon color="#D6D9E4" />
                                </Center>
                              </Td>
                              <Td w="5%" color="black">
                                {index + 1}
                              </Td>
                              <Td w="40%" color="black">
                                {row.lesson_name}
                              </Td>
                              <Td w="40%" color="black">
                                {courseId
                                  ? row.count
                                  : row.sub_lessons
                                  ? row.sub_lessons.length
                                  : null}
                              </Td>
                              <Td w="10%">
                                <Flex gap="20%">
                                  {index === 0 ? (
                                    <Image
                                      src="../../../assets/admin-page/bin-disabled.svg"
                                      alt="bin"
                                      w="24px"
                                      h="24px"
                                      cursor="not-allowed"
                                    />
                                  ) : (
                                    <Image
                                      src="../../../assets/admin-page/bin.svg"
                                      alt="bin"
                                      w="24px"
                                      h="24px"
                                      cursor="pointer"
                                      _hover={{ opacity: 0.5 }}
                                      onClick={() => {
                                        if (courseId) {
                                          // Delete lesson from edit course page
                                          lessonDeleteId = row.lesson_id;
                                          lessonDeleteIndex = index;
                                        } else {
                                          // Delete lesson from add course page
                                          lessonDeleteIndex = index;
                                        }
                                        onConfirmModalOpen();
                                      }}
                                    />
                                  )}
                                  <Image
                                    src="../../../assets/admin-page/edit.svg"
                                    alt="edit"
                                    w="24px"
                                    h="24px"
                                    cursor="pointer"
                                    _hover={{ opacity: 0.5 }}
                                    onClick={() => {
                                      if (courseId) {
                                        // Edit lesson from edit course page
                                        setEditCourseFields(currentCourseData);
                                        navigate(
                                          `./edit-lesson/${row.lesson_id}`
                                        );
                                      } else {
                                        // Edit lesson from add course page
                                        setAddCourseFields(currentCourseData); // Preserved add course field values even page was navigated to another route
                                        navigate(`./edit-lesson/${index + 1}`);
                                      }
                                    }}
                                  />
                                </Flex>
                              </Td>
                            </Tr>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </Tbody>
                </Table>
              );
            }}
          </Droppable>
        </DragDropContext>
      </TableContainer>
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
                  if (courseId) {
                    handleDeleteLesson(lessonDeleteId, courseId, adminId);
                  } else {
                    const newLessonsList = [...addLesson];
                    newLessonsList.splice(lessonDeleteIndex, 1);
                    setAddLesson(newLessonsList);
                    onConfirmModalClose();
                  }
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
};

export default LessonTable;
