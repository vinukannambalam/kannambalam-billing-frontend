import { useEffect, useState } from "react";

import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    IconButton,
    Divider,
    MenuItem,
    Switch
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

import { apiFetch } from "../../api/api";


export default function Offerings() {

    const [offerings, setOfferings] =
        useState([]);

    const [categories, setCategories] =
        useState([]);

    const [offeringName, setOfferingName] =
        useState("");

    const [offeringNameMl, setOfferingNameMl] =
        useState("");

    const [categoryId, setCategoryId] =
        useState("");

    const [rate, setRate] =
        useState("");

    
    const [remarks, setRemarks] =
        useState("");
const [editableAmount, setEditableAmount] =
        useState(false);

    const [requiresNakshathra, setRequiresNakshathra] =
        useState(false);

    const [active, setActive] =
        useState(true);

    const [editingId, setEditingId] =
        useState(null);

    const [loading, setLoading] =
        useState(false);


    // ==================================================
    // LOAD DATA
    // ==================================================

    useEffect(() => {

        loadOfferings();
        loadCategories();

    }, []);


    // ==================================================
    // LOAD OFFERINGS
    // ==================================================

    const loadOfferings = async () => {

        try {

            const response =
                await apiFetch(
                    "/api/offerings"
                );


            if (!response.ok) {

                const data =
                    await response.json();

                throw new Error(
                    data.error ||
                    "Failed to load offerings"
                );

            }


            const data =
                await response.json();


            setOfferings(
                Array.isArray(data)
                    ? data
                    : []
            );

        }

        catch (error) {

            console.error(
                "Load offerings error:",
                error
            );

        }

    };


    // ==================================================
    // LOAD CATEGORIES
    // ==================================================

    const loadCategories = async () => {

        try {

            const response =
                await apiFetch(
                    "/api/categories"
                );


            if (!response.ok) {

                const data =
                    await response.json();

                throw new Error(
                    data.error ||
                    "Failed to load categories"
                );

            }


            const data =
                await response.json();


            setCategories(

                Array.isArray(data)

                    ? data.filter(
                        (item) =>
                            item.active !== false
                    )

                    : []

            );

        }

        catch (error) {

            console.error(
                "Load categories error:",
                error
            );

        }

    };


    // ==================================================
    // SAVE / UPDATE
    // ==================================================

    const saveOffering = async () => {

        if (!offeringName.trim()) {

            alert(
                "Offering name is required"
            );

            return;

        }


        if (!offeringNameMl.trim()) {

            alert(
                "Malayalam offering name is required"
            );

            return;

        }


        if (!categoryId) {

            alert(
                "Please select a category"
            );

            return;

        }


        if (
            !rate ||
            Number(rate) <= 0
        ) {

            alert(
                "Please enter a valid rate"
            );

            return;

        }


        setLoading(true);


        try {

            const payload = {

                category_id:
                    Number(categoryId),

                offering_name:
                    offeringName.trim(),

                offering_name_ml:
                    offeringNameMl.trim(),

                amount:
                    Number(rate),

                
                remarks:
                    remarks.trim() || null,
editable_amount:
                    editableAmount,

                requires_nakshathra:
                    requiresNakshathra,

                active:
                    active,

                display_order:
                    0

            };


            let response;


            // ==========================================
            // UPDATE
            // ==========================================

            if (editingId !== null) {

                response =
                    await apiFetch(

                        `/api/offerings/${editingId}`,

                        {

                            method: "PUT",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(
                                    payload
                                )

                        }

                    );

            }

            // ==========================================
            // ADD
            // ==========================================

            else {

                response =
                    await apiFetch(

                        "/api/offerings",

                        {

                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(
                                    payload
                                )

                        }

                    );

            }


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Failed to save offering"
                );

            }


            await loadOfferings();

            clearForm();

        }

        catch (error) {

            console.error(
                "Save offering error:",
                error
            );

            alert(
                error.message
            );

        }

        finally {

            setLoading(false);

        }

    };


    // ==================================================
    // EDIT
    // ==================================================

    const editOffering = (item) => {

        setEditingId(
            item.id
        );


        setOfferingName(
            item.offering_name || ""
        );


        setOfferingNameMl(
            item.offering_name_ml || ""
        );


        setCategoryId(
            item.category_id != null
                ? String(item.category_id)
                : ""
        );


        setRate(
            item.amount != null
                ? item.amount
                : ""
        );


        

        setRemarks(
            item.remarks || ""
        );
setEditableAmount(
            item.editable_amount === true
        );


        setRequiresNakshathra(
            item.requires_nakshathra === true
        );


        setActive(
            item.active !== false
        );


        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    };


    // ==================================================
    // DELETE / DEACTIVATE
    // ==================================================

    const deleteOffering = async (id) => {

        const confirmed =
            window.confirm(
                "Are you sure you want to deactivate this offering?"
            );


        if (!confirmed) {

            return;

        }


        try {

            setLoading(true);


            const response =
                await apiFetch(

                    `/api/offerings/${id}`,

                    {
                        method: "DELETE"
                    }

                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Failed to deactivate offering"
                );

            }


            await loadOfferings();

        }

        catch (error) {

            console.error(
                "Delete offering error:",
                error
            );

            alert(
                error.message
            );

        }

        finally {

            setLoading(false);

        }

    };


    // ==================================================
    // CLEAR FORM
    // ==================================================

    const clearForm = () => {

        setEditingId(null);

        setOfferingName("");

        setOfferingNameMl("");

        setCategoryId("");

        setRate("");

        
        setRemarks("");
setEditableAmount(false);

        setRequiresNakshathra(false);

        setActive(true);

    };


    // ==================================================
    // BILINGUAL CATEGORY NAME
    // ==================================================

    const getCategory = (categoryIdValue) => {

        return categories.find(
            (item) =>
                String(item.id) ===
                String(categoryIdValue)
        );

    };


    // ==================================================
    // UI
    // ==================================================

    return (

        <Box>

            <Typography
                variant="h4"
                sx={{
                    mb: { xs: 2, md: 3 },
                    fontWeight: 600,
                    fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2.125rem" }
                }}
            >
                Offerings
            </Typography>


            {/* ==================================================
                FORM
            ================================================== */}

            <Paper
                sx={{
                    p: { xs: 1.75, sm: 2.5, md: 3 },
                    mb: { xs: 2, md: 3 }
                }}
            >

                <Typography
                    variant="h6"
                    sx={{
                        mb: 2
                    }}
                >

                    {editingId !== null
                        ? "Edit Offering"
                        : "Add Offering"}

                </Typography>


                <Box
                    sx={{
                        display: "flex",
                        gap: { xs: 1.5, sm: 2 },
                        alignItems: { xs: "stretch", sm: "center" },
                        flexWrap: "wrap",
                        flexDirection: { xs: "column", sm: "row" }
                    }}
                >

                    {/* ENGLISH NAME */}

                    <TextField
                        label="Offering Name"
                        value={offeringName}
                        onChange={(e) =>
                            setOfferingName(
                                e.target.value
                            )
                        }
                        fullWidth
                        sx={{
                            minWidth: 250,
                            width: { xs: "100%", sm: 250 },
                            maxWidth: "100%"
                        }}
                    />


                    {/* MALAYALAM NAME */}

                    <TextField
                        label="Malayalam Offering Name"
                        value={offeringNameMl}
                        onChange={(e) =>
                            setOfferingNameMl(
                                e.target.value
                            )
                        }
                        fullWidth
                        sx={{
                            minWidth: 300,
                            width: { xs: "100%", sm: 300 },
                            maxWidth: "100%"
                        }}
                    />


                    {/* CATEGORY */}

                    <TextField
                        select
                        label="Category"
                        value={categoryId}
                        onChange={(e) =>
                            setCategoryId(
                                e.target.value
                            )
                        }
                        fullWidth
                        sx={{
                            minWidth: 200,
                            width: { xs: "100%", sm: 200 },
                            maxWidth: "100%"
                        }}
                    >

                        {categories.map(
                            (category) => (

                                <MenuItem
                                    key={
                                        category.id
                                    }
                                    value={
                                        String(
                                            category.id
                                        )
                                    }
                                >

                                    {
                                        category.category_name
                                    }

                                </MenuItem>

                            )
                        )}

                    </TextField>


                    {/* RATE */}

                    <TextField
                        label="Rate"
                        type="number"
                        value={rate}
                        onChange={(e) =>
                            setRate(
                                e.target.value
                            )
                        }
                        inputProps={{
                            min: 0
                        }}
                        fullWidth
                        sx={{
                            width: { xs: "100%", sm: 150 },
                            maxWidth: "100%"
                        }}
                    />


                    {/* REMARKS */}

                    <TextField
                        label="Remarks"
                        value={remarks}
                        onChange={(e) =>
                            setRemarks(e.target.value)
                        }
                        fullWidth
                        multiline
                        minRows={2}
                        maxRows={4}
                        sx={{
                            width: { xs: "100%", sm: "100%" },
                            maxWidth: "100%"
                        }}
                    />


                    {/* EDITABLE AMOUNT */}

                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center"
                        }}
                    >

                        <Switch
                            checked={
                                editableAmount
                            }
                            onChange={(e) =>
                                setEditableAmount(
                                    e.target.checked
                                )
                            }
                        />

                        <Typography>
                            Editable Amount
                        </Typography>

                    </Box>


                    {/* NAKSHATHRA REQUIRED */}

                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center"
                        }}
                    >

                        <Switch
                            checked={
                                requiresNakshathra
                            }
                            onChange={(e) =>
                                setRequiresNakshathra(
                                    e.target.checked
                                )
                            }
                        />

                        <Typography>
                            Nakshathra Required
                        </Typography>

                    </Box>


                    {/* ACTIVE */}

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


                    {/* SAVE */}

                    <Button
                        variant="contained"
                        startIcon={
                            <AddIcon />
                        }
                        onClick={
                            saveOffering
                        }
                        disabled={loading}
                    >

                        {editingId !== null
                            ? "Update"
                            : "Add"}

                    </Button>


                    {/* CANCEL */}

                    {editingId !== null && (

                        <Button
                            variant="outlined"
                            onClick={
                                clearForm
                            }
                            disabled={loading}
                        >
                            Cancel
                        </Button>

                    )}

                </Box>

            </Paper>


            {/* ==================================================
                LIST
            ================================================== */}

            <Paper
                sx={{
                    p: 3
                }}
            >

                <Typography
                    variant="h6"
                    sx={{
                        mb: 2
                    }}
                >
                    Offering List
                </Typography>


                <Divider
                    sx={{
                        mb: 2
                    }}
                />


                <Box
                    sx={{
                        width: "100%",
                        maxHeight: 430,
                        overflow: "auto",
                        WebkitOverflowScrolling: "touch",
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 1
                    }}
                >
                    <Table
                        size="small"
                        stickyHeader
                        sx={{
                            minWidth: { xs: 820, sm: 880, md: 930 },
                            tableLayout: "auto",
                            "& .MuiTableCell-root": {
                                px: { xs: 1, sm: 1.25, md: 1.5 },
                                py: { xs: 0.9, sm: 1.05 },
                                verticalAlign: "top"
                            },
                            "& .MuiTableCell-head": {
                                fontWeight: 600,
                                whiteSpace: "nowrap",
                                backgroundColor: "background.paper"
                            }
                        }}
                    >

                        <TableHead>

                            <TableRow>

                                <TableCell
                                    sx={{ width: 45 }}
                                >
                                    #
                                </TableCell>

                                <TableCell
                                    sx={{ minWidth: 190 }}
                                >
                                    Offering
                                </TableCell>

                                <TableCell
                                    sx={{ minWidth: 145 }}
                                >
                                    Category
                                </TableCell>

                                <TableCell
                                    align="right"
                                    sx={{ width: 90 }}
                                >
                                    Rate
                                </TableCell>

                                <TableCell
                                    sx={{ minWidth: 260 }}
                                >
                                    Remarks
                                </TableCell>

                                <TableCell
                                    align="center"
                                    sx={{ width: 85 }}
                                >
                                    Editable
                                </TableCell>

                                <TableCell
                                    align="center"
                                    sx={{ width: 95 }}
                                >
                                    Nakshathra
                                </TableCell>

                                <TableCell
                                    align="center"
                                    sx={{ width: 70 }}
                                >
                                    Active
                                </TableCell>

                                <TableCell
                                    align="center"
                                    sx={{ width: 90 }}
                                >
                                    Actions
                                </TableCell>

                            </TableRow>

                        </TableHead>


                        <TableBody>

                            {offerings.map(
                                (item, index) => {

                                    const category =
                                        getCategory(
                                            item.category_id
                                        );

                                    return (

                                        <TableRow
                                            key={item.id}
                                            hover
                                        >

                                            <TableCell>
                                                {index + 1}
                                            </TableCell>

                                            <TableCell>
                                                <Box
                                                    sx={{
                                                        lineHeight: 1.25
                                                    }}
                                                >
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            fontWeight: 600
                                                        }}
                                                    >
                                                        {item.offering_name}
                                                    </Typography>

                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            color: "text.secondary",
                                                            mt: 0.25
                                                        }}
                                                    >
                                                        {item.offering_name_ml || "-"}
                                                    </Typography>
                                                </Box>
                                            </TableCell>

                                            <TableCell>
                                                <Box
                                                    sx={{
                                                        lineHeight: 1.25
                                                    }}
                                                >
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            fontWeight: 500
                                                        }}
                                                    >
                                                        {category?.category_name || "-"}
                                                    </Typography>

                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            color: "text.secondary",
                                                            mt: 0.25
                                                        }}
                                                    >
                                                        {category?.category_name_ml || "-"}
                                                    </Typography>
                                                </Box>
                                            </TableCell>

                                            <TableCell
                                                align="right"
                                                sx={{
                                                    whiteSpace: "nowrap",
                                                    fontWeight: 600
                                                }}
                                            >
                                                ₹{Number(
                                                    item.amount || 0
                                                ).toFixed(2)}
                                            </TableCell>

                                            <TableCell
                                                title={item.remarks || ""}
                                                sx={{
                                                    minWidth: 260,
                                                    maxWidth: 420,
                                                    whiteSpace: "normal",
                                                    wordBreak: "break-word",
                                                    color: item.remarks
                                                        ? "text.primary"
                                                        : "text.secondary"
                                                }}
                                            >
                                                {item.remarks || "-"}
                                            </TableCell>

                                            <TableCell align="center">
                                                {item.editable_amount
                                                    ? "Yes"
                                                    : "No"}
                                            </TableCell>

                                            <TableCell align="center">
                                                {item.requires_nakshathra
                                                    ? "Yes"
                                                    : "No"}
                                            </TableCell>

                                            <TableCell align="center">
                                                {item.active
                                                    ? "Yes"
                                                    : "No"}
                                            </TableCell>

                                            <TableCell align="center">

                                                <IconButton
                                                    color="primary"
                                                    size="small"
                                                    onClick={() =>
                                                        editOffering(item)
                                                    }
                                                    disabled={loading}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>

                                                <IconButton
                                                    color="error"
                                                    size="small"
                                                    onClick={() =>
                                                        deleteOffering(item.id)
                                                    }
                                                    disabled={loading}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>

                                            </TableCell>

                                        </TableRow>
                                    );
                                }
                            )}


                            {offerings.length === 0 && (

                                <TableRow>

                                    <TableCell
                                        colSpan={9}
                                        align="center"
                                    >
                                        No offerings found.
                                    </TableCell>

                                </TableRow>

                            )}

                        </TableBody>

                    </Table>
                </Box>


            </Paper>

        </Box>

    );

}