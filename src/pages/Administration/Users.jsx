import { useEffect, useState } from "react";

import {
    Box,
    Paper,
    Typography,
    Button,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Switch,
    Chip,
    Alert,
    TextField,
    InputAdornment
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

import { apiFetch } from "../../api/api";


export default function Users() {

    const [users, setUsers] =
        useState([]);

    const [availableUsers, setAvailableUsers] =
        useState([]);

    const [open, setOpen] =
        useState(false);

    const [editingUser, setEditingUser] =
        useState(null);

    const [userType, setUserType] =
        useState("family");

    const [selectedAppUser, setSelectedAppUser] =
        useState("");

    const [externalFullName, setExternalFullName] =
        useState("");

    const [externalUsername, setExternalUsername] =
        useState("");

    const [role, setRole] =
        useState("Cashier");

    const [active, setActive] =
        useState(true);

    const [password, setPassword] =
        useState("");

    const [confirmPassword, setConfirmPassword] =
        useState("");

    const [showPassword, setShowPassword] =
        useState(false);

    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    const [error, setError] =
        useState("");

    const [loading, setLoading] =
        useState(false);


    // =====================================================
    // LOAD BILLING USERS
    // =====================================================

    const loadUsers = async () => {

        try {

            setError("");

            const response =
                await apiFetch(
                    "/api/users"
                );

            const data =
                await response.json();

            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Failed to load users"
                );

            }

            setUsers(
                Array.isArray(data)
                    ? data
                    : []
            );

        }
        catch (err) {

            console.error(
                "Load users error:",
                err
            );

            setError(
                err.message ||
                "Failed to load users"
            );

        }

    };


    // =====================================================
    // LOAD AVAILABLE FAMILY USERS
    // =====================================================

    const loadAvailableUsers = async () => {

        try {

            setError("");

            const response =
                await apiFetch(
                    "/api/users/available"
                );

            const data =
                await response.json();

            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Failed to load available users"
                );

            }

            setAvailableUsers(
                Array.isArray(data)
                    ? data
                    : []
            );

        }
        catch (err) {

            console.error(
                "Load available users error:",
                err
            );

            setError(
                err.message ||
                "Failed to load available users"
            );

        }

    };


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {

        loadUsers();

    }, []);


    // =====================================================
    // OPEN ADD DIALOG
    // =====================================================

    const openAddDialog = async () => {

        setError("");

        setEditingUser(null);

        setUserType("family");

        setSelectedAppUser("");

        setExternalFullName("");

        setExternalUsername("");

        setRole("Cashier");

        setActive(true);

        setPassword("");

        setConfirmPassword("");

        setShowPassword(false);

        setShowConfirmPassword(false);

        await loadAvailableUsers();

        setOpen(true);

    };


    // =====================================================
    // OPEN EDIT DIALOG
    // =====================================================

    const openEditDialog = (user) => {

        setError("");

        setEditingUser(user);

        setUserType(
            user.user_type ||
            "family"
        );

        setSelectedAppUser("");

        setExternalFullName("");

        setExternalUsername("");

        setRole(
            user.role ||
            "Cashier"
        );

        setActive(
            user.active !== false
        );

        setPassword("");

        setConfirmPassword("");

        setShowPassword(false);

        setShowConfirmPassword(false);

        setOpen(true);

    };


    // =====================================================
    // CLOSE DIALOG
    // =====================================================

    const closeDialog = () => {

        if (loading) {
            return;
        }

        setOpen(false);

        setEditingUser(null);

        setUserType("family");

        setSelectedAppUser("");

        setExternalFullName("");

        setExternalUsername("");

        setRole("Cashier");

        setActive(true);

        setPassword("");

        setConfirmPassword("");

        setShowPassword(false);

        setShowConfirmPassword(false);

        setError("");

    };


    // =====================================================
    // VALIDATE PASSWORD
    // =====================================================

    const validatePassword = () => {

        if (!password) {

            setError(
                editingUser
                    ? "Please enter a new password"
                    : "Please enter an initial password"
            );

            return false;

        }


        if (password.length < 6) {

            setError(
                "Password must contain at least 6 characters"
            );

            return false;

        }


        if (password !== confirmPassword) {

            setError(
                "Passwords do not match"
            );

            return false;

        }


        return true;

    };


    // =====================================================
    // SAVE USER
    // =====================================================

    const saveUser = async () => {

        setError("");


        // =================================================
        // ADD USER VALIDATION
        // =================================================

        if (!editingUser) {

            if (userType === "family") {

                if (!selectedAppUser) {

                    setError(
                        "Please select a registered family user"
                    );

                    return;

                }

            }
            else {

                if (!externalFullName.trim()) {

                    setError(
                        "Please enter the full name"
                    );

                    return;

                }


                if (!externalUsername.trim()) {

                    setError(
                        "Please enter a username"
                    );

                    return;

                }

            }


            if (!validatePassword()) {
                return;
            }

        }


        // =================================================
        // EDIT USER
        // =================================================

        if (editingUser) {

            if (
                password ||
                confirmPassword
            ) {

                if (!validatePassword()) {
                    return;
                }

            }

        }


        setLoading(true);


        try {


            // =================================================
            // ADD USER
            // =================================================

            if (!editingUser) {

                const response =
                    await apiFetch(
                        "/api/users",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({

                                    user_type:
                                        userType,

                                    app_user_id:
                                        userType === "family"
                                            ? selectedAppUser
                                            : null,

                                    full_name:
                                        userType === "external"
                                            ? externalFullName.trim()
                                            : null,

                                    username:
                                        userType === "external"
                                            ? externalUsername.trim()
                                            : null,

                                    role:
                                        role,

                                    password:
                                        password

                                })

                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.error ||
                        "Unable to add user"
                    );

                }

            }


            // =================================================
            // UPDATE USER
            // =================================================

            else {

                const response =
                    await apiFetch(
                        `/api/users/${editingUser.id}`,
                        {
                            method: "PUT",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({

                                    role:
                                        role,

                                    active:
                                        active

                                })

                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.error ||
                        "Unable to update user"
                    );

                }


                // =================================================
                // CHANGE PASSWORD IF ENTERED
                // =================================================

                if (password) {

                    const passwordResponse =
                        await apiFetch(
                            `/api/users/${editingUser.id}/password`,
                            {
                                method: "PUT",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify({

                                        password:
                                            password

                                    })

                            }
                        );


                    const passwordData =
                        await passwordResponse.json();


                    if (!passwordResponse.ok) {

                        throw new Error(
                            passwordData.error ||
                            "Unable to update password"
                        );

                    }

                }

            }


            closeDialog();

            await loadUsers();

        }
        catch (err) {

            console.error(
                "Save user error:",
                err
            );

            setError(
                err.message ||
                "Unable to save user"
            );

        }
        finally {

            setLoading(false);

        }

    };


    // =====================================================
    // DEACTIVATE USER
    // =====================================================

    const deactivateUser = async (user) => {

        const confirmed =
            window.confirm(
                `Deactivate billing user "${user.full_name}"?`
            );


        if (!confirmed) {
            return;
        }


        try {

            setError("");

            const response =
                await apiFetch(
                    `/api/users/${user.id}`,
                    {
                        method: "DELETE"
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Unable to deactivate user"
                );

            }


            await loadUsers();

        }
        catch (err) {

            console.error(
                "Deactivate user error:",
                err
            );


            setError(
                err.message ||
                "Unable to deactivate user"
            );

        }

    };


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <Box>

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <Box
                sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    justifyContent: "space-between",
                    alignItems: { xs: "stretch", sm: "center" },
                    mb: 3,
                    gap: { xs: 1.5, sm: 2 },
                    width: "100%"
                }}
            >

                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: 600
                    }}
                >
                    Billing Users
                </Typography>


                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={openAddDialog}
                    fullWidth
                    sx={{
                        backgroundColor: "#8b0000",
                        width: { xs: "100%", sm: "auto" },
                        minHeight: 48
                    }}
                >
                    ADD USER
                </Button>

            </Box>


            {/* =================================================
                PAGE ERROR
            ================================================= */}

            {!open && error && (

                <Alert
                    severity="error"
                    sx={{
                        mb: 2
                    }}
                    onClose={() =>
                        setError("")
                    }
                >
                    {error}
                </Alert>

            )}


            {/* =================================================
                USERS TABLE
            ================================================= */}

            <Paper
                sx={{
                    p: { xs: 1, sm: 3 },
                    width: "100%",
                    overflowX: "auto",
                    overflowY: "visible"
                }}
            >

                <Typography
                    variant="h6"
                    sx={{
                        mb: 2
                    }}
                >
                    Billing Users
                </Typography>


                <Table
                    sx={{
                        minWidth: { xs: 700, sm: 800 }
                    }}
                >

                    <TableHead>

                        <TableRow>

                            <TableCell>
                                #
                            </TableCell>

                            <TableCell>
                                Name
                            </TableCell>

                            <TableCell>
                                Username / Email
                            </TableCell>

                            <TableCell>
                                Type
                            </TableCell>

                            <TableCell>
                                Role
                            </TableCell>

                            <TableCell>
                                Status
                            </TableCell>

                            <TableCell align="center">
                                Action
                            </TableCell>

                        </TableRow>

                    </TableHead>


                    <TableBody>

                        {users.map(
                            (user, index) => (

                                <TableRow
                                    key={user.id}
                                >

                                    <TableCell>
                                        {index + 1}
                                    </TableCell>


                                    <TableCell>
                                        {user.full_name}
                                    </TableCell>


                                    <TableCell>
                                        {user.username || "-"}
                                    </TableCell>


                                    <TableCell>

                                        <Chip
                                            label={
                                                user.user_type === "external"
                                                    ? "External"
                                                    : "Family"
                                            }
                                            size="small"
                                            color={
                                                user.user_type === "external"
                                                    ? "warning"
                                                    : "default"
                                            }
                                        />

                                    </TableCell>


                                    <TableCell>

                                        <Chip
                                            label={
                                                user.role ||
                                                "Cashier"
                                            }
                                            size="small"
                                        />

                                    </TableCell>


                                    <TableCell>

                                        <Chip
                                            label={
                                                user.active
                                                    ? "Active"
                                                    : "Inactive"
                                            }
                                            color={
                                                user.active
                                                    ? "success"
                                                    : "default"
                                            }
                                            size="small"
                                        />

                                    </TableCell>


                                    <TableCell align="center">

                                        <IconButton
                                            color="primary"
                                            onClick={() =>
                                                openEditDialog(
                                                    user
                                                )
                                            }
                                        >
                                            <EditIcon />
                                        </IconButton>


                                        {user.active && (

                                            <Button
                                                size="small"
                                                color="error"
                                                onClick={() =>
                                                    deactivateUser(
                                                        user
                                                    )
                                                }
                                            >
                                                Deactivate
                                            </Button>

                                        )}

                                    </TableCell>

                                </TableRow>

                            )
                        )}


                        {users.length === 0 && (

                            <TableRow>

                                <TableCell
                                    colSpan={7}
                                    align="center"
                                    sx={{
                                        py: 5
                                    }}
                                >
                                    No billing users added yet.
                                </TableCell>

                            </TableRow>

                        )}

                    </TableBody>

                </Table>

            </Paper>


            {/* =================================================
                ADD / EDIT DIALOG
            ================================================= */}

            <Dialog
                open={open}
                onClose={closeDialog}
                fullWidth
                maxWidth="sm"
            >

                <DialogTitle>

                    {editingUser
                        ? "Edit Billing User"
                        : "Add Billing User"}

                </DialogTitle>


                <DialogContent>


                    {/* =================================================
                        ERROR INSIDE MODAL
                    ================================================= */}

                    {error && (

                        <Alert
                            severity="error"
                            sx={{
                                mt: 1,
                                mb: 3
                            }}
                            onClose={() =>
                                setError("")
                            }
                        >
                            {error}
                        </Alert>

                    )}


                    {/* =========================================
                        USER TYPE - ADD ONLY
                    ========================================= */}

                    {!editingUser && (

                        <FormControl
                            fullWidth
                            sx={{
                                mt: error ? 0 : 1,
                                mb: 3
                            }}
                        >

                            <InputLabel>
                                User Type
                            </InputLabel>


                            <Select
                                value={userType}
                                label="User Type"
                                onChange={(e) => {

                                    setUserType(
                                        e.target.value
                                    );

                                    setSelectedAppUser("");

                                    setExternalFullName("");

                                    setExternalUsername("");

                                    setError("");

                                }}
                            >

                                <MenuItem value="family">
                                    Registered Family User
                                </MenuItem>

                                <MenuItem value="external">
                                    External User
                                </MenuItem>

                            </Select>

                        </FormControl>

                    )}


                    {/* =========================================
                        ADD MODE - FAMILY USER
                    ========================================= */}

                    {!editingUser &&
                        userType === "family" && (

                        <FormControl
                            fullWidth
                            sx={{
                                mb: 3
                            }}
                        >

                            <InputLabel>
                                Registered Family User
                            </InputLabel>


                            <Select
                                value={
                                    selectedAppUser
                                }
                                label="Registered Family User"
                                onChange={(e) =>
                                    setSelectedAppUser(
                                        e.target.value
                                    )
                                }
                            >

                                <MenuItem value="">
                                    Select User
                                </MenuItem>


                                {availableUsers.map(
                                    (user) => (

                                        <MenuItem
                                            key={user.id}
                                            value={user.id}
                                        >

                                            {user.full_name}

                                            {user.email
                                                ? ` — ${user.email}`
                                                : ""}

                                        </MenuItem>

                                    )
                                )}

                            </Select>

                        </FormControl>

                    )}


                    {/* =========================================
                        ADD MODE - EXTERNAL USER
                    ========================================= */}

                    {!editingUser &&
                        userType === "external" && (

                        <>

                            <TextField
                                fullWidth
                                label="Full Name"
                                value={
                                    externalFullName
                                }
                                onChange={(e) =>
                                    setExternalFullName(
                                        e.target.value
                                    )
                                }
                                sx={{
                                    mb: 3
                                }}
                            />


                            <TextField
                                fullWidth
                                label="Username"
                                value={
                                    externalUsername
                                }
                                onChange={(e) =>
                                    setExternalUsername(
                                        e.target.value
                                    )
                                }
                                helperText="This will be used to log in to the Billing System"
                                sx={{
                                    mb: 3
                                }}
                            />

                        </>

                    )}


                    {/* =========================================
                        EDIT MODE - USER DETAILS
                    ========================================= */}

                    {editingUser && (

                        <Paper
                            variant="outlined"
                            sx={{
                                p: 2,
                                mt: 1,
                                mb: 3
                            }}
                        >

                            <Typography
                                variant="subtitle1"
                                sx={{
                                    fontWeight: 600
                                }}
                            >
                                {editingUser.full_name}
                            </Typography>


                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                {editingUser.username}
                            </Typography>


                            <Box
                                sx={{
                                    mt: 1
                                }}
                            >

                                <Chip
                                    size="small"
                                    label={
                                        editingUser.user_type === "external"
                                            ? "External User"
                                            : "Family User"
                                    }
                                />

                            </Box>

                        </Paper>

                    )}


                    {/* =========================================
                        ROLE
                    ========================================= */}

                    <FormControl
                        fullWidth
                        sx={{
                            mb: 3
                        }}
                    >

                        <InputLabel>
                            Billing Role
                        </InputLabel>


                        <Select
                            value={role}
                            label="Billing Role"
                            onChange={(e) =>
                                setRole(
                                    e.target.value
                                )
                            }
                        >

                            <MenuItem value="Administrator">
                                Administrator
                            </MenuItem>

                            <MenuItem value="Manager">
                                Manager
                            </MenuItem>

                            <MenuItem value="Cashier">
                                Cashier
                            </MenuItem>

                        </Select>

                    </FormControl>


                    {/* =========================================
                        INITIAL PASSWORD / NEW PASSWORD
                    ========================================= */}

                    <Box
                        sx={{
                            position: "relative",
                            mb: 2
                        }}
                    >
                        <TextField
                            fullWidth
                            type={
                                showPassword
                                    ? "text"
                                    : "password"
                            }
                            label={
                                editingUser
                                    ? "New Password"
                                    : "Initial Password"
                            }
                            value={password}
                            onChange={(e) =>
                                setPassword(
                                    e.target.value
                                )
                            }
                            helperText={
                                editingUser
                                    ? "Leave blank to keep the existing password"
                                    : "Minimum 6 characters"
                            }
                            sx={{
                                "& .MuiInputBase-input": {
                                    pr: 6
                                }
                            }}
                        />

                        <IconButton
                            type="button"
                            onClick={() =>
                                setShowPassword(
                                    !showPassword
                                )
                            }
                            aria-label={
                                showPassword
                                    ? "Hide password"
                                    : "Show password"
                            }
                            sx={{
                                position: "absolute",
                                right: 8,
                                top: 8,
                                zIndex: 10,
                                width: 42,
                                height: 42,
                                color: "#8b0000",
                                backgroundColor: "#ffffff",
                                "&:hover": {
                                    backgroundColor: "#f5f5f5"
                                }
                            }}
                        >
                            {showPassword ? (
                                <VisibilityOffIcon
                                    sx={{
                                        fontSize: 24,
                                        color: "#8b0000"
                                    }}
                                />
                            ) : (
                                <VisibilityIcon
                                    sx={{
                                        fontSize: 24,
                                        color: "#8b0000"
                                    }}
                                />
                            )}
                        </IconButton>
                    </Box>


                    {/* =========================================
                        CONFIRM PASSWORD
                    ========================================= */}

                    <Box
                        sx={{
                            position: "relative",
                            mb: 3
                        }}
                    >
                        <TextField
                            fullWidth
                            type={
                                showConfirmPassword
                                    ? "text"
                                    : "password"
                            }
                            label="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) =>
                                setConfirmPassword(
                                    e.target.value
                                )
                            }
                            helperText="Re-enter the password"
                            sx={{
                                "& .MuiInputBase-input": {
                                    pr: 6
                                }
                            }}
                        />

                        <IconButton
                            type="button"
                            onClick={() =>
                                setShowConfirmPassword(
                                    !showConfirmPassword
                                )
                            }
                            aria-label={
                                showConfirmPassword
                                    ? "Hide password"
                                    : "Show password"
                            }
                            sx={{
                                position: "absolute",
                                right: 8,
                                top: 8,
                                zIndex: 10,
                                width: 42,
                                height: 42,
                                color: "#8b0000",
                                backgroundColor: "#ffffff",
                                "&:hover": {
                                    backgroundColor: "#f5f5f5"
                                }
                            }}
                        >
                            {showConfirmPassword ? (
                                <VisibilityOffIcon
                                    sx={{
                                        fontSize: 24,
                                        color: "#8b0000"
                                    }}
                                />
                            ) : (
                                <VisibilityIcon
                                    sx={{
                                        fontSize: 24,
                                        color: "#8b0000"
                                    }}
                                />
                            )}
                        </IconButton>
                    </Box>


                    {/* =========================================
                        ACTIVE
                    ========================================= */}

                    {editingUser && (

                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center"
                            }}
                        >

                            <Switch
                                checked={active}
                                onChange={(e) =>
                                    setActive(
                                        e.target.checked
                                    )
                                }
                            />

                            <Typography>
                                Active
                            </Typography>

                        </Box>

                    )}

                </DialogContent>


                <DialogActions
                    sx={{
                        px: 3,
                        pb: 2
                    }}
                >

                    <Button
                        onClick={closeDialog}
                        disabled={loading}
                    >
                        Cancel
                    </Button>


                    <Button
                        variant="contained"
                        onClick={saveUser}
                        disabled={loading}
                    >

                        {loading
                            ? "Saving..."
                            : editingUser
                                ? "Update"
                                : "Add User"}

                    </Button>

                </DialogActions>

            </Dialog>

        </Box>

    );

}