import {
  Avatar,
  Link,
  Flex,
  Image,
  Button,
  HStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Text,
} from "@chakra-ui/react";
import React from "react";
import { TriangleDownIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/authentication";

export const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout, contextState } = useAuth();

  return (
    <Flex
      position="relative"
      wrap="wrap"
      width="full"
      h="88px"
      bg="white"
      boxShadow="shadow2"
      paddingLeft="160px"
      paddingRight="160px"
    >
      <Flex
        alignItems="center"
        justifyContent="space-between"
        flexDirection="row"
        w="100%"
      >
        <Image
          src="/assets/landing-page/bg/CourseFlow.svg"
          alt="logo"
          onClick={() => navigate("/")}
          cursor="pointer"
        />
        <Flex gridColumnGap="75px" align="center">
          <Link color="#191C77" onClick={() => navigate("/courses")}>
            Our Courses
          </Link>
          {isAuthenticated ? (
            <Menu>
              <MenuButton bg="white" color="gray.800">
                <HStack spacing="12px">
                  <Avatar
                    loading="lazy"
                    src={
                      contextState.user.avatar_directory
                        ? contextState.user.avatar_directory.url
                        : "assets/misc/user-icon.svg"
                    }
                  />
                  <Text variant="body2">{contextState.user.full_name}</Text>
                  <TriangleDownIcon />
                </HStack>
              </MenuButton>
              <MenuList>
                <MenuItem onClick={() => navigate("/profile")}>
                  <Image
                    borderRadius="full"
                    src="/assets/landing-page/Icon/Profile.svg"
                    alt="profile icon"
                    mr="12px"
                    w="15px"
                    h="15px"
                  />
                  Profile
                </MenuItem>
                <MenuItem onClick={() => navigate("/subscription")}>
                  <Image
                    borderRadius="full"
                    src="/assets/landing-page/Icon/My course.svg"
                    alt="book icon"
                    mr="13px"
                    w="15px"
                    h="15px"
                  />
                  My Courses
                </MenuItem>
                <MenuItem onClick={() => navigate("/homework")}>
                  <Image
                    borderRadius="full"
                    src="/assets/landing-page/Icon/Hw.svg"
                    alt="clipboard icon"
                    mr="13px"
                    w="15px"
                    h="15px"
                  />
                  My Homework
                </MenuItem>
                <MenuItem onClick={() => navigate("/desire")}>
                  <Image
                    borderRadius="full"
                    src="/assets/landing-page/Icon/Desire course.svg"
                    alt="star icon"
                    mr="13px"
                    w="15px"
                    h="15px"
                  />
                  My Desired Courses
                </MenuItem>
                <MenuDivider />
                <MenuItem
                  onClick={() => {
                    logout();
                  }}
                >
                  <Image
                    borderRadius="full"
                    src="/assets/landing-page/Icon/Logout.svg"
                    alt="logout icon"
                    mr="13px"
                    w="15px"
                    h="15px"
                  />
                  Log out
                </MenuItem>
              </MenuList>
            </Menu>
          ) : (
            <Button
              variant="primary"
              ml="20px"
              onClick={() => navigate("/login")}
            >
              Log in
            </Button>
          )}
        </Flex>
      </Flex>
    </Flex>
  );
};
