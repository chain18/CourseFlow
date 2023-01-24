import {
  Box,
  Text,
  Button,
  Divider,
  Modal,
  ModalOverlay,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure,
} from "@chakra-ui/react";
import { useState } from "react";
import { useAuth } from "../contexts/authentication.js";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const PriceCard = (props) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isAuthenticated, contextState } = useAuth();
  const [isButtonLoading, setIsButtonLoading] = useState(false);

  const navigate = useNavigate();

  const handleAddCourse = async () => {
    setIsButtonLoading(true);
    // if "addStatus" is true => remove from desired course
    // if "addStatus" is false => add to desired course
    if (!props.addStatus) {
      const result = await axios.post(
        `http://localhost:4000/courses/${props.courseId}?byUser=${contextState.user.user_id}`,
        {
          action: "add",
        }
      );
      if (/successfully added/g.test(result.data.message)) {
        // setAddStatus from false to true
        props.setAddStatus(!props.addStatus);
      }
    } else {
      const result = await axios.post(
        `http://localhost:4000/courses/${props.courseId}?byUser=${contextState.user.user_id}`,
        {
          action: "remove",
        }
      );
      if (/successfully deleted/g.test(result.data.message)) {
        // setAddStatus from true to false
        props.setAddStatus(!props.addStatus);
      }
    }
    setIsButtonLoading(false);
  };

  const handleSubscribe = async () => {
    setIsButtonLoading(true);
    if (!props.subscribeStatus) {
      const result = await axios.post(
        `http://localhost:4000/courses/${props.courseId}?byUser=${contextState.user.user_id}`,
        {
          action: "subscribe",
        }
      );
      if (/successfully subscribed/g.test(result.data.message)) {
        // setSubscribeStatus from false to true
        props.setSubscribeStatus(!props.subscribeStatus);
        onClose();
      }
    }
    setIsButtonLoading(false);
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      ml="24px"
      w="357px"
      border="10px"
      p="5"
      shadow="md"
      borderRadius="8px"
      h="fit-content"
      gap="20px"
      position="sticky"
    >
      <Text color="orange.500">Courses</Text>
      <Text fontSize="24px" fontWeight="600" lineHeight="125%" color="black">
        {props.courseName}
      </Text>
      <Text variant="body2" w="309px">
        {props.courseContent}
      </Text>
      <Text fontSize="24px" fontWeight="600" lineHeight="125%" color="gray.700">
        THB{" "}
        {props.coursePrice.toLocaleString("en", { minimumFractionDigits: 2 })}
      </Text>
      <Divider borderColor="gray.300" />
      <Box display="flex" flexDirection="column" gap="16px" w="309px">
        {props.subscribeStatus ? (
          <Button
            variant="primary"
            onClick={() => navigate(`/courses/${props.courseId}/learning`)}
          >
            Start Learning
          </Button>
        ) : (
          <>
            <Button
              variant="secondary"
              isLoading={isButtonLoading}
              onClick={() => {
                if (!isAuthenticated) {
                  navigate("/login");
                } else {
                  handleAddCourse();
                }
              }}
            >
              {props.addStatus
                ? `Remove from Desired Course`
                : `Get In Desire Course`}
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                if (!isAuthenticated) {
                  navigate("/login");
                } else {
                  onOpen();
                }
              }}
            >
              Subscribe This Course
            </Button>
          </>
        )}
      </Box>
      <Modal
        isCentered
        isOpen={isOpen}
        onClose={onClose}
        closeOnOverlayClick={false}
        size="lg"
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
              Do you want to subscribe
            </Text>
            <Text
              variant="body2"
              color="gray.700"
              as="span"
              fontWeight="700"
              fontStyle="italic"
            >
              {` ${props.courseName} `}
            </Text>
            <Text variant="body2" color="gray.700" as="span">
              course?
            </Text>
            <Box mt="24px" width="600px">
              <Button variant="secondary" onClick={onClose}>
                No, I don't
              </Button>
              <Button
                ml="16px"
                isLoading={isButtonLoading}
                variant="primary"
                onClick={() => {
                  handleSubscribe();
                }}
              >
                Yes, I want to subscribe
              </Button>
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};
