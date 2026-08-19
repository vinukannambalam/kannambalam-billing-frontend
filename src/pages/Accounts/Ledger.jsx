import React, { useEffect, useMemo, useState } from "react";
import {
    Alert,
    Autocomplete,
    Box,
    Button,
    Card,
    Divider,
    Grid,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    TextField
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import PrintIcon from "@mui/icons-material/Print";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import { apiFetch } from "../../api/api";

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

export default function Ledger() {
    const [accounts, setAccounts] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [ledger, setLedger] = useState(null);
    const [loadingAccounts, setLoadingAccounts] = useState(true);
    const [loadingLedger, setLoadingLedger] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadAccounts = async () => {
            try {
                setLoadingAccounts(true);
                setError("");

                const response = await apiFetch("/api/accounts");
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.error || "Unable to load accounts"
                    );
                }

                const rows = Array.isArray(data) ? data : [];

                // Ledger must use only active leaf accounts.
                const leafAccounts = rows.filter(
                    (account) =>
                        account.active !== false &&
                        account.is_group !== true
                );

                setAccounts(leafAccounts);
            } catch (err) {
                console.error("Ledger accounts error:", err);
                setError(
                    err.message || "Unable to load accounts"
                );
            } finally {
                setLoadingAccounts(false);
            }
        };

        loadAccounts();
    }, []);

    const loadLedger = async () => {
        setError("");

        if (!selectedAccount) {
            setError("Please select an account.");
            return;
        }

        if (dateFrom && dateTo && dateFrom > dateTo) {
            setError("From Date cannot be later than To Date.");
            return;
        }

        try {
            setLoadingLedger(true);

            const params = new URLSearchParams();

            if (dateFrom) params.set("date_from", dateFrom);
            if (dateTo) params.set("date_to", dateTo);

            const query = params.toString();
            const url =
                `/api/ledger/${selectedAccount.id}` +
                (query ? `?${query}` : "");

            const response = await apiFetch(url);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Unable to load ledger"
                );
            }

            setLedger(data);
        } catch (err) {
            console.error("Ledger error:", err);
            setLedger(null);
            setError(
                err.message || "Unable to load ledger"
            );
        } finally {
            setLoadingLedger(false);
        }
    };

    const reset = () => {
        setSelectedAccount(null);
        setDateFrom("");
        setDateTo("");
        setLedger(null);
        setError("");
    };

    const exportExcel = () => {
        if (!ledger) return;

        const esc = (value) => String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");

        const rows = transactions.map((row) => `
            <tr>
                <td>${esc(formatDate(row.voucher_date))}</td>
                <td>${esc(row.voucher_no)}</td>
                <td>${esc(row.voucher_type_name || row.voucher_type_code || "")}</td>
                <td>${esc(row.description || row.narration || "")}</td>
                <td>${esc(row.narration || "")}</td>
                <td style="text-align:right">${Number(row.debit || 0).toFixed(2)}</td>
                <td style="text-align:right">${Number(row.credit || 0).toFixed(2)}</td>
                <td style="text-align:right">${Number(row.balance || 0).toFixed(2)} ${esc(row.balance_type || "")}</td>
            </tr>
        `).join("");

        const html = `
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    table { border-collapse: collapse; font-family: Arial, sans-serif; }
                    th, td { border: 1px solid #999; padding: 6px 8px; }
                    th { font-weight: bold; background: #f3dede; }
                    .title { font-size: 16px; font-weight: bold; }
                </style>
            </head>
            <body>
                <table>
                    <tr><td class="title" colspan="8">${esc(ledger.account?.account_code)} — ${esc(ledger.account?.account_name)}</td></tr>
                    <tr><td colspan="8">${esc(ledger.account?.account_type || "")}</td></tr>
                    <tr><td colspan="8">Period: ${esc(ledger.period?.date_from ? formatDate(ledger.period.date_from) : "Beginning")} to ${esc(ledger.period?.date_to ? formatDate(ledger.period.date_to) : "Current")}</td></tr>
                    <tr><td colspan="8"></td></tr>
                    <tr>
                        <th>Date</th>
                        <th>Voucher No</th>
                        <th>Voucher Type</th>
                        <th>Particulars</th>
                        <th>Narration</th>
                        <th>Debit</th>
                        <th>Credit</th>
                        <th>Balance</th>
                    </tr>
                    ${rows}
                    <tr>
                        <td colspan="5"><b>Totals</b></td>
                        <td style="text-align:right"><b>${Number(totals.debit).toFixed(2)}</b></td>
                        <td style="text-align:right"><b>${Number(totals.credit).toFixed(2)}</b></td>
                        <td></td>
                    </tr>
                    <tr>
                        <td colspan="7"><b>Opening Balance</b></td>
                        <td style="text-align:right"><b>${Number(ledger.opening?.balance || 0).toFixed(2)} ${esc(ledger.opening?.balance_type || "")}</b></td>
                    </tr>
                    <tr>
                        <td colspan="7"><b>Closing Balance</b></td>
                        <td style="text-align:right"><b>${Number(ledger.closing?.balance || 0).toFixed(2)} ${esc(ledger.closing?.balance_type || "")}</b></td>
                    </tr>
                </table>
            </body>
            </html>
        `;

        const blob = new Blob(["\ufeff", html], {
            type: "application/vnd.ms-excel;charset=utf-8;"
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `Ledger-${ledger.account?.account_code || "Account"}-${dateFrom || "Beginning"}-${dateTo || "Current"}.xls`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const transactions = Array.isArray(ledger?.transactions)
        ? ledger.transactions
        : [];

    const totals = useMemo(() => {
        return {
            debit: Number(ledger?.totals?.debit || 0),
            credit: Number(ledger?.totals?.credit || 0)
        };
    }, [ledger]);

    const printLedger = () => {
        window.print();
    };

    return (
        <Box sx={{ p: { xs: 1.5, sm: 3 } }}>

            {/* ==================================================
                PAGE HEADER
            ================================================== */}
            <Paper
                sx={{
                    p: { xs: 2, sm: 3 },
                    mb: 2
                }}
            >
                <Box>
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 600,
                            fontSize: {
                                xs: "1.6rem",
                                sm: "2.125rem"
                            },
                            color: "#8B0000"
                        }}
                    >
                        Ledger
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                    >
                        View account transactions and running balance
                    </Typography>
                </Box>
            </Paper>

            {error && (
                <Alert
                    severity="error"
                    sx={{ mb: 2 }}
                    onClose={() => setError("")}
                >
                    {error}
                </Alert>
            )}

            {/* ==================================================
                FILTERS
            ================================================== */}
            <Card sx={{ mb: 2 }}>
                <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
                    <Typography
                        variant="subtitle1"
                        fontWeight={700}
                        sx={{ mb: 2 }}
                    >
                        Ledger Selection
                    </Typography>

                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: {
                                xs: "1fr",
                                sm: "minmax(260px, 2fr) minmax(170px, 1fr)",
                                md: "minmax(360px, 5fr) minmax(180px, 2fr) minmax(180px, 2fr) minmax(220px, 3fr)"
                            },
                            gap: 2,
                            alignItems: "end"
                        }}
                    >

                        <Box>
                            <Typography
                                variant="body2"
                                fontWeight={600}
                                sx={{ mb: 0.6 }}
                            >
                                Account
                            </Typography>

                            <Autocomplete
                                fullWidth
                                size="small"
                                options={accounts}
                                value={selectedAccount}
                                loading={loadingAccounts}
                                onChange={(_, value) =>
                                    setSelectedAccount(value)
                                }
                                getOptionLabel={(account) =>
                                    account
                                        ? `${account.account_code} — ${account.account_name}`
                                        : ""
                                }
                                isOptionEqualToValue={(a, b) =>
                                    String(a.id) === String(b.id)
                                }
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        placeholder="Select ledger account"
                                        size="small"
                                        fullWidth
                                    />
                                )}
                            />
                        </Box>

                        <Box>
                            <Typography
                                variant="body2"
                                fontWeight={600}
                                sx={{ mb: 0.6 }}
                            >
                                From Date
                            </Typography>

                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) =>
                                    setDateFrom(e.target.value)
                                }
                                style={{
                                    width: "100%",
                                    height: 40,
                                    padding: "0 12px",
                                    border: "1px solid #bdbdbd",
                                    borderRadius: 4,
                                    fontSize: 14,
                                    boxSizing: "border-box",
                                    fontFamily: "inherit"
                                }}
                            />
                        </Box>

                        <Box>
                            <Typography
                                variant="body2"
                                fontWeight={600}
                                sx={{ mb: 0.6 }}
                            >
                                To Date
                            </Typography>

                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) =>
                                    setDateTo(e.target.value)
                                }
                                style={{
                                    width: "100%",
                                    height: 40,
                                    padding: "0 12px",
                                    border: "1px solid #bdbdbd",
                                    borderRadius: 4,
                                    fontSize: 14,
                                    boxSizing: "border-box",
                                    fontFamily: "inherit"
                                }}
                            />
                        </Box>

                        <Box>
                            <Box
                                sx={{
                                    display: "flex",
                                    gap: 1,
                                    width: "100%",
                                    alignItems: "center",
                                    justifyContent: {
                                        xs: "flex-start",
                                        md: "flex-start"
                                    }
                                }}
                            >
                                <Button
                                    variant="contained"
                                    startIcon={<SearchIcon />}
                                    disabled={loadingLedger}
                                    onClick={loadLedger}
                                    sx={{
                                        backgroundColor: "#8B0000",
                                        "&:hover": {
                                            backgroundColor: "#700000"
                                        }
                                    }}
                                >
                                    View Ledger
                                </Button>

                                <Button
                                    variant="outlined"
                                    startIcon={<RestartAltIcon />}
                                    onClick={reset}
                                >
                                    Reset
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Card>

            {/* ==================================================
                LEDGER RESULT
            ================================================== */}
            {ledger && (
                <Card id="ledger-print-area">

                    <Box
                        sx={{
                            p: { xs: 2, sm: 2.5 },
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            gap: 2
                        }}
                    >
                        <Box>
                            <Typography
                                variant="h6"
                                fontWeight={800}
                                sx={{
                                    color: "#8B0000"
                                }}
                            >
                                {ledger.account?.account_code} —{" "}
                                {ledger.account?.account_name}
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mt: 0.4 }}
                            >
                                {ledger.account?.account_type}
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                Period:{" "}
                                {ledger.period?.date_from
                                    ? formatDate(
                                          ledger.period.date_from
                                      )
                                    : "Beginning"}{" "}
                                to{" "}
                                {ledger.period?.date_to
                                    ? formatDate(
                                          ledger.period.date_to
                                      )
                                    : "Current"}
                            </Typography>
                        </Box>

                        <Stack direction="row" spacing={1}>
                            <Button
                                variant="outlined"
                                startIcon={<FileDownloadIcon />}
                                onClick={exportExcel}
                                className="ledger-excel-button"
                            >
                                Excel
                            </Button>

                            <Button
                                variant="outlined"
                                startIcon={<PrintIcon />}
                                onClick={printLedger}
                                className="ledger-print-button"
                            >
                                Print
                            </Button>
                        </Stack>
                    </Box>

                    <Divider />

                    {/* SUMMARY */}
                    <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
                        <Grid container spacing={2}>

                            <Grid item xs={12} sm={4}>
                                <Paper
                                    variant="outlined"
                                    sx={{
                                        p: 1.5,
                                        backgroundColor: "#FFF8F8"
                                    }}
                                >
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        Opening Balance
                                    </Typography>

                                    <Typography fontWeight={800}>
                                        ₹{formatAmount(
                                            ledger.opening?.balance
                                        )}{" "}
                                        {ledger.opening?.balance_type ||
                                            ""}
                                    </Typography>
                                </Paper>
                            </Grid>

                            <Grid item xs={12} sm={4}>
                                <Paper
                                    variant="outlined"
                                    sx={{
                                        p: 1.5,
                                        backgroundColor: "#FFF8F8"
                                    }}
                                >
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        Total Debit
                                    </Typography>

                                    <Typography fontWeight={800}>
                                        ₹{formatAmount(
                                            totals.debit
                                        )}
                                    </Typography>
                                </Paper>
                            </Grid>

                            <Grid item xs={12} sm={4}>
                                <Paper
                                    variant="outlined"
                                    sx={{
                                        p: 1.5,
                                        backgroundColor: "#FFF8F8"
                                    }}
                                >
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        Total Credit
                                    </Typography>

                                    <Typography fontWeight={800}>
                                        ₹{formatAmount(
                                            totals.credit
                                        )}
                                    </Typography>
                                </Paper>
                            </Grid>

                        </Grid>
                    </Box>

                    <Divider />

                    <TableContainer
                        sx={{
                            overflowX: "auto"
                        }}
                    >
                        <Table
                            size="small"
                            sx={{ minWidth: 900 }}
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
                                            width: 110
                                        }}
                                    >
                                        Date
                                    </TableCell>

                                    <TableCell
                                        sx={{
                                            fontWeight: 700,
                                            color: "#8B0000",
                                            width: 145
                                        }}
                                    >
                                        Voucher
                                    </TableCell>

                                    <TableCell
                                        sx={{
                                            fontWeight: 700,
                                            color: "#8B0000"
                                        }}
                                    >
                                        Particulars
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
                                        align="right"
                                        sx={{
                                            fontWeight: 700,
                                            color: "#8B0000",
                                            width: 145
                                        }}
                                    >
                                        Balance
                                    </TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {transactions.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            align="center"
                                            sx={{ py: 5 }}
                                        >
                                            <Typography color="text.secondary">
                                                No transactions found for this account.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    transactions.map((row) => (
                                        <TableRow
                                            key={row.voucher_item_id}
                                            hover
                                        >
                                            <TableCell sx={{ whiteSpace: "nowrap" }}>
                                                {formatDate(
                                                    row.voucher_date
                                                )}
                                            </TableCell>

                                            <TableCell>
                                                <Typography
                                                    sx={{
                                                        fontWeight: 800,
                                                        color: "#8B0000",
                                                        fontFamily: "monospace"
                                                    }}
                                                >
                                                    {row.voucher_no}
                                                </Typography>

                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                >
                                                    {row.voucher_type_name ||
                                                        row.voucher_type_code ||
                                                        ""}
                                                </Typography>
                                            </TableCell>

                                            <TableCell>
                                                <Typography fontWeight={600}>
                                                    {row.description ||
                                                        row.narration ||
                                                        "—"}
                                                </Typography>

                                                {row.description &&
                                                    row.narration && (
                                                        <Typography
                                                            variant="caption"
                                                            color="text.secondary"
                                                        >
                                                            {row.narration}
                                                        </Typography>
                                                    )}
                                            </TableCell>

                                            <TableCell align="right">
                                                {Number(row.debit || 0) > 0
                                                    ? `₹${formatAmount(
                                                          row.debit
                                                      )}`
                                                    : "—"}
                                            </TableCell>

                                            <TableCell align="right">
                                                {Number(row.credit || 0) > 0
                                                    ? `₹${formatAmount(
                                                          row.credit
                                                      )}`
                                                    : "—"}
                                            </TableCell>

                                            <TableCell align="right">
                                                <Typography fontWeight={700}>
                                                    ₹{formatAmount(
                                                        row.balance
                                                    )}{" "}
                                                    {row.balance_type || ""}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Divider />

                    {/* CLOSING */}
                    <Box
                        sx={{
                            p: { xs: 2, sm: 2.5 },
                            display: "flex",
                            justifyContent: "flex-end"
                        }}
                    >
                        <Paper
                            variant="outlined"
                            sx={{
                                p: 1.8,
                                minWidth: { xs: "100%", sm: 260 },
                                backgroundColor: "#FFF8F8"
                            }}
                        >
                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                Closing Balance
                            </Typography>

                            <Typography
                                variant="h6"
                                fontWeight={800}
                                sx={{ color: "#8B0000" }}
                            >
                                ₹{formatAmount(
                                    ledger.closing?.balance
                                )}{" "}
                                {ledger.closing?.balance_type || ""}
                            </Typography>

                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                {ledger.transaction_count || 0} transaction
                                {(ledger.transaction_count || 0) === 1 ? "" : "s"}
                            </Typography>
                        </Paper>
                    </Box>

                    <style>
                        {`
                            @media print {
                                body * {
                                    visibility: hidden;
                                }

                                #ledger-print-area,
                                #ledger-print-area * {
                                    visibility: visible;
                                }

                                #ledger-print-area {
                                    position: absolute;
                                    left: 0;
                                    top: 0;
                                    width: 100%;
                                    box-shadow: none !important;
                                }

                                .ledger-print-button,
                                .ledger-excel-button {
                                    display: none !important;
                                }
                            }
                        `}
                    </style>
                </Card>
            )}
        </Box>
    );
}

