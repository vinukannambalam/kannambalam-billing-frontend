import { useEffect, useState } from "react";

import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Switch,
    FormControlLabel,
    Alert,
    Snackbar,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import { apiFetch } from "../../api/api";


export default function PaymentModes() {

    const [rows, setRows] = useState([]);

    const [search, setSearch] = useState("");

    const [dialogOpen, setDialogOpen] = useState(false);

    const [editingId, setEditingId] = useState(null);

    const [form, setForm] = useState({
        payment_mode: "",
        mode_name_ml: "",
        active: true,
        display_order: 0
    });

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");

    const [message, setMessage] = useState("");


    // =====================================================
    // LOAD PAYMENT MODES
    // =====================================================

    const loadPaymentModes = async (searchText = "") => {

        try {

            setLoading(true);
            setError("");

            const trimmedSearch = searchText.trim();

            const url = trimmedSearch
                ? `/api/payment-modes?search=${encodeURIComponent(trimmedSearch)}`
                : "/api/payment-modes";

            const response = await apiFetch(url);

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Unable to load payment modes"
                );
            }

            setRows(data);

        } catch (err) {

            console.error(err);

            setError(err.message);

        } finally {

            setLoading(false);

        }

    };


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {

        loadPaymentModes("");

    }, []);


    // =====================================================
    // BACKEND SEARCH
    // =====================================================

    useEffect(() => {

        const timer = setTimeout(() => {

            loadPaymentModes(search);

        }, 300);

        return () => {
            clearTimeout(timer);
        };

    }, [search]);


    // =====================================================
    // ADD
    // =====================================================

    const openAdd = () => {

        setEditingId(null);

        setForm({
            payment_mode: "",
            mode_name_ml: "",
            active: true,
            display_order: 0
        });

        setError("");

        setDialogOpen(true);

    };


    // =====================================================
    // EDIT
    // =====================================================

    const openEdit = (row) => {

        setEditingId(row.id);

        setForm({
            payment_mode: row.payment_mode || "",
            mode_name_ml: row.mode_name_ml || "",
            active: Boolean(row.active),
            display_order: row.display_order || 0
        });

        setError("");

        setDialogOpen(true);

    };


    // =====================================================
    // SAVE
    // =====================================================

    const handleSave = async () => {

        if (!form.payment_mode.trim()) {

            setError("Payment mode name is required");

            return;

        }


        if (!form.mode_name_ml.trim()) {

            setError(
                "Malayalam payment mode name is required"
            );

            return;

        }


        try {

            setLoading(true);

            setError("");

            const isEdit = editingId !== null;

            const url = isEdit
                ? `/api/payment-modes/${editingId}`
                : "/api/payment-modes";

            const method = isEdit
                ? "PUT"
                : "POST";


            const response = await apiFetch(
                url,
                {
                    method: method,

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        payment_mode:
                            form.payment_mode.trim(),

                        mode_name_ml:
                            form.mode_name_ml.trim(),

                        active:
                            form.active,

                        display_order:
                            Number(form.display_order || 0)
                    })
                }
            );


            const data = await response.json();


            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Unable to save payment mode"
                );

            }


            setDialogOpen(false);

            setEditingId(null);


            await loadPaymentModes(search);


            setMessage(
                isEdit
                    ? "Payment mode updated successfully"
                    : "Payment mode added successfully"
            );

        } catch (err) {

            console.error(err);

            setError(err.message);

        } finally {

            setLoading(false);

        }

    };


    // =====================================================
    // DEACTIVATE
    // =====================================================

    const handleDelete = async (row) => {

        const confirmed = window.confirm(
            `Deactivate payment mode "${row.payment_mode}"?`
        );


        if (!confirmed) {
            return;
        }


        try {

            setLoading(true);

            setError("");


            const response = await apiFetch(
                `/api/payment-modes/${row.id}`,
                {
                    method: "DELETE"
                }
            );


            const data = await response.json();


            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Unable to deactivate payment mode"
                );

            }


            await loadPaymentModes(search);


            setMessage(
                "Payment mode deactivated successfully"
            );

        } catch (err) {

            console.error(err);

            setError(err.message);

        } finally {

            setLoading(false);

        }

    };


    // =====================================================
    // CLEAR SEARCH
    // =====================================================

    const clearSearch = () => {

        setSearch("");

    };


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <Box
            sx={{
                width: "100%"
            }}
        >

            {/* PAGE HEADER */}

            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                    gap: 2
                }}
            >

                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: 600,
                        fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2.125rem" },
                        whiteSpace: "nowrap"
                    }}
                >
                    Payment Modes
                </Typography>


                <Box
                    sx={{
                        display: "flex",
                        gap: 2,
                        alignItems: "center"
                    }}
                >

                    <TextField
                        size="small"
                        label="Search Payment Mode"
                        placeholder="English or Malayalam"
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                        sx={{
                            width: 300
                        }}
                    />


                    {search && (

                        <Button
                            variant="outlined"
                            onClick={clearSearch}
                        >
                            Clear
                        </Button>

                    )}


                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={openAdd}
                    >
                        Add Payment Mode
                    </Button>

                </Box>

            </Box>


            {/* ERROR */}

            {error && (

                <Alert
                    severity="error"
                    sx={{
                        mb: 2
                    }}
                    onClose={() => setError("")}
                >
                    {error}
                </Alert>

            )}


            {/* TABLE */}

            <Paper
                sx={{
                    width: "100%",
                    overflowX: "auto",
                    overflowY: "hidden",
                    borderRadius: 2
                }}
            >

                <Table
                    size="small"
                    sx={{
                        minWidth: { xs: 560, sm: 650 },
                        "& .MuiTableCell-root": {
                            px: { xs: 1, sm: 1.5, md: 2 },
                            py: { xs: 1.25, sm: 1.5 }
                        }
                    }}
                >

                    <TableHead>

                        <TableRow>

                            <TableCell>
                                ID
                            </TableCell>

                            <TableCell>
                                Payment Mode
                            </TableCell>

                            <TableCell>
                                Malayalam
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

                        {rows.map((row) => (

                            <TableRow
                                key={row.id}
                                hover
                            >

                                <TableCell>
                                    {row.id}
                                </TableCell>


                                <TableCell>
                                    {row.payment_mode}
                                </TableCell>


                                <TableCell
                                    sx={{
                                        fontSize: "1rem"
                                    }}
                                >
                                    {row.mode_name_ml || "-"}
                                </TableCell>


                                <TableCell>
                                    {row.display_order}
                                </TableCell>


                                <TableCell>

                                    <Switch
                                        checked={
                                            Boolean(row.active)
                                        }
                                        disabled
                                    />

                                </TableCell>


                                <TableCell align="right">

                                    <IconButton
                                        color="primary"
                                        onClick={() =>
                                            openEdit(row)
                                        }
                                    >
                                        <EditIcon />
                                    </IconButton>


                                    {row.active && (

                                        <IconButton
                                            color="error"
                                            onClick={() =>
                                                handleDelete(row)
                                            }
                                        >
                                            <DeleteIcon />
                                        </IconButton>

                                    )}

                                </TableCell>

                            </TableRow>

                        ))}


                        {rows.length === 0 && !loading && (

                            <TableRow>

                                <TableCell
                                    colSpan={6}
                                    align="center"
                                >
                                    {search.trim()
                                        ? "No payment modes found."
                                        : "No payment modes available."}
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


            {/* ADD / EDIT DIALOG */}

            <Dialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                fullWidth
                maxWidth="sm"
            >

                <DialogTitle>

                    {editingId !== null
                        ? "Edit Payment Mode"
                        : "Add Payment Mode"}

                </DialogTitle>


                <DialogContent>

                    <TextField
                        fullWidth
                        label="Payment Mode"
                        value={form.payment_mode}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                payment_mode:
                                    e.target.value
                            })
                        }
                        sx={{
                            mt: 1,
                            mb: 2
                        }}
                        autoFocus
                    />


                    <TextField
                        fullWidth
                        label="Malayalam Payment Mode"
                        value={form.mode_name_ml}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                mode_name_ml:
                                    e.target.value
                            })
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
                        sx={{
                            mb: 2
                        }}
                    />


                    <FormControlLabel
                        control={
                            <Switch
                                checked={form.active}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        active:
                                            e.target.checked
                                    })
                                }
                            />
                        }
                        label="Active"
                    />

                </DialogContent>


                <DialogActions
                    sx={{
                        flexDirection: { xs: "column-reverse", sm: "row" },
                        alignItems: { xs: "stretch", sm: "center" },
                        gap: { xs: 1, sm: 0 },
                        px: { xs: 2, sm: 3 },
                        pb: { xs: 2, sm: 1 }
                    }}
                >

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
                        {editingId !== null
                            ? "Update"
                            : "Save"}
                    </Button>

                </DialogActions>

            </Dialog>


            {/* SUCCESS MESSAGE */}

            <Snackbar
                open={Boolean(message)}
                autoHideDuration={3000}
                onClose={() =>
                    setMessage("")
                }
                message={message}
            />

        </Box>

    );

}