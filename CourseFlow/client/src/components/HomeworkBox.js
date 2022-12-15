import {
  Flex,
  Box,
  Badge,
  Text,
  Heading,
  Button,
  Textarea,
  Link,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const HomeworkBox = (props) => {
  const navigate = useNavigate();
  const [answer, setAnswer] = useState({ answer: props.answer });
  let deadlineDate = new Date(props.acceptedDate);
  deadlineDate = new Date(
    deadlineDate.setDate(deadlineDate.getDate() + props.duration)
  ).toLocaleString("en-GB");

  // *- Change status badge color -* //
  const changeBadgeColor = (status) => {
    let badgeColor;
    switch (status) {
      case "submitted":
        badgeColor = "submitted";
        break;
      case "overdue":
        badgeColor = "overdue";
        break;
      case "in progress":
        badgeColor = "in progress";
        break;
      case "pending":
        badgeColor = "pending";
    }
    return badgeColor;
  };

  // *- Display days until deadline or not -* //
  const displayOrNot = (status) => {
    let display;
    switch (status) {
      case "submitted":
        display = "none";
        break;
      case "overdue":
        display = "none";
        break;
      case "in progress":
        display = "block";
        break;
      case "pending":
        display = "block";
        break;
    }
    return display;
  };

  const handleTextChange = (event) => {
    setAnswer({ answer: event.target.value });
  };

  return (
    <Box>
      <Flex
        flexDirection="column"
        w="1120px"
        padding="40px 96px"
        alignItems="center"
        mb="24px"
        backgroundColor="blue.100"
        borderRadius="8px"
      >
        <Flex w="925px" justify="space-between">
          <Flex flexDirection="column" w="700px" gap="12px">
            <Heading variant="headline3">Course: {props.courseName}</Heading>
            <Text variant="body2" textColor="gray.700">
              {props.lessonName}: {props.subLessonName}
            </Text>
          </Flex>
          <Flex flexDirection="column" alignItems="flex-end">
            <Badge
              variant={changeBadgeColor(props.status)}
              sx={{ textTransform: "capitalize" }}
            >
              <Text variant="body3">{props.status}</Text>
            </Badge>
            <Text
              mt="12px"
              variant="body2"
              textColor="gray.700"
              display={displayOrNot(props.status)}
            >
              {props.daysUntilDeadline === 0
                ? `Submit within today`
                : `Submit within ${props.daysUntilDeadline} ${props.dayOrDays}`}
            </Text>
            <Text
              variant="body3"
              textColor="gray.700"
              display={displayOrNot(props.status)}
            >
              Deadline: {deadlineDate}
            </Text>
          </Flex>
        </Flex>
        <Flex
          w="928px"
          mt="36px"
          backgroundColor="white"
          borderRadius="8px"
          p="24px"
          justify="space-between"
        >
          <Flex
            flexDirection="column"
            w="719px"
            gap="4px"
            alignItems="flex-start"
          >
            <Text variant="body2" textColor="black">
              {props.hwDetail}
            </Text>
            {/* Change text area depending on status */}
            {props.submittedDate ? (
              <Box w="719px" minH="100px">
                {props.answer}
              </Box>
            ) : (
              <Textarea
                w="719px"
                h="100%"
                placeholder="Answer here..."
                resize="none"
                textAlign="start"
                color="black"
                onChange={handleTextChange}
                defaultValue={props.answer}
              />
            )}
          </Flex>
          <Flex direction="column" w="137px" gap="6px" pt="2em">
            <Button
              onClick={() =>
                props.submitHomework(
                  props.assignmentId,
                  answer,
                  props.status,
                  props.courseId
                )
              }
              display={props.submittedDate ? "none" : "block"}
            >
              Submit
            </Button>
            <Button
              variant="save draft"
              onClick={() =>
                props.saveAnswerDraft(
                  props.assignmentId,
                  answer,
                  props.status,
                  props.courseId
                )
              }
              display={props.submittedDate ? "none" : "block"}
            >
              Save draft
            </Button>
            <Flex
              justify="center"
              align="center"
              h={props.submittedDate ? "100%" : "20%"}
            >
              <Link
                onClick={() =>
                  navigate(
                    `/courses/${props.courseId}/learning?subLessonId=${props.subLessonId}`
                  )
                }
              >
                Open in course
              </Link>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </Box>
  );
};

export default HomeworkBox;
