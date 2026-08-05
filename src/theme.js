import { createTheme } from "@mui/material/styles";

const theme = createTheme({

    palette: {

        primary: {
            main: "#800000"
        },

        secondary: {
            main: "#D4AF37"
        },

        background: {
            default: "#f5f5f5"
        }

    },

    typography: {

        fontFamily: "Roboto, Arial, sans-serif",

        h5: {
            fontWeight: 600
        }

    }

});

export default theme;