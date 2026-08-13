import {
    Box,
    Grid,
    Paper,
    Typography,
    Button
} from "@mui/material";

import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import PaymentsIcon from "@mui/icons-material/Payments";
import AddIcon from "@mui/icons-material/Add";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { apiFetch } from "../../api/api";


// ======================================================
// FORMAT CURRENCY
// ======================================================

const formatCurrency = (value) => {

    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }
    ).format(value || 0);

};


// ======================================================
// FORMAT CHART DATE
// ======================================================

const formatChartDate = (dateValue) => {

    if (!dateValue) {
        return "";
    }

    try {

        const dateString =
            String(dateValue);

        // Extract YYYY-MM-DD directly
        // to avoid timezone conversion problems.

        const match =
            dateString.match(
                /(\d{4})-(\d{2})-(\d{2})/
            );

        if (!match) {
            return dateString;
        }

        const monthNames = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec"
        ];

        const month =
            Number(match[2]);

        const day =
            match[3];

        if (
            month < 1 ||
            month > 12
        ) {
            return dateString;
        }

        return `${day} ${monthNames[month - 1]}`;

    }
    catch (error) {

        console.error(
            "Chart date formatting error:",
            error
        );

        return String(dateValue);

    }

};


// ======================================================
// DASHBOARD
// ======================================================

export default function Dashboard() {

    const navigate =
        useNavigate();


    // ==================================================
    // STATE
    // ==================================================

    const [dashboard, setDashboard] =
        useState({

            todayCollection: 0,

            todayReceipts: 0,

            cashCollection: 0,

            upiCollection: 0,

            chart: []

        });


    const [loading, setLoading] =
        useState(true);


    const [error, setError] =
        useState("");


    // ==================================================
    // LOAD DASHBOARD
    // ==================================================

    const loadDashboard = async () => {

        try {

            setLoading(true);

            setError("");


            const response =
                await apiFetch(
                    "/api/dashboard/summary"
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Unable to load dashboard"
                );

            }


            setDashboard({

                todayCollection:
                    Number(
                        data.todayCollection || 0
                    ),

                todayReceipts:
                    Number(
                        data.todayReceipts || 0
                    ),

                cashCollection:
                    Number(
                        data.cashCollection || 0
                    ),

                upiCollection:
                    Number(
                        data.upiCollection || 0
                    ),

                chart:
                    Array.isArray(data.chart)
                        ? data.chart
                        : []

            });

        }

        catch (err) {

            console.error(
                "Dashboard error:",
                err
            );


            setError(
                err.message ||
                "Unable to load dashboard"
            );

        }

        finally {

            setLoading(false);

        }

    };


    // ==================================================
    // LOAD ON PAGE OPEN
    // ==================================================

    useEffect(() => {

        loadDashboard();

    }, []);


    // ==================================================
    // CHART MAXIMUM
    // ==================================================

    const chartValues =
        dashboard.chart.map(
            item =>
                Number(
                    item.collection || 0
                )
        );


    const maxCollection =
        Math.max(
            ...chartValues,
            1
        );


    // ==================================================
    // KPI CARDS
    // ==================================================

    const cards = [

        {
            title:
                "Today's Collection",

            value:
                formatCurrency(
                    dashboard.todayCollection
                ),

            icon:
                <CurrencyRupeeIcon
                    sx={{
                        fontSize: 42
                    }}
                />

        },

        {
            title:
                "Today's Receipts",

            value:
                dashboard.todayReceipts,

            icon:
                <ReceiptLongIcon
                    sx={{
                        fontSize: 42
                    }}
                />

        },

        {
            title:
                "Cash Collection",

            value:
                formatCurrency(
                    dashboard.cashCollection
                ),

            icon:
                <AccountBalanceWalletIcon
                    sx={{
                        fontSize: 42
                    }}
                />

        },

        {
            title:
                "UPI Collection",

            value:
                formatCurrency(
                    dashboard.upiCollection
                ),

            icon:
                <PaymentsIcon
                    sx={{
                        fontSize: 42
                    }}
                />

        }

    ];


    // ==================================================
    // RENDER
    // ==================================================

    return (

        <Box>

            {/* ==================================================
                HEADER
            ================================================== */}

            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: { xs: "stretch", sm: "center" },
                    flexDirection: { xs: "column", sm: "row" },
                    mb: { xs: 2, sm: 3 },
                    gap: { xs: 1.5, sm: 2 }
                }}
            >

                <Box>

                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 600,
                            fontSize: {
                                xs: "1.5rem",
                                sm: "1.75rem",
                                md: "2.125rem"
                            }
                        }}
                    >
                        Dashboard
                    </Typography>


                    <Typography
                        color="text.secondary"
                        sx={{
                            mt: 0.5
                        }}
                    >
                        Kannambalath Temple Billing
                    </Typography>

                </Box>


                <Button
                    variant="contained"
                    startIcon={
                        <AddIcon />
                    }
                    onClick={() =>
                        navigate(
                            "/billing/new"
                        )
                    }
                    fullWidth
                    sx={{
                        minHeight: 48,
                        width: { xs: "100%", sm: "auto" }
                    }}
                >
                    New Receipt
                </Button>

            </Box>


            {/* ==================================================
                ERROR
            ================================================== */}

            {error && (

                <Paper
                    sx={{
                        p: 2,
                        mb: 3,
                        borderLeft:
                            "4px solid #b00000"
                    }}
                >

                    <Typography
                        color="error"
                    >
                        {error}
                    </Typography>

                </Paper>

            )}


            {/* ==================================================
                KPI CARDS
            ================================================== */}

            <Grid
                container
                spacing={{ xs: 1.5, sm: 2, md: 3 }}
            >

                {cards.map(
                    (card) => (

                        <Grid
                            item
                            xs={12}
                            sm={6}
                            md={3}
                            key={
                                card.title
                            }
                        >

                            <Paper
                                sx={{
                                    p: { xs: 2, sm: 2.5, md: 3 },
                                    height:
                                        "100%",
                                    minHeight: { xs: 112, sm: 125 },

                                    cursor:
                                        "default",

                                    transition:
                                        "all 0.25s ease",

                                    "&:hover": {

                                        transform:
                                            "translateY(-6px)",

                                        boxShadow:
                                            "0 10px 25px rgba(0,0,0,0.18)"

                                    }
                                }}
                            >

                                <Box
                                    sx={{
                                        display:
                                            "flex",

                                        justifyContent:
                                            "space-between",

                                        alignItems:
                                            "center"
                                    }}
                                >

                                    <Box>

                                        <Typography
                                            color="text.secondary"
                                            variant="body2"
                                        >
                                            {
                                                card.title
                                            }
                                        </Typography>


                                        <Typography
                                            variant="h5"
                                            sx={{
                                                mt: 1,
                                                fontWeight:
                                                    700
                                            }}
                                        >
                                            {loading
                                                ? "..."
                                                : card.value}
                                        </Typography>

                                    </Box>


                                    <Box
                                        sx={{
                                            transition:
                                                "transform 0.25s ease",

                                            display:
                                                "flex",

                                            "&:hover": {

                                                transform:
                                                    "scale(1.15)"

                                            }
                                        }}
                                    >
                                        {card.icon}
                                    </Box>

                                </Box>

                            </Paper>

                        </Grid>

                    )
                )}

            </Grid>


            {/* ==================================================
                SECOND ROW
            ================================================== */}

            <Grid
                container
                spacing={{ xs: 1.5, sm: 2, md: 3 }}
                sx={{
                    mt: { xs: 1, md: 1 }
                }}
            >

                {/* ==================================================
                    COLLECTION CHART
                ================================================== */}

                <Grid
                    item
                    xs={12}
                    md={9}
                >

                    <Paper
                        sx={{
                            p: { xs: 1.75, sm: 2.5, md: 3 },
                            minHeight: { xs: 330, sm: 340 }
                        }}
                    >

                        <Box
                            sx={{
                                display:
                                    "flex",

                                justifyContent:
                                    "space-between",

                                alignItems: { xs: "flex-start", sm: "center" },
                                gap: 1,

                                mb: { xs: 2, sm: 3 }
                            }}
                        >

                            <Box>

                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight:
                                            600
                                    }}
                                >
                                    Collection Summary
                                </Typography>


                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Last 7 days
                                </Typography>

                            </Box>


                            <TrendingUpIcon
                                sx={{
                                    fontSize: 30,
                                    opacity: 0.7
                                }}
                            />

                        </Box>


                        {/* ==================================================
                            CHART
                        ================================================== */}

                        <Box
                            sx={{
                                height: { xs: 210, sm: 230 },
                                display:
                                    "flex",

                                alignItems:
                                    "stretch",

                                gap: 1
                            }}
                        >

                            {/* Y AXIS */}

                            <Box
                                sx={{
                                    width: { xs: 48, sm: 65 },
                                    flexShrink: 0,
                                    display:
                                        "flex",

                                    flexDirection:
                                        "column",

                                    justifyContent:
                                        "space-between",

                                    pb: 3
                                }}
                            >

                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    {formatCurrency(
                                        maxCollection
                                    )}
                                </Typography>


                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    {formatCurrency(
                                        maxCollection / 2
                                    )}
                                </Typography>


                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    ₹0
                                </Typography>

                            </Box>


                            {/* BAR AREA */}

                            <Box
                                sx={{
                                    flex: 1,
                                    display:
                                        "flex",

                                    alignItems:
                                        "stretch",

                                    gap: { xs: 0.5, sm: 2 },

                                    borderBottom:
                                        "1px solid #ddd",

                                    position:
                                        "relative"
                                }}
                            >

                                {dashboard.chart.map(
                                    (item) => {

                                        const value =
                                            Number(
                                                item.collection ||
                                                0
                                            );


                                        const height =
                                            maxCollection >
                                            0

                                                ? (
                                                    value /
                                                    maxCollection
                                                ) *
                                                100

                                                : 0;


                                        return (

                                            <Box
                                                key={
                                                    item.date
                                                }
                                                sx={{
                                                    flex: 1,

                                                    minWidth:
                                                        { xs: 32, sm: 60 },

                                                    display:
                                                        "flex",

                                                    flexDirection:
                                                        "column",

                                                    justifyContent:
                                                        "flex-end",

                                                    alignItems:
                                                        "center",

                                                    position:
                                                        "relative"
                                                }}
                                            >

                                                {/* VALUE */}

                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        mb:
                                                            0.5,

                                                        fontWeight:
                                                            600,

                                                        whiteSpace:
                                                            "nowrap",

                                                        opacity:
                                                            value >
                                                            0
                                                                ? 1
                                                                : 0
                                                    }}
                                                >
                                                    {formatCurrency(
                                                        value
                                                    )}
                                                </Typography>


                                                {/* BAR */}

                                                <Box
                                                    title={`${formatChartDate(
                                                        item.date
                                                    )}: ${formatCurrency(
                                                        value
                                                    )}`}

                                                    sx={{
                                                        width:
                                                            "65%",

                                                        height:
                                                            `${Math.max(
                                                                height,
                                                                value >
                                                                    0
                                                                    ? 4
                                                                    : 0
                                                            )}%`,

                                                        minHeight:
                                                            value >
                                                            0
                                                                ? 4
                                                                : 0,

                                                        borderRadius:
                                                            "6px 6px 0 0",

                                                        background:
                                                            "linear-gradient(180deg, #b00000 0%, #7f0000 100%)",

                                                        transition:
                                                            "all 0.25s ease",

                                                        cursor:
                                                            "pointer",

                                                        "&:hover": {

                                                            width:
                                                                "80%",

                                                            filter:
                                                                "brightness(1.15)",

                                                            boxShadow:
                                                                "0 0 10px rgba(176,0,0,0.35)"

                                                        }
                                                    }}
                                                />

                                            </Box>

                                        );

                                    }
                                )}

                            </Box>

                        </Box>


                        {/* ==================================================
                            DATE LABELS
                        ================================================== */}

                        <Box
                            sx={{
                                display:
                                    "flex",

                                ml:
                                    { xs: "48px", sm: "65px" },

                                gap: { xs: 0.5, sm: 2 },

                                mt: 1,
                                overflow: "hidden"
                            }}
                        >

                            {dashboard.chart.map(
                                (item) => (

                                    <Box
                                        key={
                                            item.date
                                        }
                                        sx={{
                                            flex: 1,

                                            minWidth:
                                                60,

                                            textAlign:
                                                "center"
                                        }}
                                    >

                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            sx={{
                                                whiteSpace:
                                                    "nowrap"
                                            }}
                                        >
                                            {formatChartDate(
                                                item.date
                                            )}
                                        </Typography>

                                    </Box>

                                )
                            )}

                        </Box>

                    </Paper>

                </Grid>


                {/* ==================================================
                    QUICK ACTIONS
                ================================================== */}

                <Grid
                    item
                    xs={12}
                    md={3}
                >

                    <Paper
                        sx={{
                            p: { xs: 1.75, sm: 2.5, md: 3 },
                            minHeight: { xs: "auto", sm: 340 }
                        }}
                    >

                        <Typography
                            variant="h6"
                            sx={{
                                mb: 2,
                                fontWeight:
                                    600
                            }}
                        >
                            Quick Actions
                        </Typography>


                        <Button
                            fullWidth
                            variant="contained"
                            sx={{
                                mb: 1.5,
                                height: 48
                            }}
                            onClick={() =>
                                navigate(
                                    "/billing/new"
                                )
                            }
                        >
                            NEW RECEIPT
                        </Button>


                        <Button
                            fullWidth
                            variant="outlined"
                            sx={{
                                mb: 1.5,
                                height: 48
                            }}
                            onClick={() =>
                                navigate(
                                    "/receipts"
                                )
                            }
                        >
                            SEARCH RECEIPTS
                        </Button>


                        <Button
                            fullWidth
                            variant="outlined"
                            sx={{
                                height: 48
                            }}
                            onClick={() =>
                                navigate(
                                    "/masters/devotees"
                                )
                            }
                        >
                            MANAGE DEVOTEES
                        </Button>

                    </Paper>

                </Grid>

            </Grid>

        </Box>

    );

}