import { useEffect, useState } from "react";

import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Snackbar,
    Stack,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import BlockIcon from "@mui/icons-material/Block";

import { apiFetch } from "../../api/api";


const ACCOUNT_TYPES = [
    {
        value: "ASSET",
        label: "Asset"
    },
    {
        value: "LIABILITY",
        label: "Liability"
    },
    {
        value: "INCOME",
        label: "Income"
    },
    {
        value: "EXPENSE",
        label: "Expense"
    },
    {
        value: "EQUITY",
        label: "Equity"
    }
];


const EMPTY_FORM = {
    account_code: "",
    account_name: "",
    account_type: "ASSET",
    parent_account_id: "",
    is_group: false,
    opening_balance: "0",
    opening_balance_type: "",
    active: true,
    remarks: ""
};


export default function AccountsMaster() {

    const [rows, setRows] =
        useState([]);

    const [groups, setGroups] =
        useState([]);

    const [loading, setLoading] =
        useState(false);

    const [dialogOpen, setDialogOpen] =
        useState(false);

    const [editingId, setEditingId] =
        useState(null);

    const [form, setForm] =
        useState({
            ...EMPTY_FORM
        });

    const [error, setError] =
        useState("");

    const [message, setMessage] =
        useState("");


    // =====================================================
    // LOAD ACCOUNTS
    // =====================================================

    const loadAccounts = async () => {

        try {

            setLoading(true);
            setError("");

            const response =
                await apiFetch(
                    "/api/accounts"
                );

            const data =
                await response.json();

            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Unable to load accounts"
                );

            }

            setRows(
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


    // =====================================================
    // LOAD ACCOUNT GROUPS
    // =====================================================

    const loadGroups = async () => {

        try {

            const response =
                await apiFetch(
                    "/api/accounts/groups"
                );

            const data =
                await response.json();

            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Unable to load account groups"
                );

            }

            setGroups(
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

    };


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {

        loadAccounts();
        loadGroups();

    }, []);


    // =====================================================
    // OPEN ADD
    // =====================================================

    const openAdd = () => {

        setEditingId(null);

        setForm({
            ...EMPTY_FORM
        });

        setError("");

        setDialogOpen(true);

    };


    // =====================================================
    // OPEN EDIT
    // =====================================================

    const openEdit = (row) => {

        setEditingId(
            row.id
        );

        setForm({

            account_code:
                row.account_code ||
                "",

            account_name:
                row.account_name ||
                "",

            account_type:
                row.account_type ||
                "ASSET",

            parent_account_id:
                row.parent_account_id === null ||
                row.parent_account_id === undefined
                    ? ""
                    : String(
                        row.parent_account_id
                    ),

            is_group:
                Boolean(
                    row.is_group
                ),

            opening_balance:
                row.opening_balance === null ||
                row.opening_balance === undefined
                    ? "0"
                    : String(
                        row.opening_balance
                    ),

            opening_balance_type:
                row.opening_balance_type ||
                "",

            active:
                row.active !== false,

            remarks:
                row.remarks ||
                ""

        });

        setError("");

        setDialogOpen(true);

    };


    // =====================================================
    // FORM CHANGE
    // =====================================================

    const handleChange = (field) => (event) => {

        const value =
            event.target.value;

        setForm(
            previous => ({
                ...previous,
                [field]: value
            })
        );

    };


    // =====================================================
    // GROUP TOGGLE
    // =====================================================

    const handleGroupChange = (event) => {

        const checked =
            event.target.checked;

        setForm(
            previous => ({
                ...previous,

                is_group:
                    checked,

                parent_account_id:
                    checked
                        ? ""
                        : previous.parent_account_id,

                opening_balance:
                    checked
                        ? "0"
                        : previous.opening_balance,

                opening_balance_type:
                    checked
                        ? ""
                        : previous.opening_balance_type
            })
        );

    };


    // =====================================================
    // SAVE
    // =====================================================

    const handleSave = async () => {

        try {

            setError("");

            const code =
                form.account_code.trim();

            const name =
                form.account_name.trim();

            if (!code) {

                setError(
                    "Account code is required"
                );

                return;

            }

            if (!name) {

                setError(
                    "Account name is required"
                );

                return;

            }


            const balance =
                Number(
                    form.opening_balance || 0
                );

            if (
                !Number.isFinite(balance) ||
                balance < 0
            ) {

                setError(
                    "Opening balance must be zero or positive"
                );

                return;

            }


            if (
                balance > 0 &&
                !form.opening_balance_type
            ) {

                setError(
                    "Select Debit or Credit for the opening balance"
                );

                return;

            }

            if (
    !form.is_group &&
    !form.parent_account_id
) {

    setError(
        "Parent account is required for ledger accounts"
    );

    return;

}


            const payload = {

                account_code:
                    code,

                account_name:
                    name,

                account_type:
                    form.account_type,

                parent_account_id:
                    form.is_group
                        ? null
                        : (
                            form.parent_account_id
                                ? Number(
                                    form.parent_account_id
                                )
                                : null
                        ),

                is_group:
                    form.is_group,

                opening_balance:
                    balance,

                opening_balance_type:
                    balance === 0
                        ? null
                        : form.opening_balance_type,

                active:
                    form.active,

                remarks:
                    form.remarks.trim() ||
                    null

            };


            const url =
                editingId
                    ? `/api/accounts/${editingId}`
                    : "/api/accounts";

            const method =
                editingId
                    ? "PUT"
                    : "POST";


            const response =
                await apiFetch(
                    url,
                    {
                        method,
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


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Unable to save account"
                );

            }


            setDialogOpen(false);

            setMessage(
                editingId
                    ? "Account updated successfully"
                    : "Account created successfully"
            );


            await loadAccounts();
            await loadGroups();

        }
        catch (err) {

            console.error(err);

            setError(
                err.message
            );

        }

    };


    // =====================================================
    // DEACTIVATE
    // =====================================================

    const handleDeactivate = async (row) => {

        const confirmed =
            window.confirm(
                `Deactivate account "${row.account_name}"?`
            );

        if (!confirmed) {
            return;
        }


        try {

            setError("");

            const response =
                await apiFetch(
                    `/api/accounts/${row.id}`,
                    {
                        method:
                            "DELETE"
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Unable to deactivate account"
                );

            }


            setMessage(
                "Account deactivated successfully"
            );

            await loadAccounts();
            await loadGroups();

        }
        catch (err) {

            console.error(err);

            setError(
                err.message
            );

        }

    };


    // =====================================================
    // CLOSE DIALOG
    // =====================================================

    const closeDialog = () => {

        setDialogOpen(false);

        setError("");

    };


    return (
        <Box
            sx={{
                p: {
                    xs: 1.5,
                    sm: 3
                }
            }}
        >

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <Paper
                sx={{
                    p: {
                        xs: 2,
                        sm: 3
                    },
                    mb: 2
                }}
            >

                <Stack
                    direction={{
                        xs: "column",
                        sm: "row"
                    }}
                    spacing={2}
                    justifyContent="space-between"
                    alignItems={{
                        xs: "stretch",
                        sm: "center"
                    }}
                >

                    <Box>

                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 600,
                                fontSize: {
                                    xs: "1.6rem",
                                    sm: "2.125rem"
                                }
                            }}
                        >
                            Accounts Master
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                mt: 0.5
                            }}
                        >
                            Manage account groups and ledger accounts
                        </Typography>

                    </Box>


                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={openAdd}
                        sx={{
                            alignSelf: {
                                xs: "stretch",
                                sm: "auto"
                            }
                        }}
                    >
                        New Account
                    </Button>

                </Stack>

            </Paper>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && !dialogOpen && (

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


            {/* =================================================
                ACCOUNTS TABLE
            ================================================= */}

            <Paper>

                <TableContainer
                    sx={{
                        overflowX: "auto"
                    }}
                >

                    <Table
                        size="small"
                        sx={{
                            minWidth: 900
                        }}
                    >

                        <TableHead>

                            <TableRow>

                                <TableCell>
                                    Code
                                </TableCell>

                                <TableCell>
                                    Account Name
                                </TableCell>

                                <TableCell>
                                    Type
                                </TableCell>

                                <TableCell>
                                    Parent Account
                                </TableCell>

                                <TableCell>
                                    Kind
                                </TableCell>

                                <TableCell align="right">
                                    Opening Balance
                                </TableCell>

                                <TableCell>
                                    Status
                                </TableCell>

                                <TableCell align="center">
                                    Actions
                                </TableCell>

                            </TableRow>

                        </TableHead>


                        <TableBody>

                            {loading && (

                                <TableRow>

                                    <TableCell
                                        colSpan={8}
                                        align="center"
                                        sx={{
                                            py: 4
                                        }}
                                    >
                                        Loading accounts...
                                    </TableCell>

                                </TableRow>

                            )}


                            {!loading &&
                                rows.length === 0 && (

                                    <TableRow>

                                        <TableCell
                                            colSpan={8}
                                            align="center"
                                            sx={{
                                                py: 5
                                            }}
                                        >

                                            <Typography
                                                color="text.secondary"
                                            >
                                                No accounts found.
                                            </Typography>

                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{
                                                    mt: 0.5
                                                }}
                                            >
                                                Create your first account group or ledger account.
                                            </Typography>

                                        </TableCell>

                                    </TableRow>

                                )}


                            {!loading &&
                                rows.map(
                                    row => (

                                        <TableRow
                                            key={
                                                row.id
                                            }
                                            hover
                                        >

                                            <TableCell>
                                                {row.account_code}
                                            </TableCell>

                                            <TableCell>
                                                {row.account_name}
                                            </TableCell>

                                            <TableCell>
                                                {
                                                    row.account_type
                                                }
                                            </TableCell>

                                            <TableCell>
                                                {
                                                    row.parent_account_name ||
                                                    "-"
                                                }
                                            </TableCell>

                                            <TableCell>
                                                {
                                                    row.is_group
                                                        ? "Group"
                                                        : "Ledger"
                                                }
                                            </TableCell>

                                            <TableCell align="right">

                                                {Number(
                                                    row.opening_balance ||
                                                    0
                                                ).toFixed(2)}

                                                {row.opening_balance_type
                                                    ? ` ${
                                                        row.opening_balance_type === "D"
                                                            ? "Dr"
                                                            : "Cr"
                                                    }`
                                                    : ""}

                                            </TableCell>

                                            <TableCell>

                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        fontWeight: 600,
                                                        color:
                                                            row.active
                                                                ? "success.main"
                                                                : "text.secondary"
                                                    }}
                                                >
                                                    {
                                                        row.active
                                                            ? "Active"
                                                            : "Inactive"
                                                    }
                                                </Typography>

                                            </TableCell>

                                            <TableCell align="center">

                                                <Stack
                                                    direction="row"
                                                    spacing={0.5}
                                                    justifyContent="center"
                                                >

                                                    <Button
                                                        size="small"
                                                        startIcon={
                                                            <EditIcon />
                                                        }
                                                        onClick={() =>
                                                            openEdit(
                                                                row
                                                            )
                                                        }
                                                    >
                                                        Edit
                                                    </Button>


                                                    {row.active && (

                                                        <Button
                                                            size="small"
                                                            color="error"
                                                            startIcon={
                                                                <BlockIcon />
                                                            }
                                                            onClick={() =>
                                                                handleDeactivate(
                                                                    row
                                                                )
                                                            }
                                                        >
                                                            Disable
                                                        </Button>

                                                    )}

                                                </Stack>

                                            </TableCell>

                                        </TableRow>

                                    )
                                )}

                        </TableBody>

                    </Table>

                </TableContainer>

            </Paper>


            {/* =================================================
                ADD / EDIT DIALOG
            ================================================= */}

            <Dialog
                open={dialogOpen}
                onClose={closeDialog}
                fullWidth
                maxWidth="sm"
                fullScreen={false}
            >

                <DialogTitle>

                    {editingId
                        ? "Edit Account"
                        : "New Account"}

                </DialogTitle>


                <DialogContent dividers>

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


                    <Stack
                        spacing={2}
                        sx={{
                            pt: 0.5
                        }}
                    >

                        <TextField
                            label="Account Code"
                            value={
                                form.account_code
                            }
                            onChange={
                                handleChange(
                                    "account_code"
                                )
                            }
                            fullWidth
                            required
                        />


                        <TextField
                            label="Account Name"
                            value={
                                form.account_name
                            }
                            onChange={
                                handleChange(
                                    "account_name"
                                )
                            }
                            fullWidth
                            required
                        />


                        <FormControl
                            fullWidth
                        >

                            <InputLabel>
                                Account Type
                            </InputLabel>

                            <Select
                                value={
                                    form.account_type
                                }
                                label="Account Type"
                                onChange={
                                    handleChange(
                                        "account_type"
                                    )
                                }
                            >

                                {ACCOUNT_TYPES.map(
                                    type => (

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


                        <FormControlLabel
                            control={
                                <Switch
                                    checked={
                                        form.is_group
                                    }
                                    onChange={
                                        handleGroupChange
                                    }
                                />
                            }
                            label="This is a Group Account"
                        />


                        {!form.is_group && (

                            <FormControl
                                fullWidth
                            >

                                <InputLabel required>
                                    Parent Account
                                </InputLabel>

                                <Select
    value={
        form.parent_account_id
    }
    label="Parent Account"
    required
    onChange={
        handleChange(
            "parent_account_id"
        )
    }
>


                                    {groups.map(
                                        group => (

                                            <MenuItem
                                                key={
                                                    group.id
                                                }
                                                value={
                                                    String(
                                                        group.id
                                                    )
                                                }
                                            >
                                                {
                                                    group.account_code
                                                }
                                                {" - "}
                                                {
                                                    group.account_name
                                                }
                                            </MenuItem>

                                        )
                                    )}

                                </Select>

                            </FormControl>

                        )}


                        {!form.is_group && (

                            <Stack
                                direction={{
                                    xs: "column",
                                    sm: "row"
                                }}
                                spacing={2}
                            >

                                <TextField
                                    label="Opening Balance"
                                    type="number"
                                    value={
                                        form.opening_balance
                                    }
                                    onChange={
                                        handleChange(
                                            "opening_balance"
                                        )
                                    }
                                    fullWidth
                                    inputProps={{
                                        min: 0,
                                        step: "0.01"
                                    }}
                                />


                                <FormControl
                                    fullWidth
                                >

                                    <InputLabel>
                                        Debit / Credit
                                    </InputLabel>

                                    <Select
                                        value={
                                            form.opening_balance_type
                                        }
                                        label="Debit / Credit"
                                        onChange={
                                            handleChange(
                                                "opening_balance_type"
                                            )
                                        }
                                    >

                                        <MenuItem value="">
                                            None
                                        </MenuItem>

                                        <MenuItem value="D">
                                            Debit
                                        </MenuItem>

                                        <MenuItem value="C">
                                            Credit
                                        </MenuItem>

                                    </Select>

                                </FormControl>

                            </Stack>

                        )}


                        <FormControlLabel
                            control={
                                <Switch
                                    checked={
                                        form.active
                                    }
                                    onChange={
                                        event =>
                                            setForm(
                                                previous => ({
                                                    ...previous,
                                                    active:
                                                        event
                                                            .target
                                                            .checked
                                                })
                                            )
                                    }
                                />
                            }
                            label="Active"
                        />


                        <TextField
                            label="Remarks"
                            value={
                                form.remarks
                            }
                            onChange={
                                handleChange(
                                    "remarks"
                                )
                            }
                            fullWidth
                            multiline
                            minRows={2}
                        />

                    </Stack>

                </DialogContent>


                <DialogActions
                    sx={{
                        px: 3,
                        py: 2
                    }}
                >

                    <Button
                        onClick={
                            closeDialog
                        }
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="contained"
                        onClick={
                            handleSave
                        }
                    >
                        Save
                    </Button>

                </DialogActions>

            </Dialog>


            {/* =================================================
                SUCCESS MESSAGE
            ================================================= */}

            <Snackbar
                open={
                    Boolean(message)
                }
                autoHideDuration={3000}
                onClose={() =>
                    setMessage("")
                }
                message={
                    message
                }
            />

        </Box>
    );
}
