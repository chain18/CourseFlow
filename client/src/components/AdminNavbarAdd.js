import { Flex, Heading, Button } from "@chakra-ui/react";

const AdminNavbarAdd = (props) => {
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
      <Flex>
        <Button variant="secondary" mr="16px">
          {props.action}
        </Button>
        <Button variant="primary" type={props.formAction}>
          {props.action2}
        </Button>
      </Flex>
    </Flex>
  );
};

export default AdminNavbarAdd;
