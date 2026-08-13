import { useEffect, useState } from "react";
import {
    Box,
    Grid,
    Paper,
    Typography,
    TextField,
    Button,
    MenuItem,
    Divider,
    Alert,
    Snackbar
} from "@mui/material";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import SaveIcon from "@mui/icons-material/Save";
import PrintIcon from "@mui/icons-material/Print";
import DevoteeSearchDialog from "../../components/billing/DevoteeSearchDialog";
import ReceiptGrid from "../../components/billing/ReceiptGrid";
import { apiFetch } from "../../api/api";

// ======================================================
// NEW RECEIPT
// ======================================================

export default function NewReceipt() {

    // ==================================================
    // DATE
    // ==================================================

    const today = new Date()
        .toISOString()
        .split("T")[0];

    // ==================================================
    // STATE
    // ==================================================

    const [dialogOpen, setDialogOpen] = useState(false);
    const [devotee, setDevotee] = useState({
        id: "",
        full_name: "",
        full_name_ml: "",
        phone: "",
        address: ""
    });
    const [paymentModes, setPaymentModes] = useState([]);
    const [paymentModeId, setPaymentModeId] = useState("");
    const [receiptDate, setReceiptDate] = useState(today);
    const [remarks, setRemarks] = useState("");
    const [items, setItems] = useState([]);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("success");
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    // ==================================================
    // LOAD PAYMENT MODES
    // ==================================================

    useEffect(() => {
        fetchPaymentModes();
    }, []);

    const fetchPaymentModes = async () => {
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
            setPaymentModes(data);
            if (data.length > 0) {
                setPaymentModeId(
                    String(data[0].id)
                );
            }
        }
        catch (error) {
            console.error(
                "Payment mode loading error:",
                error
            );
            showMessage(
                error.message,
                "error"
            );
        }
    };

    // ==================================================
    // MESSAGE
    // ==================================================

    const showMessage = (
        text,
        type = "success"
    ) => {
        setMessage(text);
        setMessageType(type);
        setSnackbarOpen(true);
    };

    // ==================================================
    // TOTAL
    // ==================================================

    const totalAmount = items.reduce(
        (total, item) => {
            return total +
                Number(
                    item.amount || 0
                );
        },
        0
    );

    // ==================================================
    // DEVOTEE SELECTED
    // ==================================================
    const handleDevoteeSelect = (row) => {
        setDevotee({
            id:
                row.id || "",
            full_name:
                row.full_name || "",
            full_name_ml:
                row.full_name_ml || "",
            phone:
                row.phone || "",
            address:
                row.address || ""
        });
        setDialogOpen(false);
    };

    // ==================================================
    // SAVE RECEIPT
    // ==================================================

    const saveReceipt = async () => {
        // ----------------------------------------------
        // Validate devotee
        // ----------------------------------------------
        if (!devotee.id) {
            showMessage(
                "Please select a devotee",
                "error"
            );
            return;
        }

        // ----------------------------------------------
        // Validate payment mode
        // ----------------------------------------------

        if (!paymentModeId) {

            showMessage(
                "Please select a payment mode",
                "error"
            );

            return;

        }


        // ----------------------------------------------
        // Validate offerings
        // ----------------------------------------------

        if (
            !items ||
            items.length === 0
        ) {

            showMessage(
                "Please add at least one offering",
                "error"
            );

            return;

        }


        // ----------------------------------------------
        // Prepare receipt items
        // ----------------------------------------------

        const receiptItems = items.map(

            (item) => ({

                offering_id:
                    Number(
                        item.offering_id
                    ),

                quantity:
                    Number(
                        item.qty ||
                        item.quantity ||
                        1
                    ),

                rate:
                    Number(
                        item.rate || 0
                    ),

                amount:
                    Number(
                        item.amount || 0
                    ),

                beneficiary_devotee_id:
                    item.beneficiary_devotee_id ||
                    null,

                beneficiary_name:
                    item.beneficiary_name ||
                    "",

                nakshathra_id:
                    item.nakshathra_id ||
                    null,

                nakshathra_en:
                    item.nakshathra_en ||
                    "",

                nakshathra_ml:
                    item.nakshathra_ml ||
                    "",

                remarks:
                    item.remarks ||
                    "",

                offering_date:
                    item.offering_date ||
                    receiptDate

            })

        );


        // ----------------------------------------------
        // REQUEST PAYLOAD
        // ----------------------------------------------

        const payload = {

            receipt_date:
                receiptDate,

            devotee_id:
                Number(
                    devotee.id
                ),

            payment_mode_id:
                Number(
                    paymentModeId
                ),

            total_amount:
                totalAmount,

            remarks:
                remarks.trim() ||
                null,

            items:
                receiptItems

        };


        console.log(
            "Saving receipt:",
            payload
        );


        // ----------------------------------------------
        // SAVE
        // ----------------------------------------------

        setSaving(true);


        try {

            const response =
                await apiFetch(

                    "/api/receipts",

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


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Failed to save receipt"
                );

            }


            // ------------------------------------------
            // SUCCESS
            // ------------------------------------------

            showMessage(

                `Receipt ${data.receipt.receipt_no} saved successfully.`,

                "success"

            );


            // ------------------------------------------
            // CLEAR FORM
            // ------------------------------------------

            setDevotee({

                id: "",

                full_name: "",

                full_name_ml: "",

                phone: "",

                address: ""

            });


            setItems([]);

            setRemarks("");

            setReceiptDate(today);

        }

        catch (error) {

            console.error(
                "Save receipt error:",
                error
            );


            showMessage(
                error.message,
                "error"
            );

        }

        finally {

            setSaving(false);

        }

    };


    // ==================================================
    // PRINT
    // ==================================================

    const printReceipt = () => {

        showMessage(

            "Print will be connected after receipt saving is completed.",

            "info"

        );

    };


    // ==================================================
    // RENDER
    // ==================================================

    return (

        <Box>

            {/* PAGE TITLE */}

            <Typography
                variant="h4"
                sx={{
                    mb: { xs: 1.5, sm: 2.5, md: 3 },
                    fontWeight: 600,
                    fontSize: {
                        xs: "1.5rem",
                        sm: "1.75rem",
                        md: "2.125rem"
                    }
                }}
            >
                New Receipt
            </Typography>


            <Paper
                sx={{
                    p: { xs: 1.5, sm: 2, md: 3 },
                    borderRadius: { xs: 1.5, md: 2 }
                }}
            >

                {/* RECEIPT DETAILS */}

                <Typography
                    variant="h6"
                    sx={{
                        mb: { xs: 1.5, md: 2 },
                        fontSize: { xs: "1.05rem", sm: "1.15rem", md: "1.25rem" }
                    }}
                >
                    Receipt Details 
                </Typography>


                <Grid
                    container
                    spacing={2}
                >

                    {/* RECEIPT NUMBER */}

                    <Grid
                        item
                        xs={12}
                        md={4}
                    >

                        <TextField
                            fullWidth
                            label="Receipt No"
                            value="AUTO"
                            InputProps={{
                                readOnly: true
                            }}
                        />

                    </Grid>


                    {/* RECEIPT DATE */}

                    <Grid
                        item
                        xs={12}
                        md={4}
                    >

                        <TextField
                            fullWidth
                            label="Receipt Date"
                            type="date"
                            value={receiptDate}
                            onChange={(e) =>
                                setReceiptDate(
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
                        md={4}
                    >

                        <TextField
                            select
                            fullWidth
                            label="Payment Mode"
                            value={paymentModeId}
                            onChange={(e) =>
                                setPaymentModeId(
                                    e.target.value
                                )
                            }
                        >

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

                                        {mode.mode_name_ml
                                            ? ` - ${mode.mode_name_ml}`
                                            : ""}

                                    </MenuItem>

                                )
                            )}

                        </TextField>

                    </Grid>

                </Grid>


                <Divider
                    sx={{
                        my: { xs: 2, md: 3 }
                    }}
                />


                {/* DEVOTEE DETAILS */}

                <Typography
                    variant="h6"
                    sx={{
                        mb: { xs: 1.5, md: 2 },
                        fontSize: { xs: "1.05rem", sm: "1.15rem", md: "1.25rem" }
                    }}
                >
                    Devotee Details
                </Typography>


                <Grid
                    container
                    spacing={2}
                >

                    {/* DEVOTEE */}

                    <Grid
                        item
                        xs={12}
                        md={5}
                    >

                        <TextField
                            fullWidth
                            label="Devotee"
                            value={
                                devotee.full_name
                            }
                            InputProps={{
                                readOnly: true
                            }}
                        />

                    </Grid>


                    {/* SEARCH */}

                    <Grid
                        item
                        xs={12}
                        md={2}
                    >

                        <Button
                            fullWidth
                            variant="contained"
                            startIcon={
                                <PersonSearchIcon />
                            }
                            sx={{
                                minHeight: 52,
                                height: { xs: 52, md: 56 }
                            }}
                            onClick={() =>
                                setDialogOpen(true)
                            }
                        >
                            Search
                        </Button>

                    </Grid>


                    {/* PHONE */}

                    <Grid
                        item
                        xs={12}
                        md={5}
                    >

                        <TextField
                            fullWidth
                            label="Phone"
                            value={
                                devotee.phone
                            }
                            InputProps={{
                                readOnly: true
                            }}
                        />

                    </Grid>


                    {/* ADDRESS */}

                    <Grid
                        item
                        xs={12}
                    >

                        <TextField
                            fullWidth
                            label="Address"
                            value={
                                devotee.address
                            }
                            InputProps={{
                                readOnly: true
                            }}
                        />

                    </Grid>

                </Grid>


                <Divider
                    sx={{
                        my: { xs: 2, md: 3 }
                    }}
                />


                {/* OFFERINGS */}

                <ReceiptGrid
    devotee={devotee}
    onItemsChange={
        setItems
    }
/>


                <Divider
                    sx={{
                        my: { xs: 2, md: 3 }
                    }}
                />


                {/* REMARKS */}

                <TextField
                    fullWidth
                    label="Remarks"
                    multiline
                    rows={2}
                    value={remarks}
                    onChange={(e) =>
                        setRemarks(
                            e.target.value
                        )
                    }
                    sx={{
                        mb: { xs: 2, md: 3 }
                    }}
                />


                {/* TOTAL + ACTIONS */}

                <Box
                    sx={{
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        justifyContent: "space-between",
                        alignItems: { xs: "stretch", sm: "center" },
                        flexWrap: "wrap",
                        gap: { xs: 1.5, sm: 2 }
                    }}
                >

                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 600,
                            fontSize: {
                                xs: "1.45rem",
                                sm: "1.65rem",
                                md: "2rem"
                            }
                        }}
                    >
                        Total: ₹
                        {totalAmount.toFixed(2)}
                    </Typography>


                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: { xs: "column", sm: "row" },
                            gap: { xs: 1, sm: 2 },
                            width: { xs: "100%", sm: "auto" }
                        }}
                    >

                        <Button
                            variant="contained"
                            startIcon={
                                <SaveIcon />
                            }
                            onClick={
                                saveReceipt
                            }
                            disabled={
                                saving
                            }
                            fullWidth={true}
                            sx={{
                                minHeight: 48,
                                width: { xs: "100%", sm: "auto" }
                            }}
                        >

                            {saving
                                ? "Saving..."
                                : "Save Receipt"}

                        </Button>


                        <Button
                            variant="outlined"
                            startIcon={
                                <PrintIcon />
                            }
                            onClick={
                                printReceipt
                            }
                            disabled={
                                saving
                            }
                            fullWidth={true}
                            sx={{
                                minHeight: 48,
                                width: { xs: "100%", sm: "auto" }
                            }}
                        >
                            Print
                        </Button>

                    </Box>

                </Box>

            </Paper>


            {/* DEVOTEE SEARCH */}

            <DevoteeSearchDialog
                open={dialogOpen}
                onClose={() =>
                    setDialogOpen(false)
                }
                onSelect={
                    handleDevoteeSelect
                }
            />


            {/* MESSAGE */}

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