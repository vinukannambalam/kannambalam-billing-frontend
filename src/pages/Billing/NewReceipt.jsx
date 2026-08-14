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
    Snackbar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from "@mui/material";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import SaveIcon from "@mui/icons-material/Save";
import DevoteeSearchDialog from "../../components/billing/DevoteeSearchDialog";
import ReceiptGrid from "../../components/billing/ReceiptGrid";
import { apiFetch } from "../../api/api";
import {printThermalReceipt} from "../../utils/thermalReceipt";
import PrintIcon from "@mui/icons-material/Print";
import {printWithRawBT} from "../../utils/thermalReceipt";

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
    const [confirmDevoteeChangeOpen, setConfirmDevoteeChangeOpen] = useState(false);
    const [pendingDevotee, setPendingDevotee] = useState(null);
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
    const [resetGridKey, setResetGridKey] = useState(0);
    const [printData, setPrintData] = useState(null);
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

        const newDevotee = {
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
        };

        // --------------------------------------------------
        // If there are already offerings for the current
        // devotee, do not silently carry them to another
        // devotee. Ask for confirmation first.
        // --------------------------------------------------
        if (
            items.length > 0 &&
            devotee.id &&
            String(newDevotee.id) !== String(devotee.id)
        ) {

            setPendingDevotee(newDevotee);
            setDialogOpen(false);
            setConfirmDevoteeChangeOpen(true);
            return;

        }

        setDevotee(newDevotee);
        setDialogOpen(false);
    };

    // ==================================================
    // CONFIRM DEVOTEE CHANGE
    // ==================================================

    const confirmDevoteeChange = () => {

        if (!pendingDevotee) {
            setConfirmDevoteeChangeOpen(false);
            return;
        }

        // Clear all offerings belonging to the previous devotee.
        setItems([]);

        // The existing ReceiptGrid devotee-change logic will
        // then reset For Name and Nakshathra for the new devotee.
        setDevotee(pendingDevotee);

        setPendingDevotee(null);
        setConfirmDevoteeChangeOpen(false);

    };

    const cancelDevoteeChange = () => {

        setPendingDevotee(null);
        setConfirmDevoteeChangeOpen(false);

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
        // Safety check: every offering must belong to the
        // currently selected devotee. This prevents stale
        // offering rows from ever being submitted if the
        // devotee changes through an unexpected UI path.
        // ----------------------------------------------

        const hasMismatchedOffering =
            items.some(
                item =>
                    String(
                        item.beneficiary_devotee_id || ""
                    ) !== String(devotee.id)
            );

        if (hasMismatchedOffering) {

            showMessage(
                "One or more offerings belong to a different devotee. Please remove them before saving the receipt.",
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

                beneficiary_family_person_id:
                    item.beneficiary_family_person_id ||
                    null,

                beneficiary_relationship:
                    item.beneficiary_relationship ||
                    "Self",

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
            // SUCCESS - CAPTURE DATA FOR THERMAL PRINT
            // BEFORE CLEARING THE FORM.
            // ------------------------------------------

            const selectedPaymentMode =
                paymentModes.find(
                    mode =>
                        String(mode.id) ===
                        String(paymentModeId)
                );

            const billingUser =
                (() => {
                    try {
                        return JSON.parse(
                            localStorage.getItem(
                                "billing_user"
                            ) || "{}"
                        );
                    }
                    catch {
                        return {};
                    }
                })();

            const receiptForPrinting = {
                receipt_no:
                    data?.receipt?.receipt_no ||
                    "",
                receipt_date:
        receiptDate
            ? new Date(receiptDate)
                .toLocaleDateString("en-GB")
                .replace(/\//g, "-")
            : "",
                created_by_name:
                    billingUser?.full_name ||
                    billingUser?.username ||
                    "-",
                created_at:
                    data?.receipt?.created_at ||
                    new Date().toISOString(),
                printed_at:
                    new Date().toISOString(),
                devotee: {
                    full_name:
                        devotee.full_name ||
                        "",
                    phone:
                        devotee.phone ||
                        ""
                },
                items: items.map(item => ({
                    offering_name:
                        item.offering_name ||
                        "",
                    offering_name_ml:
                        item.offering_name_ml ||
                        "",
                    qty:
                        Number(
                            item.qty ||
                            item.quantity ||
                            1
                        ),
                    rate:
                        Number(
                            item.rate ||
                            0
                        ),
                    amount:
                        Number(
                            item.amount ||
                            0
                        ),
                    beneficiary_name:
                        item.beneficiary_name ||
                        "",
                    beneficiary_relationship:
                        item.beneficiary_relationship ||
                        "",
                    nakshathra_en:
                        item.nakshathra_en ||
                        "",
                    nakshathra_ml:
                        item.nakshathra_ml ||
                        ""
                })),
                total_amount:
                    Number(totalAmount || 0),
                payment_mode:
                    selectedPaymentMode?.payment_mode ||
                    "",
                payment_mode_ml:
                    selectedPaymentMode?.mode_name_ml ||
                    "",
                remarks:
                    remarks.trim() ||
                    ""
            };

            setPrintData(
                receiptForPrinting
            );

            showMessage(
                `Receipt ${data.receipt.receipt_no} saved successfully.`,
                "success"
            );


            // ------------------------------------------
            // CLEAR FORM AND RECEIPT GRID
            // ------------------------------------------

            setDevotee({

                id: "",

                full_name: "",

                full_name_ml: "",

                phone: "",

                address: ""

            });


            setItems([]);
            setResetGridKey(
                previous => previous + 1
            );

            setRemarks("");

            setReceiptDate(today);

            // Print after successful save.
// Android -> RawBT -> Bluetooth thermal printer
// Desktop -> normal Chrome printing
setTimeout(() => {
    printWithRawBT(receiptForPrinting);
}, 300);

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
    // PRINT DATE/TIME
    // ==================================================

    const formatPrintDateTime = (value) => {

        if (!value) {
            return "-";
        }

        const date =
            new Date(value);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return String(value);
        }

        return date.toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false
            }
        );
    };


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
    key={devotee.id || "empty"}
    devotee={devotee}
    onItemsChange={
        setItems
    }
                     resetKey={resetGridKey}

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




                    </Box>

                </Box>

            </Paper>


            {/* ==================================================
                THERMAL RECEIPT PRINT AREA
                Hidden during normal use. Only this 58mm area
                is printed by the browser.
            ================================================== */}

            <style>
                {`
                    .thermal-print-area {
                        display: none;
                    }

                    @media print {
                        @page {
                            size: 58mm auto;
                            margin: 0;
                        }

                        html,
                        body {
                            margin: 0 !important;
                            padding: 0 !important;
                            width: 58mm !important;
                            background: #fff !important;
                        }

                        body * {
                            visibility: hidden !important;
                        }

                        .thermal-print-area,
                        .thermal-print-area * {
                            visibility: visible !important;
                        }

                        .thermal-print-area {
                            display: block !important;
                            position: absolute !important;
                            left: 0 !important;
                            top: 0 !important;
                            width: 58mm !important;
                            box-sizing: border-box !important;
                            padding: 2mm 1.5mm !important;
                            margin: 0 !important;
                            color: #000 !important;
                            background: #fff !important;
                            font-family: "Courier New", Courier, monospace !important;
                            font-size: 10px !important;
                            line-height: 1.25 !important;
                            font-weight: 500 !important;
                        }

                        .thermal-center {
                            text-align: center !important;
                        }

                        .thermal-line {
                            border-top: 1px dashed #000 !important;
                            margin: 2mm 0 !important;
                        }

                        .thermal-item {
                            margin-bottom: 2mm !important;
                        }

                        .thermal-row {
                            display: flex !important;
                            justify-content: space-between !important;
                            gap: 2mm !important;
                        }

                        .thermal-total {
                            font-weight: 700 !important;
                        }
                    }
                `}
            </style>

            {printData && (
                <Box
                    className="thermal-print-area"
                    id="thermal-print-area"
                >
                    <div className="thermal-center">
                        Kannambalath Shree Bhadrakali
                        <br />
                        Shankarammavan Kshethram
                    </div>

                    <div className="thermal-line" />

                    <div>
                        Receipt: {printData.receipt_no}
                    </div>
                    <div>
                        Date: {printData.receipt_date}
                    </div>
                    <div>
                        Devotee: {printData.devotee.full_name}
                    </div>

                    {printData.devotee.phone && (
                        <div>
                            Phone: {printData.devotee.phone}
                        </div>
                    )}

                    <div className="thermal-line" />

                    {printData.items.map(
                        (item, index) => (
                            <div
                                className="thermal-item"
                                key={`${item.offering_name}-${index}`}
                            >
                                <div>
                                    {item.offering_name}
                                </div>

                                <div className="thermal-row">
                                    <span>
                                        Qty {item.qty}
                                    </span>
                                    <span>
                                        ₹{Number(item.amount || 0).toFixed(2)}
                                    </span>
                                </div>

                                {item.beneficiary_name && (
                                    <div>
                                        For: {item.beneficiary_name}
                                    </div>
                                )}

                                {item.nakshathra_en && (
                                    <div>
                                        Star: {item.nakshathra_en}
                                    </div>
                                )}
                            </div>
                        )
                    )}

                    <div className="thermal-line" />

                    <div className="thermal-row thermal-total">
                        <span>TOTAL</span>
                        <span>
                            ₹{Number(printData.total_amount || 0).toFixed(2)}
                        </span>
                    </div>

                    {printData.payment_mode && (
                        <div>
                            Payment: {printData.payment_mode}
                        </div>
                    )}

                    <div className="thermal-line" />

                    <div>
                        Created By: {printData.created_by_name || "-"}
                    </div>

                    <div>
                        Created: {formatPrintDateTime(
                            printData.created_at
                        )}
                    </div>

                    <div>
                        Printed: {formatPrintDateTime(
                            printData.printed_at
                        )}
                    </div>

                    <div className="thermal-line" />

                    <div className="thermal-center">
                        Thank You
                    </div>
                </Box>
            )}

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


            {/* DEVOTEE CHANGE CONFIRMATION */}

            <Dialog
                open={confirmDevoteeChangeOpen}
                onClose={cancelDevoteeChange}
                fullWidth
                maxWidth="sm"
            >

                <DialogTitle>
                    Change Devotee?
                </DialogTitle>

                <DialogContent>
                    <Typography
                        sx={{ mt: 1 }}
                    >
                        There are already offerings entered for {devotee.full_name || "the current devotee"}.
                    </Typography>

                    <Typography
                        sx={{ mt: 1 }}
                    >
                        Changing the devotee will clear all existing offerings. Do you want to continue?
                    </Typography>

                </DialogContent>

                <DialogActions
                    sx={{
                        px: 3,
                        pb: 2,
                        gap: 1
                    }}
                >

                    <Button
                        onClick={cancelDevoteeChange}
                        variant="outlined"
                    >
                        Cancel
                    </Button>

                    <Button
                        onClick={confirmDevoteeChange}
                        variant="contained"
                        color="error"
                    >
                        Change Devotee
                    </Button>

                </DialogActions>

            </Dialog>


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