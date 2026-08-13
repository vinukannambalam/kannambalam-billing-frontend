import { useState } from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import { Outlet } from "react-router-dom";

import AppHeader from "./AppHeader";
import AppSidebar from "./AppSidebar";

export default function AppLayout() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

    const handleOpenDrawer = () => {
        setMobileDrawerOpen(true);
    };

    const handleCloseDrawer = () => {
        setMobileDrawerOpen(false);
    };

    return (
        <Box
            sx={{
                display: "flex",
                minHeight: "100vh",
                width: "100%",
                overflowX: "hidden"
            }}
        >
            <AppHeader
                onMenuClick={handleOpenDrawer}
                isMobile={isMobile}
            />

            <AppSidebar
                mobileOpen={mobileDrawerOpen}
                onMobileClose={handleCloseDrawer}
                isMobile={isMobile}
            />

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    width: "100%",
                    marginTop: { xs: "56px", md: "64px" },
                    padding: { xs: 1.5, sm: 2, md: 3 },
                    backgroundColor: "#f5f5f5",
                    minHeight: {
                        xs: "calc(100vh - 56px)",
                        md: "calc(100vh - 64px)"
                    },
                    boxSizing: "border-box",
                    overflowX: "hidden"
                }}
            >
                <Outlet />
            </Box>
        </Box>
    );
}
