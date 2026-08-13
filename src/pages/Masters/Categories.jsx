import { useEffect, useState } from "react";

import {
    Box,
    Paper,
    Typography,
    Button,
    TextField,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    IconButton,
    Switch,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    Snackbar
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";

import { apiFetch } from "../../api/api";


export default function Categories() {

    const [categories, setCategories] =
        useState([]);

    const [dialogOpen, setDialogOpen] =
        useState(false);

    const [editingCategory, setEditingCategory] =
        useState(null);

    const [categoryName, setCategoryName] =
        useState("");

    const [categoryNameMl, setCategoryNameMl] =
        useState("");

    const [displayOrder, setDisplayOrder] =
        useState("");

    const [active, setActive] =
        useState(true);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const [message, setMessage] =
        useState("");


    // ==========================================
    // LOAD CATEGORIES
    // ==========================================

    const loadCategories = async () => {

        try {

            setLoading(true);

            setError("");


            const response =
                await apiFetch(
                    "/api/categories"
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Unable to load categories"
                );

            }


            setCategories(
                Array.isArray(data)
                    ? data
                    : []
            );

        }

        catch (err) {

            console.error(
                "Load categories error:",
                err
            );

            setError(
                err.message ||
                "Unable to load categories"
            );

        }

        finally {

            setLoading(false);

        }

    };


    // ==========================================
    // INITIAL LOAD
    // ==========================================

    useEffect(() => {

        loadCategories();

    }, []);


    // ==========================================
    // NEW CATEGORY
    // ==========================================

    const handleNew = () => {

        setEditingCategory(null);

        setCategoryName("");

        setCategoryNameMl("");

        setDisplayOrder(
            categories.length + 1
        );

        setActive(true);

        setError("");

        setDialogOpen(true);

    };


    // ==========================================
    // EDIT CATEGORY
    // ==========================================

    const handleEdit = (category) => {

        setEditingCategory(category);

        setCategoryName(
            category.category_name || ""
        );

        setCategoryNameMl(
            category.category_name_ml || ""
        );

        setDisplayOrder(
            category.display_order ?? ""
        );

        setActive(
            category.active ?? true
        );

        setError("");

        setDialogOpen(true);

    };


    // ==========================================
    // SAVE / UPDATE
    // ==========================================

    const handleSave = async () => {

        if (!categoryName.trim()) {

            setError(
                "Category name is required"
            );

            return;

        }


        if (!categoryNameMl.trim()) {

            setError(
                "Malayalam category name is required"
            );

            return;

        }


        try {

            setLoading(true);

            setError("");


            const isEdit =
                editingCategory !== null;


            const url = isEdit
                ? `/api/categories/${editingCategory.id}`
                : "/api/categories";


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

                        body:
                            JSON.stringify({

                                category_name:
                                    categoryName.trim(),

                                category_name_ml:
                                    categoryNameMl.trim(),

                                display_order:
                                    Number(
                                        displayOrder
                                    ) || 0,

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
                    "Unable to save category"
                );

            }


            setDialogOpen(false);

            setEditingCategory(null);

            await loadCategories();


            setMessage(
                isEdit
                    ? "Category updated successfully"
                    : "Category added successfully"
            );

        }

        catch (err) {

            console.error(
                "Save category error:",
                err
            );

            setError(
                err.message ||
                "Unable to save category"
            );

        }

        finally {

            setLoading(false);

        }

    };


    // ==========================================
    // ACTIVE / INACTIVE
    // ==========================================

    const handleToggleActive =
        async (category) => {

            try {

                setLoading(true);

                setError("");


                const response =
                    await apiFetch(
                        `/api/categories/${category.id}`,
                        {
                            method: "PUT",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({

                                    category_name:
                                        category.category_name,

                                    category_name_ml:
                                        category.category_name_ml ||
                                        "",

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

                setLoading(false);

            }

        };


    return (

        <Box>

            {/* ======================================
                PAGE HEADER
            ====================================== */}

            <Box
                sx={{
                    display: "flex",
                    justifyContent:
                        "space-between",
                    alignItems: "center",
                    mb: 3
                }}
            >

                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: 600
                    }}
                >
                    Categories
                </Typography>


                <Button
                    variant="contained"
                    startIcon={
                        <AddIcon />
                    }
                    onClick={handleNew}
                >
                    New Category
                </Button>

            </Box>


            {/* ======================================
                ERROR
            ====================================== */}

            {error && (

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


            {/* ======================================
                CATEGORY TABLE
            ====================================== */}

            <Paper
                sx={{
                    borderRadius: 2,
                    overflow: "hidden"
                }}
            >

                <Table>

                    <TableHead>

                        <TableRow>

                            <TableCell>
                                ID
                            </TableCell>

                            <TableCell>
                                Category Name
                            </TableCell>

                            <TableCell>
                                Malayalam Name
                            </TableCell>

                            <TableCell>
                                Display Order
                            </TableCell>

                            <TableCell>
                                Active
                            </TableCell>

                            <TableCell align="right">
                                Actions
                            </TableCell>

                        </TableRow>

                    </TableHead>


                    <TableBody>

                        {categories.map(
                            (category) => (

                                <TableRow
                                    key={
                                        category.id
                                    }
                                    hover
                                >

                                    <TableCell>
                                        {
                                            category.id
                                        }
                                    </TableCell>


                                    <TableCell>
                                        {
                                            category.category_name
                                        }
                                    </TableCell>


                                    <TableCell
                                        sx={{
                                            fontSize:
                                                "1rem"
                                        }}
                                    >
                                        {
                                            category.category_name_ml ||
                                            "-"
                                        }
                                    </TableCell>


                                    <TableCell>
                                        {
                                            category.display_order
                                        }
                                    </TableCell>


                                    <TableCell>

                                        <Switch
                                            checked={
                                                Boolean(
                                                    category.active
                                                )
                                            }
                                            onChange={() =>
                                                handleToggleActive(
                                                    category
                                                )
                                            }
                                            disabled={
                                                loading
                                            }
                                        />

                                    </TableCell>


                                    <TableCell align="right">

                                        <IconButton
                                            color="primary"
                                            onClick={() =>
                                                handleEdit(
                                                    category
                                                )
                                            }
                                            disabled={
                                                loading
                                            }
                                        >

                                            <EditIcon />

                                        </IconButton>

                                    </TableCell>

                                </TableRow>

                            )
                        )}


                        {categories.length === 0 &&
                            !loading && (

                                <TableRow>

                                    <TableCell
                                        colSpan={6}
                                        align="center"
                                    >
                                        No categories found.
                                    </TableCell>

                                </TableRow>

                            )}


                        {loading && (

                            <TableRow>

                                <TableCell
                                    colSpan={6}
                                    align="center"
                                >
                                    Loading...
                                </TableCell>

                            </TableRow>

                        )}

                    </TableBody>

                </Table>

            </Paper>


            {/* ======================================
                ADD / EDIT DIALOG
            ====================================== */}

            <Dialog
                open={dialogOpen}
                onClose={() =>
                    setDialogOpen(false)
                }
                fullWidth
                maxWidth="sm"
            >

                <DialogTitle>

                    {editingCategory
                        ? "Edit Category"
                        : "New Category"}

                </DialogTitle>


                <DialogContent>

                    <TextField
                        fullWidth
                        label="Category Name"
                        value={categoryName}
                        onChange={(e) =>
                            setCategoryName(
                                e.target.value
                            )
                        }
                        sx={{
                            mt: 1,
                            mb: 2
                        }}
                        autoFocus
                    />


                    <TextField
                        fullWidth
                        label="Malayalam Name"
                        value={categoryNameMl}
                        onChange={(e) =>
                            setCategoryNameMl(
                                e.target.value
                            )
                        }
                        sx={{
                            mb: 2
                        }}
                        inputProps={{
                            lang: "ml"
                        }}
                    />


                    <TextField
                        fullWidth
                        label="Display Order"
                        type="number"
                        value={displayOrder}
                        onChange={(e) =>
                            setDisplayOrder(
                                e.target.value
                            )
                        }
                        sx={{
                            mb: 2
                        }}
                    />


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

                </DialogContent>


                <DialogActions>

                    <Button
                        onClick={() =>
                            setDialogOpen(false)
                        }
                    >
                        Cancel
                    </Button>


                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={loading}
                    >

                        {editingCategory
                            ? "Update"
                            : "Save"}

                    </Button>

                </DialogActions>

            </Dialog>


            {/* ======================================
                SUCCESS MESSAGE
            ====================================== */}

            <Snackbar
                open={
                    Boolean(message)
                }
                autoHideDuration={3000}
                onClose={() =>
                    setMessage("")
                }
                message={message}
            />

        </Box>

    );

}