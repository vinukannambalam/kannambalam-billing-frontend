import { useEffect, useMemo, useState } from "react";

import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Checkbox,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    FormControlLabel,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Snackbar,
    Stack,
    Switch,
    Tab,
    Tabs,
    TextField,
    Tooltip,
    Typography
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import AppsIcon from "@mui/icons-material/Apps";
import BuildIcon from "@mui/icons-material/Build";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CloseIcon from "@mui/icons-material/Close";
import CodeIcon from "@mui/icons-material/Code";
import EditIcon from "@mui/icons-material/Edit";
import ExtensionIcon from "@mui/icons-material/Extension";
import RefreshIcon from "@mui/icons-material/Refresh";
import TuneIcon from "@mui/icons-material/Tune";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import WorkspacesIcon from "@mui/icons-material/Workspaces";

import { apiFetch } from "../../api/api";

const MAROON = "#8B0000";
const MAROON_DARK = "#700000";
const GOLD = "#C58B24";
const SOFT_RED = "#fff5f5";

const objectTypes = [
    { value: "PAGE", label: "Page" },
    { value: "REPORT", label: "Report" },
    { value: "FORM", label: "Form" },
    { value: "LIST", label: "List" },
    { value: "PRINT", label: "Print" },
    { value: "OTHER", label: "Other" }
];

export default function PermissionCatalogue() {

    // Administrator: view only. Developer: full catalogue management.
    const storedUser = localStorage.getItem("billing_user");
    let currentUser = null;
    try {
        currentUser = storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
        console.error("Unable to read logged-in user:", error);
    }
    const userRole = String(currentUser?.role || "").trim().toLowerCase();
    const canManageCatalogue = userRole === "developer";

    const [catalogue, setCatalogue] = useState({
        modules: [],
        objects: [],
        operations: [],
        permissions: []
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [tab, setTab] = useState(0);
    const [selectedModuleId, setSelectedModuleId] = useState(null);
    const [selectedObjectId, setSelectedObjectId] = useState(null);

    const [moduleDialog, setModuleDialog] = useState(false);
    const [objectDialog, setObjectDialog] = useState(false);
    const [operationDialog, setOperationDialog] = useState(false);

    const [editingModule, setEditingModule] = useState(null);
    const [editingObject, setEditingObject] = useState(null);
    const [editingOperation, setEditingOperation] = useState(null);

    const [toast, setToast] = useState({
        open: false,
        message: "",
        severity: "success"
    });

    const loadCatalogue = async (preserveSelection = true) => {
        try {
            setLoading(true);
            setError("");

            const response = await apiFetch("/api/rbac/catalogue");
            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Failed to load permission catalogue"
                );
            }

            setCatalogue({
                modules: Array.isArray(data.modules) ? data.modules : [],
                objects: Array.isArray(data.objects) ? data.objects : [],
                operations: Array.isArray(data.operations)
                    ? data.operations
                    : [],
                permissions: Array.isArray(data.permissions)
                    ? data.permissions
                    : []
            });

            if (!preserveSelection) {
                setSelectedModuleId(null);
                setSelectedObjectId(null);
            }
        } catch (err) {
            console.error("Permission catalogue error:", err);
            setError(
                err.message || "Failed to load permission catalogue"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCatalogue(false);
    }, []);

    const activeModules = useMemo(
        () =>
            catalogue.modules.filter(
                (module) => module.active !== false
            ),
        [catalogue.modules]
    );

    const activeOperations = useMemo(
        () =>
            catalogue.operations.filter(
                (operation) => operation.active !== false
            ),
        [catalogue.operations]
    );

    const selectedModule = useMemo(
        () =>
            catalogue.modules.find(
                (module) =>
                    Number(module.id) === Number(selectedModuleId)
            ) || null,
        [catalogue.modules, selectedModuleId]
    );

    const moduleObjects = useMemo(
        () =>
            catalogue.objects
                .filter(
                    (object) =>
                        Number(object.module_id) ===
                        Number(selectedModuleId)
                )
                .sort(
                    (a, b) =>
                        Number(a.display_order || 0) -
                        Number(b.display_order || 0)
                ),
        [catalogue.objects, selectedModuleId]
    );

    const selectedObject = useMemo(
        () =>
            catalogue.objects.find(
                (object) =>
                    Number(object.id) === Number(selectedObjectId)
            ) || null,
        [catalogue.objects, selectedObjectId]
    );

    const selectedObjectPermissions = useMemo(
        () =>
            catalogue.permissions.filter(
                (permission) =>
                    Number(permission.object_id) ===
                    Number(selectedObjectId)
            ),
        [catalogue.permissions, selectedObjectId]
    );

    const showToast = (message, severity = "success") => {
        setToast({
            open: true,
            message,
            severity
        });
    };

    const selectModule = (module) => {
        setSelectedModuleId(module.id);
        setSelectedObjectId(null);
    };

    const selectObject = (object) => {
        setSelectedObjectId(object.id);
    };

    const openNewModule = () => {
        setEditingModule(null);
        setModuleDialog(true);
    };

    const openEditModule = (module) => {
        setEditingModule(module);
        setModuleDialog(true);
    };

    const openNewObject = () => {
        if (!selectedModule) {
            showToast(
                "Please select a module first",
                "warning"
            );
            return;
        }

        setEditingObject(null);
        setObjectDialog(true);
    };

    const openEditObject = (object) => {
        setEditingObject(object);
        setObjectDialog(true);
    };

    const openNewOperation = () => {
        setEditingOperation(null);
        setOperationDialog(true);
    };

    const openEditOperation = (operation) => {
        setEditingOperation(operation);
        setOperationDialog(true);
    };

    const saveModule = async (form) => {
        try {
            setSaving(true);

            const response = await apiFetch(
                editingModule
                    ? `/api/rbac/modules/${editingModule.id}`
                    : "/api/rbac/modules",
                {
                    method: editingModule ? "PUT" : "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(form)
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Unable to save module"
                );
            }

            setModuleDialog(false);
            await loadCatalogue();

            if (!editingModule) {
                setSelectedModuleId(data.id);
            }

            showToast(
                editingModule
                    ? "Module updated successfully"
                    : "Module created successfully"
            );
        } catch (err) {
            showToast(
                err.message || "Unable to save module",
                "error"
            );
        } finally {
            setSaving(false);
        }
    };

    const saveObject = async (form) => {
        try {
            setSaving(true);

            const response = await apiFetch(
                editingObject
                    ? `/api/rbac/objects/${editingObject.id}`
                    : "/api/rbac/objects",
                {
                    method: editingObject ? "PUT" : "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(
                        editingObject
                            ? form
                            : {
                                ...form,
                                module_id: selectedModuleId
                            }
                    )
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Unable to save object"
                );
            }

            setObjectDialog(false);

            /*
             * New objects return their id. Existing objects remain
             * selected. Reloading also brings the generated permissions
             * into the catalogue.
             */
            await loadCatalogue();

            if (!editingObject && data.object_id) {
                setSelectedObjectId(data.object_id);
            }

            showToast(
                editingObject
                    ? "Permission object updated"
                    : "Permission object created"
            );
        } catch (err) {
            showToast(
                err.message || "Unable to save object",
                "error"
            );
        } finally {
            setSaving(false);
        }
    };

    const saveOperation = async (form) => {
        try {
            setSaving(true);

            const response = await apiFetch(
                editingOperation
                    ? `/api/rbac/operations/${editingOperation.id}`
                    : "/api/rbac/operations",
                {
                    method: editingOperation ? "PUT" : "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(form)
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Unable to save operation"
                );
            }

            setOperationDialog(false);
            await loadCatalogue();

            showToast(
                editingOperation
                    ? "Operation updated"
                    : "Operation created"
            );
        } catch (err) {
            showToast(
                err.message || "Unable to save operation",
                "error"
            );
        } finally {
            setSaving(false);
        }
    };

    const updateObjectOperations = async (
        object,
        operationIds
    ) => {
        try {
            setSaving(true);

            const response = await apiFetch(
                `/api/rbac/objects/${object.id}/operations`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        operation_ids: operationIds
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Unable to update operations"
                );
            }

            await loadCatalogue();

            showToast(
                "Object operations updated"
            );
        } catch (err) {
            showToast(
                err.message ||
                "Unable to update operations",
                "error"
            );
        } finally {
            setSaving(false);
        }
    };

    const moduleObjectCount = (moduleId) =>
        catalogue.objects.filter(
            (object) =>
                Number(object.module_id) ===
                Number(moduleId)
        ).length;

    const permissionCountForObject = (objectId) =>
        catalogue.permissions.filter(
            (permission) =>
                Number(permission.object_id) ===
                Number(objectId) &&
                permission.active !== false
        ).length;

    if (loading) {
        return (
            <Box
                sx={{
                    minHeight: "55vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }}
            >
                <Stack
                    spacing={1.5}
                    alignItems="center"
                >
                    <CircularProgress
                        size={38}
                        sx={{ color: MAROON }}
                    />
                    <Typography color="text.secondary">
                        Loading permission catalogue...
                    </Typography>
                </Stack>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                p: { xs: 2, md: 3 },
                maxWidth: 1500,
                mx: "auto"
            }}
        >
            {/* PAGE HEADER */}
            <Paper
                elevation={0}
                sx={{
                    mb: 2.5,
                    overflow: "hidden",
                    borderRadius: 2.5,
                    border: "1px solid #eadada",
                    background:
                        "linear-gradient(135deg, #8b0000 0%, #a50d0d 55%, #c58b24 100%)",
                    color: "#fff"
                }}
            >
                <Box
                    sx={{
                        p: { xs: 2.5, md: 3 },
                        position: "relative"
                    }}
                >
                    <Box
                        sx={{
                            position: "absolute",
                            right: -45,
                            top: -75,
                            width: 210,
                            height: 210,
                            borderRadius: "50%",
                            background:
                                "rgba(255,255,255,0.08)"
                        }}
                    />

                    <Stack
                        direction={{
                            xs: "column",
                            md: "row"
                        }}
                        justifyContent="space-between"
                        alignItems={{
                            xs: "flex-start",
                            md: "center"
                        }}
                        spacing={2}
                        sx={{ position: "relative" }}
                    >
                        <Box>
                            <Stack
                                direction="row"
                                spacing={1.2}
                                alignItems="center"
                                sx={{ mb: 0.5 }}
                            >
                                <TuneIcon />
                                <Typography
                                    variant="h5"
                                    sx={{
                                        fontWeight: 700
                                    }}
                                >
                                    Permission Catalogue
                                </Typography>
                            </Stack>

                            <Typography
                                variant="body2"
                                sx={{
                                    opacity: 0.92,
                                    maxWidth: 720
                                }}
                            >
                                Define Modules, Objects and Operations
                                that control access throughout Temple
                                Management.
                            </Typography>
                        </Box>

                        <Button
                            variant="outlined"
                            startIcon={<RefreshIcon />}
                            onClick={() =>
                                loadCatalogue()
                            }
                            sx={{
                                color: "#fff",
                                borderColor:
                                    "rgba(255,255,255,.7)",
                                "&:hover": {
                                    borderColor: "#fff",
                                    background:
                                        "rgba(255,255,255,.1)"
                                }
                            }}
                        >
                            Refresh
                        </Button>
                    </Stack>
                </Box>
            </Paper>

            {error && (
                <Alert
                    severity="error"
                    sx={{ mb: 2 }}
                >
                    {error}
                </Alert>
            )}

            {/* SUMMARY */}
            <Grid
                container
                spacing={2}
                sx={{ mb: 2.5 }}
            >
                {[
                    {
                        label: "Modules",
                        value: catalogue.modules.length,
                        icon: <AppsIcon />,
                        color: "#8B0000"
                    },
                    {
                        label: "Objects",
                        value: catalogue.objects.length,
                        icon: <ViewModuleIcon />,
                        color: "#9d4b00"
                    },
                    {
                        label: "Operations",
                        value: catalogue.operations.length,
                        icon: <BuildIcon />,
                        color: "#8a6500"
                    },
                    {
                        label: "Permissions",
                        value: catalogue.permissions.filter(
                            (p) => p.active !== false
                        ).length,
                        icon: <CheckCircleIcon />,
                        color: "#2e7d32"
                    }
                ].map((item) => (
                    <Grid
                        item
                        xs={6}
                        md={3}
                        key={item.label}
                    >
                        <Card
                            elevation={0}
                            sx={{
                                height: "100%",
                                border:
                                    "1px solid #eadede",
                                borderRadius: 2,
                                background:
                                    "#fff"
                            }}
                        >
                            <CardContent
                                sx={{
                                    p: 2,
                                    "&:last-child": {
                                        pb: 2
                                    }
                                }}
                            >
                                <Stack
                                    direction="row"
                                    spacing={1.5}
                                    alignItems="center"
                                >
                                    <Box
                                        sx={{
                                            width: 42,
                                            height: 42,
                                            borderRadius: 1.5,
                                            display: "flex",
                                            alignItems:
                                                "center",
                                            justifyContent:
                                                "center",
                                            background:
                                                `${item.color}12`,
                                            color:
                                                item.color
                                        }}
                                    >
                                        {item.icon}
                                    </Box>

                                    <Box>
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                fontWeight: 700,
                                                lineHeight: 1.1
                                            }}
                                        >
                                            {item.value}
                                        </Typography>

                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            {item.label}
                                        </Typography>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* MAIN CATALOGUE */}
            <Paper
                elevation={0}
                sx={{
                    border:
                        "1px solid #e5dcdc",
                    borderRadius: 2.5,
                    overflow: "hidden",
                    background: "#fff"
                }}
            >
                <Tabs
                    value={tab}
                    onChange={(_, value) =>
                        setTab(value)
                    }
                    sx={{
                        px: 2,
                        borderBottom:
                            "1px solid #eadede",
                        "& .MuiTabs-indicator": {
                            backgroundColor: MAROON,
                            height: 3
                        },
                        "& .MuiTab-root": {
                            minHeight: 58,
                            textTransform: "none",
                            fontWeight: 600
                        },
                        "& .Mui-selected": {
                            color: MAROON
                        }
                    }}
                >
                    <Tab
                        icon={<AppsIcon />}
                        iconPosition="start"
                        label="Modules & Objects"
                    />
                    <Tab
                        icon={<BuildIcon />}
                        iconPosition="start"
                        label="Operations"
                    />
                </Tabs>

                {tab === 0 && (
                    <Box>
                        <Box
                            sx={{
                                p: 2,
                                background:
                                    "#fffafa",
                                borderBottom:
                                    "1px solid #eee"
                            }}
                        >
                            <Stack
                                direction={{
                                    xs: "column",
                                    sm: "row"
                                }}
                                justifyContent="space-between"
                                alignItems={{
                                    xs: "stretch",
                                    sm: "center"
                                }}
                                spacing={1.5}
                            >
                                <Box>
                                    <Typography
                                        variant="subtitle1"
                                        sx={{
                                            fontWeight: 700
                                        }}
                                    >
                                        Application Structure
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Select a module to manage
                                        its permission objects.
                                    </Typography>
                                </Box>

                                {canManageCatalogue && (
<Button
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    onClick={
                                        openNewModule
                                    }
                                    sx={{
                                        backgroundColor:
                                            MAROON,
                                        "&:hover": {
                                            backgroundColor:
                                                MAROON_DARK
                                        }
                                    }}
                                >
                                    Add Module
                                </Button>
                                )}
                            </Stack>
                        </Box>

                        <Grid
                            container
                            sx={{
                                minHeight: 500
                            }}
                        >
                            {/* MODULE LIST */}
                            <Grid
                                item
                                xs={12}
                                md={3.5}
                                sx={{
                                    borderRight: {
                                        xs: "none",
                                        md:
                                            "1px solid #eee"
                                    },
                                    borderBottom: {
                                        xs:
                                            "1px solid #eee",
                                        md: "none"
                                    }
                                }}
                            >
                                <Box sx={{ p: 1.5 }}>
                                    <Typography
                                        variant="overline"
                                        sx={{
                                            px: 1,
                                            color:
                                                "text.secondary",
                                            fontWeight: 700,
                                            letterSpacing:
                                                1
                                        }}
                                    >
                                        Modules
                                    </Typography>

                                    <Stack spacing={0.7}>
                                        {activeModules.map(
                                            (module) => {
                                                const selected =
                                                    Number(
                                                        selectedModuleId
                                                    ) ===
                                                    Number(
                                                        module.id
                                                    );

                                                return (
                                                    <Paper
                                                        key={
                                                            module.id
                                                        }
                                                        elevation={
                                                            0
                                                        }
                                                        onClick={() =>
                                                            selectModule(
                                                                module
                                                            )
                                                        }
                                                        sx={{
                                                            p: 1.2,
                                                            cursor:
                                                                "pointer",
                                                            border:
                                                                selected
                                                                    ? `1px solid ${MAROON}`
                                                                    : "1px solid transparent",
                                                            background:
                                                                selected
                                                                    ? SOFT_RED
                                                                    : "#fff",
                                                            borderRadius:
                                                                1.5,
                                                            transition:
                                                                "all .15s",
                                                            "&:hover":
                                                                {
                                                                    background:
                                                                        "#fff5f5"
                                                                }
                                                        }}
                                                    >
                                                        <Stack
                                                            direction="row"
                                                            alignItems="center"
                                                            spacing={
                                                                1.2
                                                            }
                                                        >
                                                            <Box
                                                                sx={{
                                                                    width: 36,
                                                                    height: 36,
                                                                    borderRadius: 1,
                                                                    display:
                                                                        "flex",
                                                                    alignItems:
                                                                        "center",
                                                                    justifyContent:
                                                                        "center",
                                                                    background:
                                                                        selected
                                                                            ? MAROON
                                                                            : "#f3eeee",
                                                                    color:
                                                                        selected
                                                                            ? "#fff"
                                                                            : MAROON
                                                                }}
                                                            >
                                                                <AppsIcon
                                                                    fontSize="small"
                                                                />
                                                            </Box>

                                                            <Box
                                                                sx={{
                                                                    flex: 1,
                                                                    minWidth: 0
                                                                }}
                                                            >
                                                                <Typography
                                                                    variant="body2"
                                                                    sx={{
                                                                        fontWeight: 700
                                                                    }}
                                                                >
                                                                    {
                                                                        module.module_name
                                                                    }
                                                                </Typography>

                                                                <Typography
                                                                    variant="caption"
                                                                    color="text.secondary"
                                                                >
                                                                    {
                                                                        moduleObjectCount(
                                                                            module.id
                                                                        )
                                                                    }{" "}
                                                                    objects
                                                                </Typography>
                                                            </Box>

                                                            <ChevronRightIcon
                                                                sx={{
                                                                    color:
                                                                        selected
                                                                            ? MAROON
                                                                            : "#aaa"
                                                                }}
                                                                fontSize="small"
                                                            />
                                                        </Stack>
                                                    </Paper>
                                                );
                                            }
                                        )}
                                    </Stack>
                                </Box>
                            </Grid>

                            {/* OBJECT LIST */}
                            <Grid
                                item
                                xs={12}
                                md={8.5}
                            >
                                {!selectedModule ? (
                                    <Box
                                        sx={{
                                            minHeight: 420,
                                            display:
                                                "flex",
                                            alignItems:
                                                "center",
                                            justifyContent:
                                                "center",
                                            p: 4
                                        }}
                                    >
                                        <Stack
                                            alignItems="center"
                                            spacing={1}
                                        >
                                            <WorkspacesIcon
                                                sx={{
                                                    fontSize: 52,
                                                    color:
                                                        "#d8caca"
                                                }}
                                            />
                                            <Typography
                                                variant="h6"
                                                color="text.secondary"
                                            >
                                                Select a module
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                align="center"
                                            >
                                                Choose a module on the
                                                left to view and manage
                                                its objects.
                                            </Typography>
                                        </Stack>
                                    </Box>
                                ) : (
                                    <Box>
                                        <Box
                                            sx={{
                                                p: 2,
                                                borderBottom:
                                                    "1px solid #eee"
                                            }}
                                        >
                                            <Stack
                                                direction={{
                                                    xs: "column",
                                                    sm: "row"
                                                }}
                                                justifyContent="space-between"
                                                alignItems={{
                                                    xs: "flex-start",
                                                    sm: "center"
                                                }}
                                                spacing={1}
                                            >
                                                <Box>
                                                    <Stack
                                                        direction="row"
                                                        spacing={1}
                                                        alignItems="center"
                                                    >
                                                        <Typography
                                                            variant="h6"
                                                            sx={{
                                                                fontWeight: 700,
                                                                color: MAROON
                                                            }}
                                                        >
                                                            {
                                                                selectedModule.module_name
                                                            }
                                                        </Typography>

                                                        <Chip
                                                            size="small"
                                                            label={
                                                                selectedModule.module_code
                                                            }
                                                            sx={{
                                                                fontFamily:
                                                                    "monospace",
                                                                background:
                                                                    "#f5eaea"
                                                            }}
                                                        />
                                                    </Stack>

                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                    >
                                                        {
                                                            selectedModule.description ||
                                                            "Permission objects in this module"
                                                        }
                                                    </Typography>
                                                </Box>

                                                {canManageCatalogue && (
<Stack
                                                    direction="row"
                                                    spacing={1}
                                                >
                                                    <Tooltip title="Edit module">
                                                        <IconButton
                                                            onClick={() =>
                                                                openEditModule(
                                                                    selectedModule
                                                                )
                                                            }
                                                            sx={{
                                                                color:
                                                                    MAROON
                                                            }}
                                                        >
                                                            <EditIcon />
                                                        </IconButton>
                                                    </Tooltip>

                                                    <Button
                                                        variant="contained"
                                                        size="small"
                                                        startIcon={
                                                            <AddIcon />
                                                        }
                                                        onClick={
                                                            openNewObject
                                                        }
                                                        sx={{
                                                            backgroundColor:
                                                                MAROON,
                                                            "&:hover":
                                                                {
                                                                    backgroundColor:
                                                                        MAROON_DARK
                                                                }
                                                        }}
                                                    >
                                                        Add Object
                                                    </Button>
                                                </Stack>
                                                )}
                                            </Stack>
                                        </Box>

                                        <Box sx={{ p: 2 }}>
                                            {moduleObjects.length ===
                                            0 ? (
                                                <Box
                                                    sx={{
                                                        py: 7,
                                                        textAlign:
                                                            "center"
                                                    }}
                                                >
                                                    <ViewModuleIcon
                                                        sx={{
                                                            fontSize: 48,
                                                            color:
                                                                "#d6caca"
                                                        }}
                                                    />
                                                    <Typography
                                                        variant="h6"
                                                        color="text.secondary"
                                                    >
                                                        No objects yet
                                                    </Typography>
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        sx={{
                                                            mb: 2
                                                        }}
                                                    >
                                                        Add the first page,
                                                        form or report for
                                                        this module.
                                                    </Typography>
                                                    {canManageCatalogue && (
<Button
                                                        variant="outlined"
                                                        startIcon={
                                                            <AddIcon />
                                                        }
                                                        onClick={
                                                            openNewObject
                                                        }
                                                        sx={{
                                                            color:
                                                                MAROON,
                                                            borderColor:
                                                                MAROON
                                                        }}
                                                    >
                                                        Add Object
                                                    </Button>
                                                    )}
                                                </Box>
                                            ) : (
                                                <Grid
                                                    container
                                                    spacing={1.5}
                                                >
                                                    {moduleObjects.map(
                                                        (object) => (
                                                            <Grid
                                                                item
                                                                xs={12}
                                                                sm={6}
                                                                lg={4}
                                                                key={
                                                                    object.id
                                                                }
                                                            >
                                                                <ObjectCard
                                                                    object={
                                                                        object
                                                                    }
                                                                    selected={
                                                                        Number(
                                                                            selectedObjectId
                                                                        ) ===
                                                                        Number(
                                                                            object.id
                                                                        )
                                                                    }
                                                                    permissionCount={permissionCountForObject(
                                                                        object.id
                                                                    )}
                                                                    onSelect={() =>
                                                                        selectObject(
                                                                            object
                                                                        )
                                                                    }
                                                                    onEdit={canManageCatalogue ? () => openEditObject(object) : undefined}
                                                                />
                                                            </Grid>
                                                        )
                                                    )}
                                                </Grid>
                                            )}
                                        </Box>
                                    </Box>
                                )}
                            </Grid>
                        </Grid>

                        {/* OBJECT DETAIL */}
                        {selectedObject && (
                            <ObjectOperationsPanel
                                object={
                                    selectedObject
                                }
                                operations={
                                    activeOperations
                                }
                                permissions={
                                    selectedObjectPermissions
                                }
                                saving={saving}
                                onSave={canManageCatalogue ? updateObjectOperations : undefined}
                            />
                        )}
                    </Box>
                )}

                {tab === 1 && (
                    <OperationsTab
                        operations={
                            catalogue.operations
                        }
                        onAdd={canManageCatalogue ? openNewOperation : undefined}
                        onEdit={canManageCatalogue ? openEditOperation : undefined}
                    />
                )}
            </Paper>

            <ModuleDialog
                open={moduleDialog}
                module={editingModule}
                saving={saving}
                onClose={() =>
                    setModuleDialog(false)
                }
                onSave={saveModule}
            />

            <ObjectDialog
                open={objectDialog}
                object={editingObject}
                saving={saving}
                onClose={() =>
                    setObjectDialog(false)
                }
                onSave={saveObject}
            />

            <OperationDialog
                open={operationDialog}
                operation={editingOperation}
                saving={saving}
                onClose={() =>
                    setOperationDialog(false)
                }
                onSave={saveOperation}
            />

            <Snackbar
                open={toast.open}
                autoHideDuration={3500}
                onClose={() =>
                    setToast({
                        ...toast,
                        open: false
                    })
                }
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right"
                }}
            >
                <Alert
                    severity={toast.severity}
                    onClose={() =>
                        setToast({
                            ...toast,
                            open: false
                        })
                    }
                    variant="filled"
                    sx={{ width: "100%" }}
                >
                    {toast.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}


/* =========================================================
   OBJECT CARD
========================================================= */

function ObjectCard({
    object,
    selected,
    permissionCount,
    onSelect,
    onEdit
}) {
    return (
        <Card
            elevation={0}
            onClick={onSelect}
            sx={{
                height: "100%",
                cursor: "pointer",
                border:
                    selected
                        ? `1px solid ${MAROON}`
                        : "1px solid #eadede",
                borderRadius: 2,
                background:
                    selected
                        ? "#fff8f8"
                        : "#fff",
                transition:
                    "transform .15s, box-shadow .15s",
                "&:hover": {
                    transform:
                        "translateY(-2px)",
                    boxShadow:
                        "0 6px 18px rgba(70,0,0,.09)"
                }
            }}
        >
            <CardContent
                sx={{
                    p: 1.7,
                    "&:last-child": {
                        pb: 1.7
                    }
                }}
            >
                <Stack
                    direction="row"
                    alignItems="flex-start"
                    spacing={1.2}
                >
                    <Box
                        sx={{
                            width: 40,
                            height: 40,
                            flexShrink: 0,
                            borderRadius: 1.2,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background:
                                selected
                                    ? MAROON
                                    : "#f6eeee",
                            color:
                                selected
                                    ? "#fff"
                                    : MAROON
                        }}
                    >
                        {object.object_type ===
                        "REPORT" ? (
                            <CodeIcon
                                fontSize="small"
                            />
                        ) : (
                            <ViewModuleIcon
                                fontSize="small"
                            />
                        )}
                    </Box>

                    <Box
                        sx={{
                            flex: 1,
                            minWidth: 0
                        }}
                    >
                        <Stack
                            direction="row"
                            alignItems="center"
                            spacing={0.7}
                        >
                            <Typography
                                variant="subtitle2"
                                sx={{
                                    fontWeight: 700,
                                    flex: 1
                                }}
                            >
                                {object.object_name}
                            </Typography>

                            {onEdit && (
<IconButton
                                size="small"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit();
                                }}
                                sx={{
                                    color:
                                        MAROON
                                }}
                            >
                                <EditIcon
                                    fontSize="small"
                                />
                            </IconButton>
                            )}
                        </Stack>

                        <Stack
                            direction="row"
                            spacing={0.7}
                            sx={{
                                mt: 0.7
                            }}
                            flexWrap="wrap"
                            useFlexGap
                        >
                            <Chip
                                size="small"
                                label={
                                    object.object_type
                                }
                                sx={{
                                    height: 22,
                                    fontSize: 11,
                                    background:
                                        "#f4eeee"
                                }}
                            />

                            <Chip
                                size="small"
                                label={`${permissionCount} permissions`}
                                icon={
                                    <CheckCircleIcon />
                                }
                                sx={{
                                    height: 22,
                                    fontSize: 11,
                                    background:
                                        "#eef7ef",
                                    color:
                                        "#2e7d32",
                                    "& .MuiChip-icon":
                                        {
                                            color:
                                                "#2e7d32"
                                        }
                                }}
                            />
                        </Stack>

                        <Typography
                            variant="caption"
                            sx={{
                                display: "block",
                                mt: 0.7,
                                color:
                                    "text.secondary",
                                fontFamily:
                                    "monospace",
                                whiteSpace:
                                    "nowrap",
                                overflow:
                                    "hidden",
                                textOverflow:
                                    "ellipsis"
                            }}
                        >
                            {object.object_code}
                        </Typography>
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
}


/* =========================================================
   OBJECT OPERATIONS PANEL
========================================================= */

function ObjectOperationsPanel({
    object,
    operations,
    permissions,
    saving,
    onSave
}) {
    const currentIds = useMemo(
        () =>
            new Set(
                permissions
                    .filter(
                        (permission) =>
                            permission.active !== false
                    )
                    .map((permission) =>
                        Number(
                            permission.operation_id
                        )
                    )
            ),
        [permissions]
    );

    const [selectedIds, setSelectedIds] =
        useState([]);

    useEffect(() => {
        setSelectedIds(
            Array.from(currentIds)
        );
    }, [object.id, permissions]);

    const toggle = (id) => {
        const numericId =
            Number(id);

        setSelectedIds((current) =>
            current.includes(numericId)
                ? current.filter(
                    (value) =>
                        value !== numericId
                )
                : [
                    ...current,
                    numericId
                ]
        );
    };

    const selectAll = () => {
        setSelectedIds(
            operations.map(
                (operation) =>
                    Number(operation.id)
            )
        );
    };

    const clearAll = () => {
        setSelectedIds([]);
    };

    return (
        <Box
            sx={{
                borderTop:
                    "1px solid #eadede",
                background:
                    "#fffafa"
            }}
        >
            <Box
                sx={{
                    px: 2,
                    py: 1.7
                }}
            >
                <Stack
                    direction={{
                        xs: "column",
                        sm: "row"
                    }}
                    justifyContent="space-between"
                    alignItems={{
                        xs: "flex-start",
                        sm: "center"
                    }}
                    spacing={1.5}
                >
                    <Box>
                        <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                        >
                            <ExtensionIcon
                                sx={{
                                    color:
                                        MAROON
                                }}
                            />
                            <Typography
                                variant="subtitle1"
                                sx={{
                                    fontWeight: 700
                                }}
                            >
                                Operations for{" "}
                                {object.object_name}
                            </Typography>
                        </Stack>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            Choose the actions that this object
                            supports. Permissions are generated
                            automatically.
                        </Typography>
                    </Box>

                    <Stack
                        direction="row"
                        spacing={1}
                    >
                        {onSave && (
                            <>
                                <Button
                            size="small"
                            onClick={
                                selectAll
                            }
                            sx={{
                                color:
                                    MAROON
                            }}
                        >
                            Select All
                        </Button>

                        <Button
                            size="small"
                            onClick={
                                clearAll
                            }
                            sx={{
                                color:
                                    "text.secondary"
                            }}
                        >
                            Clear All
                        </Button>

                        <Button
                            variant="contained"
                            size="small"
                            disabled={saving}
                            onClick={() =>
                                onSave(
                                    object,
                                    selectedIds
                                )
                            }
                            sx={{
                                backgroundColor:
                                    MAROON,
                                "&:hover": {
                                    backgroundColor:
                                        MAROON_DARK
                                }
                            }}
                        >
                            {saving
                                ? "Saving..."
                                : "Save Operations"}
                        </Button>
                                </>
                        )}
                    </Stack>
                </Stack>
            </Box>

            <Divider />

            <Box
                sx={{
                    px: 2,
                    py: 1.5
                }}
            >
                <Grid
                    container
                    spacing={1}
                >
                    {operations.map(
                        (operation) => {
                            const checked =
                                selectedIds.includes(
                                    Number(
                                        operation.id
                                    )
                                );

                            return (
                                <Grid
                                    item
                                    xs={12}
                                    sm={6}
                                    md={4}
                                    lg={3}
                                    key={
                                        operation.id
                                    }
                                >
                                    <Paper
                                        elevation={
                                            0
                                        }
                                        sx={{
                                            border:
                                                checked
                                                    ? `1px solid ${MAROON}`
                                                    : "1px solid #e6dddd",
                                            background:
                                                checked
                                                    ? "#fff3f3"
                                                    : "#fff",
                                            borderRadius:
                                                1.5,
                                            px: 1,
                                            py: 0.5
                                        }}
                                    >
                                        <FormControlLabel
                                            sx={{
                                                width:
                                                    "100%",
                                                m: 0
                                            }}
                                            control={
                                                <Checkbox
                                                    size="small"
                                                    checked={
                                                        selectedIds.includes(
                                                            Number(
                                                                operation.id
                                                            )
                                                        )
                                                    }
                                                    disabled={!onSave}
                                                    onChange={() =>
                                                        toggle(
                                                            operation.id
                                                        )
                                                    }
                                                    sx={{
                                                        color:
                                                            "#b9a1a1",
                                                        "&.Mui-checked":
                                                            {
                                                                color:
                                                                    MAROON
                                                            }
                                                    }}
                                                />
                                            }
                                            label={
                                                <Box>
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            fontWeight:
                                                                600
                                                        }}
                                                    >
                                                        {
                                                            operation.operation_name
                                                        }
                                                    </Typography>
                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                        sx={{
                                                            fontFamily:
                                                                "monospace"
                                                        }}
                                                    >
                                                        {
                                                            operation.operation_code
                                                        }
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                    </Paper>
                                </Grid>
                            );
                        }
                    )}
                </Grid>

                <Alert
                    severity="info"
                    icon={<CodeIcon />}
                    sx={{
                        mt: 1.5,
                        background:
                            "#f8f6f2",
                        color:
                            "#5d5144",
                        border:
                            "1px solid #e9dfd2"
                    }}
                >
                    Generated permissions follow the pattern{" "}
                    <strong>
                        {object.object_code}.operation
                    </strong>
                    . The technical permission code is managed
                    automatically.
                </Alert>
            </Box>
        </Box>
    );
}


/* =========================================================
   OPERATIONS TAB
========================================================= */

function OperationsTab({
    operations,
    onAdd,
    onEdit
}) {
    return (
        <Box>
            <Box
                sx={{
                    p: 2,
                    background:
                        "#fffafa",
                    borderBottom:
                        "1px solid #eee"
                }}
            >
                <Stack
                    direction={{
                        xs: "column",
                        sm: "row"
                    }}
                    justifyContent="space-between"
                    alignItems={{
                        xs: "flex-start",
                        sm: "center"
                    }}
                    spacing={1.5}
                >
                    <Box>
                        <Typography
                            variant="subtitle1"
                            sx={{
                                fontWeight: 700
                            }}
                        >
                            Operations
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            Reusable actions such as View, Create,
                            Post, Print and Excel Export.
                        </Typography>
                    </Box>

                    {onAdd && (
<Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={onAdd}
                        sx={{
                            backgroundColor:
                                MAROON,
                            "&:hover": {
                                backgroundColor:
                                    MAROON_DARK
                            }
                        }}
                    >
                        Add Operation
                    </Button>
                    )}
                </Stack>
            </Box>

            <Box sx={{ p: 2 }}>
                <Grid
                    container
                    spacing={1.5}
                >
                    {operations.map(
                        (operation, index) => (
                            <Grid
                                item
                                xs={12}
                                sm={6}
                                md={4}
                                lg={3}
                                key={
                                    operation.id
                                }
                            >
                                <Card
                                    elevation={
                                        0
                                    }
                                    sx={{
                                        border:
                                            "1px solid #eadede",
                                        borderRadius:
                                            2,
                                        height:
                                            "100%"
                                    }}
                                >
                                    <CardContent
                                        sx={{
                                            p: 1.7,
                                            "&:last-child":
                                                {
                                                    pb: 1.7
                                                }
                                        }}
                                    >
                                        <Stack
                                            direction="row"
                                            spacing={1.2}
                                            alignItems="center"
                                        >
                                            <Box
                                                sx={{
                                                    width: 38,
                                                    height: 38,
                                                    borderRadius: 1,
                                                    background:
                                                        "#f6eeee",
                                                    color:
                                                        MAROON,
                                                    display:
                                                        "flex",
                                                    alignItems:
                                                        "center",
                                                    justifyContent:
                                                        "center"
                                                }}
                                            >
                                                <BuildIcon
                                                    fontSize="small"
                                                />
                                            </Box>

                                            <Box
                                                sx={{
                                                    flex:
                                                        1,
                                                    minWidth:
                                                        0
                                                }}
                                            >
                                                <Typography
                                                    variant="subtitle2"
                                                    sx={{
                                                        fontWeight:
                                                            700
                                                    }}
                                                >
                                                    {
                                                        operation.operation_name
                                                    }
                                                </Typography>

                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        fontFamily:
                                                            "monospace",
                                                        color:
                                                            "text.secondary"
                                                    }}
                                                >
                                                    {
                                                        operation.operation_code
                                                    }
                                                </Typography>
                                            </Box>

                                            {onEdit && (
<Tooltip title="Edit operation">
                                                <IconButton
                                                    size="small"
                                                    onClick={() =>
                                                        onEdit(
                                                            operation
                                                        )
                                                    }
                                                    sx={{
                                                        color:
                                                            MAROON
                                                    }}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            )}
                                        </Stack>

                                        <Divider
                                            sx={{
                                                my: 1.2
                                            }}
                                        />

                                        <Stack
                                            direction="row"
                                            justifyContent="space-between"
                                            alignItems="center"
                                        >
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                Operation #
                                                {index +
                                                    1}
                                            </Typography>

                                            <Chip
                                                size="small"
                                                label={
                                                    operation.active !==
                                                    false
                                                        ? "Active"
                                                        : "Inactive"
                                                }
                                                color={
                                                    operation.active !==
                                                    false
                                                        ? "success"
                                                        : "default"
                                                }
                                                sx={{
                                                    height: 22
                                                }}
                                            />
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Grid>
                        )
                    )}
                </Grid>
            </Box>
        </Box>
    );
}


/* =========================================================
   MODULE DIALOG
========================================================= */

function ModuleDialog({
    open,
    module,
    saving,
    onClose,
    onSave
}) {
    const [form, setForm] =
        useState({
            module_code: "",
            module_name: "",
            description: "",
            display_order: 0,
            active: true
        });

    useEffect(() => {
        setForm(
            module
                ? {
                    module_code:
                        module.module_code ||
                        "",
                    module_name:
                        module.module_name ||
                        "",
                    description:
                        module.description ||
                        "",
                    display_order:
                        module.display_order ||
                        0,
                    active:
                        module.active !==
                        false
                }
                : {
                    module_code: "",
                    module_name: "",
                    description: "",
                    display_order: 0,
                    active: true
                }
        );
    }, [module, open]);

    return (
        <Dialog
            open={open}
            onClose={saving ? undefined : onClose}
            fullWidth
            maxWidth="sm"
        >
            <DialogTitle
                sx={{
                    fontWeight: 700,
                    color: MAROON
                }}
            >
                {module
                    ? "Edit Module"
                    : "Add Module"}
            </DialogTitle>

            <DialogContent dividers>
                <Stack spacing={2} sx={{ pt: 0.5 }}>
                    <TextField
                        fullWidth
                        label="Module Code"
                        value={form.module_code}
                        disabled={Boolean(module)}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                module_code:
                                    e.target.value
                            })
                        }
                        helperText={
                            module
                                ? "Technical code cannot be changed after creation."
                                : "Use a short technical code, e.g. purchase"
                        }
                    />

                    <TextField
                        fullWidth
                        label="Module Name"
                        value={form.module_name}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                module_name:
                                    e.target.value
                            })
                        }
                    />

                    <TextField
                        fullWidth
                        multiline
                        minRows={2}
                        label="Description"
                        value={form.description}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                description:
                                    e.target.value
                            })
                        }
                    />

                    <TextField
                        fullWidth
                        type="number"
                        label="Display Order"
                        value={form.display_order}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                display_order:
                                    e.target.value
                            })
                        }
                    />

                    {module && (
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={
                                        form.active
                                    }
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            active:
                                                e.target
                                                    .checked
                                        })
                                    }
                                    sx={{
                                        "& .MuiSwitch-switchBase.Mui-checked":
                                            {
                                                color:
                                                    MAROON
                                            },
                                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                                            {
                                                backgroundColor:
                                                    MAROON
                                            }
                                    }}
                                />
                            }
                            label="Active"
                        />
                    )}
                </Stack>
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Button
                    onClick={onClose}
                    disabled={saving}
                >
                    Cancel
                </Button>

                <Button
                    variant="contained"
                    onClick={() =>
                        onSave(form)
                    }
                    disabled={
                        saving ||
                        !form.module_code.trim() ||
                        !form.module_name.trim()
                    }
                    sx={{
                        backgroundColor:
                            MAROON,
                        "&:hover": {
                            backgroundColor:
                                MAROON_DARK
                        }
                    }}
                >
                    {saving
                        ? "Saving..."
                        : module
                            ? "Save Changes"
                            : "Create Module"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}


/* =========================================================
   OBJECT DIALOG
========================================================= */

function ObjectDialog({
    open,
    object,
    saving,
    onClose,
    onSave
}) {
    const [form, setForm] =
        useState({
            object_code: "",
            object_name: "",
            object_type: "PAGE",
            display_order: 0,
            active: true,
            operation_ids: []
        });

    useEffect(() => {
        setForm(
            object
                ? {
                    object_code:
                        object.object_code ||
                        "",
                    object_name:
                        object.object_name ||
                        "",
                    object_type:
                        object.object_type ||
                        "PAGE",
                    display_order:
                        object.display_order ||
                        0,
                    active:
                        object.active !==
                        false,
                    operation_ids: []
                }
                : {
                    object_code: "",
                    object_name: "",
                    object_type: "PAGE",
                    display_order: 0,
                    active: true,
                    operation_ids: []
                }
        );
    }, [object, open]);

    return (
        <Dialog
            open={open}
            onClose={saving ? undefined : onClose}
            fullWidth
            maxWidth="sm"
        >
            <DialogTitle
                sx={{
                    fontWeight: 700,
                    color: MAROON
                }}
            >
                {object
                    ? "Edit Permission Object"
                    : "Add Permission Object"}
            </DialogTitle>

            <DialogContent dividers>
                <Stack spacing={2} sx={{ pt: 0.5 }}>
                    <TextField
                        fullWidth
                        label="Object Code"
                        value={form.object_code}
                        disabled={Boolean(object)}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                object_code:
                                    e.target.value
                            })
                        }
                        helperText={
                            object
                                ? "Technical code cannot be changed because it forms part of permission codes."
                                : "Example: accounts.cash_flow"
                        }
                    />

                    <TextField
                        fullWidth
                        label="Object Name"
                        value={form.object_name}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                object_name:
                                    e.target.value
                            })
                        }
                    />

                    <FormControl fullWidth>
                        <InputLabel>
                            Object Type
                        </InputLabel>

                        <Select
                            value={
                                form.object_type
                            }
                            label="Object Type"
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    object_type:
                                        e.target.value
                                })
                            }
                        >
                            {objectTypes.map(
                                (type) => (
                                    <MenuItem
                                        key={
                                            type.value
                                        }
                                        value={
                                            type.value
                                        }
                                    >
                                        {
                                            type.label
                                        }
                                    </MenuItem>
                                )
                            )}
                        </Select>
                    </FormControl>

                    <TextField
                        fullWidth
                        type="number"
                        label="Display Order"
                        value={form.display_order}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                display_order:
                                    e.target.value
                            })
                        }
                    />

                    {object && (
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={
                                        form.active
                                    }
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            active:
                                                e.target
                                                    .checked
                                        })
                                    }
                                    sx={{
                                        "& .MuiSwitch-switchBase.Mui-checked":
                                            {
                                                color:
                                                    MAROON
                                            },
                                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                                            {
                                                backgroundColor:
                                                    MAROON
                                            }
                                    }}
                                />
                            }
                            label="Active"
                        />
                    )}

                    {!object && (
                        <Alert
                            severity="info"
                            icon={
                                <ExtensionIcon />
                            }
                        >
                            After creating the object, select it and
                            choose its operations. The system will
                            generate the permissions automatically.
                        </Alert>
                    )}
                </Stack>
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Button
                    onClick={onClose}
                    disabled={saving}
                >
                    Cancel
                </Button>

                <Button
                    variant="contained"
                    onClick={() =>
                        onSave(form)
                    }
                    disabled={
                        saving ||
                        !form.object_code.trim() ||
                        !form.object_name.trim()
                    }
                    sx={{
                        backgroundColor:
                            MAROON,
                        "&:hover": {
                            backgroundColor:
                                MAROON_DARK
                        }
                    }}
                >
                    {saving
                        ? "Saving..."
                        : object
                            ? "Save Changes"
                            : "Create Object"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}


/* =========================================================
   OPERATION DIALOG
========================================================= */

function OperationDialog({
    open,
    operation,
    saving,
    onClose,
    onSave
}) {
    const [form, setForm] =
        useState({
            operation_code: "",
            operation_name: "",
            description: "",
            display_order: 0,
            active: true
        });

    useEffect(() => {
        setForm(
            operation
                ? {
                    operation_code:
                        operation.operation_code ||
                        "",
                    operation_name:
                        operation.operation_name ||
                        "",
                    description:
                        operation.description ||
                        "",
                    display_order:
                        operation.display_order ||
                        0,
                    active:
                        operation.active !==
                        false
                }
                : {
                    operation_code: "",
                    operation_name: "",
                    description: "",
                    display_order: 0,
                    active: true
                }
        );
    }, [operation, open]);

    return (
        <Dialog
            open={open}
            onClose={saving ? undefined : onClose}
            fullWidth
            maxWidth="sm"
        >
            <DialogTitle
                sx={{
                    fontWeight: 700,
                    color: MAROON
                }}
            >
                {operation
                    ? "Edit Operation"
                    : "Add Operation"}
            </DialogTitle>

            <DialogContent dividers>
                <Stack spacing={2} sx={{ pt: 0.5 }}>
                    <TextField
                        fullWidth
                        label="Operation Code"
                        value={
                            form.operation_code
                        }
                        disabled={Boolean(
                            operation
                        )}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                operation_code:
                                    e.target.value
                            })
                        }
                        helperText={
                            operation
                                ? "Technical code cannot be changed after creation."
                                : "Example: approve"
                        }
                    />

                    <TextField
                        fullWidth
                        label="Operation Name"
                        value={
                            form.operation_name
                        }
                        onChange={(e) =>
                            setForm({
                                ...form,
                                operation_name:
                                    e.target.value
                            })
                        }
                        helperText="This is the name administrators will see."
                    />

                    <TextField
                        fullWidth
                        multiline
                        minRows={2}
                        label="Description"
                        value={
                            form.description
                        }
                        onChange={(e) =>
                            setForm({
                                ...form,
                                description:
                                    e.target.value
                            })
                        }
                    />

                    <TextField
                        fullWidth
                        type="number"
                        label="Display Order"
                        value={
                            form.display_order
                        }
                        onChange={(e) =>
                            setForm({
                                ...form,
                                display_order:
                                    e.target.value
                            })
                        }
                    />

                    {operation && (
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={
                                        form.active
                                    }
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            active:
                                                e.target
                                                    .checked
                                        })
                                    }
                                    sx={{
                                        "& .MuiSwitch-switchBase.Mui-checked":
                                            {
                                                color:
                                                    MAROON
                                            },
                                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                                            {
                                                backgroundColor:
                                                    MAROON
                                            }
                                    }}
                                />
                            }
                            label="Active"
                        />
                    )}
                </Stack>
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Button
                    onClick={onClose}
                    disabled={saving}
                >
                    Cancel
                </Button>

                <Button
                    variant="contained"
                    onClick={() =>
                        onSave(form)
                    }
                    disabled={
                        saving ||
                        !form.operation_code.trim() ||
                        !form.operation_name.trim()
                    }
                    sx={{
                        backgroundColor:
                            MAROON,
                        "&:hover": {
                            backgroundColor:
                                MAROON_DARK
                        }
                    }}
                >
                    {saving
                        ? "Saving..."
                        : operation
                            ? "Save Changes"
                            : "Create Operation"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
