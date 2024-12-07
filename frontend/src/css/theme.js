import { createTheme } from "@mui/material/styles";

const theme = createTheme({
    palette: {
        primary: {
            main: "#001f54", // Dark blue
        },
        secondary: {
            main: "#003f88", // Lighter blue
        },
        background: {
            default: "#001f54", // Dark blue background
            paper: "#003161", // Lighter blue for sidebar and cards
        },
        text: {
            primary: "#ffffff", // White text
            secondary: "#a0c4ff", // Light blue text
        },
    },
    typography: {
        fontFamily: "Arial, sans-serif",
    },
});

export default theme;
