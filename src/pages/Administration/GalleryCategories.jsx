import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

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
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import { apiFetch } from "../../api/api";


export default function GalleryCategories() {

    const [searchParams, setSearchParams] =
        useSearchParams();

    const navigate = useNavigate();

    const [categories, setCategories] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

    const [message, setMessage] =
        useState("");

    // =====================================================
    // DIALOG
    // =====================================================

    const [dialogOpen, setDialogOpen] =
        useState(false);

    const [editingCategory, setEditingCategory] =
        useState(null);


    // =====================================================
    // FORM
    // =====================================================

    const [nameEn, setNameEn] =
        useState("");

    const [nameMl, setNameMl] =
        useState("");

    const [descriptionEn, setDescriptionEn] =
        useState("");

    const [descriptionMl, setDescriptionMl] =
        useState("");

    const [icon, setIcon] =
        useState("");

    const [active, setActive] =
        useState(true);


    // =====================================================
    // DRAGGING
    // =====================================================

    const [draggingId, setDraggingId] =
        useState(null);

    const [dragOverId, setDragOverId] =
        useState(null);


    // =====================================================
    // LOAD CATEGORIES
    // =====================================================

    const loadCategories = async () => {

        try {

            setLoading(true);
            setError("");

            const response =
                await apiFetch(
                    "/api/admin/gallery/categories"
                );

            const data =
                await response.json();

            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Failed to load gallery categories"
                );
            }

            const sorted =
                Array.isArray(data)
                    ? [...data].sort(
                        (a, b) =>
                            Number(
                                a.display_order || 0
                            ) -
                            Number(
                                b.display_order || 0
                            ) ||
                            Number(a.id) -
                            Number(b.id)
                    )
                    : [];

            setCategories(sorted);

        }
        catch (err) {

            console.error(
                "Gallery categories loading error:",
                err
            );

            setError(
                err.message ||
                "Failed to load gallery categories"
            );

        }
        finally {

            setLoading(false);

        }
    };


    useEffect(() => {

        loadCategories();

    }, []);


    // =====================================================
    // OPEN NEW CATEGORY WHEN REQUESTED FROM GALLERY
    // =====================================================

    useEffect(() => {

        if (searchParams.get("new") !== "1") {
            return;
        }

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

        // Remove ?new=1 after opening the dialog.
        setSearchParams(
            {},
            {
                replace: true
            }
        );

    }, [searchParams, setSearchParams]);


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
    // OPEN EDIT
    // =====================================================

    const handleEdit = (category) => {

        setEditingCategory(category);

        setNameEn(
            category.name_en || ""
        );

        setNameMl(
            category.name_ml || ""
        );

        setDescriptionEn(
            category.description_en || ""
        );

        setDescriptionMl(
            category.description_ml || ""
        );

        setIcon(
            category.icon || ""
        );

        setActive(
            category.active !== false
        );

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

            const isEdit =
                editingCategory !== null;

            const url =
                isEdit
                    ? `/api/admin/gallery/categories/${editingCategory.id}`
                    : "/api/admin/gallery/categories";


            const displayOrder =
                isEdit
                    ? editingCategory.display_order
                    : categories.length + 1;


            const response =
                await apiFetch(
                    url,
                    {
                        method:
                            isEdit
                                ? "PUT"
                                : "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            name_en:
                                nameEn.trim(),

                            name_ml:
                                nameMl.trim(),

                            description_en:
                                descriptionEn.trim() ||
                                null,

                            description_ml:
                                descriptionMl.trim() ||
                                null,

                            icon:
                                icon.trim() ||
                                null,

                            display_order:
                                displayOrder,

                            active
                        })
                    }
                );


            const data =
                await response.json();


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

        }
        catch (err) {

            console.error(
                "Save gallery category error:",
                err
            );

            setError(
                err.message ||
                "Unable to save category"
            );

        }
        finally {

            setSaving(false);

        }
    };


    // =====================================================
    // TOGGLE ACTIVE
    // =====================================================

    const handleToggleActive = async (
        category
    ) => {

        try {

            setSaving(true);
            setError("");
            setMessage("");


            const response =
                await apiFetch(
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
                                category.icon ||
                                null,

                            display_order:
                                category.display_order,

                            active:
                                !category.active
                        })
                    }
                );


            const data =
                await response.json();


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

        }
        catch (err) {

            console.error(
                "Toggle category error:",
                err
            );

            setError(
                err.message ||
                "Unable to update category"
            );

        }
        finally {

            setSaving(false);

        }
    };


    // =====================================================
    // DRAG START
    // =====================================================

    const handleDragStart = (
        event,
        categoryId
    ) => {

        setDraggingId(categoryId);

        event.dataTransfer.effectAllowed =
            "move";

        event.dataTransfer.setData(
            "text/plain",
            String(categoryId)
        );
    };


    // =====================================================
    // DRAG OVER
    // =====================================================

    const handleDragOver = (
        event,
        categoryId
    ) => {

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
    // DROP
    // =====================================================

    const handleDrop = async (
        event,
        targetId
    ) => {

        event.preventDefault();

        const sourceId =
            Number(
                event.dataTransfer.getData(
                    "text/plain"
                )
            );


        if (
            !sourceId ||
            sourceId === targetId
        ) {

            setDraggingId(null);
            setDragOverId(null);

            return;
        }


        const oldCategories =
            [...categories];


        const sourceIndex =
            categories.findIndex(
                item =>
                    Number(item.id) ===
                    sourceId
            );

        const targetIndex =
            categories.findIndex(
                item =>
                    Number(item.id) ===
                    targetId
            );


        if (
            sourceIndex === -1 ||
            targetIndex === -1
        ) {

            setDraggingId(null);
            setDragOverId(null);

            return;
        }


        const reordered =
            [...categories];

        const [
            movedCategory
        ] =
            reordered.splice(
                sourceIndex,
                1
            );


        reordered.splice(
            targetIndex,
            0,
            movedCategory
        );


        setCategories(
            reordered
        );

        setDraggingId(null);
        setDragOverId(null);


        // =================================================
        // SAVE NEW DISPLAY ORDER
        // =================================================

        try {

            setSaving(true);
            setError("");
            setMessage("");


            for (
                let index = 0;
                index < reordered.length;
                index++
            ) {

                const category =
                    reordered[index];

                const newOrder =
                    index + 1;


                if (
                    Number(
                        category.display_order
                    ) === newOrder
                ) {
                    continue;
                }


                const response =
                    await apiFetch(
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
                                    category.name_ml ||
                                    "",

                                description_en:
                                    category.description_en ||
                                    null,

                                description_ml:
                                    category.description_ml ||
                                    null,

                                icon:
                                    category.icon ||
                                    null,

                                display_order:
                                    newOrder,

                                active:
                                    category.active !== false
                            })
                        }
                    );


                if (!response.ok) {

                    const data =
                        await response.json();

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
                        display_order:
                            index + 1
                    })
                )
            );

            setMessage(
                "Category order updated"
            );

        }
        catch (err) {

            console.error(
                "Category reorder error:",
                err
            );

            setCategories(
                oldCategories
            );

            setError(
                err.message ||
                "Failed to save category order"
            );

        }
        finally {

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
                    justifyContent:
                        "space-between",
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

                    <Button
                        variant="outlined"
                        startIcon={<ArrowBackIcon />}
                        onClick={() =>
                            navigate("/gallery")
                        }
                        sx={{
                            color: "#990000",
                            borderColor: "#990000",
                            whiteSpace: "nowrap",
                            minWidth: 0,
                            px: 1.5,
                            "&:hover": {
                                borderColor:
                                    "#7d0000",
                                backgroundColor:
                                    "#fff5f5"
                            }
                        }}
                    >
                        Back
                    </Button>


                    <Box>

                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1
                            }}
                        >

                            <PhotoLibraryIcon
                                sx={{
                                    fontSize: 30,
                                    color: "#990000"
                                }}
                            />

                            <Typography
                                variant="h4"
                                sx={{
                                    fontWeight: 700,
                                    color: "#17202a"
                                }}
                            >
                                Gallery Categories
                            </Typography>

                        </Box>

                        <Typography
                            sx={{
                                color:
                                    "text.secondary",
                                ml: 5,
                                mt: 0.25
                            }}
                        >
                            Manage categories used to
                            organize temple photographs.
                        </Typography>

                    </Box>

                </Box>


                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleNew}
                    sx={{
                        backgroundColor:
                            "#990000",
                        "&:hover": {
                            backgroundColor:
                                "#7d0000"
                        }
                    }}
                >
                    New Category
                </Button>

            </Box>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

                <Alert
                    severity="error"
                    onClose={() =>
                        setError("")
                    }
                    sx={{
                        mb: 2
                    }}
                >
                    {error}
                </Alert>

            )}


            {/* =================================================
                SUCCESS
            ================================================= */}

            {message && (

                <Alert
                    severity="success"
                    onClose={() =>
                        setMessage("")
                    }
                    sx={{
                        mb: 2
                    }}
                >
                    {message}
                </Alert>

            )}


            {/* =================================================
                LOADING
            ================================================= */}

            {loading ? (

                <Box
                    sx={{
                        display: "flex",
                        justifyContent:
                            "center",
                        py: 6
                    }}
                >
                    <CircularProgress />
                </Box>

            ) : categories.length === 0 ? (

                <Paper
                    sx={{
                        p: 4,
                        textAlign: "center"
                    }}
                >
                    <Typography
                        color="text.secondary"
                    >
                        No gallery categories found.
                    </Typography>
                </Paper>

            ) : (

                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(auto-fit, minmax(340px, 1fr))",
                        gap: 1.5
                    }}
                >

                    {categories.map(
                        (category) => (

                            <Paper
                                key={category.id}
                                draggable
                                onDragStart={
                                    (event) =>
                                        handleDragStart(
                                            event,
                                            category.id
                                        )
                                }
                                onDragOver={
                                    (event) =>
                                        handleDragOver(
                                            event,
                                            category.id
                                        )
                                }
                                onDrop={
                                    (event) =>
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
                                    border:
                                        dragOverId ===
                                        category.id
                                            ? "2px solid #990000"
                                            : "1px solid #ddd",

                                    borderRadius:
                                        1.5,

                                    p: 1.75,

                                    opacity:
                                        draggingId ===
                                        category.id
                                            ? 0.5
                                            : 1,

                                    cursor:
                                        "default",

                                    transition:
                                        "all 0.15s ease",

                                    "&:hover": {
                                        boxShadow:
                                            "0 3px 12px rgba(0,0,0,0.08)"
                                    }
                                }}
                            >

                                <Box
                                    sx={{
                                        display:
                                            "flex",
                                        alignItems:
                                            "center",
                                        gap: 1.25
                                    }}
                                >

                                    {/* DRAG HANDLE */}

                                    <DragIndicatorIcon
                                        sx={{
                                            color:
                                                "#999",
                                            cursor:
                                                "grab"
                                        }}
                                    />


                                    {/* ICON */}

                                    <Box
                                        sx={{
                                            width: 48,
                                            height: 48,
                                            borderRadius:
                                                1.25,
                                            backgroundColor:
                                                "#fff0f0",
                                            display:
                                                "flex",
                                            alignItems:
                                                "center",
                                            justifyContent:
                                                "center",
                                            flexShrink: 0
                                        }}
                                    >

                                        <PhotoLibraryIcon
                                            sx={{
                                                color:
                                                    "#990000",
                                                fontSize:
                                                    24
                                            }}
                                        />

                                    </Box>


                                    {/* NAMES */}

                                    <Box
                                        sx={{
                                            minWidth:
                                                0,
                                            flex: 1
                                        }}
                                    >

                                        <Typography
                                            sx={{
                                                fontWeight:
                                                    700,
                                                fontSize:
                                                    "1rem",
                                                lineHeight:
                                                    1.25,
                                                color:
                                                    "#17202a"
                                            }}
                                        >
                                            {
                                                category.name_en
                                            }
                                        </Typography>


                                        <Typography
                                            sx={{
                                                color:
                                                    "#990000",
                                                fontSize:
                                                    "0.9rem",
                                                lineHeight:
                                                    1.3,
                                                mt:
                                                    0.25
                                            }}
                                        >
                                            {
                                                category.name_ml
                                            }
                                        </Typography>

                                    </Box>


                                    {/* STATUS */}

                                    <Chip
                                        label={
                                            category.active
                                                ? "Active"
                                                : "Inactive"
                                        }
                                        size="small"
                                        sx={{
                                            height:
                                                24,
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


                                    {/* EDIT */}

                                    <IconButton
                                        size="small"
                                        onClick={() =>
                                            handleEdit(
                                                category
                                            )
                                        }
                                        sx={{
                                            color:
                                                "#990000"
                                        }}
                                    >
                                        <EditIcon
                                            fontSize="small"
                                        />
                                    </IconButton>

                                </Box>


                                {/* DESCRIPTION */}

                                {(category.description_en ||
                                    category.description_ml) && (

                                    <Box
                                        sx={{
                                            ml: 5.25,
                                            mt: 1
                                        }}
                                    >

                                        {category.description_en && (

                                            <Typography
                                                sx={{
                                                    color:
                                                        "text.secondary",
                                                    fontSize:
                                                        "0.82rem",
                                                    lineHeight:
                                                        1.35
                                                }}
                                            >
                                                {
                                                    category.description_en
                                                }
                                            </Typography>

                                        )}

                                        {category.description_ml && (

                                            <Typography
                                                sx={{
                                                    color:
                                                        "text.secondary",
                                                    fontSize:
                                                        "0.78rem",
                                                    lineHeight:
                                                        1.35,
                                                    mt:
                                                        0.2
                                                }}
                                            >
                                                {
                                                    category.description_ml
                                                }
                                            </Typography>

                                        )}

                                    </Box>

                                )}


                                <Divider
                                    sx={{
                                        my: 1.25
                                    }}
                                />


                                {/* ACTIVE SWITCH */}

                                <Box
                                    sx={{
                                        display:
                                            "flex",
                                        justifyContent:
                                            "space-between",
                                        alignItems:
                                            "center",
                                        ml: 5.25
                                    }}
                                >

                                    <Typography
                                        sx={{
                                            fontSize:
                                                "0.78rem",
                                            color:
                                                "text.secondary"
                                        }}
                                    >
                                        Drag to change order
                                    </Typography>


                                    <FormControlLabel
                                        sx={{
                                            mr: 0,
                                            "& .MuiFormControlLabel-label":
                                                {
                                                    fontSize:
                                                        "0.78rem"
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

                            </Paper>

                        )
                    )}

                </Box>

            )}


            {/* =================================================
                ADD / EDIT DIALOG
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