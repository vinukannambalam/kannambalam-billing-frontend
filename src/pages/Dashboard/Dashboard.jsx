import { Box, Grid, Paper, Typography, Button, Stack, Chip } from "@mui/material";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import PaymentsIcon from "@mui/icons-material/Payments";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import SearchIcon from "@mui/icons-material/Search";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../api/api";

import collectionImage from "../../assets/dashboard/collection.png";
import receiptsImage from "../../assets/dashboard/receipts.png";
import cashImage from "../../assets/dashboard/cash.png";
import upiImage from "../../assets/dashboard/upi.png";

const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(value || 0);

const formatChartDate = (dateString) => {
    if (!dateString) return "";

    const parts = String(dateString).substring(0, 10).split("-");
    if (parts.length !== 3) return "";

    const monthNames = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const month = Number(parts[1]);
    const day = parts[2];

    if (month < 1 || month > 12 || !day) return "";

    return `${day} ${monthNames[month - 1]}`;
};

const kpiCards = [
    {
        key: "todayCollection",
        title: "Today's Collection",
        icon: <CurrencyRupeeIcon />,
        image: collectionImage,
        accent: "#b00000"
    },
    {
        key: "todayReceipts",
        title: "Today's Receipts",
        icon: <ReceiptLongIcon />,
        image: receiptsImage,
        accent: "#8b5a16"
    },
    {
        key: "cashCollection",
        title: "Cash Collection",
        icon: <AccountBalanceWalletIcon />,
        image: cashImage,
        accent: "#17633d"
    },
    {
        key: "upiCollection",
        title: "UPI Collection",
        icon: <PaymentsIcon />,
        image: upiImage,
        accent: "#284c87"
    }
];

export default function Dashboard() {
    const navigate = useNavigate();

    // ==================================================
    // CURRENT USER / ADMIN CHECK
    // ==================================================
    const storedUser = localStorage.getItem("billing_user");

    let user = null;

    try {
        user = storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
        console.error("Unable to read logged-in user:", error);
        user = null;
    }

    const userRole = String(user?.role || "").trim().toLowerCase();

    const isAdmin =
        userRole === "admin" ||
        userRole === "administrator";

    const [dashboard, setDashboard] = useState({
        todayCollection: 0,
        todayReceipts: 0,
        cashCollection: 0,
        upiCollection: 0,
        chart: []
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadDashboard = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await apiFetch("/api/dashboard/summary");
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Unable to load dashboard");
            }

            setDashboard({
                todayCollection: Number(data.todayCollection || 0),
                todayReceipts: Number(data.todayReceipts || 0),
                cashCollection: Number(data.cashCollection || 0),
                upiCollection: Number(data.upiCollection || 0),
                chart: Array.isArray(data.chart) ? data.chart : []
            });
        } catch (err) {
            console.error("Dashboard error:", err);
            setError(err.message || "Unable to load dashboard");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboard();
    }, []);

    const cardValues = {
        todayCollection: formatCurrency(dashboard.todayCollection),
        todayReceipts: dashboard.todayReceipts,
        cashCollection: formatCurrency(dashboard.cashCollection),
        upiCollection: formatCurrency(dashboard.upiCollection)
    };

    const chartValues = dashboard.chart.map((item) => Number(item.collection || 0));
    const maxCollection = Math.max(...chartValues, 1);

    // SVG chart geometry. No chart library is required.
    const chartWidth = 760;
    const chartHeight = 270;
    const chartPadX = 34;
    const chartPadY = 28;
    const usableW = chartWidth - chartPadX * 2;
    const usableH = chartHeight - chartPadY * 2;

    const points = dashboard.chart.map((item, index) => {
        const value = Number(item.collection || 0);
        const x =
            dashboard.chart.length <= 1
                ? chartWidth / 2
                : chartPadX + (index / (dashboard.chart.length - 1)) * usableW;
        const y = chartPadY + usableH - (value / maxCollection) * usableH;

        return {
            x,
            y,
            value,
            date: item.date
        };
    });

    const linePoints = points.map((p) => `${p.x},${p.y}`).join(" ");
    const areaPoints =
        points.length > 0
            ? `${chartPadX},${chartHeight - chartPadY} ${linePoints} ${chartWidth - chartPadX},${chartHeight - chartPadY}`
            : "";

    const quickActions = [
        {
            title: "New Receipt",
            subtitle: "Create an offering receipt",
            icon: <ReceiptLongIcon />,
            path: "/billing/new",
            primary: true
        },
        {
            title: "View Receipts",
            subtitle: "Search and view receipts",
            icon: <SearchIcon />,
            path: "/receipts"
        },
        {
            title: "New Donation",
            subtitle: "Record an offline donation",
            icon: <VolunteerActivismIcon />,
            path: "/donations/new"
        },
        {
            title: "View Donations",
            subtitle: "Search donation records",
            icon: <PaymentsIcon />,
            path: "/donations"
        },
		
		...(isAdmin
            ? [
		
        {
            title: "Manage Devotees",
            subtitle: "View and manage devotee records",
            icon: <PeopleAltIcon />,
            path: "/masters/devotees"
        },
        
                {
                    title: "Gallery Management",
                    subtitle: "Manage gallery categories and albums",
                    icon: <PhotoLibraryIcon />,
                    path: "/gallery",
                    adminOnly: true
                }
            ]
            : [])
    ];

    return (
        <Box sx={{ pb: 4 }}>
            {/* Management header */}
            <Box
                sx={{
                    position: "relative",
                    overflow: "hidden",
                    borderRadius: 3,
                    p: { xs: 2.5, md: 3.5 },
                    mb: 2.5,
                    color: "#fff",
                    background:
                        "linear-gradient(135deg, #7f0000 0%, #a90000 48%, #d29b24 100%)",
                    boxShadow: "0 10px 30px rgba(80,0,0,0.20)",
                    "&::after": {
                        content: '""',
                        position: "absolute",
                        width: 260,
                        height: 260,
                        borderRadius: "50%",
                        right: -80,
                        top: -120,
                        background: "rgba(255,255,255,0.09)"
                    }
                }}
            >
                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", sm: "center" }}
                    spacing={2}
                    sx={{ position: "relative", zIndex: 1 }}
                >
                    <Box>
                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 800,
                                letterSpacing: "-0.5px"
                            }}
                        >
                            Temple Management
                        </Typography>

                        <Typography
                            sx={{
                                mt: 0.5,
                                opacity: 0.92,
                                fontSize: { xs: 14, md: 16 }
                            }}
                        >
                            Kannambalath Temple Management
                        </Typography>

                        <Chip
                            label="Management Dashboard"
                            size="small"
                            sx={{
                                mt: 1.5,
                                color: "#fff",
                                borderColor: "rgba(255,255,255,0.45)",
                                background: "rgba(255,255,255,0.12)"
                            }}
                            variant="outlined"
                        />
                    </Box>

                </Stack>
            </Box>

            {error && (
                <Paper
                    sx={{
                        p: 2,
                        mb: 3,
                        borderLeft: "4px solid #b00000"
                    }}
                >
                    <Typography color="error">{error}</Typography>
                </Paper>
            )}

            {/* Quick Actions */}
            <Paper
                sx={{
                    p: { xs: 1.75, md: 2.25 },
                    mb: 2.5,
                    borderRadius: 3,
                    color: "#fff",
                    overflow: "hidden",
                    position: "relative",
                    background:
                        "linear-gradient(145deg, #700000 0%, #a90000 58%, #d09b27 100%)",
                    boxShadow: "0 10px 25px rgba(100,0,0,0.18)",
                    "&::before": {
                        content: '""',
                        position: "absolute",
                        width: 220,
                        height: 220,
                        borderRadius: "50%",
                        right: -90,
                        top: -120,
                        background: "rgba(255,255,255,0.08)"
                    }
                }}
            >
                <Box sx={{ position: "relative", zIndex: 1 }}>
                    <Stack
                        direction={{ xs: "column", sm: "row" }}
                        justifyContent="space-between"
                        alignItems={{ xs: "flex-start", sm: "center" }}
                        sx={{ mb: 1.4 }}
                    >
                        <Box>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 800,
                                    lineHeight: 1.15
                                }}
                            >
                                Quick Actions
                            </Typography>

                            <Typography
                                variant="body2"
                                sx={{
                                    mt: 0.35,
                                    opacity: 0.78
                                }}
                            >
                                Frequently used temple management tasks
                            </Typography>
                        </Box>
                    </Stack>

                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: {
                                xs: "1fr",
                                sm: "repeat(2, minmax(0, 1fr))",
                                md: "repeat(3, minmax(0, 1fr))"
                            },
                            gap: 1.15,
                            width: "100%"
                        }}
                    >
                        {quickActions.map((action) => (
                            <Box
                                key={action.title}
                                onClick={() => {
                                    if (
                                        action.adminOnly &&
                                        !isAdmin
                                    ) {
                                        return;
                                    }

                                    navigate(action.path);
                                }}
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1.25,
                                    minHeight: 62,
                                    width: "100%",
                                    boxSizing: "border-box",
                                    p: 1,
                                    borderRadius: 2,
                                    cursor: "pointer",
                                    background:
                                        action.primary
                                            ? "rgba(255,255,255,0.18)"
                                            : "rgba(255,255,255,0.09)",
                                    border:
                                        "1px solid rgba(255,255,255,0.14)",
                                    backdropFilter: "blur(5px)",
                                    transition:
                                        "all 0.22s ease",
                                    "&:hover": {
                                        transform:
                                            "translateY(-3px)",
                                        background:
                                            "rgba(255,255,255,0.20)",
                                        boxShadow:
                                            "0 7px 18px rgba(0,0,0,0.18)"
                                    }
                                }}
                            >
                                <Box
                                    sx={{
                                        flexShrink: 0,
                                        width: 43,
                                        height: 43,
                                        borderRadius: 2,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        background:
                                            "rgba(255,255,255,0.93)",
                                        color: "#980000"
                                    }}
                                >
                                    {action.icon}
                                </Box>

                                <Box sx={{ minWidth: 0 }}>
                                    <Typography
                                        sx={{
                                            fontWeight: 750,
                                            fontSize: 14.5,
                                            lineHeight: 1.2
                                        }}
                                    >
                                        {action.title}
                                    </Typography>

                                    <Typography
                                        sx={{
                                            mt: 0.25,
                                            fontSize: 11.2,
                                            opacity: 0.74,
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis"
                                        }}
                                    >
                                        {action.subtitle}
                                    </Typography>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </Box>
            </Paper>

            {/* KPI image cards */}
            <Grid container spacing={1.75}>
                {kpiCards.map((card) => (
                    <Grid
                        item
                        xs={12}
                        sm={6}
                        md={3}
                        key={card.key}
                    >
                        <Paper
                            sx={{
                                position: "relative",
                                overflow: "hidden",
                                minHeight: 215,
                                borderRadius: 3,
                                cursor: "default",
                                background: "#fff",
                                boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
                                transition:
                                    "transform 0.28s ease, box-shadow 0.28s ease",
                                "&:hover": {
                                    transform: "translateY(-8px)",
                                    boxShadow:
                                        "0 15px 32px rgba(0,0,0,0.18)",
                                    "& .dashboard-card-image": {
                                        transform: "scale(1.08)"
                                    },
                                    "& .dashboard-card-icon": {
                                        transform: "scale(1.12) rotate(-4deg)"
                                    }
                                }
                            }}
                        >
                            <Box
                                className="dashboard-card-image"
                                component="img"
                                src={card.image}
                                alt=""
                                sx={{
                                    position: "absolute",
                                    inset: 0,
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    transition: "transform 0.5s ease"
                                }}
                            />

                            <Box
                                sx={{
                                    position: "absolute",
                                    inset: 0,
                                    background:
                                        "linear-gradient(180deg, rgba(10,10,10,0.12) 0%, rgba(10,10,10,0.82) 100%)"
                                }}
                            />

                            <Box
                                sx={{
                                    position: "relative",
                                    zIndex: 1,
                                    height: "100%",
                                    minHeight: 215,
                                    p: 2.5,
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "space-between",
                                    color: "#fff"
                                }}
                            >
                                <Stack
                                    direction="row"
                                    justifyContent="space-between"
                                    alignItems="flex-start"
                                >
                                    <Box
                                        className="dashboard-card-icon"
                                        sx={{
                                            width: 50,
                                            height: 50,
                                            borderRadius: "50%",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            background:
                                                "rgba(255,255,255,0.90)",
                                            color: card.accent,
                                            boxShadow:
                                                "0 6px 16px rgba(0,0,0,0.25)",
                                            transition:
                                                "transform 0.28s ease"
                                        }}
                                    >
                                        {card.icon}
                                    </Box>

                                    <Typography
                                        variant="caption"
                                        sx={{
                                            px: 1.2,
                                            py: 0.6,
                                            borderRadius: 5,
                                            background:
                                                "rgba(255,255,255,0.15)",
                                            backdropFilter: "blur(5px)"
                                        }}
                                    >
                                        TODAY
                                    </Typography>
                                </Stack>

                                <Box>
                                    <Typography
                                        sx={{
                                            fontSize: 15,
                                            fontWeight: 600,
                                            opacity: 0.92
                                        }}
                                    >
                                        {card.title}
                                    </Typography>

                                    <Typography
                                        sx={{
                                            mt: 0.4,
                                            fontSize: {
                                                xs: 25,
                                                md: 27
                                            },
                                            fontWeight: 800,
                                            letterSpacing: "0.2px"
                                        }}
                                    >
                                        {loading ? "..." : cardValues[card.key]}
                                    </Typography>
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            <Grid
                container
                spacing={2.5}
                sx={{ mt: 3 }}
            >
                <Grid item xs={12} md={12}>
                    <Paper
                        sx={{
                            p: { xs: 2, md: 3 },
                            borderRadius: 3,
                            minHeight: 450,
                            overflow: "hidden",
                            background:
                                "linear-gradient(145deg, #ffffff 0%, #fffaf0 100%)",
                            boxShadow: "0 5px 20px rgba(0,0,0,0.08)"
                        }}
                    >
                        <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            sx={{ mb: 2 }}
                        >
                            <Box>
                                <Stack
                                    direction="row"
                                    alignItems="center"
                                    spacing={1}
                                >
                                    <Box
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: 2,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            color: "#fff",
                                            background:
                                                "linear-gradient(135deg,#990000,#c79528)"
                                        }}
                                    >
                                        <TrendingUpIcon />
                                    </Box>

                                    <Box>
                                        <Typography
                                            variant="h6"
                                            sx={{ fontWeight: 800 }}
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
                                </Stack>
                            </Box>

                        </Stack>

                        {dashboard.chart.length === 0 ? (
                            <Box
                                sx={{
                                    height: 280,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "text.secondary"
                                }}
                            >
                                <Typography>
                                    No collection data available
                                </Typography>
                            </Box>
                        ) : (
                            <Box
                                sx={{
                                    width: "100%",
                                    overflowX: "auto",
                                    overflowY: "hidden",
                                    pb: 0.5
                                }}
                            >
                                <Box
                                    sx={{
                                        minWidth:
                                            dashboard.chart.length > 5
                                                ? 620
                                                : "100%"
                                    }}
                                >
                                    <svg
                                        viewBox={`0 0 ${chartWidth} 270`}
                                        width="100%"
                                        height="270"
                                        preserveAspectRatio="none"
                                        role="img"
                                        aria-label="Collection summary for the last seven days"
                                        style={{
                                            display: "block"
                                        }}
                                    >
                                        <defs>
                                            <linearGradient
                                                id="collectionArea"
                                                x1="0"
                                                x2="0"
                                                y1="0"
                                                y2="1"
                                            >
                                                <stop
                                                    offset="0%"
                                                    stopColor="#b00000"
                                                    stopOpacity="0.30"
                                                />
                                                <stop
                                                    offset="100%"
                                                    stopColor="#d4a62a"
                                                    stopOpacity="0.04"
                                                />
                                            </linearGradient>

                                            <filter
                                                id="chartShadow"
                                                x="-20%"
                                                y="-20%"
                                                width="140%"
                                                height="140%"
                                            >
                                                <feDropShadow
                                                    dx="0"
                                                    dy="4"
                                                    stdDeviation="4"
                                                    floodOpacity="0.18"
                                                />
                                            </filter>
                                        </defs>

                                        {[0, 0.5, 1].map((ratio) => {
                                            const y =
                                                chartPadY +
                                                usableH -
                                                ratio * usableH;

                                            return (
                                                <g key={ratio}>
                                                    <line
                                                        x1={chartPadX}
                                                        x2={chartWidth - chartPadX}
                                                        y1={y}
                                                        y2={y}
                                                        stroke="#dfd7c4"
                                                        strokeDasharray="4 6"
                                                    />
                                                    <text
                                                        x="2"
                                                        y={y + 4}
                                                        fontSize="13"
                                                        fill="#81796b"
                                                    >
                                                        {formatCurrency(
                                                            maxCollection * ratio
                                                        )}
                                                    </text>
                                                </g>
                                            );
                                        })}

                                        <polygon
                                            points={areaPoints}
                                            fill="url(#collectionArea)"
                                        />

                                        <polyline
                                            points={linePoints}
                                            fill="none"
                                            stroke="#a00000"
                                            strokeWidth="5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            filter="url(#chartShadow)"
                                        />

                                        {points.map((point) => (
                                            <g key={point.date}>
                                                <circle
                                                    cx={point.x}
                                                    cy={point.y}
                                                    r="8"
                                                    fill="#fff"
                                                    stroke="#a00000"
                                                    strokeWidth="4"
                                                />
                                                <title>
                                                    {formatChartDate(point.date)}:{" "}
                                                    {formatCurrency(point.value)}
                                                </title>
                                            </g>
                                        ))}

                                        {/* X-axis date labels rendered inside the SVG */}
                                        {points.map((point) => (
                                            <text
                                                key={`x-date-${point.date}`}
                                                x={point.x}
                                                y={258}
                                                textAnchor="middle"
                                                fontSize="12"
                                                fontWeight="700"
                                                fill="#5f574b"
                                            >
                                                {formatChartDate(point.date) || String(point.date || "").substring(0, 10)}
                                            </text>
                                        ))}
                                    </svg>

                                    {/* Dedicated HTML date row.
                                        Keeping the labels outside the SVG makes them
                                        reliable across browsers and prevents SVG clipping. */}
                                    <Box
                                        sx={{
                                            display: "grid",
                                            gridTemplateColumns: `repeat(${Math.max(
                                                dashboard.chart.length,
                                                1
                                            )}, minmax(0, 1fr))`,
                                            alignItems: "center",
                                            mt: 1.25,
                                            mb: 0.75,
                                            px: 0
                                        }}
                                    >
                                        {dashboard.chart.map((item) => (
                                            <Typography
                                                key={`date-${item.date}`}
                                                variant="caption"
                                                sx={{
                                                    textAlign: "center",
                                                    color: "#5f574b",
                                                    fontWeight: 700,
                                                    fontSize: {
                                                        xs: 10.5,
                                                        sm: 11.5
                                                    },
                                                    lineHeight: 1.2,
                                                    whiteSpace: "nowrap"
                                                }}
                                            >
                                                {formatChartDate(item.date)}
                                            </Typography>
                                        ))}
                                    </Box>
                                </Box>
                            </Box>
                        )}
                    </Paper>
                </Grid>

            </Grid>


        </Box>
    );
}
