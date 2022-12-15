import { Box, Flex, Text, Image } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/authentication";

export function Sidebar({ selectedTab }) {
  const navigate = useNavigate();
  const { logoutAdmin } = useAuth();
  return (
    <Box>
      <Flex
        w="240px"
        bg="white"
        h="100vh"
        direction="column"
        borderRight="1px"
        borderColor="gray.400"
        justify="space-between"
      >
        {/* Top Section */}
        <Flex direction="column">
          {/* Logo Panel */}
          <Flex direction="column" align="center" mt="40px">
            <Image src="/assets/admin-page/CourseFlow.svg" w="174px" h="19px" />
            <Text variant="body2" mt="24px" mb="64px">
              Admin Panel Control
            </Text>
          </Flex>
          {/* Navigation Tabs */}
          <Flex direction="column" cursor="pointer">
            {/* First Tab */}
            <Flex
              align="center"
              w="100%"
              h="56px"
              _hover={{ bg: "#F6F7FC" }}
              _active={{ bg: "#F1F2F6" }}
              bg={selectedTab === 1 ? "#F1F2F6" : null}
              onClick={() => {
                navigate("/admin");
              }}
            >
              <Image src="/assets/admin-page/course.svg" ml="27px" mr="19px" />
              <Text variant="body2" fontWeight="500" color="gray.800">
                Courses
              </Text>
            </Flex>
            {/* Second Tab */}
            <Flex
              align="center"
              w="100%"
              h="56px"
              _hover={{ bg: "#F6F7FC" }}
              _active={{ bg: "#F1F2F6" }}
              bg={selectedTab === 2 ? "#F1F2F6" : null}
              onClick={() => {
                navigate("/admin/assignment");
              }}
            >
              <Image src="/assets/admin-page/assign.svg" ml="27px" mr="19px" />
              <Text variant="body2" fontWeight="500" color="gray.800">
                Assignments
              </Text>
            </Flex>
          </Flex>
        </Flex>
        {/* Bottom Section */}
        <Flex
          align="center"
          w="100%"
          h="56px"
          _hover={{ bg: "#F6F7FC" }}
          _active={{ bg: "#F1F2F6" }}
          onClick={() => {
            logoutAdmin();
          }}
          cursor="pointer"
        >
          <Image src="/assets/admin-page/Vector.svg" ml="27px" mr="19px" />
          <Text variant="body2" fontWeight="700" color="gray.800">
            Log Out
          </Text>
        </Flex>
      </Flex>
    </Box>
  );
}
