import { extendTheme } from "@chakra-ui/react";

const colors = {
  blue: {
    100: "#E5ECF8",
    200: "#C6D6EF",
    300: "#8DADE0",
    400: "#5483D0",
    500: "#2F5FAC",
    600: "#234781",
    700: "#183056",
    800: "#0C182B",
    900: "#020D1E",
  },
  gray: {
    100: "#F6F7FC",
    200: "#F1F2F6",
    300: "#E4E6ED",
    400: "#D6D9E4",
    500: "#C8CCDB",
    600: "#9AA1B9",
    700: "#646D89",
    800: "#424C6B",
    900: "#2A2E3F",
  },
  orange: {
    100: "#FBAA1C",
    500: "#F47E20",
  },
  black: "#000000",
  white: "#FFFFFF",
  green: "#2FAC8E",
  purple: "#9B2FAC",
  linear1: {
    1: "#95BEFF",
    2: "#0040E5",
  },
  linear2: {
    1: "#5697FF",
    2: "#2558DD",
  },
};

const shadows = {
  shadow1: "4px 4px 24px rgba(0, 0, 0, 0.08)",
  shadow2: "2px 2px 12px rgba(64, 50, 133, 0.12)",
};

const fonts = {
  heading: `"Inter", sans-serif`,
  body: `"Inter", sans-serif`,
};

const components = {
  Heading: {
    variants: {
      headline1: {
        fontSize: "66px",
        lineHeight: `${1.25 * 66}px`,
        fontWeight: 500,
      },
      headline2: {
        fontSize: "36px",
        lineHeight: `${1.25 * 36}px`,
        fontWeight: 500,
      },
      headline3: {
        fontSize: "24px",
        lineHeight: `${1.25 * 24}px`,
        fontWeight: 500,
      },
    },
  },
  Text: {
    variants: {
      body1: {
        fontSize: "20px",
        lineHeight: `${1.5 * 20}px`,
        fontWeight: 400,
      },
      body2: {
        fontSize: "16px",
        lineHeight: `${1.5 * 16}px`,
        fontWeight: 400,
      },
      body3: {
        fontSize: "14px",
        lineHeight: `${1.5 * 14}px`,
        fontWeight: 400,
      },
      body4: {
        fontSize: "12px",
        lineHeight: `${1.5 * 12}px`,
        fontWeight: 400,
      },
      "add-more-files": {
        bg: "white",
        color: "blue.500",
        boxShadow: "shadow1",
        borderRadius: "full",
        border: "1px solid",
        borderColor: "blue.500",
        fontSizes: "14px",
        fontWeight: 700,
        lineHeight: `${1.5 * 16}px`,
        padding: "5px 10px",
        _hover: {
          color: "blue.300",
          borderColor: "blue.300",
          _disabled: {
            bg: "white",
            color: "gray.500",
            borderColor: "gray.500",
            opacity: 1,
          },
        },
        _active: {
          bg: "gray.100",
          color: "blue.500",
          borderColor: "blue.500",
        },
        _disabled: {
          bg: "white",
          color: "gray.500",
          borderColor: "gray.500",
          opacity: 1,
        },
      },
    },
  },
  FormLabel: {
    variants: {
      body1: {
        fontSize: "20px",
        lineHeight: `${1.5 * 20}px`,
        fontWeight: 400,
      },
      body2: {
        fontSize: "16px",
        lineHeight: `${1.5 * 16}px`,
        fontWeight: 400,
      },
      body3: {
        fontSize: "14px",
        lineHeight: `${1.5 * 14}px`,
        fontWeight: 400,
      },
      body4: {
        fontSize: "12px",
        lineHeight: `${1.5 * 12}px`,
        fontWeight: 400,
      },
    },
  },
  Button: {
    variants: {
      primary: {
        bg: "blue.500",
        color: "white",
        boxShadow: "shadow1",
        borderRadius: "12px",
        height: "60px",
        fontSizes: "16px",
        fontWeight: 700,
        lineHeight: `${1.5 * 16}px`,
        padding: "18px 32px",
        _hover: {
          bg: "blue.400",
          _disabled: {
            color: "gray.600",
            bg: "gray.400",
            opacity: 1,
          },
        },
        _active: {
          bg: "blue.700",
        },
        _disabled: {
          color: "gray.600",
          bg: "gray.400",
          opacity: 1,
        },
      },
      secondary: {
        bg: "white",
        color: "orange.500",
        boxShadow: "shadow1",
        borderRadius: "12px",
        border: "1px solid",
        borderColor: "orange.500",
        height: "60px",
        fontSizes: "16px",
        fontWeight: 700,
        lineHeight: `${1.5 * 16}px`,
        padding: "18px 32px",
        _hover: {
          color: "orange.100",
          borderColor: "orange.100",
          _disabled: {
            bg: "white",
            color: "gray.500",
            borderColor: "gray.500",
            opacity: 1,
          },
        },
        _active: {
          bg: "gray.100",
          color: "orange.500",
          borderColor: "orange.500",
        },
        _disabled: {
          bg: "white",
          color: "gray.500",
          borderColor: "gray.500",
          opacity: 1,
        },
      },
      gray: {
        bg: "white",
        color: "gray.900",
        height: "60px",
        fontSizes: "16px",
        fontWeight: 700,
        lineHeight: `${1.5 * 16}px`,
        padding: "18px 32px",
        _hover: {
          bg: "gray.100",
          _disabled: {
            color: "gray.600",
            bg: "gray.400",
            opacity: 1,
          },
        },
        _active: {
          bg: "gray.200",
        },
        _disabled: {
          color: "gray.600",
          bg: "gray.400",
          opacity: 1,
        },
      },
      success: {
        bg: "blue.500",
        borderColor: "blue.500",
        color: "white",
        boxShadow: "shadow1",
        borderRadius: "12px",
        height: "60px",
        fontSizes: "16px",
        fontWeight: 700,
        lineHeight: `${1.5 * 16}px`,
        padding: "18px 32px",
        _hover: {
          opacity: 0.5,
        },
        _active: {
          opacity: 1,
        },
      },
      "save draft": {
        bg: "white",
        color: "blue.500",
        boxShadow: "shadow1",
        borderRadius: "12px",
        border: "1px solid",
        borderColor: "blue.500",
        height: "60px",
        fontSizes: "16px",
        fontWeight: 700,
        lineHeight: `${1.5 * 16}px`,
        padding: "18px 32px",
        _hover: {
          color: "blue.300",
          borderColor: "blue.300",
          _disabled: {
            bg: "white",
            color: "gray.500",
            borderColor: "gray.500",
            opacity: 1,
          },
        },
        _active: {
          bg: "gray.100",
          color: "blue.500",
          borderColor: "blue.500",
        },
        _disabled: {
          bg: "white",
          color: "gray.500",
          borderColor: "gray.500",
          opacity: 1,
        },
      },
      error: {
        bg: "#E53E3E",
        color: "white",
        boxShadow: "shadow1",
        borderRadius: "12px",
        height: "60px",
        fontSizes: "16px",
        fontWeight: 700,
        lineHeight: `${1.5 * 16}px`,
        padding: "18px 32px",
        _hover: {
          bg: "#fd4545",
          _disabled: {
            color: "gray.600",
            bg: "gray.400",
            opacity: 1,
          },
        },
        _active: {
          bg: "#b63535",
        },
        _disabled: {
          color: "gray.600",
          bg: "gray.400",
          opacity: 1,
        },
      },
    },
    defaultProps: {
      variant: "primary",
    },
  },
  Input: {
    variants: {
      default: {
        field: {
          border: "1px solid",
          borderColor: "gray.400",
          borderRadius: "8px",
          p: "12px 16px 12px 12px",
          bg: "white",
          color: "black",
          fontSize: "16px",
          fontWeight: 400,
          lineHeight: "normal",
          _placeholder: {
            color: "gray.600",
          },
          _focus: {
            borderColor: "orange.500",
          },
          _invalid: {
            color: "black",
            pr: "5%",
            borderColor: "purple",
            backgroundImage: "url('/assets/misc/warning-icon.svg')",
            backgroundPosition: "95% 52.5%",
            backgroundRepeat: "no-repeat",
          },
          _disabled: {
            color: "gray.600",
            bg: "gray.200",
            borderColor: "gray.400",
            opacity: 1,
          },
        },
      },
    },
    defaultProps: {
      variant: "default",
    },
  },
  Select: {
    variants: {
      default: {
        field: {
          border: "1px solid",
          borderColor: "gray.400",
          borderRadius: "8px",
          bg: "white",
          color: "black",
          fontSize: "16px",
          fontWeight: 400,
          lineHeight: "normal",
          _focus: {
            borderColor: "orange.500",
          },
          _invalid: {
            pr: "5%",
            borderColor: "purple",
            backgroundImage: "url('/assets/misc/warning-icon.svg')",
            backgroundPosition: "92.5% 52.5%",
            backgroundRepeat: "no-repeat",
          },
          _disabled: {
            color: "gray.600",
            bg: "gray.200",
            borderColor: "gray.400",
            opacity: 1,
          },
        },
      },
    },
    defaultProps: {
      variant: "default",
    },
  },
  Textarea: {
    variants: {
      default: {
        border: "1px solid",
        borderColor: "gray.400",
        borderRadius: "8px",
        p: "12px 30px 12px 12px",
        bg: "white",
        color: "black",
        fontSize: "16px",
        fontWeight: 400,
        lineHeight: "normal",
        _placeholder: {
          color: "gray.600",
        },
        _focus: {
          borderColor: "orange.500",
        },
        _invalid: {
          color: "black",
          pr: "5%",
          borderColor: "purple",
          backgroundImage: "url('/assets/misc/warning-icon.svg')",
          backgroundPosition: "97.5% 52.5%",
          backgroundRepeat: "no-repeat",
          backgroundSize: "25px",
        },
        _disabled: {
          color: "gray.600",
          bg: "gray.200",
          borderColor: "gray.400",
          opacity: 1,
        },
      },
    },
    defaultProps: {
      variant: "default",
    },
  },
  NumberInput: {
    variants: {
      default: {
        field: {
          border: "1px solid",
          borderColor: "gray.400",
          borderRadius: "8px",
          p: "12px 16px 12px 12px",
          bg: "white",
          color: "black",
          fontSize: "16px",
          fontWeight: 400,
          lineHeight: "normal",
          _placeholder: {
            color: "gray.600",
          },
          _focus: {
            borderColor: "orange.500",
          },
          _invalid: {
            color: "black",
            pr: "5%",
            borderColor: "purple",
            backgroundImage: "url('/assets/misc/warning-icon.svg')",
            backgroundPosition: "92.5% 52.5%",
            backgroundRepeat: "no-repeat",
          },
          _disabled: {
            color: "gray.600",
            bg: "gray.200",
            borderColor: "gray.400",
            opacity: 1,
          },
        },
      },
    },
    defaultProps: {
      variant: "default",
    },
  },
  Link: {
    variants: {
      default: {
        fontSize: "16px",
        lineHeight: `${1.5 * 16}px`,
        fontWeight: 700,
        color: "blue.500",
        _hover: {
          color: "blue.400",
          textDecoration: "none",
        },
        _active: {
          color: "blue.600",
        },
        _disabled: {
          color: "gray.500",
        },
      },
    },
    defaultProps: {
      variant: "default",
    },
  },
  Badge: {
    variants: {
      submitted: {
        color: "#0A7B60",
        backgroundColor: "#DDF9EF",
        fontSize: "14px",
        fontWight: 500,
        lineHeight: "150%",
        padding: "4px 8px 4px 8px",
      },
      overdue: {
        color: "#9B2FAC",
        backgroundColor: "#FAE7F4",
        fontSize: "14px",
        fontWight: 500,
        lineHeight: "150%",
        padding: "4px 8px 4px 8px",
      },
      pending: {
        color: "#996500",
        backgroundColor: "#FFFBDB",
        fontSize: "14px",
        fontWight: 500,
        lineHeight: "150%",
        padding: "4px 8px 4px 8px",
      },
      "in progress": {
        color: "#3557CF",
        backgroundColor: "#EBF0FF",
        fontSize: "14px",
        fontWight: 500,
        lineHeight: "150%",
        padding: "4px 8px 4px 8px",
      },
    },
  },
};

const theme = extendTheme({ colors, shadows, fonts, components });

export default theme;
