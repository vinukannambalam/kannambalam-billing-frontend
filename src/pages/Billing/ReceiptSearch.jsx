import { useEffect, useState } from "react";

import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Grid,
    IconButton,
    MenuItem,
    Alert,
    Snackbar
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PrintIcon from "@mui/icons-material/Print";
import ClearIcon from "@mui/icons-material/Clear";

import { DataGrid } from "@mui/x-data-grid";

import { useNavigate } from "react-router-dom";

import { apiFetch } from "../../api/api";


export default function ReceiptSearch() {

    const navigate = useNavigate();


    // ==================================================
    // RECEIPTS
    // ==================================================

    const [receipts, setReceipts] = useState([]);

    const [loading, setLoading] = useState(false);


    // ==================================================
    // SEARCH
    // ==================================================

    const [receiptNo, setReceiptNo] = useState("");

    const [devotee, setDevotee] = useState("");

    const [phone, setPhone] = useState("");

    const [date, setDate] = useState("");

    const [paymentMode, setPaymentMode] = useState("");


    // ==================================================
    // PAYMENT MODES
    // ==================================================

    const [paymentModes, setPaymentModes] = useState([]);


    // ==================================================
    // MESSAGE
    // ==================================================

    const [message, setMessage] = useState("");

    const [messageType, setMessageType] = useState("error");

    const [snackbarOpen, setSnackbarOpen] = useState(false);


    // ==================================================
    // MESSAGE
    // ==================================================

    const showMessage = (
        text,
        type = "error"
    ) => {

        setMessage(text);

        setMessageType(type);

        setSnackbarOpen(true);

    };


    // ==================================================
    // LOAD PAYMENT MODES
    // ==================================================

    useEffect(() => {

        loadPaymentModes();

    }, []);


    const loadPaymentModes = async () => {

        try {

            const response =
                await apiFetch(
                    "/api/payment-modes"
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Unable to load payment modes"
                );

            }


            setPaymentModes(
                Array.isArray(data)
                    ? data
                    : []
            );

        }

        catch (error) {

            console.error(
                "Payment modes error:",
                error
            );


            showMessage(
                error.message
            );

        }

    };


    // ==================================================
    // LOAD RECEIPTS
    // ==================================================

    useEffect(() => {

        loadReceipts();

    }, []);


    const loadReceipts = async () => {

        setLoading(true);


        try {

            const response =
                await apiFetch(
                    "/api/receipts"
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Unable to load receipts"
                );

            }


            setReceipts(
                Array.isArray(data)
                    ? data
                    : []
            );

        }

        catch (error) {

            console.error(
                "Load receipts error:",
                error
            );


            setReceipts([]);


            showMessage(
                error.message
            );

        }

        finally {

            setLoading(false);

        }

    };


    // ==================================================
    // SEARCH
    // ==================================================

    const handleSearch = async () => {

        setLoading(true);


        try {

            const params =
                new URLSearchParams();


            if (receiptNo.trim()) {

                params.append(
                    "receipt_no",
                    receiptNo.trim()
                );

            }


            if (devotee.trim()) {

                params.append(
                    "devotee",
                    devotee.trim()
                );

            }


            if (phone.trim()) {

                params.append(
                    "phone",
                    phone.trim()
                );

            }


            if (date) {

                params.append(
                    "date",
                    date
                );

            }


            if (paymentMode) {

                params.append(
                    "payment_mode_id",
                    paymentMode
                );

            }


            const queryString =
                params.toString();


            const url =
                queryString
                    ? `/api/receipts?${queryString}`
                    : "/api/receipts";


            console.log(
                "Receipt search URL:",
                url
            );


            const response =
                await apiFetch(url);


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Unable to search receipts"
                );

            }


            setReceipts(
                Array.isArray(data)
                    ? data
                    : []
            );

        }

        catch (error) {

            console.error(
                "Receipt search error:",
                error
            );


            setReceipts([]);


            showMessage(
                error.message
            );

        }

        finally {

            setLoading(false);

        }

    };


    // ==================================================
    // CLEAR
    // ==================================================

    const handleClear = () => {

        setReceiptNo("");

        setDevotee("");

        setPhone("");

        setDate("");

        setPaymentMode("");


        loadReceipts();

    };


    // ==================================================
    // DATE FORMAT
    // ==================================================

    const formatDate = (value) => {

        if (!value) {
            return "";
        }


        const dateObj =
            new Date(value);


        if (
            Number.isNaN(
                dateObj.getTime()
            )
        ) {

            return value;

        }


        const day =
            String(
                dateObj.getDate()
            ).padStart(2, "0");


        const month =
            String(
                dateObj.getMonth() + 1
            ).padStart(2, "0");


        const year =
            dateObj.getFullYear();


        return `${day}-${month}-${year}`;

    };


    // ==================================================
    // COLUMNS
    // ==================================================

    const columns = [

        // ----------------------------------------------
        // RECEIPT NUMBER
        // ----------------------------------------------

        {
            field: "receipt_no",

            headerName: "Receipt No",

            width: 125,

            headerAlign: "left",

            align: "left"

        },


        // ----------------------------------------------
        // DATE
        // ----------------------------------------------

        {
            field: "receipt_date",

            headerName: "Date",

            width: 115,

            headerAlign: "center",

            align: "center",

            renderCell: (params) => (

                <Box
                    sx={{
                        width: "100%",
                        textAlign: "center"
                    }}
                >

                    {formatDate(
                        params.value
                    )}

                </Box>

            )

        },


        // ----------------------------------------------
        // DEVOTEE
        // ----------------------------------------------

        {
            field: "devotee",

            headerName: "Devotee",

            flex: 1,

            minWidth: 180,

            headerAlign: "left",

            align: "left"

        },


        // ----------------------------------------------
        // PHONE
        // ----------------------------------------------

        {
            field: "phone",

            headerName: "Phone",

            width: 135,

            headerAlign: "left",

            align: "left"

        },


        // ----------------------------------------------
        // PAYMENT MODE
        // ----------------------------------------------

        {
            field: "payment_mode",

            headerName: "Payment Mode",

            width: 130,

            headerAlign: "left",

            align: "left",

            renderCell: (params) => (

                <Box
                    sx={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        height: "100%"
                    }}
                >

                    {params.value || ""}

                </Box>

            )

        },


        // ----------------------------------------------
        // AMOUNT
        // ----------------------------------------------

        {
            field: "amount",

            headerName: "Amount",

            width: 120,

            headerAlign: "right",

            align: "right",

            renderCell: (params) => (

                <Box
                    sx={{
                        width: "100%",
                        textAlign: "right"
                    }}
                >

                    ₹
                    {Number(
                        params.value || 0
                    ).toFixed(2)}

                </Box>

            )

        },


        // ----------------------------------------------
        // CREATED BY
        // ----------------------------------------------

        {
            field: "created_by_name",

            headerName: "Created By",

            width: 160,

            headerAlign: "left",

            align: "left",

            renderCell: (params) => (

                <Box
                    sx={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        height: "100%"
                    }}
                >

                    {params.value || "-"}

                </Box>

            )

        },


        // ----------------------------------------------
        // ACTIONS
        // ----------------------------------------------

        {
            field: "actions",

            headerName: "Actions",

            width: 120,

            sortable: false,

            filterable: false,

            headerAlign: "center",

            align: "center",

            renderCell: (params) => (

                <Box
                    sx={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center"
                    }}
                >

                    <IconButton
                        color="primary"
                        title="View Receipt"
                        size="small"
                        onClick={() =>
                            navigate(
                                `/receipts/${params.row.id}`
                            )
                        }
                    >

                        <VisibilityIcon />

                    </IconButton>


                    <IconButton
                        color="primary"
                        title="Print Receipt"
                        size="small"
                        onClick={() =>
                            console.log(
                                "Print",
                                params.row.id
                            )
                        }
                    >

                        <PrintIcon />

                    </IconButton>

                </Box>

            )

        }

    ];


    // ==================================================
    // RENDER
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
                Receipts
            </Typography>


            {/* ==================================================
                SEARCH PANEL
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
                    Search Receipts
                </Typography>


                <Grid
                    container
                    spacing={2}
                >

                    {/* RECEIPT NUMBER */}

                    <Grid
                        item
                        xs={12}
                        md={3}
                    >

                        <TextField
                            fullWidth
                            size="small"
                            label="Receipt No"
                            value={receiptNo}
                            onChange={(e) =>
                                setReceiptNo(
                                    e.target.value
                                )
                            }
                        />

                    </Grid>


                    {/* DEVOTEE */}

                    <Grid
                        item
                        xs={12}
                        md={3}
                    >

                        <TextField
                            fullWidth
                            size="small"
                            label="Devotee Name"
                            value={devotee}
                            onChange={(e) =>
                                setDevotee(
                                    e.target.value
                                )
                            }
                        />

                    </Grid>


                    {/* PHONE */}

                    <Grid
                        item
                        xs={12}
                        md={2}
                    >

                        <TextField
                            fullWidth
                            size="small"
                            label="Phone"
                            value={phone}
                            onChange={(e) =>
                                setPhone(
                                    e.target.value
                                )
                            }
                        />

                    </Grid>


                    {/* DATE */}

                    <Grid
                        item
                        xs={12}
                        md={2}
                    >

                        <TextField
                            fullWidth
                            size="small"
                            label="Receipt Date"
                            type="date"
                            value={date}
                            onChange={(e) =>
                                setDate(
                                    e.target.value
                                )
                            }
                            InputLabelProps={{
                                shrink: true
                            }}
                        />

                    </Grid>


                    {/* PAYMENT MODE */}

                    <Grid
                        item
                        xs={12}
                        md={2}
                    >

                        <TextField
                            select
                            fullWidth
                            size="small"
                            label="Payment Mode"
                            value={paymentMode}
                            onChange={(e) =>
                                setPaymentMode(
                                    e.target.value
                                )
                            }
                        >

                            <MenuItem value="">
                                All
                            </MenuItem>


                            {paymentModes.map(
                                (mode) => (

                                    <MenuItem
                                        key={mode.id}
                                        value={
                                            String(
                                                mode.id
                                            )
                                        }
                                    >

                                        {mode.payment_mode}

                                    </MenuItem>

                                )
                            )}

                        </TextField>

                    </Grid>

                </Grid>


                {/* BUTTONS */}

                <Box
                    sx={{
                        mt: 3,
                        display: "flex",
                        gap: 2
                    }}
                >

                    <Button
                        variant="contained"
                        startIcon={
                            <SearchIcon />
                        }
                        onClick={
                            handleSearch
                        }
                    >
                        Search
                    </Button>


                    <Button
                        variant="outlined"
                        startIcon={
                            <ClearIcon />
                        }
                        onClick={
                            handleClear
                        }
                    >
                        Clear
                    </Button>

                </Box>

            </Paper>


            {/* ==================================================
                RECEIPT LIST
            ================================================== */}

            <Paper
                sx={{
                    height: 500,
                    width: "100%"
                }}
            >

                <DataGrid
                    rows={receipts}
                    columns={columns}
                    loading={loading}
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
                    disableRowSelectionOnClick
                />

            </Paper>


            {/* ==================================================
                MESSAGE
            ================================================== */}

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={5000}
                onClose={() =>
                    setSnackbarOpen(false)
                }
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "center"
                }}
            >

                <Alert
                    severity={messageType}
                    onClose={() =>
                        setSnackbarOpen(false)
                    }
                    sx={{
                        width: "100%"
                    }}
                >
                    {message}
                </Alert>

            </Snackbar>

        </Box>

    );

}