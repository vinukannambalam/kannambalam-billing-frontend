import { useEffect, useRef, useState } from "react";

import {
    Box,
    Paper,
    Typography,
    Grid,
    Divider,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Alert
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PrintIcon from "@mui/icons-material/Print";

import { useParams, useNavigate, useSearchParams } from "react-router-dom";

import { apiFetch } from "../../api/api";

import {
    printReceiptWithPushpanjali
} from "../../utils/thermalReceipt";


export default function ReceiptView() {

    const { id } = useParams();

    const navigate = useNavigate();

    const [searchParams] = useSearchParams();

    const printRef = useRef();

    const autoPrintTriggered = useRef(false);

    const [printedAt, setPrintedAt] = useState(null);


    // ==================================================
    // STATE
    // ==================================================

    const [receipt, setReceipt] =
        useState(null);

    const [items, setItems] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    // ==================================================
    // LOAD RECEIPT
    // ==================================================

    useEffect(() => {

        loadReceipt();

    }, [id]);

    // ==================================================
    // AUTO PRINT FROM RECEIPT LIST
    // ReceiptSearch opens this page with ?print=1.
    // Use the SAME thermal function as the Print button.
    // ==================================================

    useEffect(() => {

        if (
            searchParams.get("print") !== "1" ||
            !receipt ||
            loading ||
            autoPrintTriggered.current
        ) {
            return;
        }

        autoPrintTriggered.current = true;

        setPrintedAt(
            new Date().toISOString()
        );

        setTimeout(() => {
            handlePrint();
        }, 300);

    }, [
        receipt,
        loading,
        searchParams
    ]);


    const loadReceipt = async () => {

        setLoading(true);

        setError("");


        try {

            /*
             * IMPORTANT:
             *
             * Do NOT use plain fetch here.
             *
             * apiFetch automatically sends
             * the JWT authentication token.
             */

            const response =
                await apiFetch(
                    `/api/receipts/${id}`
                );


            // ------------------------------------------
            // Check HTTP response BEFORE JSON
            // ------------------------------------------

            if (!response.ok) {

                const text =
                    await response.text();


                let message =
                    "Unable to load receipt";


                try {

                    const data =
                        JSON.parse(text);


                    message =
                        data.error ||
                        message;

                }

                catch {

                    message =
                        `Server returned ${response.status}`;

                }


                throw new Error(message);

            }


            const data =
                await response.json();


            console.log(
                "Receipt details:",
                data
            );


            setReceipt(
                data.receipt
            );


            setItems(
                Array.isArray(data.items)
                    ? data.items
                    : []
            );

        }

        catch (err) {

            console.error(
                "Receipt load error:",
                err
            );


            setError(
                err.message ||
                "Unable to load receipt"
            );

        }

        finally {

            setLoading(false);

        }

    };


    // ==================================================
    // PRINT
    // ==================================================

    const handlePrint = () => {

        if (!receipt) {
            return;
        }

        /*
         * ANDROID PHONE:
         * Keep the existing RawBT path.  This path uses the
         * canvas/image implementation in thermalReceipt.js,
         * including the Malayalam Pushpanjali list.
         *
         * TABLET / LAPTOP / DESKTOP / iOS:
         * Use the browser print dialog.  The dedicated thermal
         * print area below contains the same Pushpanjali list.
         */
        const userAgent = navigator.userAgent || "";

        const isAndroidPhone =
            /Android/i.test(userAgent) &&
            (
                /Mobile/i.test(userAgent) ||
                (
                    window.innerWidth <= 600 &&
                    navigator.maxTouchPoints > 0
                )
            );

        const receiptForPrinting = {

            receipt_no:
                receipt.receipt_no || "",

            receipt_date:
                receipt.receipt_date
                    ? new Date(
                        receipt.receipt_date
                    ).toLocaleDateString(
                        "en-IN"
                    )
                    : "",

            created_by_name:
                receipt.created_by_name || "-",

            created_at:
                receipt.created_at || null,

            printed_at:
                new Date().toISOString(),

            devotee: {

                full_name:
                    receipt.devotee_name ||
                    receipt.devotee ||
                    "",

                phone:
                    receipt.phone || ""
            },

            items:
                printItems,

            total_amount:
                Number(
                    receipt.total_amount ||
                    total ||
                    0
                ),

            payment_mode:
                receipt.payment_mode || "",

            payment_mode_ml:
                receipt.mode_name_ml || ""
        };

        if (isAndroidPhone) {

            /*
             * IMPORTANT:
             * Do not replace this with window.print().
             * printReceiptWithPushpanjali() builds the Malayalam
             * Pushpanjali section as an image and sends the complete
             * receipt + Pushpanjali slip to RawBT.
             */
            printReceiptWithPushpanjali(
                receiptForPrinting
            );

            return;
        }

        /*
         * Browser printing for laptop / desktop / tablet / iOS.
         * The print-only receipt area includes the Pushpanjali list,
         * so it is printed at the end of the receipt.
         */
        const printTime =
            new Date().toISOString();

        setPrintedAt(printTime);

        setTimeout(() => {
            window.print();
        }, 150);
    };

    // ==================================================
    // LOADING
    // ==================================================

    if (loading) {

        return (

            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    mt: 6
                }}
            >

                <CircularProgress />

            </Box>

        );

    }


    // ==================================================
    // ERROR
    // ==================================================

    if (error || !receipt) {

        return (

            <Box>

                <Alert
                    severity="error"
                    sx={{ mb: 3 }}
                >

                    {error ||
                        "Receipt not found"}

                </Alert>


                <Button
                    variant="contained"
                    startIcon={
                        <ArrowBackIcon />
                    }
                    onClick={() =>
                        navigate("/receipts")
                    }
                >

                    Back to Receipts

                </Button>

            </Box>

        );

    }


    // ==================================================
    // TOTAL
    // ==================================================

    const total =
        items.reduce(

            (sum, item) =>

                sum +
                Number(
                    item.amount || 0
                ),

            0

        );

    // Normalize receipt items once at render scope.
    // This is used by BOTH the browser print area and
    // the Android RawBT print path.
    const printItems =
        items.map(
            (item) => {

                let details =
                    item.item_details || {};

                if (
                    typeof details === "string"
                ) {
                    try {
                        details =
                            JSON.parse(details);
                    }
                    catch {
                        details = {};
                    }
                }

                return {

                    ...item,

                    offering_id:
                        Number(
                            item.offering_id || 0
                        ),

                    offering_name:
                        item.offering_name || "",

                    offering_name_ml:
                        item.offering_name_ml || "",

                    qty:
                        Number(
                            item.quantity ||
                            item.qty ||
                            1
                        ),

                    amount:
                        Number(
                            item.amount || 0
                        ),

                    beneficiary_name:
                        details.beneficiary_name ||
                        item.beneficiary_name ||
                        "",

                    beneficiary_name_ml:
                        details.beneficiary_name_ml ||
                        details.malayalam_name ||
                        item.beneficiary_name_ml ||
                        item.malayalam_name ||
                        "",

                    nakshathra_en:
                        details.nakshathra_en ||
                        item.nakshathra_en ||
                        "",

                    nakshathra_ml:
                        details.nakshathra_ml ||
                        item.nakshathra_ml ||
                        ""
                };
            }
        );


    // ==================================================
    // DATE
    // ==================================================

    const formattedDate =
        receipt.receipt_date
            ? new Date(
                receipt.receipt_date
            ).toLocaleDateString(
                "en-GB"
            )
            : "";


    // ==================================================
    // RENDER
    // ==================================================

    const formatPrintDateTime = (value) => {
        if (!value) return "-";
        return new Date(value).toLocaleString("en-IN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        });
    };

    const thermalPrintStyles = `
        .receipt-thermal-print-area { display: none; }
        @media print {
            @page { size: 58mm auto; margin: 0; }
            body { margin: 0 !important; padding: 0 !important; }
            body * { visibility: hidden !important; }
            #receipt-thermal-print-area, #receipt-thermal-print-area * { visibility: visible !important; }
            #receipt-thermal-print-area {
                display: block !important;
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 58mm !important;
                padding: 2mm 2mm !important;
                box-sizing: border-box !important;
                font-family: Arial, "Segoe UI", sans-serif !important;
                font-size: 13px !important;
                line-height: 1.35 !important;
                font-weight: 600 !important;
                letter-spacing: 0 !important;
                color: #000 !important;
                background: #fff !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            .receipt-thermal-center {
                text-align: center !important;
                font-weight: 700 !important;
            }
            .receipt-thermal-line { border-top: 1px dashed #000 !important; margin: 4px 0 !important; }
            .receipt-thermal-row { display: flex !important; justify-content: space-between !important; gap: 2mm !important; }
            .receipt-thermal-total { font-weight: 700 !important; }
            .receipt-thermal-item {
                margin-bottom: 5px !important;
                font-weight: 600 !important;
            }
            .receipt-pushpanjali-section { margin-top: 14mm !important; }
            .receipt-pushpanjali-title {
                text-align: center !important;
                font-family: "Noto Sans Malayalam", "Noto Sans", sans-serif !important;
                font-size: 17px !important;
                font-weight: 700 !important;
                margin-bottom: 4px !important;
            }
            .receipt-pushpanjali-item {
                font-family: "Noto Sans Malayalam", "Noto Sans", sans-serif !important;
                font-size: 12px !important;
                line-height: 1.35 !important;
                margin-bottom: 5px !important;
                word-break: break-word !important;
            }
            .receipt-pushpanjali-separator {
                border-top: 1px dashed #000 !important;
                margin: 4px 0 8px !important;
            }
        }
    `;

    return (

        <>
            <style>{thermalPrintStyles}</style>

        <Box ref={printRef}>

            {/* ==========================================
                HEADER
            ========================================== */}

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

                    Receipt

                </Typography>


                <Box
                    sx={{
                        display: "flex",
                        gap: 2
                    }}
                >

                    <Button
                        variant="outlined"
                        startIcon={
                            <ArrowBackIcon />
                        }
                        onClick={() =>
                            navigate(
                                "/receipts"
                            )
                        }
                    >

                        Back

                    </Button>


                    <Button
                        variant="contained"
                        startIcon={
                            <PrintIcon />
                        }
                        onClick={
                            handlePrint
                        }
                    >

                        Print

                    </Button>

                </Box>

            </Box>


            {/* ==========================================
                RECEIPT
            ========================================== */}

            <Paper
                sx={{
                    p: 4,
                    borderRadius: 2
                }}
            >

                {/* RECEIPT HEADER */}

                <Box
                    sx={{
                        textAlign: "center",
                        mb: 3
                    }}
                >

                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 700
                        }}
                    >

                        Kannambalam Temple

                    </Typography>


                    <Typography
                        variant="body2"
                        color="text.secondary"
                    >

                        Offering Receipt

                    </Typography>

                </Box>


                <Divider
                    sx={{ mb: 3 }}
                />


                {/* RECEIPT INFORMATION */}

                <Grid
                    container
                    spacing={2}
                    sx={{ mb: 3 }}
                >

                    <Grid
                        item
                        xs={12}
                        md={4}
                    >

                        <Typography
                            variant="caption"
                            color="text.secondary"
                        >

                            Receipt No

                        </Typography>

                        <Typography
                            variant="body1"
                            sx={{
                                fontWeight: 600
                            }}
                        >

                            {receipt.receipt_no}

                        </Typography>

                    </Grid>


                    <Grid
                        item
                        xs={12}
                        md={4}
                    >

                        <Typography
                            variant="caption"
                            color="text.secondary"
                        >

                            Date

                        </Typography>

                        <Typography>

                            {formattedDate}

                        </Typography>

                    </Grid>


                    <Grid
                        item
                        xs={12}
                        md={4}
                    >

                        <Typography
                            variant="caption"
                            color="text.secondary"
                        >

                            Payment Mode

                        </Typography>

                        <Typography>

                            {receipt.payment_mode}

                            {receipt.mode_name_ml
                                ? ` - ${receipt.mode_name_ml}`
                                : ""}

                        </Typography>

                    </Grid>

                </Grid>


                <Divider
                    sx={{ mb: 3 }}
                />


                {/* DEVOTEE */}

                <Typography
                    variant="h6"
                    sx={{ mb: 2 }}
                >

                    Devotee Details

                </Typography>


                <Grid
                    container
                    spacing={2}
                    sx={{ mb: 3 }}
                >

                    <Grid
                        item
                        xs={12}
                        md={4}
                    >

                        <Typography
                            variant="caption"
                            color="text.secondary"
                        >

                            Name

                        </Typography>

                        <Typography>

                            {receipt.devotee_name}

                        </Typography>


                        {receipt.devotee_name_ml && (

                            <Typography
                                variant="body2"
                            >

                                {receipt.devotee_name_ml}

                            </Typography>

                        )}

                    </Grid>


                    <Grid
                        item
                        xs={12}
                        md={4}
                    >

                        <Typography
                            variant="caption"
                            color="text.secondary"
                        >

                            Phone

                        </Typography>

                        <Typography>

                            {receipt.phone || "-"}

                        </Typography>

                    </Grid>


                    <Grid
                        item
                        xs={12}
                        md={4}
                    >

                        <Typography
                            variant="caption"
                            color="text.secondary"
                        >

                            Address

                        </Typography>

                        <Typography>

                            {receipt.address || "-"}

                        </Typography>

                    </Grid>

                </Grid>


                <Divider
                    sx={{ mb: 3 }}
                />


                {/* OFFERINGS */}

                <Typography
                    variant="h6"
                    sx={{ mb: 2 }}
                >

                    Offerings

                </Typography>


                <TableContainer>

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
                                    For Name
                                </TableCell>

                                <TableCell>
                                    Nakshathra
                                </TableCell>

                                <TableCell
                                    align="right"
                                >
                                    Qty
                                </TableCell>

                                <TableCell
                                    align="right"
                                >
                                    Rate
                                </TableCell>

                                <TableCell
                                    align="right"
                                >
                                    Amount
                                </TableCell>

                            </TableRow>

                        </TableHead>


                        <TableBody>

                            {items.map(
                                (
                                    item,
                                    index
                                ) => {

                                    const details =
                                        item.item_details ||
                                        {};


                                    return (

                                        <TableRow
                                            key={
                                                item.id ||
                                                index
                                            }
                                        >

                                            <TableCell>

                                                {index + 1}

                                            </TableCell>


                                            <TableCell>

                                                <Typography>

                                                    {
                                                        item.offering_name
                                                    }

                                                </Typography>


                                                {item.offering_name_ml && (

                                                    <Typography
                                                        variant="body2"
                                                    >

                                                        {
                                                            item.offering_name_ml
                                                        }

                                                    </Typography>

                                                )}

                                            </TableCell>


                                            <TableCell>

                                                {
                                                    details.beneficiary_name ||
                                                    "-"
                                                }

                                            </TableCell>


                                            <TableCell>

                                                {
                                                    details.nakshathra_ml ||
                                                    details.nakshathra_en ||
                                                    "-"
                                                }

                                            </TableCell>


                                            <TableCell
                                                align="right"
                                            >

                                                {
                                                    item.quantity
                                                }

                                            </TableCell>


                                            <TableCell
                                                align="right"
                                            >

                                                ₹
                                                {Number(
                                                    item.rate || 0
                                                ).toFixed(2)}

                                            </TableCell>


                                            <TableCell
                                                align="right"
                                            >

                                                ₹
                                                {Number(
                                                    item.amount || 0
                                                ).toFixed(2)}

                                            </TableCell>

                                        </TableRow>

                                    );

                                }

                            )}

                        </TableBody>

                    </Table>

                </TableContainer>


                <Divider
                    sx={{
                        mt: 3,
                        mb: 2
                    }}
                />


                {/* TOTAL */}

                <Box
                    sx={{
                        display: "flex",
                        justifyContent:
                            "flex-end"
                    }}
                >

                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 700
                        }}
                    >

                        Total: ₹
                        {Number(
                            receipt.total_amount ||
                            total
                        ).toFixed(2)}

                    </Typography>

                </Box>


                {/* REMARKS */}

                {receipt.remarks && (

                    <Box sx={{ mt: 3 }}>

                        <Typography
                            variant="caption"
                            color="text.secondary"
                        >

                            Remarks

                        </Typography>

                        <Typography>

                            {receipt.remarks}

                        </Typography>

                    </Box>

                )}

            </Paper>

            <Box
                className="receipt-thermal-print-area"
                id="receipt-thermal-print-area"
            >
                <div className="receipt-thermal-center">
                    Kannambalath Shree Bhadrakali<br />
                    Shankarammavan Kshethram
                </div>

                <div className="receipt-thermal-line" />

                <div>
                    Receipt: {receipt.receipt_no}
                </div>

                <div>
                    Date: {formattedDate}
                </div>

                <div>
                    Devotee: {
                        receipt.devotee_name ||
                        receipt.devotee ||
                        "-"
                    }
                </div>

                {receipt.phone && (
                    <div>
                        Phone: {receipt.phone}
                    </div>
                )}

                <div className="receipt-thermal-line" />

                {printItems.map(
                    (item, index) => (
                        <div
                            className="receipt-thermal-item"
                            key={
                                item.id ||
                                index
                            }
                        >
                            <div>
                                {
                                    item.offering_name ||
                                    ""
                                }
                            </div>

                            <div className="receipt-thermal-row">
                                <span>
                                    Qty {item.qty || 1}
                                </span>

                                <span>
                                    ₹
                                    {Number(
                                        item.amount || 0
                                    ).toFixed(2)}
                                </span>
                            </div>

                            {item.beneficiary_name && (
                                <div>
                                    For: {
                                        item.beneficiary_name
                                    }
                                </div>
                            )}

                            {(
                                item.nakshathra_en ||
                                item.nakshathra_ml
                            ) && (
                                <div>
                                    Star: {
                                        item.nakshathra_en ||
                                        item.nakshathra_ml
                                    }
                                </div>
                            )}
                        </div>
                    )
                )}

                <div className="receipt-thermal-line" />

                <div className="receipt-thermal-row receipt-thermal-total">
                    <span>
                        TOTAL
                    </span>

                    <span>
                        ₹
                        {Number(
                            receipt.total_amount ||
                            total ||
                            0
                        ).toFixed(2)}
                    </span>
                </div>

                {receipt.payment_mode && (
                    <div>
                        Payment: {receipt.payment_mode}
                    </div>
                )}

                <div className="receipt-thermal-line" />

                <div>
                    Created By: {
                        receipt.created_by_name ||
                        "-"
                    }
                </div>

                <div>
                    Created: {
                        formatPrintDateTime(
                            receipt.created_at
                        )
                    }
                </div>

                <div>
                    Printed: {
                        formatPrintDateTime(
                            printedAt
                        )
                    }
                </div>

                <div className="receipt-thermal-line" />

                <div className="receipt-thermal-center">
                    Thank You
                </div>


                {/* ==========================================
                    PUSHPANJALI
                    Uses the SAME normalized printItems that
                    are sent to the Android thermal printer.
                    This prevents browser and mobile printing
                    from using different data sources.
                ========================================== */}

                {printItems.some(
                    (item) =>
                        Number(
                            item.offering_id || 0
                        ) === 2 &&
                        (
                            item.beneficiary_name_ml ||
                            item.beneficiary_name ||
                            item.malayalam_name
                        )
                ) && (

                    <div
                        className="receipt-pushpanjali-section"
                    >

                        <div
                            className="receipt-pushpanjali-title"
                        >
                            പുഷ്പാഞ്ജലി
                        </div>

                        <div
                            className="receipt-pushpanjali-separator"
                        />

                        {printItems
                            .filter(
                                (item) =>
                                    Number(
                                        item.offering_id || 0
                                    ) === 2 &&
                                    (
                                        item.beneficiary_name_ml ||
                                        item.beneficiary_name ||
                                        item.malayalam_name
                                    )
                            )
                            .map(
                                (
                                    item,
                                    index
                                ) => {

                                    const name =
                                        item.beneficiary_name_ml ||
                                        item.malayalam_name ||
                                        item.beneficiary_name ||
                                        "";

                                    const star =
                                        item.nakshathra_ml ||
                                        item.nakshathra_en ||
                                        "";

                                    return (

                                        <div
                                            className="receipt-pushpanjali-item"
                                            key={
                                                `pushpanjali-${
                                                    item.id ||
                                                    index
                                                }`
                                            }
                                        >
                                            <span>
                                                {
                                                    index + 1
                                                }.
                                            </span>

                                            {" "}

                                            <span>
                                                {name}
                                            </span>

                                            {star && (
                                                <>
                                                    {" - "}
                                                    <span>
                                                        {star}
                                                    </span>
                                                </>
                                            )}

                                        </div>

                                    );

                                }
                            )}

                        <div
                            className="receipt-pushpanjali-separator"
                        />

                    </div>

                )}

            </Box>

        </Box>

        </>

    );

}