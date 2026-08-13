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

        setEditableAmount(false);

        setRequiresNakshathra(false);

        setActive(true);

    };


    // ==================================================
    // CATEGORY NAME
    // ==================================================

    const getCategoryName = (
        categoryIdValue
    ) => {

        const category =
            categories.find(
                (item) =>
                    String(item.id) ===
                    String(categoryIdValue)
            );


        return category
            ? category.category_name
            : "-";

    };


    // ==================================================
    // UI
    // ==================================================

    return (

        <Box>

            <Typography
                variant="h4"
                sx={{
                    mb: 3,
                    fontWeight: 600
                }}
            >
                Offerings
            </Typography>


            {/* ==================================================
                FORM
            ================================================== */}

            <Paper
                sx={{
                    p: 3,
                    mb: 3
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
                        gap: 2,
                        alignItems: "center",
                        flexWrap: "wrap"
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
                        sx={{
                            minWidth: 250
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
                        sx={{
                            minWidth: 300
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
                        sx={{
                            minWidth: 200
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
                        sx={{
                            width: 150
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


                <Table>

                    <TableHead>

                        <TableRow>

                            <TableCell>
                                #
                            </TableCell>

                            <TableCell>
                                Offering
                            </TableCell>

                            <TableCell>
                                Malayalam
                            </TableCell>

                            <TableCell>
                                Category
                            </TableCell>

                            <TableCell align="right">
                                Rate
                            </TableCell>

                            <TableCell align="center">
                                Editable
                            </TableCell>

                            <TableCell align="center">
                                Nakshathra
                            </TableCell>

                            <TableCell align="center">
                                Active
                            </TableCell>

                            <TableCell align="center">
                                Actions
                            </TableCell>

                        </TableRow>

                    </TableHead>


                    <TableBody>

                        {offerings.map(
                            (item, index) => (

                                <TableRow
                                    key={
                                        item.id
                                    }
                                >

                                    <TableCell>
                                        {index + 1}
                                    </TableCell>


                                    <TableCell>
                                        {
                                            item.offering_name
                                        }
                                    </TableCell>


                                    <TableCell>
                                        {
                                            item.offering_name_ml ||
                                            "-"
                                        }
                                    </TableCell>


                                    <TableCell>
                                        {
                                            getCategoryName(
                                                item.category_id
                                            )
                                        }
                                    </TableCell>


                                    <TableCell align="right">

                                        ₹
                                        {Number(
                                            item.amount || 0
                                        ).toFixed(2)}

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
                                            onClick={() =>
                                                editOffering(
                                                    item
                                                )
                                            }
                                            disabled={
                                                loading
                                            }
                                        >

                                            <EditIcon />

                                        </IconButton>


                                        <IconButton
                                            color="error"
                                            onClick={() =>
                                                deleteOffering(
                                                    item.id
                                                )
                                            }
                                            disabled={
                                                loading
                                            }
                                        >

                                            <DeleteIcon />

                                        </IconButton>

                                    </TableCell>

                                </TableRow>

                            )
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

            </Paper>

        </Box>

    );

}