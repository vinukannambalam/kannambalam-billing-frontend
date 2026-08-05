import { Box, Toolbar } from "@mui/material";

import Header from "./Header";
import Sidebar from "./Sidebar";

import { Outlet } from "react-router-dom";

export default function Layout() {

    return (

        <Box sx={{ display: "flex" }}>

            <Header />

            <Sidebar />

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3
                }}
            >

                <Toolbar />

                <Outlet />

            </Box>

        </Box>

    );

}