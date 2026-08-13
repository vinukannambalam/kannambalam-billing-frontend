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
    Snackbar,
    FormControlLabel
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import { apiFetch } from "../../api/api";
export default function Devotees() {
    const [devotees, setDevotees] = useState([]);
    const [search, setSearch] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingDevotee, setEditingDevotee] = useState(null);
    const [fullName, setFullName] = useState("");
    const [fullNameMl, setFullNameMl] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [addressMl, setAddressMl] = useState("");
    const [familyMember, setFamilyMember] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    // ==========================================
    // LOAD / SEARCH DEVOTEES
    // ==========================================
    const loadDevotees = async (
        searchText = search
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


            setDevotees(
                Array.isArray(data)
                    ? data
                    : []
            );

        }

        catch (err) {

            console.error(err);

            setError(
                err.message
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

        loadDevotees("");

    }, []);


    // ==========================================
    // BACKEND SEARCH
    // ==========================================

    useEffect(() => {

        const timer =
            setTimeout(() => {

                loadDevotees(search);

            }, 300);


        return () => {

            clearTimeout(timer);

        };

    }, [search]);


    // ==========================================
    // CLEAR FORM
    // ==========================================

    const clearForm = () => {

        setFullName("");
        setFullNameMl("");
        setPhone("");
        setAddress("");
        setAddressMl("");
        setFamilyMember(false);

    };


    // ==========================================
    // NEW DEVOTEE
    // ==========================================

    const handleNew = () => {

        setEditingDevotee(null);

        clearForm();

        setError("");

        setDialogOpen(true);

    };


    // ==========================================
    // EDIT DEVOTEE
    // ==========================================

    const handleEdit = (devotee) => {

        setEditingDevotee(devotee);


        setFullName(
            devotee.full_name || ""
        );


        setFullNameMl(
            devotee.full_name_ml || ""
        );


        setPhone(
            devotee.phone || ""
        );


        setAddress(
            devotee.address || ""
        );


        setAddressMl(
            devotee.address_ml || ""
        );


        setFamilyMember(
            Boolean(
                devotee.family_member
            )
        );


        setError("");

        setDialogOpen(true);

    };


    // ==========================================
    // SAVE / UPDATE
    // ==========================================

    const handleSave = async () => {

        if (!fullName.trim()) {

            setError(
                "Devotee name is required"
            );

            return;

        }


        if (!fullNameMl.trim()) {

            setError(
                "Malayalam devotee name is required"
            );

            return;

        }


        try {

            setLoading(true);

            setError("");


            const isEdit =
                editingDevotee !== null;


            const response =
                await apiFetch(

                    isEdit
                        ? `/api/devotees/${editingDevotee.id}`
                        : "/api/devotees",

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

                                full_name:
                                    fullName.trim(),

                                full_name_ml:
                                    fullNameMl.trim(),

                                phone:
                                    phone.trim(),

                                address:
                                    address.trim(),

                                address_ml:
                                    addressMl.trim(),

                                family_member:
                                    familyMember

                            })

                    }

                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Unable to save devotee"
                );

            }


            setDialogOpen(false);

            clearForm();

            setEditingDevotee(null);


            await loadDevotees(search);


            setMessage(

                isEdit
                    ? "Devotee updated successfully"
                    : "Devotee added successfully"

            );

        }

        catch (err) {

            console.error(err);

            setError(
                err.message
            );

        }

        finally {

            setLoading(false);

        }

    };


    // ==========================================
    // DELETE DEVOTEE
    // ==========================================

    const handleDelete =
        async (devotee) => {

            const confirmed =
                window.confirm(
                    `Delete ${devotee.full_name}?`
                );


            if (!confirmed) {

                return;

            }


            try {

                setLoading(true);

                setError("");


                const response =
                    await apiFetch(

                        `/api/devotees/${devotee.id}`,

                        {

                            method: "DELETE"

                        }

                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.error ||
                        "Unable to delete devotee"
                    );

                }


                await loadDevotees(search);


                setMessage(
                    "Devotee deleted successfully"
                );

            }

            catch (err) {

                console.error(err);

                setError(
                    err.message
                );

            }

            finally {

                setLoading(false);

            }

        };


    // ==========================================
    // CLEAR SEARCH
    // ==========================================

    const handleClearSearch = () => {

        setSearch("");

    };


    return (

        <Box
            sx={{
                width: "100%",
                maxWidth: "none",
                margin: 0,
                padding: 0
            }}
        >

            {/* ======================================
                PAGE HEADER
            ====================================== */}

            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: { xs: "stretch", sm: "center" },
                    flexDirection: { xs: "column", md: "row" },
                    mb: { xs: 2, md: 3 },
                    width: "100%",
                    gap: { xs: 1.5, md: 2 }
                }}
            >

                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: 600,
                        textAlign: "left",
                        whiteSpace: "nowrap",
                        fontSize: {
                            xs: "1.5rem",
                            sm: "1.75rem",
                            md: "2.125rem"
                        }
                    }}
                >
                    Devotees
                </Typography>


                <Box
                    sx={{
                        display: "flex",
                        gap: { xs: 1, sm: 1.5, md: 2 },
                        alignItems: { xs: "stretch", sm: "center" },
                        flexDirection: { xs: "column", sm: "row" },
                        width: { xs: "100%", md: "auto" }
                    }}
                >

                    <TextField
                        size="small"
                        label="Search Devotee"
                        placeholder="Name, phone or address"
                        value={search}
                        onChange={(e) =>
                            setSearch(
                                e.target.value
                            )
                        }
                        sx={{
                            width: { xs: "100%", sm: 320 },
                            maxWidth: "100%"
                        }}
                    />


                    {search && (

                        <Button
                            variant="outlined"
                            onClick={
                                handleClearSearch
                            }
                            fullWidth
                            sx={{
                                minHeight: 48,
                                width: { xs: "100%", sm: "auto" }
                            }}
                        >
                            Clear
                        </Button>

                    )}


                    <Button
                        variant="contained"
                        startIcon={
                            <AddIcon />
                        }
                        onClick={handleNew}
                        fullWidth
                        sx={{
                            minHeight: 48,
                            width: { xs: "100%", sm: "auto" }
                        }}
                    >
                        New Devotee
                    </Button>

                </Box>

            </Box>


            {/* ======================================
                SEARCH STATUS
            ====================================== */}

            {search.trim() && (

                <Typography
                    variant="body2"
                    sx={{
                        mb: { xs: 1.5, md: 2 },
                        color:
                            "text.secondary"
                    }}
                >
                    Showing {devotees.length}{" "}
                    matching devotee
                    {devotees.length === 1
                        ? ""
                        : "s"}
                </Typography>

            )}


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
                DEVOTEES TABLE
            ====================================== */}

            <Paper
                sx={{
                    borderRadius: { xs: 1.5, md: 2 },
                    overflow: "hidden",
                    width: "100%"
                }}
            >

                <Box
                    sx={{
                        width: "100%",
                        overflowX: "auto",
                        WebkitOverflowScrolling: "touch"
                    }}
                >

                <Table
                    sx={{
                        width: "100%",
                        minWidth: { xs: 820, sm: 900 },
                        tableLayout: "fixed",
                        "& .MuiTableCell-root": {
                            px: { xs: 1, sm: 1.5, md: 2 },
                            py: { xs: 1.25, sm: 1.5 }
                        }
                    }}
                >

                    <TableHead>

                        <TableRow>

                            <TableCell
                                sx={{
                                    width: "12%",
                                    whiteSpace: "nowrap"
                                }}
                            >
                                Member ID
                            </TableCell>


                            <TableCell
                                sx={{
                                    width: "17%"
                                }}
                            >
                                Name
                            </TableCell>


                            <TableCell
                                sx={{
                                    width: "25%"
                                }}
                            >
                                Malayalam Name
                            </TableCell>


                            <TableCell
                                sx={{
                                    width: "12%"
                                }}
                            >
                                Phone
                            </TableCell>


                            <TableCell
                                sx={{
                                    width: "19%"
                                }}
                            >
                                Address
                            </TableCell>


                            <TableCell
                                align="center"
                                sx={{
                                    width: "7%",
                                    whiteSpace: "nowrap"
                                }}
                            >
                                Family
                            </TableCell>


                            <TableCell
                                align="center"
                                sx={{
                                    width: "8%",
                                    whiteSpace: "nowrap"
                                }}
                            >
                                Actions
                            </TableCell>

                        </TableRow>

                    </TableHead>


                    <TableBody>

                        {devotees.map(
                            (devotee) => (

                                <TableRow
                                    key={
                                        devotee.id
                                    }
                                    hover
                                >

                                    {/* MEMBER ID */}

                                    <TableCell
                                        sx={{
                                            fontWeight: 500,
                                            whiteSpace: "nowrap"
                                        }}
                                    >

                                        {devotee.member_id ||
                                            "—"}

                                    </TableCell>


                                    {/* NAME */}

                                    <TableCell
                                        sx={{
                                            wordBreak:
                                                "break-word"
                                        }}
                                    >

                                        {
                                            devotee.full_name
                                        }

                                    </TableCell>


                                    {/* MALAYALAM NAME */}

                                    <TableCell
                                        sx={{
                                            fontSize:
                                                "1rem",
                                            wordBreak:
                                                "break-word",
                                            lineHeight:
                                                1.5
                                        }}
                                    >

                                        {
                                            devotee.full_name_ml ||
                                            "-"
                                        }

                                    </TableCell>


                                    {/* PHONE */}

                                    <TableCell
                                        sx={{
                                            whiteSpace:
                                                "nowrap"
                                        }}
                                    >

                                        {
                                            devotee.phone ||
                                            "-"
                                        }

                                    </TableCell>


                                    {/* ADDRESS */}

                                    <TableCell
                                        sx={{
                                            wordBreak:
                                                "break-word"
                                        }}
                                    >

                                        {
                                            devotee.address ||
                                            "-"
                                        }

                                    </TableCell>


                                    {/* FAMILY MEMBER */}

                                    <TableCell
                                        align="center"
                                        sx={{
                                            padding:
                                                "4px"
                                        }}
                                    >

                                        <Switch
                                            checked={
                                                Boolean(
                                                    devotee.family_member
                                                )
                                            }
                                            disabled
                                            size="small"
                                        />

                                    </TableCell>


                                    {/* ACTIONS */}

                                    <TableCell
                                        align="center"
                                        sx={{
                                            padding:
                                                "4px"
                                        }}
                                    >

                                        <IconButton
                                            color="primary"
                                            size="small"
                                            onClick={() =>
                                                handleEdit(
                                                    devotee
                                                )
                                            }
                                        >

                                            <EditIcon
                                                fontSize="small"
                                            />

                                        </IconButton>


                                        <Button
                                            color="error"
                                            size="small"
                                            sx={{
                                                minWidth:
                                                    "auto",
                                                padding:
                                                    "2px 4px",
                                                fontSize:
                                                    "0.7rem"
                                            }}
                                            onClick={() =>
                                                handleDelete(
                                                    devotee
                                                )
                                            }
                                        >
                                            Delete
                                        </Button>

                                    </TableCell>

                                </TableRow>

                            )
                        )}


                        {devotees.length === 0 &&
                            !loading && (

                                <TableRow>

                                    <TableCell
                                        colSpan={7}
                                        align="center"
                                    >

                                        {search.trim()
                                            ? "No devotees found matching your search."
                                            : "No devotees found."}

                                    </TableCell>

                                </TableRow>

                            )}


                        {loading && (

                            <TableRow>

                                <TableCell
                                    colSpan={7}
                                    align="center"
                                >
                                    Searching...
                                </TableCell>

                            </TableRow>

                        )}

                    </TableBody>

                </Table>

                </Box>

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
                maxWidth="md"
            >

                <DialogTitle>

                    {editingDevotee
                        ? "Edit Devotee"
                        : "New Devotee"}

                </DialogTitle>


                <DialogContent
                    sx={{
                        px: { xs: 2, sm: 3 },
                        py: { xs: 1, sm: 2 }
                    }}
                >

                    <TextField
                        fullWidth
                        label="Full Name"
                        value={fullName}
                        onChange={(e) =>
                            setFullName(
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
                        value={fullNameMl}
                        onChange={(e) =>
                            setFullNameMl(
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
                        label="Phone"
                        value={phone}
                        onChange={(e) =>
                            setPhone(
                                e.target.value
                            )
                        }
                        sx={{
                            mb: 2
                        }}
                    />


                    <TextField
                        fullWidth
                        label="Address"
                        value={address}
                        onChange={(e) =>
                            setAddress(
                                e.target.value
                            )
                        }
                        multiline
                        rows={3}
                        sx={{
                            mb: 2
                        }}
                    />


                    <TextField
                        fullWidth
                        label="Malayalam Address"
                        value={addressMl}
                        onChange={(e) =>
                            setAddressMl(
                                e.target.value
                            )
                        }
                        multiline
                        rows={3}
                        sx={{
                            mb: 2
                        }}
                        inputProps={{
                            lang: "ml"
                        }}
                    />


                    <FormControlLabel
                        control={

                            <Switch
                                checked={
                                    familyMember
                                }
                                onChange={(e) =>
                                    setFamilyMember(
                                        e.target.checked
                                    )
                                }
                            />

                        }
                        label="Family Member"
                    />

                </DialogContent>


                <DialogActions
                    sx={{
                        px: { xs: 2, sm: 3 },
                        pb: { xs: 2, sm: 2 },
                        pt: 1,
                        gap: 1,
                        flexDirection: { xs: "column-reverse", sm: "row" }
                    }}
                >

                    <Button
                        onClick={() =>
                            setDialogOpen(false)
                        }
                        fullWidth
                        sx={{
                            minHeight: 48,
                            width: { xs: "100%", sm: "auto" }
                        }}
                    >
                        Cancel
                    </Button>


                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={loading}
                        fullWidth
                        sx={{
                            minHeight: 48,
                            width: { xs: "100%", sm: "auto" }
                        }}
                    >

                        {editingDevotee
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