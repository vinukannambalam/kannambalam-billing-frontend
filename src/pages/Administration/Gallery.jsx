import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    Box,
    Typography,
    Paper,
    Button,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Switch,
    FormControlLabel,
    CircularProgress,
    Alert,
    Divider,
    Chip
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import TempleHinduIcon from "@mui/icons-material/TempleHindu";
import EventIcon from "@mui/icons-material/Event";
import LocalFloristIcon from "@mui/icons-material/LocalFlorist";
import HomeIcon from "@mui/icons-material/Home";

import { apiFetch } from "../../api/api";

export default function Gallery() {
    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    // =====================================================
    // CATEGORY DIALOG
    // =====================================================

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    const [nameEn, setNameEn] = useState("");
    const [nameMl, setNameMl] = useState("");
    const [descriptionEn, setDescriptionEn] = useState("");
    const [descriptionMl, setDescriptionMl] = useState("");
    const [icon, setIcon] = useState("");
    const [active, setActive] = useState(true);

    // =====================================================
    // DRAGGING
    // =====================================================

    const [draggingId, setDraggingId] = useState(null);
    const [dragOverId, setDragOverId] = useState(null);

    // =====================================================
    // CATEGORY ICON
    // =====================================================

    const getCategoryIcon = (category) => {
        switch (Number(category.id)) {
            case 1:
                return <TempleHinduIcon />;
            case 2:
                return <EventIcon />;
            case 3:
                return <LocalFloristIcon />;
            case 4:
                return <HomeIcon />;
            default:
                return <PhotoLibraryIcon />;
        }
    };

    // =====================================================
    // LOAD CATEGORIES
    // =====================================================

    const loadCategories = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await apiFetch(
                "/api/admin/gallery/categories"
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Failed to load gallery categories"
                );
            }

            const sorted = Array.isArray(data)
                ? [...data].sort(
                    (a, b) =>
                        Number(a.display_order || 0) -
                        Number(b.display_order || 0) ||
                        Number(a.id) - Number(b.id)
                )
                : [];

            setCategories(sorted);
        } catch (err) {
            console.error(
                "Gallery category loading error:",
                err
            );

            setError(
                err.message ||
                "Failed to load gallery categories"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCategories();
    }, []);

    // =====================================================
    // OPEN NEW CATEGORY
    // =====================================================

    const handleNew = () => {
        setEditingCategory(null);
        setNameEn("");
        setNameMl("");
        setDescriptionEn("");
        setDescriptionMl("");
        setIcon("");
        setActive(true);

        setError("");
        setMessage("");
        setDialogOpen(true);
    };

    // =====================================================
    // OPEN EDIT CATEGORY
    // =====================================================

    const handleEdit = (category) => {
        setEditingCategory(category);

        setNameEn(category.name_en || "");
        setNameMl(category.name_ml || "");
        setDescriptionEn(category.description_en || "");
        setDescriptionMl(category.description_ml || "");
        setIcon(category.icon || "");
        setActive(category.active !== false);

        setError("");
        setMessage("");
        setDialogOpen(true);
    };

    // =====================================================
    // CLOSE DIALOG
    // =====================================================

    const handleClose = () => {
        if (saving) {
            return;
        }

        setDialogOpen(false);
    };

    // =====================================================
    // SAVE CATEGORY
    // =====================================================

    const handleSave = async () => {
        if (!nameEn.trim()) {
            setError(
                "English category name is required"
            );
            return;
        }

        if (!nameMl.trim()) {
            setError(
                "Malayalam category name is required"
            );
            return;
        }

        try {
            setSaving(true);
            setError("");
            setMessage("");

            const isEdit = editingCategory !== null;

            const url = isEdit
                ? `/api/admin/gallery/categories/${editingCategory.id}`
                : "/api/admin/gallery/categories";

            const displayOrder = isEdit
                ? editingCategory.display_order
                : categories.length + 1;

            const response = await apiFetch(
                url,
                {
                    method: isEdit ? "PUT" : "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name_en: nameEn.trim(),
                        name_ml: nameMl.trim(),
                        description_en:
                            descriptionEn.trim() || null,
                        description_ml:
                            descriptionMl.trim() || null,
                        icon: icon.trim() || null,
                        display_order: displayOrder,
                        active
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Unable to save category"
                );
            }

            setDialogOpen(false);
            await loadCategories();

            setMessage(
                isEdit
                    ? "Category updated successfully"
                    : "Category added successfully"
            );
        } catch (err) {
            console.error(
                "Save gallery category error:",
                err
            );

            setError(
                err.message ||
                "Unable to save category"
            );
        } finally {
            setSaving(false);
        }
    };

    // =====================================================
    // TOGGLE ACTIVE
    // =====================================================

    const handleToggleActive = async (category) => {
        try {
            setSaving(true);
            setError("");
            setMessage("");

            const response = await apiFetch(
                `/api/admin/gallery/categories/${category.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name_en: category.name_en,
                        name_ml: category.name_ml || "",
                        description_en:
                            category.description_en || null,
                        description_ml:
                            category.description_ml || null,
                        icon: category.icon || null,
                        display_order:
                            category.display_order,
                        active: !category.active
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Unable to update category"
                );
            }

            await loadCategories();

            setMessage(
                !category.active
                    ? "Category activated"
                    : "Category deactivated"
            );
        } catch (err) {
            console.error(
                "Toggle category error:",
                err
            );

            setError(
                err.message ||
                "Unable to update category"
            );
        } finally {
            setSaving(false);
        }
    };

    // =====================================================
    // DRAG START
    // =====================================================

    const handleDragStart = (event, categoryId) => {
        setDraggingId(categoryId);

        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData(
            "text/plain",
            String(categoryId)
        );
    };

    // =====================================================
    // DRAG OVER
    // =====================================================

    const handleDragOver = (event, categoryId) => {
        event.preventDefault();

        if (
            draggingId === null ||
            draggingId === categoryId
        ) {
            return;
        }

        setDragOverId(categoryId);
    };

    // =====================================================
    // DRAG LEAVE
    // =====================================================

    const handleDragLeave = () => {
        setDragOverId(null);
    };

    // =====================================================
    // DROP
    // =====================================================

    const handleDrop = async (event, targetId) => {
        event.preventDefault();

        const sourceId = Number(
            event.dataTransfer.getData("text/plain")
        );

        if (
            !sourceId ||
            sourceId === targetId
        ) {
            setDraggingId(null);
            setDragOverId(null);
            return;
        }

        const oldCategories = [...categories];

        const sourceIndex = categories.findIndex(
            (item) =>
                Number(item.id) === sourceId
        );

        const targetIndex = categories.findIndex(
            (item) =>
                Number(item.id) === targetId
        );

        if (
            sourceIndex === -1 ||
            targetIndex === -1
        ) {
            setDraggingId(null);
            setDragOverId(null);
            return;
        }

        const reordered = [...categories];

        const [movedCategory] =
            reordered.splice(sourceIndex, 1);

        reordered.splice(
            targetIndex,
            0,
            movedCategory
        );

        setCategories(reordered);
        setDraggingId(null);
        setDragOverId(null);

        try {
            setSaving(true);
            setError("");
            setMessage("");

            for (
                let index = 0;
                index < reordered.length;
                index++
            ) {
                const category = reordered[index];
                const newOrder = index + 1;

                if (
                    Number(category.display_order) ===
                    newOrder
                ) {
                    continue;
                }

                const response = await apiFetch(
                    `/api/admin/gallery/categories/${category.id}`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type":
                                "application/json"
                        },
                        body: JSON.stringify({
                            name_en:
                                category.name_en,
                            name_ml:
                                category.name_ml || "",
                            description_en:
                                category.description_en ||
                                null,
                            description_ml:
                                category.description_ml ||
                                null,
                            icon:
                                category.icon || null,
                            display_order:
                                newOrder,
                            active:
                                category.active !== false
                        })
                    }
                );

                if (!response.ok) {
                    const data =
                        await response.json().catch(
                            () => ({})
                        );

                    throw new Error(
                        data.error ||
                        "Failed to save category order"
                    );
                }
            }

            setCategories(
                reordered.map(
                    (category, index) => ({
                        ...category,
                        display_order: index + 1
                    })
                )
            );

            setMessage(
                "Category order updated"
            );
        } catch (err) {
            console.error(
                "Category reorder error:",
                err
            );

            setCategories(oldCategories);

            setError(
                err.message ||
                "Failed to save category order"
            );
        } finally {
            setSaving(false);
        }
    };

    // =====================================================
    // DRAG END
    // =====================================================

    const handleDragEnd = () => {
        setDraggingId(null);
        setDragOverId(null);
    };

    // =====================================================
    // OPEN ALBUMS
    // =====================================================

    const handleManage = (category) => {
        navigate(
            `/gallery/${category.id}/albums`
        );
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
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5
                    }}
                >
                    <PhotoLibraryIcon
                        sx={{
                            fontSize: 34,
                            color: "#990000"
                        }}
                    />

                    <Box>
                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 700,
                                color: "#17202a"
                            }}
                        >
                            Gallery Management
                        </Typography>

                        <Typography
                            sx={{
                                color: "text.secondary",
                                mt: 0.25
                            }}
                        >
                            Manage temple photographs,
                            albums and gallery categories.
                        </Typography>
                    </Box>
                </Box>

                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleNew}
                    sx={{
                        backgroundColor: "#990000",
                        "&:hover": {
                            backgroundColor: "#7d0000"
                        }
                    }}
                >
                    Create Category
                </Button>
            </Box>

            {/* =================================================
                MESSAGES
            ================================================= */}

            {error && (
                <Alert
                    severity="error"
                    sx={{ mb: 2 }}
                    onClose={() => setError("")}
                >
                    {error}
                </Alert>
            )}

            {message && (
                <Alert
                    severity="success"
                    sx={{ mb: 2 }}
                    onClose={() => setMessage("")}
                >
                    {message}
                </Alert>
            )}

            {/* =================================================
                CATEGORY LIST
            ================================================= */}

            {loading ? (
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        py: 8
                    }}
                >
                    <CircularProgress />
                </Box>
            ) : categories.length === 0 ? (
                <Paper
                    elevation={0}
                    sx={{
                        p: 5,
                        textAlign: "center",
                        border: "1px solid #dedede",
                        borderRadius: 2
                    }}
                >
                    <PhotoLibraryIcon
                        sx={{
                            fontSize: 56,
                            color: "#c9c9c9",
                            mb: 1
                        }}
                    />

                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 700,
                            mb: 1
                        }}
                    >
                        No gallery categories found
                    </Typography>

                    <Typography
                        sx={{
                            color: "text.secondary",
                            mb: 2
                        }}
                    >
                        Create the first gallery category
                        to start organizing temple photographs.
                    </Typography>

                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleNew}
                        sx={{
                            backgroundColor: "#990000",
                            "&:hover": {
                                backgroundColor: "#7d0000"
                            }
                        }}
                    >
                        Create Category
                    </Button>
                </Paper>
            ) : (
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: {
                            xs: "1fr",
                            md: "repeat(2, minmax(0, 1fr))"
                        },
                        gap: 2
                    }}
                >
                    {categories.map(
                        (category) => (
                            <Paper
                                key={category.id}
                                draggable
                                onDragStart={(event) =>
                                    handleDragStart(
                                        event,
                                        category.id
                                    )
                                }
                                onDragOver={(event) =>
                                    handleDragOver(
                                        event,
                                        category.id
                                    )
                                }
                                onDragLeave={
                                    handleDragLeave
                                }
                                onDrop={(event) =>
                                    handleDrop(
                                        event,
                                        category.id
                                    )
                                }
                                onDragEnd={
                                    handleDragEnd
                                }
                                elevation={0}
                                sx={{
                                    minWidth: 0,
                                    minHeight: 220,
                                    border:
                                        dragOverId ===
                                        category.id
                                            ? "2px dashed #990000"
                                            : "1px solid #dedede",
                                    borderRadius: 2,
                                    backgroundColor:
                                        "#ffffff",
                                    display: "flex",
                                    flexDirection:
                                        "column",
                                    overflow: "hidden",
                                    opacity:
                                        draggingId ===
                                        category.id
                                            ? 0.55
                                            : 1,
                                    transition:
                                        "all 0.22s ease",
                                    "&:hover": {
                                        transform:
                                            "translateY(-4px)",
                                        borderColor:
                                            "#990000",
                                        boxShadow:
                                            "0 8px 22px rgba(0,0,0,0.12)"
                                    }
                                }}
                            >
                                {/* CARD BODY */}

                                <Box
                                    sx={{
                                        display: "flex",
                                        gap: 2,
                                        p: 2,
                                        flex: 1
                                    }}
                                >
                                    {/* DRAG HANDLE */}

                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems:
                                                "flex-start",
                                            pt: 0.5
                                        }}
                                    >
                                        <DragIndicatorIcon
                                            sx={{
                                                color: "#999",
                                                cursor: "grab"
                                            }}
                                        />
                                    </Box>

                                    {/* ICON */}

                                    <Box
                                        sx={{
                                            width: 64,
                                            height: 64,
                                            minWidth: 64,
                                            borderRadius: 2,
                                            backgroundColor:
                                                "#fff0f0",
                                            color: "#990000",
                                            display: "flex",
                                            alignItems:
                                                "center",
                                            justifyContent:
                                                "center"
                                        }}
                                    >
                                        {getCategoryIcon(
                                            category
                                        )}
                                    </Box>

                                    {/* TEXT */}

                                    <Box
                                        sx={{
                                            flex: 1,
                                            minWidth: 0
                                        }}
                                    >
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                fontWeight: 700,
                                                color: "#17202a",
                                                mb: 0.5
                                            }}
                                        >
                                            {category.name_en}
                                        </Typography>

                                        {category.name_ml && (
                                            <Typography
                                                sx={{
                                                    color: "#990000",
                                                    fontSize: "1rem",
                                                    fontWeight: 500,
                                                    mb: 1.25
                                                }}
                                            >
                                                {category.name_ml}
                                            </Typography>
                                        )}

                                        {category.description_en && (
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color:
                                                        "text.secondary",
                                                    lineHeight: 1.6
                                                }}
                                            >
                                                {
                                                    category.description_en
                                                }
                                            </Typography>
                                        )}

                                        {category.description_ml && (
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color:
                                                        "text.secondary",
                                                    lineHeight: 1.5,
                                                    mt: 0.5
                                                }}
                                            >
                                                {
                                                    category.description_ml
                                                }
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>

                                {/* CARD FOOTER */}

                                <Box
                                    sx={{
                                        borderTop:
                                            "1px solid #eeeeee",
                                        mx: 2.5,
                                        py: 1.25,
                                        display: "flex",
                                        alignItems:
                                            "center",
                                        justifyContent:
                                            "space-between",
                                        gap: 1
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems:
                                                "center",
                                            gap: 0.75
                                        }}
                                    >
                                        <Chip
                                            size="small"
                                            label={
                                                category.active
                                                    ? "Active"
                                                    : "Inactive"
                                            }
                                            sx={{
                                                height: 24,
                                                fontSize:
                                                    "0.72rem",
                                                backgroundColor:
                                                    category.active
                                                        ? "#edf7ed"
                                                        : "#f5f5f5",
                                                color:
                                                    category.active
                                                        ? "#2e7d32"
                                                        : "#777"
                                            }}
                                        />

                                        <IconButton
                                            size="small"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                handleEdit(
                                                    category
                                                );
                                            }}
                                            sx={{
                                                color: "#990000"
                                            }}
                                        >
                                            <EditIcon
                                                fontSize="small"
                                            />
                                        </IconButton>

                                        <FormControlLabel
                                            sx={{
                                                ml: 0,
                                                mr: 0,
                                                "& .MuiFormControlLabel-label":
                                                    {
                                                        fontSize:
                                                            "0.75rem"
                                                    }
                                            }}
                                            control={
                                                <Switch
                                                    size="small"
                                                    checked={
                                                        category.active !==
                                                        false
                                                    }
                                                    onChange={() =>
                                                        handleToggleActive(
                                                            category
                                                        )
                                                    }
                                                    disabled={
                                                        saving
                                                    }
                                                />
                                            }
                                            label={
                                                category.active
                                                    ? "Active"
                                                    : "Inactive"
                                            }
                                        />
                                    </Box>

                                    <Button
                                        size="small"
                                        endIcon={
                                            <ArrowForwardIosIcon
                                                sx={{
                                                    fontSize: 16
                                                }}
                                            />
                                        }
                                        onClick={() =>
                                            handleManage(
                                                category
                                            )
                                        }
                                        sx={{
                                            color: "#990000",
                                            fontWeight: 700,
                                            whiteSpace:
                                                "nowrap"
                                        }}
                                    >
                                        Manage
                                    </Button>
                                </Box>
                            </Paper>
                        )
                    )}
                </Box>
            )}

            {/* =================================================
                CREATE / EDIT CATEGORY DIALOG
            ================================================= */}

            <Dialog
                open={dialogOpen}
                onClose={handleClose}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle
                    sx={{
                        fontWeight: 700
                    }}
                >
                    {editingCategory
                        ? "Edit Gallery Category"
                        : "New Gallery Category"}
                </DialogTitle>

                <DialogContent dividers>
                    <TextField
                        fullWidth
                        label="Category Name (English)"
                        value={nameEn}
                        onChange={(event) =>
                            setNameEn(
                                event.target.value
                            )
                        }
                        required
                        margin="normal"
                        autoFocus
                    />

                    <TextField
                        fullWidth
                        label="Category Name (Malayalam)"
                        value={nameMl}
                        onChange={(event) =>
                            setNameMl(
                                event.target.value
                            )
                        }
                        required
                        margin="normal"
                    />

                    <TextField
                        fullWidth
                        label="Description (English)"
                        value={descriptionEn}
                        onChange={(event) =>
                            setDescriptionEn(
                                event.target.value
                            )
                        }
                        multiline
                        minRows={2}
                        margin="normal"
                    />

                    <TextField
                        fullWidth
                        label="Description (Malayalam)"
                        value={descriptionMl}
                        onChange={(event) =>
                            setDescriptionMl(
                                event.target.value
                            )
                        }
                        multiline
                        minRows={2}
                        margin="normal"
                    />

                    <TextField
                        fullWidth
                        label="Icon"
                        value={icon}
                        onChange={(event) =>
                            setIcon(
                                event.target.value
                            )
                        }
                        margin="normal"
                        helperText="Optional icon identifier"
                    />

                    <FormControlLabel
                        control={
                            <Switch
                                checked={active}
                                onChange={(event) =>
                                    setActive(
                                        event.target.checked
                                    )
                                }
                            />
                        }
                        label={
                            active
                                ? "Active"
                                : "Inactive"
                        }
                        sx={{
                            mt: 1
                        }}
                    />
                </DialogContent>

                <DialogActions
                    sx={{
                        px: 3,
                        py: 2
                    }}
                >
                    <Button
                        onClick={handleClose}
                        disabled={saving}
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={saving}
                        sx={{
                            backgroundColor:
                                "#990000",
                            "&:hover": {
                                backgroundColor:
                                    "#7d0000"
                            }
                        }}
                    >
                        {saving
                            ? "Saving..."
                            : editingCategory
                                ? "Update Category"
                                : "Save Category"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
