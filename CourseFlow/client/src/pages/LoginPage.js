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
} from "@chakra-ui/react";
import { Navbar } from "../components/Navbar.js";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/authentication.js";
import { Field, Form, Formik } from "formik";

function LoginPage() {
  const { login } = useAuth();

  const handleSubmit = async (values, props) => {
    const result = await login(values);
    props.setSubmitting(false);
    if (result) {
      if (/account/g.test(result)) {
        props.setFieldError("email", result);
      } else {
        props.setFieldError("password", result);
      }
    }
  };

  const validateEmail = (value) => {
    let error;
    if (!value) {
      error = "Email is required";
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

  const navigate = useNavigate();

  return (
    <Box
      w="100vw"
      h="1000px"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      bgImage="url('/assets/login-page/bg-login.svg')"
      backgroundSize="cover"
      backgroundPosition="center"
    >
      <Navbar />
      <Flex
        pt="12%"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
      >
        <Flex flexDirection="column" alignItems="start" justifyContent="center">
          <Heading variant="headline2" color="#22269E">
            Welcome Back!
          </Heading>
          <Formik
            initialValues={{ email: "", password: "" }}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Flex flexDirection="column" justifyContent="flex-start">
                <Form>
                  <Field name="email" validate={validateEmail}>
                    {({ field, form }) => (
                      <FormControl
                        isInvalid={form.errors.email && form.touched.email}
                      >
                        <FormLabel
                          variant="body2"
                          color="black"
                          pt="37px"
                          mb="0"
                        >
                          Email
                        </FormLabel>
                        <Input
                          mt="4px"
                          type="email"
                          w="453px"
                          h="48px"
                          placeholder="Enter Email"
                          {...field}
                        />
                        <FormErrorMessage>{form.errors.email}</FormErrorMessage>
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
                <Text as="b" mt="44px">
                  Don't have an account?
                  <Link pl="12px" onClick={() => navigate("/register")}>
                    Register
                  </Link>
                </Text>
              </Flex>
            )}
          </Formik>
        </Flex>
      </Flex>
    </Box>
  );
}

export default LoginPage;
