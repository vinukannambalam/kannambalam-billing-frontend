import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";

import AppHeader from "./AppHeader";
import AppSidebar from "./AppSidebar";

export default function AppLayout() {

    return (

        <Box
            sx={{
                display: "flex",
                minHeight: "100vh"
            }}
        >

            <AppHeader />

            <AppSidebar />

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    marginTop: "64px",
                    padding: 3,
                    backgroundColor: "#f5f5f5",
                    minHeight: "calc(100vh - 64px)",
                    boxSizing: "border-box"
                }}
            >

                <Outlet />

            </Box>

        </Box>

    );

}