import { Sidebar } from "../../components/SidebarAdmin";
import {
  Flex,
  Table,
  Text,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
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
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../contexts/authentication";
import AdminNavbar from "../../components/AdminNavbar.js";
let assignment_id;

function AdminAssignmentList() {
  const { contextAdminState } = useAuth();
  const adminId = contextAdminState.user.admin_id;
  const [adminAssignment, setAdminAssignment] = useState();
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
    "Assignment detail",
    "Course",
    "Lesson",
    "Sub-lesson",
    "Created date",
    "Update date",
    "Action",
  ];

  useEffect(() => {
    getAdminAssignment(searchParams.get("search"));
  }, [searchParams.get("search")]);

  const getAdminAssignment = async (searchText) => {
    /* In case of no searchText => transform searchText into empty string (instead of null) */
    if (!searchText) {
      searchText = "";
    }
    setIsLoadeing(true);
    const query = new URLSearchParams();
    query.append("searchText", searchText);
    query.append("byAdmin", adminId);
    const results = await axios.get(
      `http://localhost:4000/admin/assignments/list?${query.toString()}`
    );
    setAdminAssignment(results.data.data);
    setIsLoadeing(false);
  };

  const handleDeleteAssignment = async (assignmentId) => {
    setIsDeleting(true);
    const result = await axios.delete(
      `http://localhost:4000/admin/assignments/${assignmentId}?byAdmin=${adminId}`
    );
    setIsDeleting(false);
    if (/successfully/i.test(result.data.message)) {
      onConfirmModalClose();
      getAdminAssignment(searchParams.get("search"));
    }
  };

  return (
    <Flex w="100vw">
      {/* Left Section */}
      <Sidebar selectedTab={2} />
      {/* Right Section */}
      <Flex direction="column" w="100%">
        {/* Right-Top Section */}
        <AdminNavbar
          heading="Assignment"
          action="+ Add Assignment"
          url="add"
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
          {isLoading || !Boolean(adminAssignment) ? (
            <Spinner
              thickness="4px"
              speed="0.65s"
              emptyColor="gray.200"
              color="blue.500"
              size="xl"
            />
          ) : adminAssignment.length === 0 ? (
            <Text as="i">Assignment not found!</Text>
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
                  {adminAssignment.map((assignment, key) => {
                    return (
                      <Tr key={key}>
                        {Object.keys(assignment).map((assignmentKey, index) => {
                          if (/assignment_id/i.test(assignmentKey)) {
                            return;
                          }
                          return (
                            <Td
                              maxW="200px"
                              overflow="hidden"
                              textOverflow="ellipsis"
                              p="32px 16px"
                              color="black"
                              fontSize="15px"
                              key={index}
                            >
                              {assignment[assignmentKey]}
                            </Td>
                          );
                        })}
                        <Td maxW="150px" p="0px">
                          <Flex gap="20%" justify="center">
                            <Image
                              src="../../../assets/admin-page/bin.svg"
                              alt="bin"
                              cursor="pointer"
                              _hover={{ opacity: 0.5 }}
                              onClick={() => {
                                assignment_id = assignment.assignment_id;
                                onConfirmModalOpen();
                              }}
                            />
                            <Image
                              src="../../../assets/admin-page/edit.svg"
                              alt="edit"
                              cursor="pointer"
                              _hover={{ opacity: 0.5 }}
                              onClick={() =>
                                navigate(`./edit/${assignment.assignment_id}`)
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
                  handleDeleteAssignment(assignment_id);
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

export default AdminAssignmentList;
