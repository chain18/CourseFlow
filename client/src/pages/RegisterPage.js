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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure,
} from "@chakra-ui/react";
import { CheckCircleIcon } from "@chakra-ui/icons";
import { Navbar } from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/authentication.js";
import { Field, Form, Formik } from "formik";
import TextField from "@mui/material/TextField";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "../configs/calendarStyle.js";
import CalendarIcon from "../components/CalendarIcon";

function RegisterPage() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { register } = useAuth();

  const navigate = useNavigate();

  const handleSubmit = async (values, props) => {
    const result = await register(values);
    props.setSubmitting(false);
    if (result !== true) {
      props.setFieldError("email", result);
    } else {
      onOpen();
    }
  };

  const validateName = (value) => {
    let error;
    if (!value) {
      error = "Name is required";
    } else if (!/^[a-z ,.'-]+$/i.test(value)) {
      error = `Name must only contain alphabets and some special characters (e.g., comma, dot, apostrophe, and hyphen)`;
    }
    return error;
  };

  const validateEmail = (value) => {
    let error;
    if (!value) {
      error = "Email is required";
    } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g.test(value)) {
      error = `Email should be in this form: "john@mail.com"`;
    }
    return error;
  };

  const validatePassword = (value) => {
    let error;
    if (!value) {
      error = "Password is required";
    } else if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(value)) {
      error = `Password must have minimum eight characters, at least one letter and one number`;
    }
    return error;
  };

  return (
    <Box
      w="100vw"
      h="120vh"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      bgImage="url('/assets/login-page/bg-login.svg')"
      backgroundSize="cover"
      backgroundPosition="center"
      backgroundRepeat="no-repeat"
    >
      <Navbar />
      <Flex
        pt="10%"
        pb="10%"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
      >
        <Flex
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
        >
          <Heading variant="headline2" color="blue.500">
            Register to start learning!
          </Heading>
          <Formik
            initialValues={{
              full_name: "",
              birthdate: null,
              education: "",
              email: "",
              password: "",
            }}
            onSubmit={handleSubmit}
          >
            {(props) => (
              <Flex
                flexDirection="column"
                justifyContent="flex-start"
                w="453px"
              >
                <Form>
                  {/* //------------------------- Input Name --------------------// */}
                  <Field name="full_name" validate={validateName}>
                    {({ field, form }) => (
                      <FormControl
                        isInvalid={
                          form.errors.full_name && form.touched.full_name
                        }
                        isRequired
                      >
                        <FormLabel variant="body2" color="black" mt="37px">
                          Name
                        </FormLabel>
                        <Input
                          type="text"
                          w="453px"
                          h="48px"
                          placeholder="Enter First Name and Last Name"
                          {...field}
                        />
                        <FormErrorMessage>
                          {form.errors.full_name}
                        </FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>

                  {/* //-------------------------- Input Date --------------------// */}
                  <Field name="birthdate">
                    {({ field, form }) => (
                      <FormControl>
                        <label>
                          <Text
                            variant="body2"
                            color="black"
                            m="40px 12px 8px 0px"
                          >
                            Date of Birth
                          </Text>
                          <ThemeProvider theme={theme}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                              <DatePicker
                                inputFormat="DD/MM/YYYY"
                                minDate="01/01/1900"
                                disableFuture
                                value={field.value}
                                onChange={(newValue) => {
                                  form.setFieldValue("birthdate", newValue);
                                }}
                                components={{
                                  OpenPickerIcon: CalendarIcon,
                                }}
                                PopperProps={{
                                  placement: "bottom-end",
                                }}
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    inputProps={{
                                      ...params.inputProps,
                                      placeholder: "DD/MM/YYYY",
                                    }}
                                    sx={{
                                      "& .MuiInputBase-root": {
                                        borderRadius: "8px",
                                        backgroundColor: "white",
                                        width: "453px",
                                        height: "48px",
                                        color: "black",
                                        "input:first-of-type": {
                                          "&::placeholder": {
                                            opacity: 1,
                                            color: "color.gray.600",
                                          },
                                        },
                                      },
                                      "& .MuiInputBase-input": {
                                        padding: "12px 0 12px 12px",
                                      },
                                      "& .MuiOutlinedInput-root": {
                                        paddingRight: "20px",
                                        "& fieldset": {
                                          borderColor: "color.gray.400",
                                        },
                                        "&:hover fieldset": {
                                          borderColor: "color.gray.400",
                                        },
                                        "&.Mui-focused fieldset": {
                                          border: "solid 1px",
                                          borderColor: "color.orange.500",
                                        },
                                      },
                                    }}
                                  />
                                )}
                              />
                            </LocalizationProvider>
                          </ThemeProvider>
                        </label>
                      </FormControl>
                    )}
                  </Field>
                  {/* //---------------------- Input Educational --------------------// */}
                  <Field name="education">
                    {({ field, form }) => (
                      <FormControl>
                        <FormLabel variant="body2" color="black" mt="40px">
                          Educational Background
                        </FormLabel>
                        <Input
                          type="text"
                          w="453px"
                          h="48px"
                          placeholder="Enter Educational Background"
                          {...field}
                        />
                      </FormControl>
                    )}
                  </Field>
                  {/* //------------------------- Input Email --------------------// */}
                  <Field name="email" validate={validateEmail}>
                    {({ field, form }) => (
                      <FormControl
                        isInvalid={form.errors.email && form.touched.email}
                        isRequired
                      >
                        <FormLabel variant="body2" color="black" mt="40px">
                          Email
                        </FormLabel>
                        <Input
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
                  {/* //------------------------- Input Password --------------------// */}
                  <Field name="password" validate={validatePassword}>
                    {({ field, form }) => (
                      <FormControl
                        isInvalid={
                          form.errors.password && form.touched.password
                        }
                        isRequired
                      >
                        <FormLabel variant="body2" color="black" mt="40px">
                          Password
                        </FormLabel>
                        <Input
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
                  {/* //------------------------- Register Button --------------------// */}
                  <Button
                    isLoading={props.isSubmitting}
                    variant="primary"
                    mt="40px"
                    w="453px"
                    h="60px"
                    type="submit"
                  >
                    Register
                  </Button>
                </Form>
                <Text as="b" mt="44px">
                  Already have an account?
                  <Link ml="12px" onClick={() => navigate("/login")}>
                    Log in
                  </Link>
                </Text>
              </Flex>
            )}
          </Formik>
        </Flex>
      </Flex>
      <Modal
        isCentered
        isOpen={isOpen}
        onClose={onClose}
        onCloseComplete={() => navigate("/login")}
        closeOnOverlayClick={false}
        preserveScrollBarGap
      >
        <ModalOverlay />
        <ModalContent borderRadius="24px">
          <ModalHeader
            bg="blue.500"
            color="white"
            textAlign="center"
            borderRadius="24px 24px 0px 0px"
            fontSize="1.5rem"
          >
            <CheckCircleIcon mr="0.5em" />
            Success
          </ModalHeader>
          <ModalBody textAlign="center" mt="1em" color="black" fontSize="1rem">
            Your account has been successfully created.
            <Button m="1em" variant="success" mr={3} onClick={onClose}>
              Continue
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default RegisterPage;
