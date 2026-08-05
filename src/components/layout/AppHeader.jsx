import {
    AppBar,
    Toolbar,
    Typography,
    Avatar,
    Box
} from "@mui/material";

const drawerWidth = 250;

export default function Header() {

    return (

        <AppBar
            position="fixed"
            sx={{
                width: `calc(100% - ${drawerWidth}px)`,
                ml: `${drawerWidth}px`
            }}
        >

            <Toolbar>

                <Typography
                    variant="h6"
                    sx={{ flexGrow: 1 }}
                >
                    🛕 Kannambalam Temple Billing
                </Typography>

                <Box>

                    <Avatar>A</Avatar>

                </Box>

            </Toolbar>

        </AppBar>

    );

}