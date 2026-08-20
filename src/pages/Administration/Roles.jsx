import { useEffect, useMemo, useState } from "react";

import {
    Alert,
    Box,
    Button,
    Checkbox,
    Chip,
    CircularProgress,
    Collapse,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControlLabel,
    IconButton,
    Paper,
    Stack,
    Switch,
    Tab,
    Tabs,
    TextField,
    Typography
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import PeopleIcon from "@mui/icons-material/People";
import SecurityIcon from "@mui/icons-material/Security";
import ShieldIcon from "@mui/icons-material/Shield";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

import { apiFetch } from "../../api/api";

const MAROON = "#8b0000";
const MAROON_DARK = "#700000";
const SOFT_RED = "#fff7f7";
const GOLD_BG = "#fff3cd";

export default function Roles() {
    const [roles, setRoles] = useState([]);
    const [selectedRole, setSelectedRole] = useState(null);
    const [roleDetails, setRoleDetails] = useState(null);
    const [catalogue, setCatalogue] = useState({ modules: [], objects: [], operations: [], permissions: [] });
    const [tab, setTab] = useState(0);
    const [openModules, setOpenModules] = useState({});
    const [openObjects, setOpenObjects] = useState({});
    const [selectedPermissions, setSelectedPermissions] = useState(new Set());
    const [roleName, setRoleName] = useState("");
    const [description, setDescription] = useState("");
    const [active, setActive] = useState(true);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [userDialogOpen, setUserDialogOpen] = useState(false);
    const [allUsers, setAllUsers] = useState([]);
    const [selectedUserIds, setSelectedUserIds] = useState([]);

    const filteredRoles = useMemo(() => roles.filter((role) => `${role.role_name} ${role.description || ""}`.toLowerCase().includes(search.toLowerCase())), [roles, search]);

    const loadRoles = async () => {
        const response = await apiFetch("/api/rbac/roles");
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to load roles");
        setRoles(Array.isArray(data) ? data : []);
    };

    const loadCatalogue = async () => {
        const response = await apiFetch("/api/rbac/catalogue");
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to load permission catalogue");
        setCatalogue(data);
    };

    const loadRole = async (roleId) => {
        setLoading(true);
        try {
            const response = await apiFetch(`/api/rbac/roles/${roleId}`);
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Failed to load role");
            setRoleDetails(data);
            setRoleName(data.role?.role_name || "");
            setDescription(data.role?.description || "");
            setActive(data.role?.active !== false);
            setSelectedPermissions(new Set((data.permissions || []).map((p) => Number(p.id))));
            setOpenModules({});
            setOpenObjects({});
        } catch (err) {
            setError(err.message || "Failed to load role");
        } finally {
            setLoading(false);
        }
    };

    const initialLoad = async () => {
        try {
            setLoading(true);
            setError("");
            await Promise.all([loadRoles(), loadCatalogue()]);
        } catch (err) {
            setError(err.message || "Unable to load roles");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { initialLoad(); }, []);

    const createNewRole = () => {
        setSelectedRole({ id: null, isNew: true });
        setRoleDetails(null);
        setRoleName("");
        setDescription("");
        setActive(true);
        setTab(0);
        setSelectedPermissions(new Set());
        setOpenModules({});
        setOpenObjects({});
        setError("");
    };

    const selectRole = async (role) => {
        setSelectedRole(role);
        setTab(0);
        setError("");
        await loadRole(role.id);
    };

    const saveRole = async () => {
        if (!roleName.trim()) { setError("Role name is required"); return; }
        setSaving(true);
        setError("");
        try {
            let roleId = selectedRole?.id;
            const payload = { role_name: roleName.trim(), description: description.trim(), active };
            if (!roleId) {
                const response = await apiFetch("/api/rbac/roles", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || "Unable to create role");
                roleId = data.id;
            } else {
                const response = await apiFetch(`/api/rbac/roles/${roleId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || "Unable to update role");
            }
            const permissionResponse = await apiFetch(`/api/rbac/roles/${roleId}/permissions`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ permission_ids: [...selectedPermissions] }) });
            const permissionData = await permissionResponse.json();
            if (!permissionResponse.ok) throw new Error(permissionData.error || "Unable to save role permissions");
            await loadRoles();
            setSelectedRole({ id: roleId });
            await loadRole(roleId);
        } catch (err) {
            setError(err.message || "Unable to save role");
        } finally {
            setSaving(false);
        }
    };

    const togglePermission = (permissionId) => {
        setSelectedPermissions((current) => {
            const next = new Set(current);
            if (next.has(Number(permissionId))) next.delete(Number(permissionId));
            else next.add(Number(permissionId));
            return next;
        });
    };

    const permissionsForObject = (objectId) => catalogue.permissions.filter((permission) => Number(permission.object_id) === Number(objectId) && permission.active !== false);
    const objectsForModule = (moduleId) => catalogue.objects.filter((object) => Number(object.module_id) === Number(moduleId) && object.active !== false);

    const toggleObject = (objectId) => {
        const permissions = permissionsForObject(objectId).map((p) => Number(p.id));
        setSelectedPermissions((current) => {
            const next = new Set(current);
            const allSelected = permissions.length > 0 && permissions.every((id) => next.has(id));
            permissions.forEach((id) => allSelected ? next.delete(id) : next.add(id));
            return next;
        });
    };

    const toggleModule = (moduleId) => {
        const permissions = objectsForModule(moduleId).flatMap((object) => permissionsForObject(object.id).map((p) => Number(p.id)));
        setSelectedPermissions((current) => {
            const next = new Set(current);
            const allSelected = permissions.length > 0 && permissions.every((id) => next.has(id));
            permissions.forEach((id) => allSelected ? next.delete(id) : next.add(id));
            return next;
        });
    };


    const openUserDialog = async () => {
        try {
            setError("");
            const response = await apiFetch("/api/rbac/users");
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Failed to load users");
            setAllUsers(Array.isArray(data) ? data : []);
            setSelectedUserIds([]);
            setUserDialogOpen(true);
        } catch (err) {
            setError(err.message || "Unable to load users");
        }
    };

    const addUsersToRole = async () => {
        if (!selectedRole?.id || selectedUserIds.length === 0) return;
        setSaving(true);
        try {
            const response = await apiFetch(`/api/rbac/roles/${selectedRole.id}/users`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_ids: selectedUserIds })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Unable to add users to role");
            setUserDialogOpen(false);
            await loadRole(selectedRole.id);
            await loadRoles();
        } catch (err) {
            setError(err.message || "Unable to add users to role");
        } finally {
            setSaving(false);
        }
    };

    const removeUserFromRole = async (userId) => {
        if (!selectedRole?.id) return;
        if (!window.confirm("Remove this role from the selected user?")) return;
        try {
            const response = await apiFetch(`/api/rbac/roles/${selectedRole.id}/users/${userId}`, { method: "DELETE" });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Unable to remove user from role");
            await loadRole(selectedRole.id);
            await loadRoles();
        } catch (err) {
            setError(err.message || "Unable to remove user from role");
        }
    };

    return (
        <>
        <Box sx={{ pb: 4 }}>
            <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", sm: "center" }} spacing={2} sx={{ mb: 2.5 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: MAROON_DARK }}>Role Management</Typography>
                    <Typography color="text.secondary">Create roles and manage their permissions and users.</Typography>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={createNewRole} sx={{ backgroundColor: MAROON, minHeight: 46 }}>New Role</Button>
            </Stack>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "30% 70%" }, gap: 2 }}>
                <Paper sx={{ p: 1.5, border: "1px solid #eadede" }}>
                    <TextField fullWidth size="small" placeholder="Search roles..." value={search} onChange={(e) => setSearch(e.target.value)} sx={{ mb: 1 }} />
                    {loading && roles.length === 0 ? <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}><CircularProgress /></Box> : <Box>
                        {filteredRoles.map((role) => (
                            <Paper key={role.id} onClick={() => selectRole(role)} variant="outlined" sx={{ p: 1.25, mb: 0.75, cursor: "pointer", borderColor: Number(selectedRole?.id) === Number(role.id) ? MAROON : "#e6dddd", backgroundColor: Number(selectedRole?.id) === Number(role.id) ? SOFT_RED : "#fff" }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                                    <Box><Typography sx={{ fontWeight: 700, fontSize: 15 }}>{role.role_name}</Typography><Typography variant="body2" color="text.secondary" sx={{ fontSize: 12.5, lineHeight: 1.35 }}>{role.description || "No description"}</Typography></Box>
                                    <Chip size="small" label={role.active ? "Active" : "Inactive"} color={role.active ? "success" : "default"} />
                                </Stack>
                                <Stack direction="row" spacing={0.75} sx={{ mt: 0.75 }}><Chip size="small" icon={<PeopleIcon />} label={`${role.user_count || 0} users`} /><Chip size="small" sx={{ height: 24 }} icon={<SecurityIcon />} label={role.full_access ? "Full Access" : `${role.permission_count || 0} permissions`} /></Stack>
                            </Paper>
                        ))}
                    </Box>}
                </Paper>

                <Paper sx={{ border: "1px solid #eadede", overflow: "hidden" }}>
                    {!selectedRole ? <Box sx={{ p: 7, textAlign: "center" }}><ShieldIcon sx={{ fontSize: 54, color: "#d9c9c9", mb: 1 }} /><Typography variant="h6">Select a role</Typography><Typography color="text.secondary">Choose a role on the left to view and manage it.</Typography></Box> : <>
                        <Box sx={{ p: 2.5, borderBottom: "1px solid #eee" }}>
                            <Stack direction="row" spacing={1} alignItems="center"><ShieldIcon sx={{ color: MAROON }} /><Typography variant="h5" sx={{ fontWeight: 800 }}>{selectedRole.isNew ? "Create New Role" : `Edit Role - ${roleName}`}</Typography></Stack>
                        </Box>
                        <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ borderBottom: "1px solid #eee" }}>
                            <Tab icon={<SecurityIcon />} iconPosition="start" label={`Permissions ${selectedPermissions.size ? `(${selectedPermissions.size})` : ""}`} />
                            <Tab icon={<PeopleIcon />} iconPosition="start" label={`Users ${roleDetails?.users?.length ? `(${roleDetails.users.length})` : ""}`} />
                        </Tabs>

                        {tab === 0 && <Box sx={{ p: 2.5 }}>
                            <Paper variant="outlined" sx={{ p: 1.5, mb: 2 }}>
                                <Typography sx={{ fontWeight: 700, mb: 1.5 }}>Role Details</Typography>
                                <Box sx={{
                                    display: "grid",
                                    gridTemplateColumns: { xs: "1fr", md: "25% 35% 40%" },
                                    gap: 1.5,
                                    alignItems: "center"
                                }}>
                                    <TextField
                                        fullWidth
                                        required
                                        size="small"
                                        label="Role Name"
                                        value={roleName}
                                        onChange={(e) => setRoleName(e.target.value)}
                                    />

                                    <TextField
                                        fullWidth
                                        multiline
                                        minRows={3}
                                        label="Description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        sx={{
                                            "& .MuiInputBase-root": {
                                                minHeight: 72,
                                                alignItems: "flex-start"
                                            }
                                        }}
                                    />

                                    <Box sx={{
                                        display: "flex",
                                        flexDirection: { xs: "row", md: "column" },
                                        alignItems: { xs: "center", md: "stretch" },
                                        justifyContent: "center",
                                        gap: 1.5,
                                        height: "100%"
                                    }}>
                                        <FormControlLabel
                                            sx={{ m: 0 }}
                                            control={<Switch checked={active} onChange={(e) => setActive(e.target.checked)} />}
                                            label="Active"
                                        />
                                        <Button
                                            variant="contained"
                                            onClick={saveRole}
                                            disabled={saving}
                                            sx={{ backgroundColor: MAROON, minHeight: 42, width: 135, alignSelf: "flex-start" }}
                                        >
                                            {saving ? "Saving..." : "Save Changes"}
                                        </Button>
                                    </Box>
                                </Box>
                            </Paper>

                            <Paper variant="outlined" sx={{ p: 1.5, minWidth: 0, overflow: "hidden" }}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 1 }}><Box><Typography sx={{ fontWeight: 700 }}>Permissions</Typography><Typography variant="body2" color="text.secondary">Module → Object → Operation</Typography></Box><Typography variant="body2" sx={{ fontWeight: 700 }}>{selectedPermissions.size} selected</Typography></Stack>
                                    <Divider />
                                    {catalogue.modules.filter((m) => m.active !== false).map((module) => {
                                        const moduleObjects = objectsForModule(module.id);
                                        const modulePermissions = moduleObjects.flatMap((object) => permissionsForObject(object.id).map((p) => Number(p.id)));
                                        const moduleSelected = modulePermissions.length > 0 && modulePermissions.every((id) => selectedPermissions.has(id));
                                        return <Box key={module.id} sx={{ mt: 1 }}>
                                            <Paper variant="outlined" sx={{ p: 1, backgroundColor: "#faf5f5" }}>
                                                <Stack direction="row" alignItems="center"><IconButton size="small" onClick={() => setOpenModules((v) => ({ ...v, [module.id]: !v[module.id] }))}>{openModules[module.id] ? <ExpandMoreIcon /> : <ChevronRightIcon />}</IconButton><Checkbox checked={moduleSelected} indeterminate={!moduleSelected && modulePermissions.some((id) => selectedPermissions.has(id))} onChange={() => toggleModule(module.id)} /><Typography sx={{ fontWeight: 700 }}>{module.module_name}</Typography><Chip size="small" sx={{ ml: "auto" }} label={`${modulePermissions.filter((id) => selectedPermissions.has(id)).length}/${modulePermissions.length}`} /></Stack>
                                            </Paper>
                                            <Collapse in={Boolean(openModules[module.id])}>
                                                <Box sx={{ pl: 3 }}>
                                                    {moduleObjects.map((object) => {
                                                        const objectPermissions = permissionsForObject(object.id).map((p) => Number(p.id));
                                                        const objectSelected = objectPermissions.length > 0 && objectPermissions.every((id) => selectedPermissions.has(id));
                                                        return <Box key={object.id} sx={{ mt: 0.7 }}>
                                                            <Stack direction="row" alignItems="center"><IconButton size="small" onClick={() => setOpenObjects((v) => ({ ...v, [object.id]: !v[object.id] }))}>{openObjects[object.id] ? <ExpandMoreIcon /> : <ChevronRightIcon />}</IconButton><Checkbox checked={objectSelected} indeterminate={!objectSelected && objectPermissions.some((id) => selectedPermissions.has(id))} onChange={() => toggleObject(object.id)} /><Typography sx={{ fontWeight: 600 }}>{object.object_name}</Typography><Chip size="small" sx={{ ml: 1 }} label={object.object_type} /></Stack>
                                                            <Collapse in={Boolean(openObjects[object.id])}>
                                                                <Box
                                                                    sx={{
                                                                        pl: 5,
                                                                        pr: 1,
                                                                        pb: 1,
                                                                        display: "grid",
                                                                        gridTemplateColumns: "repeat(auto-fit, minmax(105px, 1fr))",
                                                                        columnGap: 1,
                                                                        rowGap: 0.5,
                                                                        minWidth: 0
                                                                    }}
                                                                >
                                                                    {permissionsForObject(object.id).map((permission) => (
                                                                        <FormControlLabel
                                                                            key={permission.id}
                                                                            sx={{
                                                                                m: 0,
                                                                                minWidth: 0,
                                                                                width: "100%",
                                                                                alignItems: "flex-start",
                                                                                "& .MuiFormControlLabel-label": {
                                                                                    minWidth: 0,
                                                                                    width: "100%",
                                                                                    overflowWrap: "anywhere"
                                                                                }
                                                                            }}
                                                                            control={
                                                                                <Checkbox
                                                                                    size="small"
                                                                                    checked={selectedPermissions.has(Number(permission.id))}
                                                                                    onChange={() => togglePermission(permission.id)}
                                                                                />
                                                                            }
                                                                            label={
                                                                                <Box sx={{ minWidth: 0 }}>
                                                                                    <Typography variant="body2" sx={{ lineHeight: 1.2, overflowWrap: "anywhere" }}>
                                                                                        {permission.operation_name}
                                                                                    </Typography>
                                                                                    <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.1, overflowWrap: "anywhere" }}>
                                                                                        {permission.operation_code}
                                                                                    </Typography>
                                                                                </Box>
                                                                            }
                                                                        />
                                                                    ))}
                                                                </Box>
                                                            </Collapse>
                                                        </Box>;
                                                    })}
                                                </Box>
                                            </Collapse>
                                        </Box>;
                                    })}
                                </Paper>
                        </Box>}

                        {tab === 1 && <Box sx={{ p: 2.5 }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}><Box><Typography variant="h6" sx={{ fontWeight: 700 }}>Users</Typography><Typography color="text.secondary">Users currently assigned to this role.</Typography></Box><Button variant="contained" startIcon={<AddIcon />} onClick={openUserDialog} sx={{ backgroundColor: MAROON }}>Add Users</Button></Stack>
                            <TableWrapper users={roleDetails?.users || []} onRemove={removeUserFromRole} />
                        </Box>}
                    </>}
                </Paper>
            </Box>
        </Box>

            <Dialog open={userDialogOpen} onClose={() => setUserDialogOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Add Users to {roleName}</DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={0.5}>
                        {allUsers.filter((user) => !(roleDetails?.users || []).some((assigned) => Number(assigned.id) === Number(user.id))).map((user) => (
                            <FormControlLabel
                                key={user.id}
                                control={<Checkbox checked={selectedUserIds.includes(Number(user.id))} onChange={(e) => setSelectedUserIds((current) => e.target.checked ? [...current, Number(user.id)] : current.filter((id) => id !== Number(user.id)))} />}
                                label={<Box><Typography sx={{ fontWeight: 600 }}>{user.full_name}</Typography><Typography variant="caption" color="text.secondary">{user.username || ""}</Typography></Box>}
                            />
                        ))}
                        {allUsers.filter((user) => !(roleDetails?.users || []).some((assigned) => Number(assigned.id) === Number(user.id))).length === 0 && <Typography color="text.secondary" sx={{ py: 3 }}>All users are already assigned to this role.</Typography>}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setUserDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={addUsersToRole} disabled={saving || selectedUserIds.length === 0} sx={{ backgroundColor: MAROON }}>Add Selected</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

function TableWrapper({ users, onRemove }) {
    return <Paper variant="outlined"><Box sx={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse" }}><thead><tr>{["User", "Username", "Type", "Status", ""].map((heading) => <th key={heading} style={{ textAlign: "left", padding: 12, background: "#fff7f7", borderBottom: "1px solid #eee" }}>{heading}</th>)}</tr></thead><tbody>{users.length ? users.map((user) => <tr key={user.id}><td style={{ padding: 12, borderBottom: "1px solid #eee", fontWeight: 600 }}>{user.full_name}</td><td style={{ padding: 12, borderBottom: "1px solid #eee" }}>{user.username || "-"}</td><td style={{ padding: 12, borderBottom: "1px solid #eee" }}>{user.user_type === "external" ? "External" : "Family"}</td><td style={{ padding: 12, borderBottom: "1px solid #eee" }}><Chip size="small" label={user.active ? "Active" : "Inactive"} color={user.active ? "success" : "default"} /></td><td style={{ padding: 12, borderBottom: "1px solid #eee" }}><IconButton size="small" onClick={() => onRemove(user.id)} sx={{ color: "#b00020" }}><DeleteOutlineOutlinedIcon /></IconButton></td></tr>) : <tr><td colSpan="5" style={{ padding: 35, textAlign: "center", color: "#777" }}>No users assigned to this role.</td></tr>}</tbody></table></Box></Paper>;
}
