import { useEffect, useMemo, useRef, useState } from "react";
import {
    Alert,
    Avatar,
    Box,
    Button,
    Checkbox,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    FormControlLabel,
    IconButton,
    InputLabel,
    ListItemText,
    MenuItem,
    Select,
    Stack,
    Tab,
    Tabs,
    TextField,
    Typography
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import PersonIcon from "@mui/icons-material/Person";
import ShieldIcon from "@mui/icons-material/Shield";
import HistoryIcon from "@mui/icons-material/History";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import UploadFileIcon from "@mui/icons-material/UploadFile";

import { apiFetch } from "../../api/api";

const MAROON = "#8B0000";
const LIGHT_MAROON = "#FFF3F3";
const BORDER = "#eadada";

const emptyProfile = {
    email: "",
    phone_no: ""
};

function roleIdsFromUser(user) {
    return Array.isArray(user?.roles)
        ? user.roles.map((item) => Number(item.id)).filter(Number.isInteger)
        : [];
}

async function resizeImage(file) {
    if (!file) return null;

    if (!file.type.startsWith("image/")) {
        throw new Error("Please select an image file");
    }

    const source = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

    const image = await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = source;
    });

    const maxSize = 320;
    const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    context.drawImage(image, 0, 0, width, height);

    return canvas.toDataURL("image/jpeg", 0.78);
}

export default function Users() {
    const [users, setUsers] = useState([]);
    const [availableUsers, setAvailableUsers] = useState([]);
    const [roles, setRoles] = useState([]);

    const [open, setOpen] = useState(false);
    const [roleDialogOpen, setRoleDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    const [tab, setTab] = useState(0);
    const [userType, setUserType] = useState("family");
    const [selectedAppUser, setSelectedAppUser] = useState("");
    const [fullName, setFullName] = useState("");
    const [username, setUsername] = useState("");
    const [profile, setProfile] = useState(emptyProfile);

    const [selectedRoleIds, setSelectedRoleIds] = useState([]);
    const [pendingRoleIds, setPendingRoleIds] = useState([]);

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [active, setActive] = useState(true);

    const [profilePhoto, setProfilePhoto] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const photoInputRef = useRef(null);

    const selectedFamilyUser = useMemo(
        () => availableUsers.find((item) => String(item.id) === String(selectedAppUser)),
        [availableUsers, selectedAppUser]
    );

    const selectedRoles = useMemo(
        () => roles.filter((item) => selectedRoleIds.includes(Number(item.id))),
        [roles, selectedRoleIds]
    );

    const loadUsers = async () => {
        const response = await apiFetch("/api/users");
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Failed to load users");
        }

        setUsers(Array.isArray(data) ? data : []);
    };

    const loadAvailableUsers = async () => {
        const response = await apiFetch("/api/users/available");
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Failed to load available family users");
        }

        setAvailableUsers(Array.isArray(data) ? data : []);
    };

    const loadRoles = async () => {
        const response = await apiFetch("/api/rbac/roles");
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Failed to load billing roles");
        }

        setRoles(Array.isArray(data) ? data : []);
    };

    useEffect(() => {
        Promise.all([loadUsers(), loadRoles()]).catch((err) => {
            console.error(err);
            setError(err.message || "Unable to load users");
        });
    }, []);

    const resetForm = () => {
        setTab(0);
        setUserType("family");
        setSelectedAppUser("");
        setFullName("");
        setUsername("");
        setProfile(emptyProfile);
        setSelectedRoleIds([]);
        setPendingRoleIds([]);
        setPassword("");
        setConfirmPassword("");
        setShowPassword(false);
        setShowConfirmPassword(false);
        setActive(true);
        setProfilePhoto("");
        setError("");
    };

    const openAddDialog = async () => {
        resetForm();
        setEditingUser(null);

        try {
            await Promise.all([loadAvailableUsers(), loadRoles()]);
            setOpen(true);
        } catch (err) {
            setError(err.message || "Unable to prepare user creation");
        }
    };

    const openEditDialog = (user) => {
        setError("");
        setEditingUser(user);
        setTab(0);
        setUserType(user.user_type || "family");
        setSelectedAppUser("");
        setFullName(user.full_name || "");
        setUsername(user.username || "");
        setProfile({
            email: user.email || "",
            phone_no: user.phone_no || ""
        });
        setSelectedRoleIds(roleIdsFromUser(user));
        setPendingRoleIds(roleIdsFromUser(user));
        setPassword("");
        setConfirmPassword("");
        setShowPassword(false);
        setShowConfirmPassword(false);
        setActive(user.active !== false);
        setProfilePhoto(user.profile_photo || "");
        setOpen(true);
    };

    const closeDialog = () => {
        if (loading) return;
        setOpen(false);
        setRoleDialogOpen(false);
        setEditingUser(null);
        resetForm();
    };

    const handleFamilyUserChange = (value) => {
        setSelectedAppUser(value);
        setError("");

        const familyUser = availableUsers.find(
            (item) => String(item.id) === String(value)
        );

        if (familyUser) {
            setFullName(familyUser.full_name || "");
            setUsername(familyUser.email || "");
            setProfile({
                email: familyUser.email || "",
                phone_no: familyUser.phone_no || ""
            });
        } else {
            setFullName("");
            setUsername("");
            setProfile(emptyProfile);
        }
    };

    const handleUserTypeChange = (value) => {
        setUserType(value);
        setSelectedAppUser("");
        setFullName("");
        setUsername("");
        setProfile(emptyProfile);
        setError("");
    };

    const handlePhotoChange = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            setError("");
            const dataUrl = await resizeImage(file);
            setProfilePhoto(dataUrl);
        } catch (err) {
            setError(err.message || "Unable to process the photo");
        } finally {
            event.target.value = "";
        }
    };

    const validatePassword = () => {
        if (!editingUser && !password) {
            setError("Please enter an initial password");
            return false;
        }

        if (password && password.length < 6) {
            setError("Password must contain at least 6 characters");
            return false;
        }

        if (password && password !== confirmPassword) {
            setError("Passwords do not match");
            return false;
        }

        return true;
    };

    const saveRolesFromDialog = () => {
        if (pendingRoleIds.length === 0) {
            setError("Please select at least one role");
            return;
        }

        setSelectedRoleIds([...pendingRoleIds]);
        setRoleDialogOpen(false);
        setError("");
    };

    const removeRole = (roleId) => {
        const next = selectedRoleIds.filter((id) => Number(id) !== Number(roleId));

        if (next.length === 0) {
            setError("A user must have at least one role");
            return;
        }

        setSelectedRoleIds(next);
    };

    const saveUser = async () => {
        setError("");

        if (userType === "family" && !editingUser && !selectedAppUser) {
            setError("Please select a registered family user");
            setTab(0);
            return;
        }

        if (!fullName.trim()) {
            setError("Please enter the full name");
            setTab(1);
            return;
        }

        if (!username.trim()) {
            setError("Please enter a username");
            setTab(1);
            return;
        }

        if (selectedRoleIds.length === 0) {
            setError("Please assign at least one role");
            setTab(0);
            return;
        }

        if (!validatePassword()) return;

        setLoading(true);

        try {
            const body = {
                user_type: userType,
                app_user_id: userType === "family" && !editingUser ? selectedAppUser : null,
                full_name: fullName.trim(),
                username: username.trim(),
                role_ids: selectedRoleIds,
                password: password || undefined,
                active,
                phone_no: userType === "external" ? profile.phone_no.trim() : null,
                profile_photo: profilePhoto || null
            };

            const response = await apiFetch(
                editingUser ? `/api/users/${editingUser.id}` : "/api/users",
                {
                    method: editingUser ? "PUT" : "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(body)
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Unable to save user");
            }

            if (editingUser && password) {
                const passwordResponse = await apiFetch(
                    `/api/users/${editingUser.id}/password`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ password })
                    }
                );

                const passwordData = await passwordResponse.json();

                if (!passwordResponse.ok) {
                    throw new Error(
                        passwordData.error || "Unable to update password"
                    );
                }
            }

            closeDialog();
            await loadUsers();
        } catch (err) {
            console.error("Save user error:", err);
            setError(err.message || "Unable to save user");
        } finally {
            setLoading(false);
        }
    };

    const deactivateUser = async (user) => {
        if (!window.confirm(`Deactivate billing user "${user.full_name}"?`)) {
            return;
        }

        try {
            setError("");
            const response = await apiFetch(`/api/users/${user.id}`, {
                method: "DELETE"
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Unable to deactivate user");
            }

            await loadUsers();
        } catch (err) {
            setError(err.message || "Unable to deactivate user");
        }
    };

    const openRoleDialog = () => {
        setPendingRoleIds([...selectedRoleIds]);
        setRoleDialogOpen(true);
    };

    const dialogTitle = editingUser ? "Edit User" : "Create User";

    return (
        <Box>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                    gap: 2
                }}
            >
                <Box>
                    <Typography
                        variant="h4"
                        sx={{ fontWeight: 600, color: MAROON }}
                    >
                        User Management
                    </Typography>
                    <Typography color="text.secondary">
                        Create users and assign one or more roles.
                    </Typography>
                </Box>

                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={openAddDialog}
                    sx={{
                        backgroundColor: MAROON,
                        "&:hover": { backgroundColor: "#700000" }
                    }}
                >
                    NEW USER
                </Button>
            </Box>

            {error && !open && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
                    {error}
                </Alert>
            )}

            <Box
                sx={{
                    border: `1px solid ${BORDER}`,
                    borderRadius: 2,
                    overflow: "hidden",
                    backgroundColor: "#fff"
                }}
            >
                <Box sx={{ px: 2, py: 1.5, backgroundColor: LIGHT_MAROON }}>
                    <Typography variant="h6" sx={{ color: MAROON, fontWeight: 700 }}>
                        Billing Users
                    </Typography>
                </Box>

                {/* USER LIST */}
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: {
                            xs: "1fr",
                            md: "minmax(260px, 1.7fr) 92px minmax(220px, 1fr) 92px 140px"
                        },
                        alignItems: "stretch",
                        columnGap: { xs: 0, md: 2 },
                        px: { xs: 1.5, md: 2 },
                        py: 1,
                        backgroundColor: "#fff"
                    }}
                >
                    {users.map((user, index) => (
                        <Box
                            key={user.id}
                            sx={{
                                gridColumn: "1 / -1",
                                display: "grid",
                                gridTemplateColumns: {
                                    xs: "1fr",
                                    md: "minmax(260px, 1.7fr) 92px minmax(220px, 1fr) 92px 140px"
                                },
                                columnGap: { xs: 0, md: 2 },
                                alignItems: "start",
                                borderTop: `1px solid ${BORDER}`,
                                py: 1.4
                            }}
                        >
                            {/* Identity */}
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1.5,
                                    minWidth: 0
                                }}
                            >
                                <Avatar
                                    src={user.profile_photo || undefined}
                                    sx={{ bgcolor: MAROON, width: 42, height: 42, flexShrink: 0 }}
                                >
                                    {!user.profile_photo && <PersonIcon />}
                                </Avatar>
                                <Box sx={{ minWidth: 0 }}>
                                    <Typography sx={{ fontWeight: 600 }} noWrap>
                                        {index + 1}. {user.full_name}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{ overflow: "hidden", textOverflow: "ellipsis" }}
                                        noWrap
                                    >
                                        {user.username || "-"}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Type */}
                            <Box sx={{ pt: { xs: 1, md: 0.4 } }}>
                                <Chip
                                    size="small"
                                    label={user.user_type === "external" ? "External" : "Family"}
                                />
                            </Box>

                            {/* Roles */}
                            <Box
                                sx={{
                                    minWidth: 0,
                                    pt: { xs: 1, md: 0.2 }
                                }}
                            >
                                <Stack
                                    direction="row"
                                    useFlexGap
                                    spacing={0.6}
                                    sx={{
                                        flexWrap: "wrap",
                                        rowGap: 0.6,
                                        alignItems: "flex-start"
                                    }}
                                >
                                    {(user.roles || []).map((item) => (
                                        <Chip
                                            key={item.id}
                                            size="small"
                                            icon={<ShieldIcon sx={{ fontSize: 16 }} />}
                                            label={item.role_name}
                                            sx={{ backgroundColor: LIGHT_MAROON, maxWidth: "100%" }}
                                        />
                                    ))}
                                    {(!user.roles || user.roles.length === 0) && (
                                        <Typography variant="body2" color="text.secondary">
                                            No roles
                                        </Typography>
                                    )}
                                </Stack>
                            </Box>

                            {/* Status */}
                            <Box sx={{ pt: { xs: 1, md: 0.4 } }}>
                                <Chip
                                    size="small"
                                    label={user.active ? "Active" : "Inactive"}
                                    color={user.active ? "success" : "default"}
                                />
                            </Box>

                            {/* Actions */}
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: { xs: "flex-start", md: "flex-end" },
                                    gap: 0.5,
                                    pt: { xs: 1, md: 0 },
                                    flexWrap: "wrap"
                                }}
                            >
                                <IconButton onClick={() => openEditDialog(user)} color="primary" size="small">
                                    <EditIcon />
                                </IconButton>
                                {user.active && (
                                    <Button
                                        size="small"
                                        color="error"
                                        onClick={() => deactivateUser(user)}
                                        sx={{ minWidth: "auto" }}
                                    >
                                        Deactivate
                                    </Button>
                                )}
                            </Box>
                        </Box>
                    ))}
                </Box>

                {users.length === 0 && (
                    <Box sx={{ p: 5, textAlign: "center", color: "text.secondary" }}>
                        No billing users added yet.
                    </Box>
                )}
            </Box>

            <Dialog
                open={open}
                onClose={closeDialog}
                fullWidth
                maxWidth="lg"
                PaperProps={{
                    sx: {
                        minHeight: { md: 610 },
                        borderRadius: 1.5
                    }
                }}
            >
                <DialogTitle sx={{ borderBottom: `1px solid ${BORDER}` }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {dialogTitle}
                    </Typography>
                </DialogTitle>

                <DialogContent sx={{ p: 0 }}>
                    {error && (
                        <Alert
                            severity="error"
                            sx={{ m: 2, mb: 0 }}
                            onClose={() => setError("")}
                        >
                            {error}
                        </Alert>
                    )}

                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: { xs: "column", md: "row" },
                            minHeight: 520
                        }}
                    >
                        {/* LEFT USER INFORMATION */}
                        <Box
                            sx={{
                                width: { xs: "100%", md: "34%" },
                                borderRight: { md: `1px solid ${BORDER}` },
                                backgroundColor: "#fffafa",
                                p: 2.5
                            }}
                        >
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                                <PersonIcon sx={{ color: MAROON }} />
                                <Typography sx={{ color: MAROON, fontWeight: 700, fontSize: 18 }}>
                                    User Information
                                </Typography>
                            </Stack>

                            <Box sx={{ display: "flex", justifyContent: "center", mb: 2.5 }}>
                                <Avatar
                                    src={profilePhoto || undefined}
                                    sx={{
                                        width: 110,
                                        height: 110,
                                        bgcolor: "#d9d9d9",
                                        color: MAROON,
                                        border: `3px solid ${BORDER}`
                                    }}
                                >
                                    {!profilePhoto && <PersonIcon sx={{ fontSize: 54 }} />}
                                </Avatar>
                            </Box>

                            <Box sx={{ mb: 2.5 }}>
                                <Typography variant="caption" color="text.secondary">
                                    Profile photo is managed in the Profile tab
                                </Typography>
                            </Box>

                            {!editingUser && (
                                <FormControl fullWidth sx={{ mb: 2.2 }}>
                                    <InputLabel>User Type</InputLabel>
                                    <Select
                                        value={userType}
                                        label="User Type"
                                        onChange={(e) => handleUserTypeChange(e.target.value)}
                                    >
                                        <MenuItem value="family">Family User</MenuItem>
                                        <MenuItem value="external">External User</MenuItem>
                                    </Select>
                                </FormControl>
                            )}

                            {!editingUser && userType === "family" && (
                                <FormControl fullWidth sx={{ mb: 2.2 }}>
                                    <InputLabel>Family Member</InputLabel>
                                    <Select
                                        value={selectedAppUser}
                                        label="Family Member"
                                        onChange={(e) => handleFamilyUserChange(e.target.value)}
                                    >
                                        <MenuItem value="">Select family member</MenuItem>
                                        {availableUsers.map((item) => (
                                            <MenuItem key={item.id} value={item.id}>
                                                {item.full_name}
                                                {item.email ? ` — ${item.email}` : ""}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            )}

                            <TextField
                                fullWidth
                                label="Full Name"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                disabled={userType === "family"}
                                InputProps={{ readOnly: userType === "family" }}
                                sx={{ mb: 2.2 }}
                            />

                            <TextField
                                fullWidth
                                label="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                helperText="Used to log in to the Billing System"
                                sx={{ mb: 2.2 }}
                            />

                            <Box sx={{ position: "relative", mb: 2 }}>
                                <TextField
                                    fullWidth
                                    type={showPassword ? "text" : "password"}
                                    label={editingUser ? "New Password" : "Initial Password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    helperText={
                                        editingUser
                                            ? "Leave blank to keep the existing password"
                                            : "Minimum 6 characters"
                                    }
                                    sx={{ "& .MuiInputBase-input": { pr: 6 } }}
                                />
                                <IconButton
                                    onClick={() => setShowPassword(!showPassword)}
                                    sx={{
                                        position: "absolute",
                                        right: 6,
                                        top: 7,
                                        color: MAROON
                                    }}
                                    aria-label="Toggle password visibility"
                                >
                                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                </IconButton>
                            </Box>

                            <Box sx={{ position: "relative", mb: 2 }}>
                                <TextField
                                    fullWidth
                                    type={showConfirmPassword ? "text" : "password"}
                                    label="Confirm Password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    helperText="Re-enter the password"
                                    sx={{ "& .MuiInputBase-input": { pr: 6 } }}
                                />
                                <IconButton
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    sx={{
                                        position: "absolute",
                                        right: 6,
                                        top: 7,
                                        color: MAROON
                                    }}
                                    aria-label="Toggle confirm password visibility"
                                >
                                    {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                </IconButton>
                            </Box>

                            {editingUser && (
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={active}
                                            onChange={(e) => setActive(e.target.checked)}
                                            sx={{ color: MAROON, "&.Mui-checked": { color: MAROON } }}
                                        />
                                    }
                                    label="Active"
                                />
                            )}
                        </Box>

                        {/* RIGHT TABBED AREA */}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Tabs
                                value={tab}
                                onChange={(_, value) => setTab(value)}
                                sx={{
                                    borderBottom: `1px solid ${BORDER}`,
                                    "& .MuiTabs-indicator": { backgroundColor: MAROON },
                                    "& .MuiTab-root.Mui-selected": { color: MAROON }
                                }}
                            >
                                <Tab icon={<ShieldIcon />} iconPosition="start" label="ROLES" />
                                <Tab icon={<PersonIcon />} iconPosition="start" label="PROFILE" />
                                <Tab icon={<HistoryIcon />} iconPosition="start" label="LOGIN ACTIVITY" />
                            </Tabs>

                            <Box sx={{ p: 3 }}>
                                {tab === 0 && (
                                    <Box>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                gap: 2,
                                                mb: 2
                                            }}
                                        >
                                            <Box>
                                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                                    Assigned Roles
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Select one or more roles for this user.
                                                </Typography>
                                            </Box>

                                            <Button
                                                variant="contained"
                                                startIcon={<AddIcon />}
                                                onClick={openRoleDialog}
                                                sx={{
                                                    backgroundColor: MAROON,
                                                    "&:hover": { backgroundColor: "#700000" }
                                                }}
                                            >
                                                ADD ROLES
                                            </Button>
                                        </Box>

                                        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1, mb: 3 }}>
                                            {selectedRoles.map((item) => (
                                                <Chip
                                                    key={item.id}
                                                    icon={<ShieldIcon />}
                                                    label={item.role_name}
                                                    onDelete={() => removeRole(item.id)}
                                                    sx={{
                                                        backgroundColor: LIGHT_MAROON,
                                                        color: MAROON,
                                                        border: `1px solid ${BORDER}`
                                                    }}
                                                />
                                            ))}

                                            {selectedRoles.length === 0 && (
                                                <Typography color="text.secondary">
                                                    No roles assigned.
                                                </Typography>
                                            )}
                                        </Stack>

                                        <Divider sx={{ mb: 2 }} />

                                        {selectedRoles.map((item) => (
                                            <Box
                                                key={item.id}
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 1.5,
                                                    p: 1.5,
                                                    mb: 1,
                                                    border: `1px solid ${BORDER}`,
                                                    borderRadius: 1.5
                                                }}
                                            >
                                                <ShieldIcon sx={{ color: MAROON }} />
                                                <Box sx={{ flex: 1 }}>
                                                    <Typography sx={{ fontWeight: 600 }}>
                                                        {item.role_name}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {item.description || "No description"}
                                                    </Typography>
                                                </Box>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => removeRole(item.id)}
                                                    sx={{ color: MAROON }}
                                                >
                                                    <DeleteOutlineOutlinedIcon />
                                                </IconButton>
                                            </Box>
                                        ))}
                                    </Box>
                                )}

                                {tab === 1 && (
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                            Profile
                                        </Typography>

                                        <Stack spacing={2.2}>
                                            <TextField
                                                fullWidth
                                                label="Full Name"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                disabled={userType === "family"}
                                                InputProps={{ readOnly: userType === "family" }}
                                            />

                                            <TextField
                                                fullWidth
                                                label="Username"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                            />

                                            <TextField
                                                fullWidth
                                                label="User Type"
                                                value={userType === "external" ? "External User" : "Family User"}
                                                InputProps={{ readOnly: true }}
                                            />

                                            {userType === "family" && (
                                                <TextField
                                                    fullWidth
                                                    label="Email"
                                                    value={profile.email}
                                                    InputProps={{ readOnly: true }}
                                                />
                                            )}

                                            <TextField
                                                fullWidth
                                                label="Phone Number"
                                                value={profile.phone_no}
                                                onChange={(e) =>
                                                    userType === "external" &&
                                                    setProfile((current) => ({ ...current, phone_no: e.target.value }))
                                                }
                                                InputProps={{ readOnly: userType === "family" }}
                                                helperText={
                                                    userType === "family"
                                                        ? "Fetched from the family member record"
                                                        : "Phone number for this external Billing System user"
                                                }
                                            />

                                            <Box
                                                sx={{
                                                    border: `1px solid ${BORDER}`,
                                                    borderRadius: 1.5,
                                                    p: 2,
                                                    backgroundColor: "#fffafa"
                                                }}
                                            >
                                                <Typography sx={{ fontWeight: 600, mb: 1 }}>
                                                    Profile Photo
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                                                    Upload a separate Billing System profile photo. It is not taken from the family table.
                                                </Typography>

                                                <input
                                                    ref={photoInputRef}
                                                    type="file"
                                                    accept="image/jpeg,image/png,image/webp"
                                                    hidden
                                                    onChange={handlePhotoChange}
                                                />

                                                <Stack direction="row" spacing={2} alignItems="center">
                                                    <Avatar
                                                        src={profilePhoto || undefined}
                                                        sx={{ width: 82, height: 82, bgcolor: "#ddd", color: MAROON }}
                                                    >
                                                        {!profilePhoto && <PersonIcon />}
                                                    </Avatar>

                                                    <Button
                                                        variant="outlined"
                                                        startIcon={<UploadFileIcon />}
                                                        onClick={() => photoInputRef.current?.click()}
                                                        sx={{ color: MAROON, borderColor: MAROON }}
                                                    >
                                                        Select Photo
                                                    </Button>
                                                </Stack>
                                            </Box>
                                        </Stack>
                                    </Box>
                                )}

                                {tab === 2 && (
                                    <Box>
                                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                                            <HistoryIcon sx={{ color: MAROON }} />
                                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                                Login Activity
                                            </Typography>
                                        </Stack>
                                        <Typography color="text.secondary">
                                            Login activity will be displayed here once login auditing is enabled.
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    </Box>
                </DialogContent>

                <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${BORDER}` }}>
                    <Button onClick={closeDialog} disabled={loading}>
                        CANCEL
                    </Button>
                    <Button
                        variant="contained"
                        onClick={saveUser}
                        disabled={loading}
                        sx={{
                            backgroundColor: MAROON,
                            "&:hover": { backgroundColor: "#700000" }
                        }}
                    >
                        {loading ? "SAVING..." : editingUser ? "SAVE CHANGES" : "CREATE USER"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ADD ROLES DIALOG */}
            <Dialog
                open={roleDialogOpen}
                onClose={() => setRoleDialogOpen(false)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>Add Roles</DialogTitle>
                <DialogContent dividers>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Select any number of active roles. A user can have multiple roles.
                    </Typography>

                    <Stack spacing={0.5}>
                        {roles.map((item) => {
                            const checked = pendingRoleIds.includes(Number(item.id));

                            return (
                                <Box
                                    key={item.id}
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                        p: 1,
                                        border: `1px solid ${checked ? MAROON : BORDER}`,
                                        borderRadius: 1,
                                        backgroundColor: checked ? LIGHT_MAROON : "#fff"
                                    }}
                                >
                                    <Checkbox
                                        checked={checked}
                                        onChange={() => {
                                            const id = Number(item.id);
                                            setPendingRoleIds((current) =>
                                                current.includes(id)
                                                    ? current.filter((value) => value !== id)
                                                    : [...current, id]
                                            );
                                        }}
                                        sx={{
                                            color: MAROON,
                                            "&.Mui-checked": { color: MAROON }
                                        }}
                                    />
                                    <ListItemText
                                        primary={item.role_name}
                                        secondary={item.description || "No description"}
                                    />
                                </Box>
                            );
                        })}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRoleDialogOpen(false)}>CANCEL</Button>
                    <Button
                        variant="contained"
                        onClick={saveRolesFromDialog}
                        sx={{ backgroundColor: MAROON, "&:hover": { backgroundColor: "#700000" } }}
                    >
                        OK
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
