import { useState } from "react";
import * as XLSX from "xlsx";

import {
    Alert,
    Box,
    Button,
    Card,
    CardActionArea,
    CardContent,
    CircularProgress,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography
} from "@mui/material";

import AssessmentIcon from "@mui/icons-material/Assessment";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import PaymentsIcon from "@mui/icons-material/Payments";
import CategoryIcon from "@mui/icons-material/Category";
import PeopleIcon from "@mui/icons-material/People";
import SummarizeIcon from "@mui/icons-material/Summarize";
import DownloadIcon from "@mui/icons-material/Download";


const reportOptions = [
    {
        id: "collection",
        title: "Collection Report",
        description:
            "Receipt-level collection details for the selected period.",
        icon: ReceiptLongIcon
    },
    {
        id: "offering",
        title: "Offering-wise Collection",
        description:
            "Collection totals grouped by offering.",
        icon: LocalOfferIcon
    },
    {
        id: "payment-mode",
        title: "Payment Mode-wise",
        description:
            "Collection totals grouped by payment mode.",
        icon: PaymentsIcon
    },
    {
        id: "category",
        title: "Category-wise Collection",
        description:
            "Collection totals grouped by offering category.",
        icon: CategoryIcon
    },
    {
        id: "user",
        title: "User-wise Collection",
        description:
            "Receipt count and collection grouped by billing user.",
        icon: PeopleIcon
    },
    {
        id: "summary",
        title: "Collection Summary",
        description:
            "A concise summary of receipts and total collection.",
        icon: SummarizeIcon
    }
];


const getLocalDate = () => {

    const date = new Date();

    const year = date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;
};


const formatDate = (value) => {

    if (!value) {
        return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );
};


const formatCurrency = (value) => {

    const amount =
        Number(value || 0);

    return amount.toLocaleString(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 2
        }
    );
};


export default function DashboardReport() {

    const today = getLocalDate();


    const [selectedReport, setSelectedReport] =
        useState("collection");


    const [fromDate, setFromDate] =
        useState(today);


    const [toDate, setToDate] =
        useState(today);


    const [reportRows, setReportRows] =
        useState([]);


    const [reportSummary, setReportSummary] =
        useState(null);


    const [loading, setLoading] =
        useState(false);


    const [error, setError] =
        useState("");


    const [reportGenerated, setReportGenerated] =
        useState(false);


    const selectedReportDetails =
        reportOptions.find(
            report =>
                report.id === selectedReport
        );


    // =====================================================
    // GENERATE REPORT
    // =====================================================

    const generateReport = async () => {

        setError("");

        setReportGenerated(false);

        setReportRows([]);

        setReportSummary(null);


        if (!fromDate || !toDate) {

            setError(
                "Please select both From Date and To Date."
            );

            return;
        }


        if (fromDate > toDate) {

            setError(
                "From Date cannot be later than To Date."
            );

            return;
        }


        if (selectedReport !== "collection") {

            setError(
                "This report is not available yet. Collection Report is currently available."
            );

            return;
        }


        const token =
            localStorage.getItem(
                "billing_token"
            );


        if (!token) {

            setError(
                "Your login session is not available. Please log in again."
            );

            return;
        }


        setLoading(true);


        try {

            const response =
                await fetch(
                    `https://billing-api.kannambalam.com/api/reports/collection?from_date=${encodeURIComponent(fromDate)}&to_date=${encodeURIComponent(toDate)}`,
                    {
                        method: "GET",

                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


            let data = null;


            try {

                data =
                    await response.json();

            }
            catch {

                data = null;

            }


            if (!response.ok) {

                if (response.status === 401) {

                    throw new Error(
                        "Your login session has expired. Please log in again."
                    );

                }


                if (response.status === 403) {

                    throw new Error(
                        "Administrator access is required to view reports."
                    );

                }


                throw new Error(
                    data?.error ||
                    "Unable to generate the report."
                );

            }


            setReportRows(
                Array.isArray(data?.rows)
                    ? data.rows
                    : []
            );


            setReportSummary(
                data?.summary ||
                {
                    receipt_count: 0,
                    total_collection: 0
                }
            );


            setReportGenerated(true);

        }
        catch (err) {

            console.error(
                "Collection report error:",
                err
            );


            setError(
                err.message ||
                "Unable to generate the report."
            );

        }
        finally {

            setLoading(false);

        }

    };


    // =====================================================
    // EXPORT COLLECTION REPORT TO EXCEL
    // =====================================================

    const exportToExcel = () => {

        if (!reportRows.length) {
            return;
        }


        // -------------------------------------------------
        // SUMMARY SHEET
        // -------------------------------------------------

        const summaryData = [

            ["Collection Report"],

            [],

            [
                "From Date",
                formatDate(fromDate)
            ],

            [
                "To Date",
                formatDate(toDate)
            ],

            [],

            [
                "Total Receipts",
                Number(
                    reportSummary?.receipt_count || 0
                )
            ],

            [
                "Total Collection",
                Number(
                    reportSummary?.total_collection || 0
                )
            ]

        ];


        const summarySheet =
            XLSX.utils.aoa_to_sheet(
                summaryData
            );


        summarySheet["!cols"] = [
            {
                wch: 24
            },
            {
                wch: 25
            }
        ];


        // -------------------------------------------------
        // DETAIL SHEET
        // -------------------------------------------------

        const detailData =
            reportRows.map(
                row => ({

                    "Receipt No":
                        row.receipt_no || "",

                    "Date":
                        formatDate(
                            row.receipt_date
                        ),

                    "Main Devotee":
                        row.main_devotee || "",

                    "Beneficiary":
                        row.beneficiary_name || "",

                    "Offering":
                        row.offering_name || "",

                    "Category":
                        row.category_name || "",

                    "Qty":
                        Number(
                            row.quantity || 0
                        ),

                    "Rate":
                        Number(
                            row.rate || 0
                        ),

                    "Amount":
                        Number(
                            row.item_amount || 0
                        ),

                    "Payment Mode":
                        row.payment_mode || "",

                    "Status":
                        row.status_name || "",

                    "Created By":
                        row.created_by_name || ""

                })
            );


        const detailSheet =
            XLSX.utils.json_to_sheet(
                detailData
            );


        detailSheet["!cols"] = [

            {
                wch: 16
            },

            {
                wch: 14
            },

            {
                wch: 25
            },

            {
                wch: 25
            },

            {
                wch: 22
            },

            {
                wch: 18
            },

            {
                wch: 8
            },

            {
                wch: 14
            },

            {
                wch: 14
            },

            {
                wch: 16
            },

            {
                wch: 14
            },

            {
                wch: 20
            }

        ];


        // -------------------------------------------------
        // CURRENCY FORMATTING
        // -------------------------------------------------
        //
        // Excel stores Rate and Amount as numbers.
        // We apply an INR number format so they remain
        // usable for calculations while displaying currency.
        // -------------------------------------------------

        const range =
            XLSX.utils.decode_range(
                detailSheet["!ref"]
            );


        for (
            let rowIndex = range.s.r + 1;
            rowIndex <= range.e.r;
            rowIndex++
        ) {

            // Rate = column H
            const rateCell =
                detailSheet[
                    XLSX.utils.encode_cell({
                        r: rowIndex,
                        c: 7
                    })
                ];


            if (rateCell) {

                rateCell.z =
                    '₹#,##0.00';

            }


            // Amount = column I
            const amountCell =
                detailSheet[
                    XLSX.utils.encode_cell({
                        r: rowIndex,
                        c: 8
                    })
                ];


            if (amountCell) {

                amountCell.z =
                    '₹#,##0.00';

            }

        }


        // -------------------------------------------------
        // CREATE WORKBOOK
        // -------------------------------------------------

        const workbook =
            XLSX.utils.book_new();


        XLSX.utils.book_append_sheet(
            workbook,
            summarySheet,
            "Summary"
        );


        XLSX.utils.book_append_sheet(
            workbook,
            detailSheet,
            "Collection Report"
        );


        // -------------------------------------------------
        // FILE NAME
        // -------------------------------------------------

        const filename =
            `Collection_Report_${fromDate}_to_${toDate}.xlsx`;


        XLSX.writeFile(
            workbook,
            filename
        );

    };


    return (

        <Box
            sx={{
                width: "100%",
                maxWidth: 1400,
                mx: "auto",
                px: {
                    xs: 1,
                    sm: 2,
                    md: 3
                },
                py: {
                    xs: 2,
                    md: 3
                }
            }}
        >


            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <Stack
                direction="row"
                spacing={1.5}
                alignItems="center"
                sx={{
                    mb: 3
                }}
            >

                <AssessmentIcon
                    sx={{
                        fontSize: 34,
                        color: "#8B0000"
                    }}
                />


                <Box>

                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 700,
                            color: "#263238",
                            lineHeight: 1.1
                        }}
                    >
                        Reports
                    </Typography>


                    <Typography
                        variant="body2"
                        sx={{
                            mt: 0.5,
                            color: "text.secondary"
                        }}
                    >
                        Select a report and choose the required date range.
                    </Typography>

                </Box>

            </Stack>



            {/* =================================================
                REPORT SELECTION
            ================================================= */}

            <Typography
                variant="h6"
                sx={{
                    mb: 1.5,
                    fontWeight: 700,
                    color: "#8B0000"
                }}
            >
                Select Report
            </Typography>


            <Box
                sx={{
                    mb: 3,

                    display: "grid",

                    gridTemplateColumns: {
                        xs: "1fr",
                        sm:
                            "repeat(2, minmax(0, 1fr))",
                        md:
                            "repeat(3, minmax(0, 1fr))"
                    },

                    gap: 2
                }}
            >

                {reportOptions.map(
                    report => {

                        const Icon =
                            report.icon;

                        const isSelected =
                            selectedReport ===
                            report.id;


                        return (

                            <Card
                                key={report.id}
                                elevation={0}
                                sx={{
                                    height: "100%",
                                    minWidth: 0,

                                    borderRadius: 3,

                                    border:
                                        isSelected
                                            ? "2px solid #8B0000"
                                            : "1px solid #e0e0e0",

                                    backgroundColor:
                                        isSelected
                                            ? "#FFF7F7"
                                            : "#FFFFFF",

                                    boxShadow:
                                        isSelected
                                            ? "0 8px 24px rgba(139, 0, 0, 0.16)"
                                            : "0 3px 12px rgba(0, 0, 0, 0.07)",

                                    overflow: "hidden",

                                    transition:
                                        "transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease, background-color 0.22s ease",

                                    "&:hover": {
                                        transform:
                                            "translateY(-5px)",

                                        boxShadow:
                                            "0 12px 28px rgba(139, 0, 0, 0.18)",

                                        borderColor:
                                            "#B71C1C",

                                        backgroundColor:
                                            "#FFF9F9"
                                    }
                                }}
                            >

                                <CardActionArea
                                    onClick={() => {

                                        setSelectedReport(
                                            report.id
                                        );

                                        setError("");

                                        setReportGenerated(
                                            false
                                        );

                                    }}

                                    sx={{
                                        height: "100%",

                                        "&:hover .report-icon":
                                            {
                                                transform:
                                                    "scale(1.08) rotate(-3deg)"
                                            }
                                    }}
                                >

                                    <CardContent
                                        sx={{
                                            p: 2.5,

                                            minHeight: 150,

                                            display:
                                                "flex",

                                            flexDirection:
                                                "column",

                                            justifyContent:
                                                "space-between"
                                        }}
                                    >

                                        <Stack
                                            direction="row"
                                            spacing={2}
                                            alignItems="flex-start"
                                        >

                                            <Box
                                                className="report-icon"
                                                sx={{
                                                    width: 52,
                                                    height: 52,
                                                    minWidth: 52,

                                                    borderRadius:
                                                        2.5,

                                                    display:
                                                        "flex",

                                                    alignItems:
                                                        "center",

                                                    justifyContent:
                                                        "center",

                                                    backgroundColor:
                                                        isSelected
                                                            ? "#8B0000"
                                                            : "#FFF0F0",

                                                    color:
                                                        isSelected
                                                            ? "#FFFFFF"
                                                            : "#8B0000",

                                                    transition:
                                                        "transform 0.22s ease, background-color 0.22s ease, color 0.22s ease"
                                                }}
                                            >

                                                <Icon
                                                    sx={{
                                                        fontSize: 28
                                                    }}
                                                />

                                            </Box>


                                            <Box
                                                sx={{
                                                    minWidth: 0
                                                }}
                                            >

                                                <Typography
                                                    variant="subtitle1"
                                                    sx={{
                                                        fontWeight: 700,
                                                        color: "#263238",
                                                        mb: 0.6
                                                    }}
                                                >
                                                    {
                                                        report.title
                                                    }
                                                </Typography>


                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        color:
                                                            "text.secondary",

                                                        lineHeight:
                                                            1.45
                                                    }}
                                                >
                                                    {
                                                        report.description
                                                    }
                                                </Typography>

                                            </Box>

                                        </Stack>


                                        <Typography
                                            variant="caption"
                                            sx={{
                                                mt: 2,

                                                fontWeight:
                                                    700,

                                                color:
                                                    isSelected
                                                        ? "#8B0000"
                                                        : "#757575"
                                            }}
                                        >
                                            {
                                                isSelected
                                                    ? "Selected"
                                                    : "Click to select"
                                            }
                                        </Typography>

                                    </CardContent>

                                </CardActionArea>

                            </Card>

                        );

                    }
                )}

            </Box>



            {/* =================================================
                FILTER PANEL
            ================================================= */}

            <Card
                elevation={0}
                sx={{
                    borderRadius: 3,

                    border:
                        "1px solid #e0e0e0",

                    boxShadow:
                        "0 3px 14px rgba(0, 0, 0, 0.06)",

                    overflow: "hidden"
                }}
            >

                <Box
                    sx={{
                        px: {
                            xs: 2,
                            md: 2.5
                        },

                        py: 1.7,

                        backgroundColor:
                            "#FFF3F3",

                        borderBottom:
                            "1px solid #f0d7d7"
                    }}
                >

                    <Typography
                        variant="subtitle1"
                        sx={{
                            fontWeight: 700,
                            color: "#8B0000"
                        }}
                    >
                        Report Filters
                    </Typography>


                    <Typography
                        variant="body2"
                        sx={{
                            mt: 0.3,
                            color: "text.secondary"
                        }}
                    >
                        {
                            selectedReportDetails?.title
                        }
                    </Typography>

                </Box>


                <CardContent
                    sx={{
                        p: {
                            xs: 2,
                            md: 2.5
                        }
                    }}
                >

                    <Box
                        sx={{
                            display: "grid",

                            gridTemplateColumns: {
                                xs: "1fr",
                                sm:
                                    "repeat(2, minmax(0, 1fr))",
                                md:
                                    "1fr 1fr 1fr"
                            },

                            gap: 2,

                            alignItems: "center"
                        }}
                    >

                        <TextField
                            fullWidth
                            label="From Date"
                            type="date"
                            value={fromDate}
                            onChange={
                                event =>
                                    setFromDate(
                                        event.target.value
                                    )
                            }
                            InputLabelProps={{
                                shrink: true
                            }}
                        />


                        <TextField
                            fullWidth
                            label="To Date"
                            type="date"
                            value={toDate}
                            onChange={
                                event =>
                                    setToDate(
                                        event.target.value
                                    )
                            }
                            InputLabelProps={{
                                shrink: true
                            }}
                            inputProps={{
                                min:
                                    fromDate ||
                                    undefined
                            }}
                        />


                        <Button
                            fullWidth
                            variant="contained"
                            startIcon={
                                loading
                                    ?
                                    <CircularProgress
                                        size={20}
                                        sx={{
                                            color:
                                                "#FFFFFF"
                                        }}
                                    />
                                    :
                                    <AssessmentIcon />
                            }
                            onClick={
                                generateReport
                            }
                            disabled={
                                loading ||
                                !fromDate ||
                                !toDate
                            }
                            sx={{
                                minHeight: 56,

                                borderRadius: 2,

                                backgroundColor:
                                    "#8B0000",

                                fontWeight: 700,

                                textTransform:
                                    "none",

                                fontSize: 15,

                                boxShadow:
                                    "0 5px 14px rgba(139, 0, 0, 0.22)",

                                "&:hover": {
                                    backgroundColor:
                                        "#6D0000",

                                    boxShadow:
                                        "0 8px 18px rgba(139, 0, 0, 0.28)"
                                }
                            }}
                        >
                            {
                                loading
                                    ? "Generating..."
                                    : "Generate Report"
                            }
                        </Button>

                    </Box>


                    {error && (

                        <Alert
                            severity="error"
                            sx={{
                                mt: 2,
                                borderRadius: 2
                            }}
                        >
                            {error}
                        </Alert>

                    )}

                </CardContent>

            </Card>



            {/* =================================================
                REPORT RESULTS
            ================================================= */}

            {reportGenerated && (

                <Box
                    sx={{
                        mt: 3
                    }}
                >


                    {/* REPORT TITLE + EXPORT */}

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
                        sx={{
                            mb: 2
                        }}
                    >

                        <Box>

                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 700,
                                    color: "#263238"
                                }}
                            >
                                Collection Report
                            </Typography>


                            <Typography
                                variant="body2"
                                sx={{
                                    color:
                                        "text.secondary",

                                    mt: 0.3
                                }}
                            >
                                {
                                    formatDate(
                                        fromDate
                                    )
                                }

                                {" - "}

                                {
                                    formatDate(
                                        toDate
                                    )
                                }
                            </Typography>

                        </Box>


                        <Button
                            variant="outlined"
                            startIcon={
                                <DownloadIcon />
                            }
                            onClick={
                                exportToExcel
                            }
                            disabled={
                                loading ||
                                !reportRows.length
                            }
                            sx={{
                                borderColor:
                                    "#8B0000",

                                color:
                                    "#8B0000",

                                fontWeight: 700,

                                textTransform:
                                    "none",

                                borderRadius: 2,

                                minHeight: 44,

                                "&:hover": {
                                    borderColor:
                                        "#6D0000",

                                    backgroundColor:
                                        "#FFF3F3"
                                }
                            }}
                        >
                            Export to Excel
                        </Button>

                    </Stack>



                    {/* =================================================
                        SUMMARY CARDS
                    ================================================= */}

                    <Box
                        sx={{
                            display: "grid",

                            gridTemplateColumns: {
                                xs: "1fr",
                                sm:
                                    "repeat(2, minmax(0, 1fr))"
                            },

                            gap: 2,

                            mb: 2
                        }}
                    >

                        <Card
                            elevation={0}
                            sx={{
                                borderRadius: 3,

                                border:
                                    "1px solid #e0e0e0",

                                boxShadow:
                                    "0 3px 14px rgba(0, 0, 0, 0.06)"
                            }}
                        >

                            <CardContent>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Total Receipts
                                </Typography>


                                <Typography
                                    variant="h5"
                                    sx={{
                                        mt: 0.5,

                                        fontWeight:
                                            700,

                                        color:
                                            "#8B0000"
                                    }}
                                >
                                    {
                                        Number(
                                            reportSummary?.receipt_count ||
                                            0
                                        ).toLocaleString(
                                            "en-IN"
                                        )
                                    }
                                </Typography>

                            </CardContent>

                        </Card>


                        <Card
                            elevation={0}
                            sx={{
                                borderRadius: 3,

                                border:
                                    "1px solid #e0e0e0",

                                boxShadow:
                                    "0 3px 14px rgba(0, 0, 0, 0.06)"
                            }}
                        >

                            <CardContent>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Total Collection
                                </Typography>


                                <Typography
                                    variant="h5"
                                    sx={{
                                        mt: 0.5,

                                        fontWeight:
                                            700,

                                        color:
                                            "#8B0000"
                                    }}
                                >
                                    {
                                        formatCurrency(
                                            reportSummary?.total_collection
                                        )
                                    }
                                </Typography>

                            </CardContent>

                        </Card>

                    </Box>



                    {/* =================================================
                        DATA TABLE
                    ================================================= */}

                    <Card
                        elevation={0}
                        sx={{
                            borderRadius: 3,

                            border:
                                "1px solid #e0e0e0",

                            boxShadow:
                                "0 3px 14px rgba(0, 0, 0, 0.06)",

                            overflow: "hidden"
                        }}
                    >

                        <TableContainer
                            sx={{
                                maxHeight: 560,

                                overflowX: "auto"
                            }}
                        >

                            <Table
                                stickyHeader
                                size="small"
                                sx={{
                                    minWidth: 1450,

                                    tableLayout:
                                        "auto"
                                }}
                            >

                                <TableHead>

                                    <TableRow>

                                        <TableCell
                                            sx={{
                                                width: 120,
                                                minWidth: 120,
                                                fontWeight: 700,
                                                color: "#FFFFFF",
                                                backgroundColor: "#8B0000",
                                                whiteSpace: "nowrap",
                                                px: 1.5,
                                                py: 1.2
                                            }}
                                        >
                                            Receipt No
                                        </TableCell>


                                        <TableCell
                                            sx={{
                                                width: 105,
                                                minWidth: 105,
                                                fontWeight: 700,
                                                color: "#FFFFFF",
                                                backgroundColor: "#8B0000",
                                                whiteSpace: "nowrap",
                                                px: 1.5,
                                                py: 1.2
                                            }}
                                        >
                                            Date
                                        </TableCell>


                                        <TableCell
                                            sx={{
                                                width: 170,
                                                minWidth: 170,
                                                fontWeight: 700,
                                                color: "#FFFFFF",
                                                backgroundColor: "#8B0000",
                                                whiteSpace: "nowrap",
                                                px: 1.5,
                                                py: 1.2
                                            }}
                                        >
                                            Main Devotee
                                        </TableCell>


                                        <TableCell
                                            sx={{
                                                width: 170,
                                                minWidth: 170,
                                                fontWeight: 700,
                                                color: "#FFFFFF",
                                                backgroundColor: "#8B0000",
                                                whiteSpace: "nowrap",
                                                px: 1.5,
                                                py: 1.2
                                            }}
                                        >
                                            Beneficiary
                                        </TableCell>


                                        <TableCell
                                            sx={{
                                                width: 150,
                                                minWidth: 150,
                                                fontWeight: 700,
                                                color: "#FFFFFF",
                                                backgroundColor: "#8B0000",
                                                whiteSpace: "nowrap",
                                                px: 1.5,
                                                py: 1.2
                                            }}
                                        >
                                            Offering
                                        </TableCell>


                                        <TableCell
                                            sx={{
                                                width: 130,
                                                minWidth: 130,
                                                fontWeight: 700,
                                                color: "#FFFFFF",
                                                backgroundColor: "#8B0000",
                                                whiteSpace: "nowrap",
                                                px: 1.5,
                                                py: 1.2
                                            }}
                                        >
                                            Category
                                        </TableCell>


                                        <TableCell
                                            align="right"
                                            sx={{
                                                width: 65,
                                                minWidth: 65,
                                                fontWeight: 700,
                                                color: "#FFFFFF",
                                                backgroundColor: "#8B0000",
                                                whiteSpace: "nowrap",
                                                px: 1.5,
                                                py: 1.2
                                            }}
                                        >
                                            Qty
                                        </TableCell>


                                        <TableCell
                                            align="right"
                                            sx={{
                                                width: 105,
                                                minWidth: 105,
                                                fontWeight: 700,
                                                color: "#FFFFFF",
                                                backgroundColor: "#8B0000",
                                                whiteSpace: "nowrap",
                                                px: 1.5,
                                                py: 1.2
                                            }}
                                        >
                                            Rate
                                        </TableCell>


                                        <TableCell
                                            align="right"
                                            sx={{
                                                width: 115,
                                                minWidth: 115,
                                                fontWeight: 700,
                                                color: "#FFFFFF",
                                                backgroundColor: "#8B0000",
                                                whiteSpace: "nowrap",
                                                px: 1.5,
                                                py: 1.2
                                            }}
                                        >
                                            Amount
                                        </TableCell>


                                        <TableCell
                                            sx={{
                                                width: 130,
                                                minWidth: 130,
                                                fontWeight: 700,
                                                color: "#FFFFFF",
                                                backgroundColor: "#8B0000",
                                                whiteSpace: "nowrap",
                                                px: 1.5,
                                                py: 1.2
                                            }}
                                        >
                                            Payment Mode
                                        </TableCell>


                                        <TableCell
                                            sx={{
                                                width: 105,
                                                minWidth: 105,
                                                fontWeight: 700,
                                                color: "#FFFFFF",
                                                backgroundColor: "#8B0000",
                                                whiteSpace: "nowrap",
                                                px: 1.5,
                                                py: 1.2
                                            }}
                                        >
                                            Status
                                        </TableCell>


                                        <TableCell
                                            sx={{
                                                width: 145,
                                                minWidth: 145,
                                                fontWeight: 700,
                                                color: "#FFFFFF",
                                                backgroundColor: "#8B0000",
                                                whiteSpace: "nowrap",
                                                px: 1.5,
                                                py: 1.2
                                            }}
                                        >
                                            Created By
                                        </TableCell>

                                    </TableRow>

                                </TableHead>



                                <TableBody>

                                    {reportRows.length === 0 ? (

                                        <TableRow>

                                            <TableCell
                                                colSpan={12}
                                                align="center"
                                                sx={{
                                                    py: 5,

                                                    color:
                                                        "text.secondary"
                                                }}
                                            >
                                                No records found for the selected date range.
                                            </TableCell>

                                        </TableRow>

                                    ) : (

                                        reportRows.map(
                                            (row, index) => (

                                                <TableRow
                                                    key={
                                                        `${row.receipt_id}-${index}`
                                                    }
                                                    hover
                                                >

                                                    <TableCell
                                                        sx={{
                                                            fontWeight: 600,
                                                            whiteSpace: "nowrap"
                                                        }}
                                                    >
                                                        {
                                                            row.receipt_no
                                                        }
                                                    </TableCell>


                                                    <TableCell
                                                        sx={{
                                                            whiteSpace: "nowrap"
                                                        }}
                                                    >
                                                        {
                                                            formatDate(
                                                                row.receipt_date
                                                            )
                                                        }
                                                    </TableCell>


                                                    <TableCell
                                                        sx={{
                                                            minWidth: 170
                                                        }}
                                                    >
                                                        {
                                                            row.main_devotee ||
                                                            "-"
                                                        }
                                                    </TableCell>


                                                    <TableCell
                                                        sx={{
                                                            minWidth: 170
                                                        }}
                                                    >
                                                        {
                                                            row.beneficiary_name ||
                                                            "-"
                                                        }
                                                    </TableCell>


                                                    <TableCell
                                                        sx={{
                                                            minWidth: 150
                                                        }}
                                                    >
                                                        {
                                                            row.offering_name ||
                                                            "-"
                                                        }
                                                    </TableCell>


                                                    <TableCell
                                                        sx={{
                                                            minWidth: 130
                                                        }}
                                                    >
                                                        {
                                                            row.category_name ||
                                                            "-"
                                                        }
                                                    </TableCell>


                                                    <TableCell
                                                        align="right"
                                                        sx={{
                                                            whiteSpace:
                                                                "nowrap"
                                                        }}
                                                    >
                                                        {
                                                            Number(
                                                                row.quantity ||
                                                                0
                                                            )
                                                        }
                                                    </TableCell>


                                                    <TableCell
                                                        align="right"
                                                        sx={{
                                                            whiteSpace:
                                                                "nowrap"
                                                        }}
                                                    >
                                                        {
                                                            formatCurrency(
                                                                row.rate
                                                            )
                                                        }
                                                    </TableCell>


                                                    <TableCell
                                                        align="right"
                                                        sx={{
                                                            fontWeight:
                                                                600,

                                                            whiteSpace:
                                                                "nowrap"
                                                        }}
                                                    >
                                                        {
                                                            formatCurrency(
                                                                row.item_amount
                                                            )
                                                        }
                                                    </TableCell>


                                                    <TableCell
                                                        sx={{
                                                            whiteSpace:
                                                                "nowrap"
                                                        }}
                                                    >
                                                        {
                                                            row.payment_mode ||
                                                            "-"
                                                        }
                                                    </TableCell>


                                                    <TableCell
                                                        sx={{
                                                            whiteSpace:
                                                                "nowrap"
                                                        }}
                                                    >
                                                        {
                                                            row.status_name ||
                                                            "-"
                                                        }
                                                    </TableCell>


                                                    <TableCell
                                                        sx={{
                                                            whiteSpace:
                                                                "nowrap"
                                                        }}
                                                    >
                                                        {
                                                            row.created_by_name ||
                                                            "-"
                                                        }
                                                    </TableCell>

                                                </TableRow>

                                            )
                                        )

                                    )}

                                </TableBody>

                            </Table>

                        </TableContainer>

                    </Card>

                </Box>

            )}

        </Box>
    );
}