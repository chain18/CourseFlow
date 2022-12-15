import { Navbar } from "../components/Navbar.js";
import { Footer } from "../components/Footer";
import { CourseCard } from "../components/CourseCard";
import { SearchIcon } from "@chakra-ui/icons";
import { Pagination } from "antd";
import "antd/dist/antd.min.css";
import { useEffect, useState } from "react";
import {
  Box,
  Image,
  Flex,
  Text,
  Heading,
  Input,
  InputLeftElement,
  InputGroup,
  Center,
  Spinner,
} from "@chakra-ui/react";
import useCourses from "../hooks/useCourses";
import { useNavigate, useSearchParams } from "react-router-dom";

function OurCourses() {
  const [searchText, setSearchText] = useState("");
  const { getCourses, courses, isLoading } = useCourses();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    /* Set state to initialize input (search) field value */
    setSearchText(
      Boolean(searchParams.get("search")) ? searchParams.get("search") : ""
    );
    getCourses(searchParams.get("search"), searchParams.get("page"));
  }, [searchParams.get("search"), searchParams.get("page")]);

  const paginate = (pageNumber) => {
    if (searchParams.get("search")) {
      navigate(`.?search=${searchParams.get("search")}&page=${pageNumber}`);
    } else {
      navigate(`.?page=${pageNumber}`);
    }
    window.scrollTo(0, 150);
  };

  return (
    <Box>
      <Navbar />
      <Box>
        <Image w="100%" src="/assets/courseCard/bgOc.svg" position="relative" />

        <Flex flexDirection="column" alignItems="center" mt="-100">
          <Heading variant="headline2" mb="60px">
            Our Courses
          </Heading>
          <Box mb="100px">
            <InputGroup w="357px">
              <Input
                type="text"
                placeholder="Search..."
                pl="40px"
                onChange={(event) => {
                  setSearchText(event.target.value);
                }}
                onKeyPress={(event) => {
                  if (event.key === "Enter") {
                    if (Boolean(event.target.value)) {
                      navigate(`.?search=${event.target.value}`);
                    } else {
                      navigate(".");
                    }
                  }
                }}
                value={searchText}
              />
              <InputLeftElement
                pointerEvents="none"
                children={<SearchIcon color="#646D89" />}
              />
            </InputGroup>
          </Box>
        </Flex>
      </Box>

      <Center>
        {isLoading ? (
          <Spinner
            thickness="4px"
            speed="0.65s"
            emptyColor="gray.200"
            color="blue.500"
            size="xl"
            mb="17%"
          />
        ) : !Object.keys(courses).length > 0 ? null : courses.data.length >
          0 ? (
          <Flex
            ml="7.5%"
            flexDirection="row"
            justifyContent="flex-start"
            alignItems="center"
            mb="180px"
            flexWrap="wrap"
            w="100vw"
          >
            {courses.data.map((course, key) => {
              return (
                <CourseCard
                  key={key}
                  courseTitle={course.course_name}
                  courseSummary={course.summary}
                  courseNumLessons={course.lessons_count}
                  courseTime={course.learning_time}
                  courseImg={course.cover_image_directory}
                  courseId={course.course_id}
                />
              );
            })}
          </Flex>
        ) : (
          <Text as="i" color="black" mb="17%">
            Course not found
          </Text>
        )}
      </Center>
      <Center mb="20">
        <Pagination
          total={courses.count}
          current={Number(searchParams.get("page")) || 1}
          pageSize={12}
          onChange={paginate}
          showSizeChanger={false}
          hideOnSinglePage={Number(courses.count) === 0 ? true : false}
        />
      </Center>
      <Footer />
    </Box>
  );
}

export default OurCourses;
