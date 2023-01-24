import React from "react";
import { Box, Flex, Text, Heading, Avatar } from "@chakra-ui/react";
import { useAuth } from "../contexts/authentication.js";

export function UserCourseCard({ coursesCount }) {
  const { contextState } = useAuth();

  return (
    <Box
      h="fit-content"
      w="357px"
      boxShadow="shadow1"
      borderRadius="8px"
      mx="24px"
      mt="24px"
      overflow="hidden"
      mb="24px"
      bg="white"
      align="center"
    >
      <Box w="357px" mt="32px">
        <Avatar
          src={
            contextState.user.avatar_directory
              ? contextState.user.avatar_directory.url
              : "assets/misc/user-icon.svg"
          }
          w="120px"
          h="120px"
        />
        <Heading variant="headline3" color="gray.800" mt="24px">
          {contextState.user.full_name}
        </Heading>
      </Box>
      <Box
        display="flex"
        justifyContent="space-between"
        pb="36px"
        pr="24px"
        pl="24px"
        pt="24px"
      >
        <Flex
          backgroundColor="gray.200"
          flexDirection="column"
          h="142px"
          w="134px"
          boxShadow="shadow1"
          borderRadius="8px"
          gap="24px"
          p="16px"
          alignItems="start"
          _hover={{
            border: "solid 1px",
            borderColor: "blue.200",
          }}
        >
          <Text textAlign="start" variant="body2">
            Course In progress
          </Text>
          <Heading variant="headline3">
            {Boolean(coursesCount["in progress"])
              ? coursesCount["in progress"]
              : "0"}
          </Heading>
        </Flex>
        <Flex
          backgroundColor="gray.200"
          flexDirection="column"
          h="142px"
          w="134px"
          boxShadow="shadow1"
          borderRadius="8px"
          gap="24px"
          p="16px"
          alignItems="start"
          _hover={{
            border: "solid 1px",
            borderColor: "blue.200",
          }}
        >
          <Text textAlign="start" variant="body2" w="110px">
            Course Complete
          </Text>
          <Heading variant="headline3">
            {Boolean(coursesCount["completed"])
              ? coursesCount["completed"]
              : "0"}
          </Heading>
        </Flex>
      </Box>
    </Box>
  );
}
