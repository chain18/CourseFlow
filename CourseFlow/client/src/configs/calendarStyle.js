import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    color: {
      gray: {
        400: "#D6D9E4",
        600: "#9AA1B9",
        800: "#424C6B",
      },
      orange: {
        500: "#F47E20",
      },
    },
    text: {
      primary: "#173A5E",
      secondary: "#46505A",
    },
    action: {
      active: "#001E3C",
    },
  },
  components: {
    MuiCalendarPicker: {
      styleOverrides: {
        root: {
          width: "258px",
          height: "300px",
          margin: 0,
          overflowY: "hidden",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          width: "258px",
          height: "300px",
          boxShadow: "2px 2px 12px rgba(64, 50, 133, 0.12)",
        },
      },
    },
    MuiPickersCalendarHeader: {
      styleOverrides: {
        root: {
          color: "#424C6B",
        },
        labelContainer: {
          fontWeight: 600,
          fontSize: "14px",
        },
      },
    },
    MuiPickersDay: {
      styleOverrides: {
        today: {
          "&:not(.Mui-selected)": {
            border: "1px solid #5483D0",
          },
        },
        root: {
          fontSize: "14px",
          color: "#424C6B",
          fontWeight: 500,
          width: "32px",
          height: "32px",
        },
      },
    },
    MuiTouchRipple: {
      styleOverrides: {
        root: {
          fontSize: "30px",
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          fontSize: "14px",
          fontWeight: 500,
          "&&": { color: "#9AA1B9", width: "32px", height: "32px" },
        },
      },
    },
    MuiDayPicker: {
      styleOverrides: {
        header: {
          width: "256px",
        },
        slideTransition: {
          width: "256px",
        },
      },
    },
    MuiPickersArrowSwitcher: {
      styleOverrides: {
        spacer: {
          width: "6px",
        },
      },
    },
    PrivatePickersYear: {
      styleOverrides: {
        button: {
          fontSize: "14px",
          color: "#424C6B",
          "&:disabled": {
            color: "rgba(0, 0, 0, 0.38)",
            "&:hover": {
              backgroundColor: "white",
              cursor: "context-menu",
            },
          },
        },
      },
    },
  },
});
