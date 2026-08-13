import { useEffect, useState } from "react";

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Alert,
    Divider
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";

import { DataGrid } from "@mui/x-data-grid";

import { apiFetch } from "../../api/api";


export default function DevoteeSearchDialog({
    open,
    onClose,
    onSelect
}) {

    // ==================================================
    // SEARCH STATE
    // ==================================================

    const [rows, setRows] = useState([]);

    const [search, setSearch] = useState("");

    const [selectedRow, setSelectedRow] =
        useState(null);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");


    // ==================================================
    // ADD DEVOTEE DIALOG
    // ==================================================

    const [addDialogOpen, setAddDialogOpen] =
        useState(false);

    const [addLoading, setAddLoading] =
        useState(false);

    const [addError, setAddError] =
        useState("");


    const [newDevotee, setNewDevotee] =
        useState({
            full_name: "",
            full_name_ml: "",
            phone: "",
            address: ""
        });


    // ==================================================
    // LOAD DEVOTEES
    // ==================================================

    const fetchDevotees = async (
        searchText = ""
    ) => {

        try {

            setLoading(true);

            setError("");


            const trimmedSearch =
                searchText.trim();


            const url =
                trimmedSearch
                    ? `/api/devotees?search=${encodeURIComponent(
                          trimmedSearch
                      )}`
                    : "/api/devotees";


            const response =
                await apiFetch(url);


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Unable to load devotees"
                );

            }


            setRows(
                Array.isArray(data)
                    ? data
                    : []
            );

        }

        catch (error) {

            console.error(
                "Devotee search error:",
                error
            );


            setRows([]);


            setError(
                error.message ||
                "Unable to load devotees"
            );

        }

        finally {

            setLoading(false);

        }

    };


    // ==================================================
    // LOAD WHEN DIALOG OPENS
    // ==================================================

    useEffect(() => {

        if (!open) {
            return;
        }


        setSearch("");

        setSelectedRow(null);

        setError("");


        fetchDevotees("");

    }, [open]);


    // ==================================================
    // SEARCH
    // ==================================================

    useEffect(() => {

        if (!open) {
            return;
        }


        const timer =
            setTimeout(() => {

                fetchDevotees(search);

            }, 300);


        return () => {

            clearTimeout(timer);

        };

    }, [search, open]);


    // ==================================================
    // OPEN ADD DEVOTEE
    // ==================================================

    const openAddDevotee = () => {

        setNewDevotee({
            full_name: "",
            full_name_ml: "",
            phone: "",
            address: ""
        });

        setAddError("");

        setAddDialogOpen(true);

    };


    // ==================================================
    // CLOSE ADD DEVOTEE
    // ==================================================

    const closeAddDevotee = () => {

        if (addLoading) {
            return;
        }


        setAddDialogOpen(false);

        setAddError("");

    };


    // ==================================================
    // SAVE NEW DEVOTEE
    // ==================================================

    const handleAddDevotee = async () => {

        setAddError("");


        if (!newDevotee.full_name.trim()) {

            setAddError(
                "Devotee name is required"
            );

            return;

        }


        try {

            setAddLoading(true);


            const response =
                await apiFetch(
                    "/api/devotees",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            full_name:
                                newDevotee.full_name.trim(),

                            full_name_ml:
                                newDevotee.full_name_ml.trim(),

                            phone:
                                newDevotee.phone.trim(),

                            address:
                                newDevotee.address.trim(),

                            family_member: false

                        })

                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Unable to add devotee"
                );

            }


            // ==========================================
            // NEW DEVOTEE CREATED SUCCESSFULLY
            // ==========================================

            // Add the new devotee to the current list
            setRows((previous) => [

                data,

                ...previous

            ]);


            // Automatically select the new devotee
            onSelect(data);


            // Close both dialogs
            setAddDialogOpen(false);

            onClose();


        }

        catch (error) {

            console.error(
                "Add devotee error:",
                error
            );


            setAddError(
                error.message ||
                "Unable to add devotee"
            );

        }

        finally {

            setAddLoading(false);

        }

    };


    // ==================================================
    // COLUMNS
    // ==================================================

    const columns = [

        {
            field: "full_name",

            headerName: "Name",

            flex: 1,

            minWidth: 180
        },


        {
            field: "full_name_ml",

            headerName: "Malayalam Name",

            flex: 1,

            minWidth: 180
        },


        {
            field: "phone",

            headerName: "Phone",

            width: 150
        },


        {
            field: "address",

            headerName: "Address",

            flex: 1,

            minWidth: 200
        }

    ];


    // ==================================================
    // SELECT EXISTING DEVOTEE
    // ==================================================

    const handleSelect = () => {

        if (!selectedRow) {
            return;
        }


        onSelect(selectedRow);

        onClose();

    };


    // ==================================================
    // RENDER
    // ==================================================

    return (

        <>

            {/* ==================================================
                SEARCH DEVOTEE DIALOG
            ================================================== */}

            <Dialog
                open={open}
                onClose={onClose}
                maxWidth="lg"
                fullWidth
            >

                <DialogTitle>
                    Search Devotee
                </DialogTitle>


                <DialogContent>

                    <Box
                        sx={{
                            pt: 1
                        }}
                    >

                        {/* SEARCH + ADD BUTTON */}

                        <Box
                            sx={{
                                display: "flex",
                                gap: 2,
                                mb: 2,
                                alignItems: "center"
                            }}
                        >

                            <TextField
                                fullWidth
                                label="Search by name, Malayalam name or phone"
                                value={search}
                                onChange={(e) =>
                                    setSearch(
                                        e.target.value
                                    )
                                }
                                autoFocus
                            />


                            <Button
                                variant="contained"
                                startIcon={
                                    <AddIcon />
                                }
                                onClick={
                                    openAddDevotee
                                }
                                sx={{
                                    minWidth: 190,
                                    height: 40,
                                    whiteSpace:
                                        "nowrap"
                                }}
                            >
                                Add New Devotee
                            </Button>

                        </Box>


                        {error && (

                            <Alert
                                severity="error"
                                sx={{
                                    mb: 2
                                }}
                            >
                                {error}
                            </Alert>

                        )}


                        <Box
                            sx={{
                                height: 400,
                                width: "100%"
                            }}
                        >

                            <DataGrid

                                rows={rows}

                                columns={columns}

                                loading={loading}

                                disableRowSelectionOnClick

                                onRowClick={(params) =>
                                    setSelectedRow(
                                        params.row
                                    )
                                }

                                getRowClassName={
                                    (params) => {

                                        if (
                                            selectedRow &&
                                            selectedRow.id ===
                                                params.row.id
                                        ) {

                                            return "selected-devotee-row";

                                        }

                                        return "";

                                    }
                                }

                                sx={{

                                    "& .selected-devotee-row":
                                        {
                                            backgroundColor:
                                                "rgba(25, 118, 210, 0.12)"
                                        }

                                }}

                                pageSizeOptions={[
                                    10,
                                    25,
                                    50
                                ]}

                                initialState={{
                                    pagination: {
                                        paginationModel: {
                                            pageSize: 10,
                                            page: 0
                                        }
                                    }
                                }}

                            />

                        </Box>

                    </Box>

                </DialogContent>


                <DialogActions>

                    <Button
                        onClick={onClose}
                    >
                        Cancel
                    </Button>


                    <Button
                        variant="contained"
                        disabled={!selectedRow}
                        onClick={handleSelect}
                    >
                        Select
                    </Button>

                </DialogActions>

            </Dialog>


            {/* ==================================================
                ADD NEW DEVOTEE DIALOG
            ================================================== */}

            <Dialog
                open={addDialogOpen}
                onClose={closeAddDevotee}
                maxWidth="sm"
                fullWidth
            >

                <DialogTitle>
                    Add New Devotee
                </DialogTitle>


                <DialogContent>

                    <Box
                        sx={{
                            pt: 1
                        }}
                    >

                        {addError && (

                            <Alert
                                severity="error"
                                sx={{
                                    mb: 2
                                }}
                            >
                                {addError}
                            </Alert>

                        )}


                        <TextField
                            fullWidth
                            required
                            label="Devotee Name"
                            value={
                                newDevotee.full_name
                            }
                            onChange={(e) =>
                                setNewDevotee({
                                    ...newDevotee,
                                    full_name:
                                        e.target.value
                                })
                            }
                            margin="normal"
                            autoFocus
                        />


                        <TextField
                            fullWidth
                            label="Malayalam Name"
                            value={
                                newDevotee.full_name_ml
                            }
                            onChange={(e) =>
                                setNewDevotee({
                                    ...newDevotee,
                                    full_name_ml:
                                        e.target.value
                                })
                            }
                            margin="normal"
                        />


                        <TextField
                            fullWidth
                            label="Phone"
                            value={
                                newDevotee.phone
                            }
                            onChange={(e) =>
                                setNewDevotee({
                                    ...newDevotee,
                                    phone:
                                        e.target.value
                                })
                            }
                            margin="normal"
                        />


                        <TextField
                            fullWidth
                            label="Address"
                            value={
                                newDevotee.address
                            }
                            onChange={(e) =>
                                setNewDevotee({
                                    ...newDevotee,
                                    address:
                                        e.target.value
                                })
                            }
                            margin="normal"
                            multiline
                            rows={3}
                        />

                    </Box>

                </DialogContent>


                <Divider />


                <DialogActions>

                    <Button
                        onClick={
                            closeAddDevotee
                        }
                        disabled={addLoading}
                    >
                        Cancel
                    </Button>


                    <Button
                        variant="contained"
                        onClick={
                            handleAddDevotee
                        }
                        disabled={addLoading}
                    >

                        {addLoading
                            ? "Saving..."
                            : "Save Devotee"}

                    </Button>

                </DialogActions>

            </Dialog>

        </>

    );

}