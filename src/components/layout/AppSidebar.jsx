import { useState } from "react";

import {
    Drawer,
    Toolbar,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Box,
    Collapse
} from "@mui/material";

import { NavLink } from "react-router-dom";

import DashboardIcon from "@mui/icons-material/Dashboard";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";

import PeopleIcon from "@mui/icons-material/People";
import CategoryIcon from "@mui/icons-material/Category";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import PaymentsIcon from "@mui/icons-material/Payments";

import AssessmentIcon from "@mui/icons-material/Assessment";

import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import SettingsIcon from "@mui/icons-material/Settings";

import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";


const drawerWidth = 250;


// ==================================================
// COLORS
// ==================================================

const colors = {

    headingText: "#8B0000",

    headingBackground: "#FFF3F3",

    headingHover: "#FFE3E3",

    activeBackground: "#8B0000",

    activeText: "#FFFFFF",

    normalText: "#263238",

    iconColor: "#8B0000"

};


// ==================================================
// SIDEBAR
// ==================================================

export default function AppSidebar({
    mobileOpen = false,
    onMobileClose = () => {},
    isMobile = false
}) {


    // ==================================================
    // GET CURRENT LOGGED-IN USER
    // ==================================================

    const storedUser =
        localStorage.getItem("billing_user");

    let user = null;

    try {

        user = storedUser
            ? JSON.parse(storedUser)
            : null;

    }
    catch (error) {

        console.error(
            "Unable to read logged-in user:",
            error
        );

        user = null;

    }


    // ==================================================
    // ADMIN CHECK
    // ==================================================

    const userRole =
        String(user?.role || "")
            .trim()
            .toLowerCase();

    const isAdmin =
    userRole === "admin" ||
    userRole === "administrator";


    // ==================================================
    // COLLAPSE STATE
    // ==================================================

    const [billingOpen, setBillingOpen] =
        useState(true);

    const [mastersOpen, setMastersOpen] =
        useState(true);

    const [reportsOpen, setReportsOpen] =
        useState(true);

    const [administrationOpen, setAdministrationOpen] =
        useState(true);


    // ==================================================
    // MENU ITEM STYLE
    // ==================================================

    const menuItemStyle = {

        minHeight: 46,

        px: 2,

        mx: 1,

        mb: 0.5,

        borderRadius: 1.5,

        color: colors.normalText,

        transition: "all 0.2s ease",

        "& .MuiListItemIcon-root": {

            minWidth: 38,

            color: colors.iconColor

        },

        "&:hover": {

            backgroundColor: "#FFF0F0",

            color: colors.headingText

        },

        "&.active": {

            backgroundColor:
                colors.activeBackground,

            color:
                colors.activeText,

            fontWeight: 600,

            "& .MuiListItemIcon-root": {

                color:
                    colors.activeText

            }

        }

    };


    // ==================================================
    // SECTION HEADING STYLE
    // ==================================================

    const sectionHeadingStyle = {

        minHeight: 44,

        mx: 1,

        my: 0.8,

        px: 1.5,

        borderRadius: 1.5,

        backgroundColor:
            colors.headingBackground,

        color:
            colors.headingText,

        fontWeight: 700,

        transition: "all 0.2s ease",

        "&:hover": {

            backgroundColor:
                colors.headingHover

        }

    };


    return (

        <Drawer
            variant={isMobile ? "temporary" : "permanent"}
            open={isMobile ? mobileOpen : true}
            onClose={onMobileClose}
            ModalProps={{
                keepMounted: true
            }}
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                display: { xs: "block", md: "block" },
                "& .MuiDrawer-paper": {
                    width: drawerWidth,
                    boxSizing: "border-box",
                    borderRight: "1px solid #e0e0e0",
                    backgroundColor: "#FFFFFF",
                    overflowX: "hidden"
                }
            }}
        >

            {/* ==================================================
                TOP SPACE
            ================================================== */}

            <Toolbar />


            <Box
                sx={{
                    py: 1
                }}
            >

                <List
                    disablePadding
                >


                    {/* ==================================================
                        DASHBOARD
                    ================================================== */}

                    <ListItemButton
                        component={NavLink}
                        onClick={onMobileClose}
                        to="/"
                        end
                        sx={menuItemStyle}
                    >

                        <ListItemIcon>

                            <DashboardIcon />

                        </ListItemIcon>


                        <ListItemText
                            primary="Dashboard"
                            primaryTypographyProps={{
                                fontSize: 15,
                                fontWeight: 500
                            }}
                        />

                    </ListItemButton>


                    {/* ==================================================
                        BILLING
                    ================================================== */}

                    <ListItemButton
                        onClick={() =>
                            setBillingOpen(
                                !billingOpen
                            )
                        }
                        sx={sectionHeadingStyle}
                    >

                        <ListItemIcon
                            sx={{
                                minWidth: 38,
                                color:
                                    colors.headingText
                            }}
                        >

                            <ReceiptLongIcon />

                        </ListItemIcon>


                        <ListItemText
                            primary="Billing"
                            primaryTypographyProps={{
                                fontWeight: 700
                            }}
                        />


                        {billingOpen ? (

                            <ExpandLessIcon />

                        ) : (

                            <ExpandMoreIcon />

                        )}

                    </ListItemButton>


                    <Collapse
                        in={billingOpen}
                        timeout="auto"
                        unmountOnExit
                    >

                        <List
                            disablePadding
                        >

                            <ListItemButton
                                component={NavLink}
                                onClick={onMobileClose}
                                to="/billing/new"
                                sx={{

                                    ...menuItemStyle,
                                    ml: 2,
                                    mr: 1
                                }}
                            >

                                <ListItemIcon>

                                    <AddIcon />

                                </ListItemIcon>


                                <ListItemText
                                    primary="New Receipt"
                                />

                            </ListItemButton>


                            <ListItemButton
                                component={NavLink}
                                onClick={onMobileClose}
                                to="/receipts"
                                sx={{

                                    ...menuItemStyle,
                                    ml: 2,
                                    mr: 1
                                }}
                            >

                                <ListItemIcon>

                                    <SearchIcon />

                                </ListItemIcon>


                                <ListItemText
                                    primary="Receipts"
                                />

                            </ListItemButton>

                        </List>

                    </Collapse>


                    {/* ==================================================
                        MASTERS - ADMIN ONLY
                    ================================================== */}

                    {isAdmin && (

                        <>

                            <ListItemButton
                                onClick={() =>
                                    setMastersOpen(
                                        !mastersOpen
                                    )
                                }
                                sx={sectionHeadingStyle}
                            >

                                <ListItemIcon
                                    sx={{
                                        minWidth: 38,
                                        color:
                                            colors.headingText
                                    }}
                                >

                                    <CategoryIcon />

                                </ListItemIcon>


                                <ListItemText
                                    primary="Masters"
                                    primaryTypographyProps={{
                                        fontWeight: 700
                                    }}
                                />


                                {mastersOpen ? (

                                    <ExpandLessIcon />

                                ) : (

                                    <ExpandMoreIcon />

                                )}

                            </ListItemButton>


                            <Collapse
                                in={mastersOpen}
                                timeout="auto"
                                unmountOnExit
                            >

                                <List
                                    disablePadding
                                >

                                    {/* DEVOTEES */}

                                    <ListItemButton
                                        component={NavLink}
                                        onClick={onMobileClose}
                                        to="/masters/devotees"
                                        sx={{

                                            ...menuItemStyle,
                                            ml: 2,
                                            mr: 1
                                        }}
                                    >

                                        <ListItemIcon>

                                            <PeopleIcon />

                                        </ListItemIcon>


                                        <ListItemText
                                            primary="Devotees"
                                        />

                                    </ListItemButton>


                                    {/* CATEGORIES */}

                                    <ListItemButton
                                        component={NavLink}
                                        onClick={onMobileClose}
                                        to="/masters/categories"
                                        sx={{

                                            ...menuItemStyle,
                                            ml: 2,
                                            mr: 1
                                        }}
                                    >

                                        <ListItemIcon>

                                            <CategoryIcon />

                                        </ListItemIcon>


                                        <ListItemText
                                            primary="Categories"
                                        />

                                    </ListItemButton>


                                    {/* OFFERINGS */}

                                    <ListItemButton
                                        component={NavLink}
                                        onClick={onMobileClose}
                                        to="/masters/offerings"
                                        sx={{

                                            ...menuItemStyle,
                                            ml: 2,
                                            mr: 1
                                        }}
                                    >

                                        <ListItemIcon>

                                            <LocalOfferIcon />

                                        </ListItemIcon>


                                        <ListItemText
                                            primary="Offerings"
                                        />

                                    </ListItemButton>


                                    {/* PAYMENT MODES */}

                                    <ListItemButton
                                        component={NavLink}
                                        onClick={onMobileClose}
                                        to="/masters/payment-modes"
                                        sx={{

                                            ...menuItemStyle,
                                            ml: 2,
                                            mr: 1
                                        }}
                                    >

                                        <ListItemIcon>

                                            <PaymentsIcon />

                                        </ListItemIcon>


                                        <ListItemText
                                            primary="Payment Modes"
                                        />

                                    </ListItemButton>

                                </List>

                            </Collapse>

                        </>

                    )}


                    {/* ==================================================
                        REPORTS
                    ================================================== */}

                    <ListItemButton
                        onClick={() =>
                            setReportsOpen(
                                !reportsOpen
                            )
                        }
                        sx={sectionHeadingStyle}
                    >

                        <ListItemIcon
                            sx={{
                                minWidth: 38,
                                color:
                                    colors.headingText
                            }}
                        >

                            <AssessmentIcon />

                        </ListItemIcon>


                        <ListItemText
                            primary="Reports"
                            primaryTypographyProps={{
                                fontWeight: 700
                            }}
                        />


                        {reportsOpen ? (

                            <ExpandLessIcon />

                        ) : (

                            <ExpandMoreIcon />

                        )}

                    </ListItemButton>


                    <Collapse
                        in={reportsOpen}
                        timeout="auto"
                        unmountOnExit
                    >

                        <List
                            disablePadding
                        >

                            <ListItemButton
                                component={NavLink}
                                onClick={onMobileClose}
                                to="/reports"
                                sx={{

                                    ...menuItemStyle,
                                    ml: 2,
                                    mr: 1
                                }}
                            >

                                <ListItemIcon>

                                    <AssessmentIcon />

                                </ListItemIcon>


                                <ListItemText
                                    primary="Reports"
                                />

                            </ListItemButton>

                        </List>

                    </Collapse>


                    {/* ==================================================
                        ADMINISTRATION - ADMIN ONLY
                    ================================================== */}

                    {isAdmin && (

                        <>

                            <ListItemButton
                                onClick={() =>
                                    setAdministrationOpen(
                                        !administrationOpen
                                    )
                                }
                                sx={sectionHeadingStyle}
                            >

                                <ListItemIcon
                                    sx={{
                                        minWidth: 38,
                                        color:
                                            colors.headingText
                                    }}
                                >

                                    <AdminPanelSettingsIcon />

                                </ListItemIcon>


                                <ListItemText
                                    primary="Administration"
                                    primaryTypographyProps={{
                                        fontWeight: 700
                                    }}
                                />


                                {administrationOpen ? (

                                    <ExpandLessIcon />

                                ) : (

                                    <ExpandMoreIcon />

                                )}

                            </ListItemButton>


                            <Collapse
                                in={administrationOpen}
                                timeout="auto"
                                unmountOnExit
                            >

                                <List
                                    disablePadding
                                >

                                    {/* USERS */}

                                    <ListItemButton
                                        component={NavLink}
                                        onClick={onMobileClose}
                                        to="/users"
                                        sx={{

                                            ...menuItemStyle,
                                            ml: 2,
                                            mr: 1
                                        }}
                                    >

                                        <ListItemIcon>

                                            <ManageAccountsIcon />

                                        </ListItemIcon>


                                        <ListItemText
                                            primary="Users"
                                        />

                                    </ListItemButton>


                                    {/* SETTINGS */}

                                    <ListItemButton
                                        component={NavLink}
                                        onClick={onMobileClose}
                                        to="/settings"
                                        sx={{

                                            ...menuItemStyle,
                                            ml: 2,
                                            mr: 1
                                        }}
                                    >

                                        <ListItemIcon>

                                            <SettingsIcon />

                                        </ListItemIcon>


                                        <ListItemText
                                            primary="Settings"
                                        />

                                    </ListItemButton>

                                </List>

                            </Collapse>

                        </>

                    )}

                </List>

            </Box>

        </Drawer>

    );

}
