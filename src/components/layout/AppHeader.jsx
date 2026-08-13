import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    AppBar,
    Toolbar,
    Typography,
    Avatar,
    Box,
    Menu,
    MenuItem,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Alert,
    IconButton,
    InputAdornment,
    useMediaQuery,
    useTheme,
    CircularProgress
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import LockIcon from "@mui/icons-material/Lock";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

import templeImage from "../../assets/temple.png";


const drawerWidth = 260;

const API_BASE = "https://billing-api.kannambalam.com";


export default function AppHeader({ onMenuClick, isMobile: isMobileProp }) {

    const navigate = useNavigate();
    const theme = useTheme();
    const isMobileQuery = useMediaQuery(theme.breakpoints.down("md"));
    const isMobile = isMobileProp ?? isMobileQuery;


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


    const displayName =
        user?.full_name ||
        user?.username ||
        "User";


    const role =
        user?.role ||
        "";


    // ==================================================
    // USER MENU
    // ==================================================

    const [menuAnchor, setMenuAnchor] =
        useState(null);


    const menuOpen =
        Boolean(menuAnchor);


    const handleUserClick = (event) => {

        setMenuAnchor(
            event.currentTarget
        );

    };


    const handleMenuClose = () => {

        setMenuAnchor(null);

    };


    // ==================================================
    // CHANGE PASSWORD DIALOG
    // ==================================================

    const [passwordDialogOpen, setPasswordDialogOpen] =
        useState(false);


    const [currentPassword, setCurrentPassword] =
        useState("");


    const [newPassword, setNewPassword] =
        useState("");


    const [confirmPassword, setConfirmPassword] =
        useState("");


    const [passwordError, setPasswordError] =
        useState("");


    const [passwordSuccess, setPasswordSuccess] =
        useState("");


    const [changingPassword, setChangingPassword] =
        useState(false);


    // ==================================================
    // PASSWORD VISIBILITY
    // ==================================================

    const [showCurrentPassword, setShowCurrentPassword] =
        useState(false);


    const [showNewPassword, setShowNewPassword] =
        useState(false);


    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);


    // ==================================================
    // OPEN CHANGE PASSWORD
    // ==================================================

    const handleOpenChangePassword = () => {

        setMenuAnchor(null);

        setCurrentPassword("");

        setNewPassword("");

        setConfirmPassword("");

        setPasswordError("");

        setPasswordSuccess("");

        setShowCurrentPassword(false);

        setShowNewPassword(false);

        setShowConfirmPassword(false);

        setPasswordDialogOpen(true);

    };


    // ==================================================
    // CLOSE CHANGE PASSWORD
    // ==================================================

    const handleCloseChangePassword = () => {

        if (changingPassword) {
            return;
        }


        setPasswordDialogOpen(false);

        setCurrentPassword("");

        setNewPassword("");

        setConfirmPassword("");

        setPasswordError("");

        setPasswordSuccess("");

        setShowCurrentPassword(false);

        setShowNewPassword(false);

        setShowConfirmPassword(false);

    };


    // ==================================================
    // CHANGE PASSWORD
    // ==================================================

    const handleChangePassword = async () => {

        setPasswordError("");

        setPasswordSuccess("");


        // ----------------------------------------------
        // VALIDATION
        // ----------------------------------------------

        if (!currentPassword) {

            setPasswordError(
                "Current password is required"
            );

            return;

        }


        if (!newPassword) {

            setPasswordError(
                "New password is required"
            );

            return;

        }


        if (!confirmPassword) {

            setPasswordError(
                "Please confirm the new password"
            );

            return;

        }


        if (newPassword !== confirmPassword) {

            setPasswordError(
                "New password and confirmation do not match"
            );

            return;

        }


        if (newPassword.length < 6) {

            setPasswordError(
                "New password must be at least 6 characters"
            );

            return;

        }


        if (currentPassword === newPassword) {

            setPasswordError(
                "New password must be different from current password"
            );

            return;

        }


        // ----------------------------------------------
        // API CALL
        // ----------------------------------------------

        try {

            setChangingPassword(true);


            const token =
                localStorage.getItem(
                    "billing_token"
                );


            const response =
                await fetch(
                    `${API_BASE}/api/auth/change-password`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            Authorization:
                                `Bearer ${token}`
                        },

                        body: JSON.stringify({

                            currentPassword:
                                currentPassword,

                            newPassword:
                                newPassword

                        })
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Unable to change password"
                );

            }


            // ------------------------------------------
            // SUCCESS
            // ------------------------------------------

            setPasswordSuccess(
                "Password changed successfully"
            );


            setCurrentPassword("");

            setNewPassword("");

            setConfirmPassword("");


            setTimeout(() => {

                setPasswordDialogOpen(false);

                setPasswordSuccess("");

            }, 1200);

        }

        catch (error) {

            console.error(
                "Change password error:",
                error
            );


            setPasswordError(
                error.message ||
                "Unable to change password"
            );

        }

        finally {

            setChangingPassword(false);

        }

    };


    // ==================================================
    // LOGOUT
    // ==================================================

    const handleLogout = () => {

        setMenuAnchor(null);


        localStorage.removeItem(
            "billing_token"
        );


        localStorage.removeItem(
            "billing_user"
        );


        localStorage.removeItem(
            "token"
        );


        localStorage.removeItem(
            "user"
        );


        navigate(
            "/login",
            {
                replace: true
            }
        );

    };


    // ==================================================
    // EYE BUTTON STYLE
    // ==================================================

    const eyeButtonSx = {

        color: "#555",

        width: 42,

        height: 42,

        minWidth: 42,

        minHeight: 42,

        display: "flex",

        alignItems: "center",

        justifyContent: "center",

        opacity: 1,

        visibility: "visible",

        zIndex: 10,

        pointerEvents: "auto",

        mr: 0.25,

        "& svg": {

            display: "block",

            visibility: "visible",

            opacity: 1,

            width: 24,

            height: 24

        },

        "&:hover": {

            color: "#a00000",

            backgroundColor:
                "rgba(160, 0, 0, 0.08)"

        }

    };


    // ==================================================
    // RENDER
    // ==================================================

    return (

        <>

            {/* ==================================================
                HEADER
            ================================================== */}

            <AppBar
                position="fixed"
                sx={{
                    width: {
                        xs: "100%",
                        md: `calc(100% - ${drawerWidth}px)`
                    },
                    ml: {
                        xs: 0,
                        md: `${drawerWidth}px`
                    },
                    backgroundColor: "#a00000",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
                    zIndex: (theme) => theme.zIndex.drawer + 1
                }}
            >

                <Toolbar
                    sx={{
                        minHeight: {
                            xs: "56px !important",
                            md: "64px !important"
                        },
                        px: { xs: 1, sm: 2, md: 2 }
                    }}
                >

                    {isMobile && (
                        <IconButton
                            color="inherit"
                            edge="start"
                            onClick={onMenuClick}
                            aria-label="Open navigation menu"
                            sx={{ mr: 0.5 }}
                        >
                            <MenuIcon />
                        </IconButton>
                    )}

                    {/* ======================================
                        TEMPLE LOGO + MALAYALAM TITLE
                    ====================================== */}

                    <Box

                        sx={{

                            display:
                                "flex",

                            alignItems:
                                "center",

                            gap:
                                1.5,

                            flexGrow:
                                1,

                            minWidth:
                                0

                        }}

                    >

                        <Box

                            component="img"

                            src={templeImage}

                            alt="Kannambalam Temple"

                            sx={{

                                width: {
                                    xs: 42,
                                    sm: 50,
                                    md: 55
                                },

                                height: {
                                    xs: 34,
                                    sm: 38,
                                    md: 42
                                },

                                objectFit:
                                    "cover",

                                borderRadius:
                                    "2px",

                                flexShrink:
                                    0

                            }}

                        />


                        <Typography

                            variant="h6"

                            sx={{

                                fontWeight:
                                    700,

                                fontSize: {
                                    xs: "0.95rem",
                                    sm: "1.05rem",
                                    md: "1.25rem"
                                },

                                whiteSpace:
                                    "nowrap",

                                overflow:
                                    "hidden",

                                textOverflow:
                                    "ellipsis"

                            }}

                        >

                            കണ്ണാമ്പലത്ത് ശ്രീ ഭദ്രകാളി ശങ്കരമ്മാവൻ ക്ഷേത്രം

                        </Typography>

                    </Box>


                    {/* ======================================
                        LOGGED-IN USER
                    ====================================== */}

                    <Box

                        onClick={
                            handleUserClick
                        }

                        sx={{

                            display:
                                "flex",

                            alignItems:
                                "center",

                            gap:
                                1.5,

                            cursor:
                                "pointer",

                            mr: { xs: 0, sm: 1 },
                            px: { xs: 0.5, sm: 1 },
                            py: 0.5,

                            borderRadius:
                                1,

                            "&:hover": {

                                backgroundColor:
                                    "rgba(255,255,255,0.10)"

                            }

                        }}

                    >

                        <Box
                            sx={{
                                textAlign: "right",
                                display: { xs: "none", sm: "block" }
                            }}
                        >

                            <Typography

                                variant="body2"

                                sx={{

                                    fontWeight:
                                        600,

                                    lineHeight:
                                        1.2

                                }}

                            >

                                {displayName}

                            </Typography>


                            {role && (

                                <Typography

                                    variant="caption"

                                    sx={{
                                        opacity:
                                            0.85
                                    }}

                                >

                                    {role}

                                </Typography>

                            )}

                        </Box>


                        <Avatar>

                            {displayName
                                .charAt(0)
                                .toUpperCase()}

                        </Avatar>

                    </Box>


                    {/* ======================================
                        USER MENU
                    ====================================== */}

                    <Menu

                        anchorEl={
                            menuAnchor
                        }

                        open={
                            menuOpen
                        }

                        onClose={
                            handleMenuClose
                        }

                        anchorOrigin={{
                            vertical:
                                "bottom",

                            horizontal:
                                "right"
                        }}

                        transformOrigin={{
                            vertical:
                                "top",

                            horizontal:
                                "right"
                        }}

                    >

                        <MenuItem

                            onClick={
                                handleOpenChangePassword
                            }

                        >

                            <LockIcon

                                fontSize="small"

                                sx={{
                                    mr: 1.5
                                }}

                            />

                            Change Password

                        </MenuItem>


                        <Divider />


                        <MenuItem
                            onClick={
                                handleLogout
                            }
                        >

                            <LogoutIcon

                                fontSize="small"

                                sx={{
                                    mr: 1.5
                                }}

                            />

                            Logout

                        </MenuItem>

                    </Menu>

                </Toolbar>

            </AppBar>


            {/* ==================================================
                CHANGE PASSWORD DIALOG
            ================================================== */}

            <Dialog

                open={
                    passwordDialogOpen
                }

                onClose={
                    handleCloseChangePassword
                }

                maxWidth="sm"

                fullWidth

            >

                <DialogTitle

                    sx={{
                        fontWeight:
                            700
                    }}

                >

                    Change Password

                </DialogTitle>


                <DialogContent>

                    {/* ==========================================
                        ERROR
                    ========================================== */}

                    {passwordError && (

                        <Alert

                            severity="error"

                            sx={{
                                mb: 2,
                                mt: 1
                            }}

                        >

                            {passwordError}

                        </Alert>

                    )}


                    {/* ==========================================
                        SUCCESS
                    ========================================== */}

                    {passwordSuccess && (

                        <Alert

                            severity="success"

                            sx={{
                                mb: 2,
                                mt: 1
                            }}

                        >

                            {passwordSuccess}

                        </Alert>

                    )}


                    {/* ==========================================
                        CURRENT PASSWORD
                    ========================================== */}

                    <TextField

                        fullWidth

                        margin="normal"

                        label="Current Password"

                        type={
                            showCurrentPassword
                                ? "text"
                                : "password"
                        }

                        value={
                            currentPassword
                        }

                        onChange={(event) =>
                            setCurrentPassword(
                                event.target.value
                            )
                        }

                        disabled={
                            changingPassword
                        }

                        autoComplete="current-password"

                        slotProps={{

                            input: {

                                endAdornment:

                                    <InputAdornment
                                        position="end"
                                    >

                                        <IconButton

                                            type="button"

                                            aria-label={
                                                showCurrentPassword
                                                    ? "Hide current password"
                                                    : "Show current password"
                                            }

                                            onClick={() =>
                                                setShowCurrentPassword(
                                                    (previous) =>
                                                        !previous
                                                )
                                            }

                                            disabled={
                                                changingPassword
                                            }

                                            edge="end"

                                            sx={
                                                eyeButtonSx
                                            }

                                        >

                                            {showCurrentPassword
                                                ? <VisibilityOffIcon />
                                                : <VisibilityIcon />
                                            }

                                        </IconButton>

                                    </InputAdornment>

                            }

                        }}

                    />


                    {/* ==========================================
                        NEW PASSWORD
                    ========================================== */}

                    <TextField

                        fullWidth

                        margin="normal"

                        label="New Password"

                        type={
                            showNewPassword
                                ? "text"
                                : "password"
                        }

                        value={
                            newPassword
                        }

                        onChange={(event) =>
                            setNewPassword(
                                event.target.value
                            )
                        }

                        disabled={
                            changingPassword
                        }

                        autoComplete="new-password"

                        slotProps={{

                            input: {

                                endAdornment:

                                    <InputAdornment
                                        position="end"
                                    >

                                        <IconButton

                                            type="button"

                                            aria-label={
                                                showNewPassword
                                                    ? "Hide new password"
                                                    : "Show new password"
                                            }

                                            onClick={() =>
                                                setShowNewPassword(
                                                    (previous) =>
                                                        !previous
                                                )
                                            }

                                            disabled={
                                                changingPassword
                                            }

                                            edge="end"

                                            sx={
                                                eyeButtonSx
                                            }

                                        >

                                            {showNewPassword
                                                ? <VisibilityOffIcon />
                                                : <VisibilityIcon />
                                            }

                                        </IconButton>

                                    </InputAdornment>

                            }

                        }}

                    />


                    {/* ==========================================
                        CONFIRM NEW PASSWORD
                    ========================================== */}

                    <TextField

                        fullWidth

                        margin="normal"

                        label="Confirm New Password"

                        type={
                            showConfirmPassword
                                ? "text"
                                : "password"
                        }

                        value={
                            confirmPassword
                        }

                        onChange={(event) =>
                            setConfirmPassword(
                                event.target.value
                            )
                        }

                        disabled={
                            changingPassword
                        }

                        autoComplete="new-password"

                        slotProps={{

                            input: {

                                endAdornment:

                                    <InputAdornment
                                        position="end"
                                    >

                                        <IconButton

                                            type="button"

                                            aria-label={
                                                showConfirmPassword
                                                    ? "Hide confirmation password"
                                                    : "Show confirmation password"
                                            }

                                            onClick={() =>
                                                setShowConfirmPassword(
                                                    (previous) =>
                                                        !previous
                                                )
                                            }

                                            disabled={
                                                changingPassword
                                            }

                                            edge="end"

                                            sx={
                                                eyeButtonSx
                                            }

                                        >

                                            {showConfirmPassword
                                                ? <VisibilityOffIcon />
                                                : <VisibilityIcon />
                                            }

                                        </IconButton>

                                    </InputAdornment>

                            }

                        }}

                    />

                </DialogContent>


                {/* ==================================================
                    DIALOG ACTIONS
                ================================================== */}

                <DialogActions

                    sx={{
                        px: 3,
                        pb: 2
                    }}

                >

                    <Button

                        onClick={
                            handleCloseChangePassword
                        }

                        disabled={
                            changingPassword
                        }

                    >

                        CANCEL

                    </Button>


                    <Button

                        variant="contained"

                        onClick={
                            handleChangePassword
                        }

                        disabled={
                            changingPassword
                        }

                        sx={{

                            backgroundColor:
                                "#a00000",

                            "&:hover": {

                                backgroundColor:
                                    "#800000"

                            },

                            fontWeight:
                                600

                        }}

                    >

                        {changingPassword ? (

                            <CircularProgress

                                size={22}

                                color="inherit"

                            />

                        ) : (

                            "CHANGE PASSWORD"

                        )}

                    </Button>

                </DialogActions>

            </Dialog>

        </>

    );

}