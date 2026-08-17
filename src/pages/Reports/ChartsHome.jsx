import { useMemo, useState } from "react";

import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Divider,
    Grid,
    Stack,
    TextField,
    Typography
} from "@mui/material";

import AssessmentIcon from "@mui/icons-material/Assessment";
import RefreshIcon from "@mui/icons-material/Refresh";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";

import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line
} from "recharts";


const CHART_COLORS = [
    "#8B0000",
    "#B71C1C",
    "#D32F2F",
    "#E57373",
    "#6A1B9A",
    "#1565C0",
    "#00838F",
    "#2E7D32",
    "#EF6C00",
    "#5D4037"
];


const getLocalDate = () => {

    const date = new Date();

    const year =
        date.getFullYear();

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


const formatCurrency = (value) => {

    return Number(
        value || 0
    ).toLocaleString(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 2
        }
    );
};


const formatNumber = (value) => {

    return Number(
        value || 0
    ).toLocaleString(
        "en-IN"
    );
};


const formatDate = (value) => {

    if (!value) {
        return "";
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return value;
    }

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "2-digit"
        }
    );
};


const shortLabel = (
    english,
    malayalam
) => {

    const en =
        String(
            english || ""
        ).trim();

    const ml =
        String(
            malayalam || ""
        ).trim();

    if (en && ml) {
        return `${en} / ${ml}`;
    }

    return en || ml || "Unknown";
};


const chartTooltipStyle = {
    borderRadius: 12,
    border: "1px solid #ead6d6",
    boxShadow:
        "0 8px 24px rgba(0,0,0,0.12)",
    backgroundColor: "#FFFFFF"
};


const chartCardSx = {
    height: "100%",
    borderRadius: 3,
    border:
        "1px solid #eadede",
    boxShadow:
        "0 5px 20px rgba(0,0,0,0.06)",
    overflow: "hidden"
};


const ChartHeader = ({
    title,
    subtitle
}) => (
    <Box
        sx={{
            px: 2.5,
            pt: 2.2,
            pb: 1
        }}
    >
        <Typography
            variant="h6"
            sx={{
                fontWeight: 700,
                color: "#263238"
            }}
        >
            {title}
        </Typography>

        {subtitle && (
            <Typography
                variant="body2"
                sx={{
                    mt: 0.4,
                    color: "text.secondary"
                }}
            >
                {subtitle}
            </Typography>
        )}
    </Box>
);


const EmptyChart = ({
    message = "No data available for the selected period."
}) => (
    <Box
        sx={{
            height: 320,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "text.secondary",
            px: 3,
            textAlign: "center"
        }}
    >
        <Typography
            variant="body2"
        >
            {message}
        </Typography>
    </Box>
);


export default function ChartsHome() {

    const today =
        getLocalDate();


    const [fromDate, setFromDate] =
        useState(today);

    const [toDate, setToDate] =
        useState(today);

    const [data, setData] =
        useState(null);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const [generated, setGenerated] =
        useState(false);


    const generateCharts =
        async () => {

            setError("");
            setGenerated(false);
            setData(null);


            if (
                !fromDate ||
                !toDate
            ) {

                setError(
                    "Please select both From Date and To Date."
                );

                return;
            }


            if (
                fromDate > toDate
            ) {

                setError(
                    "From Date cannot be later than To Date."
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
                        `https://billing-api.kannambalam.com/api/charts/dashboard?from_date=${encodeURIComponent(fromDate)}&to_date=${encodeURIComponent(toDate)}`,
                        {
                            method: "GET",
                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    );


                let result = null;


                try {

                    result =
                        await response.json();

                }
                catch {

                    result = null;

                }


                if (
                    !response.ok
                ) {

                    if (
                        response.status === 401
                    ) {

                        throw new Error(
                            "Your login session has expired. Please log in again."
                        );

                    }


                    if (
                        response.status === 403
                    ) {

                        throw new Error(
                            "Administrator access is required to view charts."
                        );

                    }


                    throw new Error(
                        result?.error ||
                        "Unable to load chart data."
                    );

                }


                setData(
                    result
                );

                setGenerated(
                    true
                );

            }
            catch (err) {

                console.error(
                    "Charts dashboard error:",
                    err
                );

                setError(
                    err.message ||
                    "Unable to load chart data."
                );

            }
            finally {

                setLoading(false);

            }

        };


    const offeringData =
        useMemo(
            () => (
                Array.isArray(
                    data?.offering_wise
                )
                    ? data.offering_wise.map(
                        row => ({
                            ...row,
                            label:
                                shortLabel(
                                    row.offering_name,
                                    row.offering_name_ml
                                ),
                            total_collection:
                                Number(
                                    row.total_collection || 0
                                )
                        })
                    )
                    : []
            ),
            [data]
        );


    const categoryData =
        useMemo(
            () => (
                Array.isArray(
                    data?.category_wise
                )
                    ? data.category_wise.map(
                        row => ({
                            ...row,
                            label:
                                shortLabel(
                                    row.category_name,
                                    row.category_name_ml
                                ),
                            total_collection:
                                Number(
                                    row.total_collection || 0
                                )
                        })
                    )
                    : []
            ),
            [data]
        );


    const paymentModeData =
        useMemo(
            () => (
                Array.isArray(
                    data?.payment_mode_wise
                )
                    ? data.payment_mode_wise.map(
                        row => ({
                            ...row,
                            label:
                                shortLabel(
                                    row.payment_mode,
                                    row.mode_name_ml
                                ),
                            total_collection:
                                Number(
                                    row.total_collection || 0
                                ),
                            receipt_count:
                                Number(
                                    row.receipt_count || 0
                                )
                        })
                    )
                    : []
            ),
            [data]
        );


    const userData =
        useMemo(
            () => (
                Array.isArray(
                    data?.user_wise
                )
                    ? data.user_wise.map(
                        row => ({
                            ...row,
                            total_collection:
                                Number(
                                    row.total_collection || 0
                                ),
                            receipt_count:
                                Number(
                                    row.receipt_count || 0
                                )
                        })
                    )
                    : []
            ),
            [data]
        );


    const dailyCollectionData =
        useMemo(
            () => (
                Array.isArray(
                    data?.daily_collection
                )
                    ? data.daily_collection.map(
                        row => ({
                            ...row,
                            label:
                                formatDate(
                                    row.receipt_date
                                ),
                            total_collection:
                                Number(
                                    row.total_collection || 0
                                )
                        })
                    )
                    : []
            ),
            [data]
        );


    const dailyReceiptData =
        useMemo(
            () => (
                Array.isArray(
                    data?.daily_receipts
                )
                    ? data.daily_receipts.map(
                        row => ({
                            ...row,
                            label:
                                formatDate(
                                    row.receipt_date
                                ),
                            receipt_count:
                                Number(
                                    row.receipt_count || 0
                                )
                        })
                    )
                    : []
            ),
            [data]
        );


    const totalCollection =
        Number(
            data?.summary?.total_collection || 0
        );


    const totalReceipts =
        Number(
            data?.summary?.receipt_count || 0
        );


    return (

        <Box
            sx={{
                width: "100%",
                maxWidth: 1500,
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

            {/* ==================================================
                PAGE HEADER
            ================================================== */}

            <Stack
                direction="row"
                spacing={1.5}
                alignItems="center"
                sx={{
                    mb: 3
                }}
            >

                <Box
                    sx={{
                        width: 52,
                        height: 52,
                        borderRadius: 2.5,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background:
                            "linear-gradient(135deg, #8B0000, #B71C1C)",
                        color: "#FFFFFF",
                        boxShadow:
                            "0 8px 22px rgba(139,0,0,0.20)"
                    }}
                >

                    <AssessmentIcon
                        sx={{
                            fontSize: 30
                        }}
                    />

                </Box>


                <Box>

                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 700,
                            color: "#263238",
                            lineHeight: 1.1
                        }}
                    >
                        Charts & Analytics
                    </Typography>


                    <Typography
                        variant="body2"
                        sx={{
                            mt: 0.5,
                            color: "text.secondary"
                        }}
                    >
                        Visual overview of temple collections and billing activity.
                    </Typography>

                </Box>

            </Stack>


            {/* ==================================================
                FILTER PANEL
            ================================================== */}

            <Card
                elevation={0}
                sx={{
                    borderRadius: 3,
                    border:
                        "1px solid #eadede",
                    boxShadow:
                        "0 5px 18px rgba(0,0,0,0.06)",
                    mb: 3
                }}
            >

                <Box
                    sx={{
                        px: {
                            xs: 2,
                            md: 2.5
                        },
                        py: 1.6,
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
                        Chart Filters
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

                    <Grid
                        container
                        spacing={2}
                        alignItems="center"
                    >

                        <Grid
                            size={{
                                xs: 12,
                                sm: 5,
                                md: 4
                            }}
                        >

                            <TextField
                                fullWidth
                                size="small"
                                type="date"
                                label="From Date"
                                value={fromDate}
                                onChange={event =>
                                    setFromDate(
                                        event.target.value
                                    )
                                }
                                InputLabelProps={{
                                    shrink: true
                                }}
                            />

                        </Grid>


                        <Grid
                            size={{
                                xs: 12,
                                sm: 5,
                                md: 4
                            }}
                        >

                            <TextField
                                fullWidth
                                size="small"
                                type="date"
                                label="To Date"
                                value={toDate}
                                onChange={event =>
                                    setToDate(
                                        event.target.value
                                    )
                                }
                                InputLabelProps={{
                                    shrink: true
                                }}
                            />

                        </Grid>


                        <Grid
                            size={{
                                xs: 12,
                                sm: 2,
                                md: 4
                            }}
                        >

                            <Button
                                fullWidth
                                variant="contained"
                                startIcon={
                                    loading
                                        ? (
                                            <CircularProgress
                                                size={18}
                                                color="inherit"
                                            />
                                        )
                                        : (
                                            <RefreshIcon />
                                        )
                                }
                                disabled={loading}
                                onClick={
                                    generateCharts
                                }
                                sx={{
                                    minHeight: 40,
                                    borderRadius: 2,
                                    backgroundColor:
                                        "#8B0000",
                                    fontWeight: 700,
                                    "&:hover": {
                                        backgroundColor:
                                            "#6D0000"
                                    }
                                }}
                            >
                                {loading
                                    ? "Loading..."
                                    : "Generate Charts"}
                            </Button>

                        </Grid>

                    </Grid>

                </CardContent>

            </Card>


            {/* ==================================================
                ERROR
            ================================================== */}

            {error && (

                <Alert
                    severity="error"
                    sx={{
                        mb: 3,
                        borderRadius: 2
                    }}
                >
                    {error}
                </Alert>

            )}


            {/* ==================================================
                KPI CARDS
            ================================================== */}

            {generated && data && (

                <Grid
                    container
                    spacing={2}
                    sx={{
                        mb: 3
                    }}
                >

                    <Grid
                        size={{
                            xs: 12,
                            sm: 6,
                            md: 6
                        }}
                    >

                        <Card
                            sx={{
                                borderRadius: 3,
                                border:
                                    "1px solid #eadede",
                                background:
                                    "linear-gradient(135deg, #FFF8F8, #FFFFFF)",
                                boxShadow:
                                    "0 6px 20px rgba(139,0,0,0.08)"
                            }}
                        >

                            <CardContent
                                sx={{
                                    p: 2.5
                                }}
                            >

                                <Stack
                                    direction="row"
                                    spacing={2}
                                    alignItems="center"
                                >

                                    <Box
                                        sx={{
                                            width: 52,
                                            height: 52,
                                            borderRadius: 2.5,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            backgroundColor:
                                                "#8B0000",
                                            color:
                                                "#FFFFFF"
                                        }}
                                    >
                                        <AccountBalanceWalletIcon />
                                    </Box>


                                    <Box>

                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            Total Collection
                                        </Typography>

                                        <Typography
                                            variant="h5"
                                            sx={{
                                                mt: 0.3,
                                                fontWeight: 800,
                                                color: "#8B0000"
                                            }}
                                        >
                                            {formatCurrency(
                                                totalCollection
                                            )}
                                        </Typography>

                                    </Box>

                                </Stack>

                            </CardContent>

                        </Card>

                    </Grid>


                    <Grid
                        size={{
                            xs: 12,
                            sm: 6,
                            md: 6
                        }}
                    >

                        <Card
                            sx={{
                                borderRadius: 3,
                                border:
                                    "1px solid #eadede",
                                background:
                                    "linear-gradient(135deg, #F8FAFF, #FFFFFF)",
                                boxShadow:
                                    "0 6px 20px rgba(21,101,192,0.08)"
                            }}
                        >

                            <CardContent
                                sx={{
                                    p: 2.5
                                }}
                            >

                                <Stack
                                    direction="row"
                                    spacing={2}
                                    alignItems="center"
                                >

                                    <Box
                                        sx={{
                                            width: 52,
                                            height: 52,
                                            borderRadius: 2.5,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            backgroundColor:
                                                "#1565C0",
                                            color:
                                                "#FFFFFF"
                                        }}
                                    >
                                        <ReceiptLongIcon />
                                    </Box>


                                    <Box>

                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            Total Receipts
                                        </Typography>

                                        <Typography
                                            variant="h5"
                                            sx={{
                                                mt: 0.3,
                                                fontWeight: 800,
                                                color: "#1565C0"
                                            }}
                                        >
                                            {formatNumber(
                                                totalReceipts
                                            )}
                                        </Typography>

                                    </Box>

                                </Stack>

                            </CardContent>

                        </Card>

                    </Grid>

                </Grid>

            )}


            {/* ==================================================
                OFFERING + PAYMENT MODE
            ================================================== */}

            {generated && (

                <Grid
                    container
                    spacing={2.5}
                >

                    <Grid
                        size={{
                            xs: 12,
                            lg: 8
                        }}
                    >

                        <Card
                            sx={
                                chartCardSx
                            }
                        >

                            <ChartHeader
                                title="Collection by Offering"
                                subtitle="Top offerings by collection amount"
                            />

                            <Divider />

                            {offeringData.length === 0 ? (

                                <EmptyChart />

                            ) : (

                                <Box
                                    sx={{
                                        height: {
                                            xs: 360,
                                            md: 430
                                        },
                                        p: {
                                            xs: 1,
                                            md: 2
                                        }
                                    }}
                                >

                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >

                                        <BarChart
                                            data={
                                                offeringData
                                            }
                                            layout="vertical"
                                            margin={{
                                                top: 10,
                                                right: 25,
                                                left: 10,
                                                bottom: 10
                                            }}
                                        >

                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                horizontal={false}
                                                stroke="#eeeeee"
                                            />

                                            <XAxis
                                                type="number"
                                                tickFormatter={
                                                    value =>
                                                        `₹${formatNumber(value)}`
                                                }
                                                tick={{
                                                    fontSize: 11
                                                }}
                                            />

                                            <YAxis
                                                type="category"
                                                dataKey="label"
                                                width={150}
                                                tick={{
                                                    fontSize: 11
                                                }}
                                            />

                                            <Tooltip
                                                contentStyle={
                                                    chartTooltipStyle
                                                }
                                                formatter={
                                                    value =>
                                                        formatCurrency(
                                                            value
                                                        )
                                                }
                                            />

                                            <Bar
                                                dataKey="total_collection"
                                                name="Collection"
                                                radius={[
                                                    0,
                                                    8,
                                                    8,
                                                    0
                                                ]}
                                                barSize={24}
                                            >

                                                {offeringData.map(
                                                    (
                                                        entry,
                                                        index
                                                    ) => (
                                                        <Cell
                                                            key={
                                                                `offering-${index}`
                                                            }
                                                            fill={
                                                                CHART_COLORS[
                                                                    index %
                                                                    CHART_COLORS.length
                                                                ]
                                                            }
                                                        />
                                                    )
                                                )}

                                            </Bar>

                                        </BarChart>

                                    </ResponsiveContainer>

                                </Box>

                            )}

                        </Card>

                    </Grid>


                    <Grid
                        size={{
                            xs: 12,
                            lg: 4
                        }}
                    >

                        <Card
                            sx={
                                chartCardSx
                            }
                        >

                            <ChartHeader
                                title="Payment Mode Collection"
                                subtitle="Collection distribution by payment mode"
                            />

                            <Divider />

                            {paymentModeData.length === 0 ? (

                                <EmptyChart />

                            ) : (

                                <Box
                                    sx={{
                                        height: {
                                            xs: 360,
                                            md: 430
                                        },
                                        p: 1
                                    }}
                                >

                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >

                                        <PieChart>

                                            <Pie
                                                data={
                                                    paymentModeData
                                                }
                                                dataKey="total_collection"
                                                nameKey="label"
                                                cx="50%"
                                                cy="45%"
                                                innerRadius="48%"
                                                outerRadius="72%"
                                                paddingAngle={3}
                                                labelLine={false}
                                            >

                                                {paymentModeData.map(
                                                    (
                                                        entry,
                                                        index
                                                    ) => (
                                                        <Cell
                                                            key={
                                                                `payment-${index}`
                                                            }
                                                            fill={
                                                                CHART_COLORS[
                                                                    index %
                                                                    CHART_COLORS.length
                                                                ]
                                                            }
                                                        />
                                                    )
                                                )}

                                            </Pie>

                                            <Tooltip
                                                contentStyle={
                                                    chartTooltipStyle
                                                }
                                                formatter={
                                                    value =>
                                                        formatCurrency(
                                                            value
                                                        )
                                                }
                                            />

                                            <Legend
                                                verticalAlign="bottom"
                                                height={55}
                                                wrapperStyle={{
                                                    fontSize: 12
                                                }}
                                            />

                                        </PieChart>

                                    </ResponsiveContainer>

                                </Box>

                            )}

                        </Card>

                    </Grid>


                    {/* ==================================================
                        CATEGORY
                    ================================================== */}

                    <Grid
                        size={{
                            xs: 12,
                            md: 6
                        }}
                    >

                        <Card
                            sx={
                                chartCardSx
                            }
                        >

                            <ChartHeader
                                title="Category-wise Collection"
                                subtitle="Collection grouped by offering category"
                            />

                            <Divider />

                            {categoryData.length === 0 ? (

                                <EmptyChart />

                            ) : (

                                <Box
                                    sx={{
                                        height: 350,
                                        p: 2
                                    }}
                                >

                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >

                                        <BarChart
                                            data={
                                                categoryData
                                            }
                                            margin={{
                                                top: 15,
                                                right: 15,
                                                left: 5,
                                                bottom: 35
                                            }}
                                        >

                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                stroke="#eeeeee"
                                            />

                                            <XAxis
                                                dataKey="label"
                                                angle={-25}
                                                textAnchor="end"
                                                interval={0}
                                                height={75}
                                                tick={{
                                                    fontSize: 11
                                                }}
                                            />

                                            <YAxis
                                                tickFormatter={
                                                    value =>
                                                        `₹${formatNumber(value)}`
                                                }
                                                tick={{
                                                    fontSize: 11
                                                }}
                                            />

                                            <Tooltip
                                                contentStyle={
                                                    chartTooltipStyle
                                                }
                                                formatter={
                                                    value =>
                                                        formatCurrency(
                                                            value
                                                        )
                                                }
                                            />

                                            <Bar
                                                dataKey="total_collection"
                                                name="Collection"
                                                radius={[
                                                    8,
                                                    8,
                                                    0,
                                                    0
                                                ]}
                                            >

                                                {categoryData.map(
                                                    (
                                                        entry,
                                                        index
                                                    ) => (
                                                        <Cell
                                                            key={
                                                                `category-${index}`
                                                            }
                                                            fill={
                                                                CHART_COLORS[
                                                                    index %
                                                                    CHART_COLORS.length
                                                                ]
                                                            }
                                                        />
                                                    )
                                                )}

                                            </Bar>

                                        </BarChart>

                                    </ResponsiveContainer>

                                </Box>

                            )}

                        </Card>

                    </Grid>


                    {/* ==================================================
                        USER
                    ================================================== */}

                    <Grid
                        size={{
                            xs: 12,
                            md: 6
                        }}
                    >

                        <Card
                            sx={
                                chartCardSx
                            }
                        >

                            <ChartHeader
                                title="User-wise Collection"
                                subtitle="Collection grouped by billing user"
                            />

                            <Divider />

                            {userData.length === 0 ? (

                                <EmptyChart />

                            ) : (

                                <Box
                                    sx={{
                                        height: 350,
                                        p: 2
                                    }}
                                >

                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >

                                        <BarChart
                                            data={
                                                userData
                                            }
                                            layout="vertical"
                                            margin={{
                                                top: 10,
                                                right: 25,
                                                left: 5,
                                                bottom: 10
                                            }}
                                        >

                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                horizontal={false}
                                                stroke="#eeeeee"
                                            />

                                            <XAxis
                                                type="number"
                                                tickFormatter={
                                                    value =>
                                                        `₹${formatNumber(value)}`
                                                }
                                                tick={{
                                                    fontSize: 11
                                                }}
                                            />

                                            <YAxis
                                                type="category"
                                                dataKey="user_name"
                                                width={115}
                                                tick={{
                                                    fontSize: 11
                                                }}
                                            />

                                            <Tooltip
                                                contentStyle={
                                                    chartTooltipStyle
                                                }
                                                formatter={
                                                    (
                                                        value,
                                                        name
                                                    ) =>
                                                        name ===
                                                        "Collection"
                                                            ? formatCurrency(
                                                                value
                                                            )
                                                            : formatNumber(
                                                                value
                                                            )
                                                }
                                            />

                                            <Legend />

                                            <Bar
                                                dataKey="total_collection"
                                                name="Collection"
                                                fill="#8B0000"
                                                radius={[
                                                    0,
                                                    8,
                                                    8,
                                                    0
                                                ]}
                                                barSize={24}
                                            />

                                        </BarChart>

                                    </ResponsiveContainer>

                                </Box>

                            )}

                        </Card>

                    </Grid>


                    {/* ==================================================
                        DAILY COLLECTION
                    ================================================== */}

                    <Grid
                        size={{
                            xs: 12
                        }}
                    >

                        <Card
                            sx={
                                chartCardSx
                            }
                        >

                            <ChartHeader
                                title="Daily Collection Trend"
                                subtitle="Collection movement across the selected period"
                            />

                            <Divider />

                            {dailyCollectionData.length === 0 ? (

                                <EmptyChart />

                            ) : (

                                <Box
                                    sx={{
                                        height: {
                                            xs: 320,
                                            md: 380
                                        },
                                        p: 2
                                    }}
                                >

                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >

                                        <LineChart
                                            data={
                                                dailyCollectionData
                                            }
                                            margin={{
                                                top: 15,
                                                right: 20,
                                                left: 10,
                                                bottom: 10
                                            }}
                                        >

                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                stroke="#eeeeee"
                                            />

                                            <XAxis
                                                dataKey="label"
                                                tick={{
                                                    fontSize: 11
                                                }}
                                            />

                                            <YAxis
                                                tickFormatter={
                                                    value =>
                                                        `₹${formatNumber(value)}`
                                                }
                                                tick={{
                                                    fontSize: 11
                                                }}
                                            />

                                            <Tooltip
                                                contentStyle={
                                                    chartTooltipStyle
                                                }
                                                formatter={
                                                    value =>
                                                        formatCurrency(
                                                            value
                                                        )
                                                }
                                            />

                                            <Legend />

                                            <Line
                                                type="monotone"
                                                dataKey="total_collection"
                                                name="Collection"
                                                stroke="#8B0000"
                                                strokeWidth={3}
                                                dot={{
                                                    r: 4,
                                                    fill: "#8B0000"
                                                }}
                                                activeDot={{
                                                    r: 7
                                                }}
                                            />

                                        </LineChart>

                                    </ResponsiveContainer>

                                </Box>

                            )}

                        </Card>

                    </Grid>


                    {/* ==================================================
                        DAILY RECEIPTS
                    ================================================== */}

                    <Grid
                        size={{
                            xs: 12
                        }}
                    >

                        <Card
                            sx={
                                chartCardSx
                            }
                        >

                            <ChartHeader
                                title="Daily Receipt Count"
                                subtitle="Number of receipts generated each day"
                            />

                            <Divider />

                            {dailyReceiptData.length === 0 ? (

                                <EmptyChart />

                            ) : (

                                <Box
                                    sx={{
                                        height: {
                                            xs: 320,
                                            md: 360
                                        },
                                        p: 2
                                    }}
                                >

                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >

                                        <BarChart
                                            data={
                                                dailyReceiptData
                                            }
                                            margin={{
                                                top: 15,
                                                right: 20,
                                                left: 10,
                                                bottom: 10
                                            }}
                                        >

                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                stroke="#eeeeee"
                                            />

                                            <XAxis
                                                dataKey="label"
                                                tick={{
                                                    fontSize: 11
                                                }}
                                            />

                                            <YAxis
                                                allowDecimals={false}
                                                tick={{
                                                    fontSize: 11
                                                }}
                                            />

                                            <Tooltip
                                                contentStyle={
                                                    chartTooltipStyle
                                                }
                                                formatter={
                                                    value =>
                                                        formatNumber(
                                                            value
                                                        )
                                                }
                                            />

                                            <Bar
                                                dataKey="receipt_count"
                                                name="Receipts"
                                                fill="#1565C0"
                                                radius={[
                                                    8,
                                                    8,
                                                    0,
                                                    0
                                                ]}
                                            />

                                        </BarChart>

                                    </ResponsiveContainer>

                                </Box>

                            )}

                        </Card>

                    </Grid>

                </Grid>

            )}


            {!generated &&
                !loading &&
                !error && (

                    <Card
                        elevation={0}
                        sx={{
                            borderRadius: 3,
                            border:
                                "1px dashed #d8bcbc",
                            backgroundColor:
                                "#FFFAFA",
                            py: 7,
                            px: 3,
                            textAlign: "center"
                        }}
                    >

                        <AssessmentIcon
                            sx={{
                                fontSize: 56,
                                color: "#B71C1C",
                                mb: 1
                            }}
                        />

                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 700,
                                color: "#263238"
                            }}
                        >
                            Select a date range to view analytics
                        </Typography>

                        <Typography
                            variant="body2"
                            sx={{
                                mt: 0.8,
                                color: "text.secondary"
                            }}
                        >
                            All charts will refresh together using the selected period.
                        </Typography>

                    </Card>

                )}

        </Box>

    );
}
