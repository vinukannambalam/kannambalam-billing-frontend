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

import { useParams, useNavigate } from "react-router-dom";

import { apiFetch } from "../../api/api";


export default function ReceiptView() {

    const { id } = useParams();

    const navigate = useNavigate();

    const printRef = useRef();


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

        window.print();

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

    return (

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

                    {/* RECEIPT NO */}

                    <Grid
                        item
                        xs={12}
                        md={3}
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


                    {/* DATE */}

                    <Grid
                        item
                        xs={12}
                        md={3}
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


                    {/* PAYMENT MODE */}

                    <Grid
                        item
                        xs={12}
                        md={3}
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


                    {/* CREATED BY */}

                    <Grid
                        item
                        xs={12}
                        md={3}
                    >

                        <Typography
                            variant="caption"
                            color="text.secondary"
                        >

                            Created By

                        </Typography>

                        <Typography>

                            {receipt.created_by_name || "-"}

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

        </Box>

    );

}