import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Divider,
    Grid,
    IconButton,
    MenuItem,
    Pagination,
    Paper,
    Select,
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
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PrintIcon from "@mui/icons-material/Print";
import Tooltip from "@mui/material/Tooltip";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../api/api";

const statusColor = (status) => {
    if (status === "POSTED") return "success";
    if (status === "CANCELLED") return "error";
    return "warning";
};

const formatDate = (value) => {
    if (!value) return "";
    const parts = String(value).substring(0, 10).split("-");
    if (parts.length !== 3) return "";
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
};

const formatAmount = (value) =>
    Number(value || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

export default function VoucherList() {
    const navigate = useNavigate();

    const [filters, setFilters] = useState({
        date_from: "",
        date_to: "",
        status: "",
        search: ""
    });

    const [vouchers, setVouchers] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const limit = 20;

    const loadVouchers = async (requestedPage = 1, suppliedFilters = filters) => {
        try {
            setLoading(true);
            setError("");

            const params = new URLSearchParams();

            if (suppliedFilters.date_from) {
                params.set("date_from", suppliedFilters.date_from);
            }

            if (suppliedFilters.date_to) {
                params.set("date_to", suppliedFilters.date_to);
            }

            if (suppliedFilters.status) {
                params.set("status", suppliedFilters.status);
            }

            if (suppliedFilters.search.trim()) {
                params.set("search", suppliedFilters.search.trim());
            }

            params.set("limit", String(limit));
            params.set("offset", String((requestedPage - 1) * limit));

            const response = await apiFetch(
                `/api/vouchers?${params.toString()}`
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Failed to retrieve vouchers"
                );
            }

            setVouchers(Array.isArray(data.vouchers) ? data.vouchers : []);
            setTotal(Number(data.total || 0));
            setPage(requestedPage);
        }
        catch (err) {
            console.error("Voucher list error:", err);
            setError(
                err.message || "Unable to retrieve vouchers"
            );
            setVouchers([]);
            setTotal(0);
        }
        finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadVouchers(1);
        // Initial load only.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const resetFilters = () => {
        const cleared = {
            date_from: "",
            date_to: "",
            status: "",
            search: ""
        };

        setFilters(cleared);
        loadVouchers(1, cleared);
    };

    const pageCount = Math.max(
        1,
        Math.ceil(total / limit)
    );

    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>

            {/* ==================================================
                PAGE HEADER
            ================================================== */}
            <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "stretch", sm: "center" }}
                spacing={2}
                sx={{ mb: 2.5 }}
            >
                <Box>
                    <Typography
                        variant="h5"
                        fontWeight={700}
                        sx={{ color: "#8B0000" }}
                    >
                        Vouchers
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                    >
                        View and search accounting vouchers
                    </Typography>
                </Box>

                <Button
                    variant="contained"
                    startIcon={<RefreshIcon />}
                    onClick={() => loadVouchers(page)}
                    sx={{
                        backgroundColor: "#8B0000",
                        "&:hover": {
                            backgroundColor: "#700000"
                        }
                    }}
                >
                    Refresh
                </Button>
            </Stack>

            {/* ==================================================
                SEARCH PANEL
            ================================================== */}
            <Card sx={{ mb: 2.5 }}>
                <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>

                    <Typography
                        variant="subtitle1"
                        fontWeight={700}
                        sx={{ mb: 2 }}
                    >
                        Search Vouchers
                    </Typography>

                    <Grid container spacing={2}>

                        <Grid item xs={12} sm={6} md={2.2}>
                            <Typography
                                variant="body2"
                                fontWeight={600}
                                sx={{ mb: 0.6 }}
                            >
                                Date From
                            </Typography>

                            <TextField
                                fullWidth
                                size="small"
                                type="date"
                                value={filters.date_from}
                                onChange={(e) =>
                                    setFilters((f) => ({
                                        ...f,
                                        date_from: e.target.value
                                    }))
                                }
                                inputProps={{
                                    "aria-label": "Date From"
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6} md={2.2}>
                            <Typography
                                variant="body2"
                                fontWeight={600}
                                sx={{ mb: 0.6 }}
                            >
                                Date To
                            </Typography>

                            <TextField
                                fullWidth
                                size="small"
                                type="date"
                                value={filters.date_to}
                                onChange={(e) =>
                                    setFilters((f) => ({
                                        ...f,
                                        date_to: e.target.value
                                    }))
                                }
                                inputProps={{
                                    "aria-label": "Date To"
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6} md={1.8}>
                            <Typography
                                variant="body2"
                                fontWeight={600}
                                sx={{ mb: 0.6 }}
                            >
                                Status
                            </Typography>

                            <Select
                                fullWidth
                                size="small"
                                displayEmpty
                                value={filters.status}
                                onChange={(e) =>
                                    setFilters((f) => ({
                                        ...f,
                                        status: e.target.value
                                    }))
                                }
                            >
                                <MenuItem value="">
                                    All Statuses
                                </MenuItem>
                                <MenuItem value="DRAFT">
                                    Draft
                                </MenuItem>
                                <MenuItem value="POSTED">
                                    Posted
                                </MenuItem>
                                <MenuItem value="CANCELLED">
                                    Cancelled
                                </MenuItem>
                            </Select>
                        </Grid>

                        <Grid item xs={12} sm={6} md={3.0}>
                            <Typography
                                variant="body2"
                                fontWeight={600}
                                sx={{ mb: 0.6 }}
                            >
                                Search
                            </Typography>

                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Voucher No or Narration"
                                value={filters.search}
                                onChange={(e) =>
                                    setFilters((f) => ({
                                        ...f,
                                        search: e.target.value
                                    }))
                                }
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        loadVouchers(1);
                                    }
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} md={2.8}>
                            <Box
                                sx={{
                                    height: "100%",
                                    display: "flex",
                                    alignItems: "flex-end"
                                }}
                            >
                                <Stack
                                    direction="row"
                                    spacing={1.2}
                                    sx={{ width: "100%" }}
                                >
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        startIcon={<SearchIcon />}
                                        onClick={() => loadVouchers(1)}
                                        sx={{
                                            backgroundColor: "#8B0000",
                                            "&:hover": {
                                                backgroundColor: "#700000"
                                            }
                                        }}
                                    >
                                        Search
                                    </Button>

                                    <Button
                                        variant="outlined"
                                        color="error"
                                        onClick={resetFilters}
                                    >
                                        Reset
                                    </Button>
                                </Stack>
                            </Box>
                        </Grid>

                    </Grid>
                </CardContent>
            </Card>

            {error && (
                <Paper
                    sx={{
                        p: 1.8,
                        mb: 2,
                        border: "1px solid",
                        borderColor: "error.light",
                        backgroundColor: "#fff8f8"
                    }}
                >
                    <Typography color="error">
                        {error}
                    </Typography>
                </Paper>
            )}

            {/* ==================================================
                VOUCHER TABLE
            ================================================== */}
            <Card>
                <Box
                    sx={{
                        px: 2,
                        py: 1.6,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between"
                    }}
                >
                    <Typography
                        variant="subtitle1"
                        fontWeight={700}
                    >
                        Voucher List
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                    >
                        {total} voucher{total === 1 ? "" : "s"}
                    </Typography>
                </Box>

                <Divider />

                <TableContainer
                    sx={{
                        overflowX: "auto"
                    }}
                >
                    <Table
                        size="small"
                        sx={{
                            minWidth: 1040
                        }}
                    >
                        <TableHead>
                            <TableRow
                                sx={{
                                    backgroundColor: "#FFF3F3"
                                }}
                            >
                                <TableCell
                                    sx={{
                                        fontWeight: 700,
                                        color: "#8B0000",
                                        width: 150
                                    }}
                                >
                                    Voucher No
                                </TableCell>

                                <TableCell
                                    sx={{
                                        fontWeight: 700,
                                        color: "#8B0000",
                                        width: 135,
                                        whiteSpace: "nowrap"
                                    }}
                                >
                                    Date
                                </TableCell>

                                <TableCell
                                    sx={{
                                        fontWeight: 700,
                                        color: "#8B0000",
                                        width: 150
                                    }}
                                >
                                    Type
                                </TableCell>

                                <TableCell
                                    sx={{
                                        fontWeight: 700,
                                        color: "#8B0000"
                                    }}
                                >
                                    Narration
                                </TableCell>

                                <TableCell
                                    align="right"
                                    sx={{
                                        fontWeight: 700,
                                        color: "#8B0000",
                                        width: 130
                                    }}
                                >
                                    Debit
                                </TableCell>

                                <TableCell
                                    align="right"
                                    sx={{
                                        fontWeight: 700,
                                        color: "#8B0000",
                                        width: 130
                                    }}
                                >
                                    Credit
                                </TableCell>

                                <TableCell
                                    sx={{
                                        fontWeight: 700,
                                        color: "#8B0000",
                                        width: 120
                                    }}
                                >
                                    Status
                                </TableCell>

                                <TableCell
                                    align="center"
                                    sx={{
                                        fontWeight: 700,
                                        color: "#8B0000",
                                        width: 115
                                    }}
                                >
                                    Actions
                                </TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>

                            {loading ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={8}
                                        align="center"
                                        sx={{ py: 6 }}
                                    >
                                        <CircularProgress
                                            size={30}
                                            sx={{ color: "#8B0000" }}
                                        />
                                    </TableCell>
                                </TableRow>
                            ) : vouchers.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={8}
                                        align="center"
                                        sx={{ py: 6 }}
                                    >
                                        <Typography
                                            color="text.secondary"
                                        >
                                            No vouchers found
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                vouchers.map((voucher) => (
                                    <TableRow
                                        key={voucher.id}
                                        hover
                                        onClick={() =>
                                            navigate(
                                                `/accounts/vouchers/${voucher.id}`
                                            )
                                        }
                                        sx={{
                                            cursor: "pointer",
                                            "&:hover": {
                                                backgroundColor:
                                                    "#FFF8F8"
                                            }
                                        }}
                                    >
                                        <TableCell>
                                            <Box
                                                sx={{
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    px: 1.2,
                                                    py: 0.55,
                                                    borderRadius: 1,
                                                    backgroundColor: "#FFF3F3",
                                                    border: "1px solid #F0D0D0"
                                                }}
                                            >
                                                <Typography
                                                    sx={{
                                                        fontWeight: 800,
                                                        color: "#8B0000",
                                                        fontFamily:
                                                            "monospace",
                                                        letterSpacing: 0.3
                                                    }}
                                                >
                                                    {voucher.voucher_no}
                                                </Typography>
                                            </Box>
                                        </TableCell>

                                        <TableCell
                                            sx={{
                                                whiteSpace: "nowrap",
                                                fontVariantNumeric: "tabular-nums"
                                            }}
                                        >
                                            {formatDate(
                                                voucher.voucher_date
                                            )}
                                        </TableCell>

                                        <TableCell>
                                            {voucher.voucher_type_name ||
                                                voucher.voucher_type_code ||
                                                "—"}
                                        </TableCell>

                                        <TableCell
                                            sx={{
                                                maxWidth: 300,
                                                whiteSpace: "nowrap",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis"
                                            }}
                                        >
                                            {voucher.narration || "—"}
                                        </TableCell>

                                        <TableCell align="right">
                                            ₹{formatAmount(
                                                voucher.total_debit
                                            )}
                                        </TableCell>

                                        <TableCell align="right">
                                            ₹{formatAmount(
                                                voucher.total_credit
                                            )}
                                        </TableCell>

                                        <TableCell>
                                            <Chip
                                                size="small"
                                                label={voucher.status}
                                                color={statusColor(
                                                    voucher.status
                                                )}
                                                sx={{
                                                    fontWeight: 700
                                                }}
                                            />
                                        </TableCell>

                                        <TableCell align="center">
                                            <Stack
                                                direction="row"
                                                spacing={0.4}
                                                justifyContent="center"
                                            >
                                                <Tooltip title="View voucher">
                                                    <IconButton
                                                        size="small"
                                                        sx={{ color: "#8B0000" }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();

                                                            navigate(
                                                                `/accounts/vouchers/${voucher.id}`
                                                            );
                                                        }}
                                                    >
                                                        <VisibilityIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Print voucher">
                                                    <IconButton
                                                        size="small"
                                                        sx={{ color: "#555" }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();

                                                            window.open(
                                                                `/accounts/vouchers/${voucher.id}?print=1`,
                                                                "_blank",
                                                                "noopener,noreferrer"
                                                            );
                                                        }}
                                                    >
                                                        <PrintIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}

                        </TableBody>
                    </Table>
                </TableContainer>

                {pageCount > 1 && (
                    <>
                        <Divider />

                        <Stack
                            alignItems="center"
                            sx={{ py: 2 }}
                        >
                            <Pagination
                                count={pageCount}
                                page={page}
                                onChange={(_, value) =>
                                    loadVouchers(value)
                                }
                                color="primary"
                            />
                        </Stack>
                    </>
                )}
            </Card>
        </Box>
    );
}
