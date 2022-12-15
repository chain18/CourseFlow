import {
  Flex,
  Heading,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
  Image,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const AdminNavbar = (props) => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    setSearchText(
      Boolean(props.searchParams.get("search"))
        ? props.searchParams.get("search")
        : ""
    );
  }, [props.searchParams.get("search")]);

  return (
    <Flex
      w="100%"
      h="92px"
      bg="white"
      justify="space-between"
      align="center"
      px="40px"
      borderBottom="1px"
      borderColor="gray.400"
    >
      <Heading variant="headline3">{props.heading}</Heading>
      <Flex align="center">
        <Flex mr="16px">
          <InputGroup>
            <InputLeftElement
              // pointerEvents="none"
              cursor="pointer"
              onClick={() => {
                if (Boolean(searchText)) {
                  navigate(`.?search=${searchText}`);
                } else {
                  navigate(".");
                }
              }}
              children={
                <Image src="../../assets/admin-page/search.svg" alt="search" />
              }
            />
            <Input
              pl="40px"
              w="320px"
              type="text"
              placeholder="Search..."
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
          </InputGroup>
        </Flex>
        <Button onClick={() => navigate(`./${props.url}`)}>
          {props.action}
        </Button>
      </Flex>
    </Flex>
  );
};

export default AdminNavbar;
