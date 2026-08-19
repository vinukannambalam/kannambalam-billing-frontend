import React, { useEffect, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Divider,
    Grid,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CancelIcon from "@mui/icons-material/Cancel";
import PostAddIcon from "@mui/icons-material/PostAdd";
import PrintIcon from "@mui/icons-material/Print";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
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

const formatDateTime = (value) => {
    if (!value) return "—";

    return new Date(value).toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
};

const formatAmount = (value) =>
    Number(value || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

const getCurrentUser = () => {
    try {
        return JSON.parse(
            localStorage.getItem("billing_user") || "null"
        );
    }
    catch {
        return null;
    }
};

export default function VoucherView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const printRequested = searchParams.get("print") === "1";

    const [voucher, setVoucher] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionError, setActionError] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    const user = getCurrentUser();

    const userRole =
        String(user?.role || "")
            .trim()
            .toLowerCase();

    const isAdmin =
        userRole === "admin" ||
        userRole === "administrator";

    const loadVoucher = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await apiFetch(
                `/api/vouchers/${id}`
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Failed to retrieve voucher"
                );
            }

            setVoucher(data.voucher || null);
            setItems(
                Array.isArray(data.items)
                    ? data.items
                    : []
            );
        }
        catch (err) {
            console.error(
                "Voucher view error:",
                err
            );

            setError(
                err.message ||
                "Unable to retrieve voucher"
            );
        }
        finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadVoucher();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    useEffect(() => {
        if (
            printRequested &&
            !loading &&
            voucher
        ) {
            const timer = window.setTimeout(() => {
                window.print();
            }, 350);

            return () => window.clearTimeout(timer);
        }
    }, [printRequested, loading, voucher]);

    const postVoucher = async () => {
        if (
            !window.confirm(
                "Post this draft voucher?"
            )
        ) {
            return;
        }

        try {
            setActionLoading(true);
            setActionError("");

            const response = await apiFetch(
                `/api/vouchers/${id}/post`,
                {
                    method: "POST"
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Failed to post voucher"
                );
            }

            await loadVoucher();
        }
        catch (err) {
            console.error(
                "Post voucher error:",
                err
            );

            setActionError(
                err.message ||
                "Unable to post voucher"
            );
        }
        finally {
            setActionLoading(false);
        }
    };

    const cancelVoucher = async () => {
        const reason =
            window.prompt(
                "Enter the reason for cancelling this voucher:"
            );

        if (!reason || !reason.trim()) {
            return;
        }

        try {
            setActionLoading(true);
            setActionError("");

            const response = await apiFetch(
                `/api/vouchers/${id}/cancel`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify({
                        reason: reason.trim()
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Failed to cancel voucher"
                );
            }

            await loadVoucher();
        }
        catch (err) {
            console.error(
                "Cancel voucher error:",
                err
            );

            setActionError(
                err.message ||
                "Unable to cancel voucher"
            );
        }
        finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <Box
                sx={{
                    minHeight: "50vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }}
            >
                <CircularProgress
                    sx={{ color: "#8B0000" }}
                />
            </Box>
        );
    }

    if (error) {
        return (
            <Box
                sx={{
                    p: { xs: 2, md: 3 }
                }}
            >
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() =>
                        navigate(
                            "/accounts/vouchers"
                        )
                    }
                    sx={{ mb: 2 }}
                >
                    Back to Vouchers
                </Button>

                <Alert severity="error">
                    {error}
                </Alert>
            </Box>
        );
    }

    if (!voucher) {
        return null;
    }

    return (
        <>
            <style>{`
                @media print {
                    .no-print {
                        display: none !important;
                    }

                    body {
                        background: #fff !important;
                    }

                    .MuiDrawer-root,
                    .MuiAppBar-root {
                        display: none !important;
                    }

                    @page {
                        margin: 12mm;
                    }
                }
            `}</style>

            <Box
            sx={{
                p: { xs: 2, md: 3 }
            }}
        >

            {/* ==================================================
                PAGE HEADER
            ================================================== */}
            <Stack
                direction={{
                    xs: "column",
                    sm: "row"
                }}
                justifyContent="space-between"
                alignItems={{
                    xs: "stretch",
                    sm: "center"
                }}
                spacing={2}
                sx={{ mb: 2.5 }}
            >
                <Box>
                    <Button
                        startIcon={
                            <ArrowBackIcon />
                        }
                        onClick={() =>
                            navigate(
                                "/accounts/vouchers"
                            )
                        }
                        sx={{
                            color: "#8B0000",
                            px: 0,
                            mb: 0.5
                        }}
                    >
                        Back to Vouchers
                    </Button>

                    <Stack
                        direction="row"
                        spacing={1.2}
                        alignItems="center"
                        flexWrap="wrap"
                    >
                        <Typography
                            variant="h5"
                            fontWeight={800}
                            sx={{
                                color: "#8B0000",
                                fontFamily:
                                    "monospace"
                            }}
                        >
                            {voucher.voucher_no}
                        </Typography>

                        <Chip
                            label={voucher.status}
                            color={statusColor(
                                voucher.status
                            )}
                            size="small"
                            sx={{
                                fontWeight: 700
                            }}
                        />
                    </Stack>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                    >
                        {voucher.voucher_type_name ||
                            voucher.voucher_type_code ||
                            "Voucher"}
                    </Typography>
                </Box>

                <Stack
                    direction="row"
                    spacing={1}
                    className="no-print"
                >
                    <Button
                        variant="outlined"
                        startIcon={<PrintIcon />}
                        onClick={() => window.print()}
                    >
                        Print
                    </Button>

                    {isAdmin &&
                        voucher.status ===
                            "DRAFT" && (
                            <Button
                                variant="contained"
                                color="success"
                                startIcon={
                                    <PostAddIcon />
                                }
                                disabled={
                                    actionLoading
                                }
                                onClick={
                                    postVoucher
                                }
                            >
                                Post Voucher
                            </Button>
                        )}

                    {isAdmin &&
                        voucher.status ===
                            "POSTED" && (
                            <Button
                                variant="outlined"
                                color="error"
                                startIcon={
                                    <CancelIcon />
                                }
                                disabled={
                                    actionLoading
                                }
                                onClick={
                                    cancelVoucher
                                }
                            >
                                Cancel Voucher
                            </Button>
                        )}
                </Stack>
            </Stack>

            {actionError && (
                <Alert
                    severity="error"
                    sx={{ mb: 2.5 }}
                >
                    {actionError}
                </Alert>
            )}

            {/* ==================================================
                VOUCHER HEADER
            ================================================== */}
            <Card sx={{ mb: 2.5 }}>
                <CardContent>
                    <Grid container spacing={2.5}>

                        <Grid item xs={12} sm={6} md={3}>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                Voucher Date
                            </Typography>

                            <Typography
                                fontWeight={700}
                            >
                                {formatDate(
                                    voucher.voucher_date
                                )}
                            </Typography>
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                Voucher Type
                            </Typography>

                            <Typography
                                fontWeight={700}
                            >
                                {voucher.voucher_type_name ||
                                    voucher.voucher_type_code ||
                                    "—"}
                            </Typography>
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                Created By
                            </Typography>

                            <Typography
                                fontWeight={700}
                            >
                                {voucher.created_by_name ||
                                    voucher.created_by_username ||
                                    voucher.created_by ||
                                    "—"}
                            </Typography>
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                Total
                            </Typography>

                            <Typography
                                fontWeight={800}
                                sx={{
                                    color: "#8B0000"
                                }}
                            >
                                ₹{formatAmount(
                                    voucher.total_debit
                                )}
                            </Typography>
                        </Grid>

                        <Grid item xs={12}>
                            <Divider />
                        </Grid>

                        <Grid item xs={12}>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                Narration
                            </Typography>

                            <Typography>
                                {voucher.narration ||
                                    "—"}
                            </Typography>
                        </Grid>

                    </Grid>
                </CardContent>
            </Card>

            {/* ==================================================
                VOUCHER ENTRIES
            ================================================== */}
            <Card sx={{ mb: 2.5 }}>
                <Box sx={{ p: 2 }}>
                    <Typography
                        variant="subtitle1"
                        fontWeight={700}
                    >
                        Voucher Entries
                    </Typography>
                </Box>

                <Divider />

                <Box
                    sx={{
                        overflowX: "auto"
                    }}
                >
                    <Table
                        size="small"
                        sx={{
                            minWidth: 850
                        }}
                    >
                        <TableHead>
                            <TableRow
                                sx={{
                                    backgroundColor:
                                        "#FFF3F3"
                                }}
                            >
                                <TableCell
                                    sx={{
                                        fontWeight: 700,
                                        color: "#8B0000",
                                        width: 65
                                    }}
                                >
                                    Line
                                </TableCell>

                                <TableCell
                                    sx={{
                                        fontWeight: 700,
                                        color: "#8B0000"
                                    }}
                                >
                                    Account
                                </TableCell>

                                <TableCell
                                    sx={{
                                        fontWeight: 700,
                                        color: "#8B0000"
                                    }}
                                >
                                    Cost Centre
                                </TableCell>

                                <TableCell
                                    sx={{
                                        fontWeight: 700,
                                        color: "#8B0000"
                                    }}
                                >
                                    Description
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
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {items.map((item) => (
                                <TableRow
                                    key={item.id}
                                >
                                    <TableCell>
                                        {item.line_no}
                                    </TableCell>

                                    <TableCell>
                                        <Typography
                                            fontWeight={700}
                                        >
                                            {item.account_code} —{" "}
                                            {item.account_name}
                                        </Typography>

                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            {item.account_type}
                                        </Typography>
                                    </TableCell>

                                    <TableCell>
                                        {item.cost_center_code
                                            ? `${item.cost_center_code} — ${item.cost_center_name}`
                                            : "—"}
                                    </TableCell>

                                    <TableCell>
                                        {item.description ||
                                            "—"}
                                    </TableCell>

                                    <TableCell
                                        align="right"
                                    >
                                        {Number(
                                            item.debit || 0
                                        ) > 0
                                            ? `₹${formatAmount(
                                                  item.debit
                                              )}`
                                            : "—"}
                                    </TableCell>

                                    <TableCell
                                        align="right"
                                    >
                                        {Number(
                                            item.credit || 0
                                        ) > 0
                                            ? `₹${formatAmount(
                                                  item.credit
                                              )}`
                                            : "—"}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Box>

                <Divider />

                <Box sx={{ p: 2 }}>
                    <Grid
                        container
                        spacing={2}
                        justifyContent="flex-end"
                    >
                        <Grid
                            item
                            xs={12}
                            sm={4}
                            md={2.5}
                        >
                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 1.5,
                                    backgroundColor:
                                        "#FFF8F8"
                                }}
                            >
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    Total Debit
                                </Typography>

                                <Typography
                                    fontWeight={800}
                                >
                                    ₹{formatAmount(
                                        voucher.total_debit
                                    )}
                                </Typography>
                            </Paper>
                        </Grid>

                        <Grid
                            item
                            xs={12}
                            sm={4}
                            md={2.5}
                        >
                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 1.5,
                                    backgroundColor:
                                        "#FFF8F8"
                                }}
                            >
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    Total Credit
                                </Typography>

                                <Typography
                                    fontWeight={800}
                                >
                                    ₹{formatAmount(
                                        voucher.total_credit
                                    )}
                                </Typography>
                            </Paper>
                        </Grid>
                    </Grid>
                </Box>
            </Card>

            {/* ==================================================
                AUDIT INFORMATION
            ================================================== */}
            {voucher.posted_at && (
                <Card sx={{ mb: 2.5 }}>
                    <CardContent>
                        <Typography
                            variant="subtitle2"
                            fontWeight={800}
                            sx={{ mb: 0.8 }}
                        >
                            Posting Information
                        </Typography>

                        <Typography variant="body2">
                            Posted by:{" "}
                            {voucher.posted_by_name ||
                                voucher.posted_by ||
                                "—"}
                        </Typography>

                        <Typography variant="body2">
                            Posted at:{" "}
                            {formatDateTime(
                                voucher.posted_at
                            )}
                        </Typography>
                    </CardContent>
                </Card>
            )}

            {voucher.status === "CANCELLED" && (
                <Card>
                    <CardContent>
                        <Typography
                            variant="subtitle2"
                            fontWeight={800}
                            color="error.main"
                            sx={{ mb: 0.8 }}
                        >
                            Cancellation Information
                        </Typography>

                        <Typography variant="body2">
                            Cancelled by:{" "}
                            {voucher.cancelled_by_name ||
                                voucher.cancelled_by ||
                                "—"}
                        </Typography>

                        <Typography variant="body2">
                            Cancelled at:{" "}
                            {formatDateTime(
                                voucher.cancelled_at
                            )}
                        </Typography>

                        <Typography variant="body2">
                            Reason:{" "}
                            {voucher.cancellation_reason ||
                                "—"}
                        </Typography>
                    </CardContent>
                </Card>
            )}
        </Box>
        </>
    );
}
