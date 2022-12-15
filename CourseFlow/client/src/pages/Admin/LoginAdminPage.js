import {
  Box,
  Flex,
  Text,
  Heading,
  Button,
  Input,
  Link,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Image,
  Center,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/authentication.js";
import { Field, Form, Formik } from "formik";

function LoginAdminPage() {
  const { loginAdmin } = useAuth();

  const handleSubmit = async (values, props) => {
    const result = await loginAdmin(values);
    props.setSubmitting(false);
    if (result) {
      if (/account/g.test(result)) {
        props.setFieldError("username", result);
      } else {
        props.setFieldError("password", result);
      }
    }
  };

  const validateUsername = (value) => {
    let error;
    if (!value) {
      error = "Username is required";
    }
    return error;
  };

  const validatePassword = (value) => {
    let error;
    if (!value) {
      error = "Password is required";
    }
    return error;
  };

  return (
    <Box
      w="100vw"
      h="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      bgGradient="linear(to-l, linear2.1,linear2.2)"
      backgroundSize="cover"
      backgroundPosition="center"
    >
      <Flex
        w="568px"
        h="568px"
        bg="white"
        shadow="shadow1"
        borderRadius="8px"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
      >
        <Flex
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
        >
          <Image src="/assets/login-admin-page/logo.svg" w="315px" h="36px" />
          <Heading color="gray.700" fontSize="24px" pt="24px">
            Admin Panel Control
          </Heading>
          <Formik
            initialValues={{ username: "", password: "" }}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Flex flexDirection="column" justifyContent="flex-start">
                <Form>
                  <Field name="username" validate={validateUsername}>
                    {({ field, form }) => (
                      <FormControl
                        isInvalid={
                          form.errors.username && form.touched.username
                        }
                      >
                        <FormLabel
                          variant="body2"
                          color="black"
                          pt="37px"
                          mb="0"
                        >
                          Username
                        </FormLabel>
                        <Input
                          mt="4px"
                          type="username"
                          w="453px"
                          h="48px"
                          placeholder="Enter Username"
                          {...field}
                        />
                        <FormErrorMessage>
                          {form.errors.username}
                        </FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>
                  <Field name="password" validate={validatePassword}>
                    {({ field, form }) => (
                      <FormControl
                        isInvalid={
                          form.errors.password && form.touched.password
                        }
                      >
                        <FormLabel
                          variant="body2"
                          color="black"
                          pt="40px"
                          mb="0px"
                        >
                          Password
                        </FormLabel>
                        <Input
                          mt="4px"
                          type="password"
                          w="453px"
                          h="48px"
                          placeholder="Enter Password"
                          {...field}
                        />
                        <FormErrorMessage>
                          {form.errors.password}
                        </FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>
                  <Button
                    isLoading={isSubmitting}
                    type="submit"
                    variant="primary"
                    mt="40px"
                    w="453px"
                    h="60px"
                  >
                    Log in
                  </Button>
                </Form>
              </Flex>
            )}
          </Formik>
        </Flex>
      </Flex>
    </Box>
  );
}

export default LoginAdminPage;
