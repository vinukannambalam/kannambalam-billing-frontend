import React, { useEffect, useMemo, useState } from "react";
import {
    Alert,
    Autocomplete,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Divider,
    Grid,
    IconButton,
    MenuItem,
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
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import SendIcon from "@mui/icons-material/Send";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../api/api";

const today = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const newLine = (n) => ({
    line_no: n,
    account_id: "",
    cost_center_id: "",
    description: "",
    debit: "",
    credit: ""
});

const money = (v) => Number(v || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
});

export default function JournalVoucher() {
    const navigate = useNavigate();

    const [voucherTypes, setVoucherTypes] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [costCenters, setCostCenters] = useState([]);
    const [voucherTypeId, setVoucherTypeId] = useState("");
    const [voucherDate, setVoucherDate] = useState(today());
    const [narration, setNarration] = useState("");
    const [lines, setLines] = useState([newLine(1), newLine(2)]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const load = async () => {
            try {
                const r = await apiFetch("/api/vouchers/masters");
                const data = await r.json();
                if (!r.ok) throw new Error(data.error || "Unable to load voucher masters");

                const types = Array.isArray(data.voucher_types) ? data.voucher_types : [];
                setVoucherTypes(types);
                setAccounts(Array.isArray(data.accounts) ? data.accounts : []);
                setCostCenters(Array.isArray(data.cost_centers) ? data.cost_centers : []);

                const jv = types.find(x => String(x.code).toUpperCase() === "JV");
                if (jv) setVoucherTypeId(String(jv.id));
                else setError("Journal Voucher type (JV) is not configured.");
            } catch (e) {
                console.error(e);
                setError(e.message || "Unable to load voucher masters");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const totals = useMemo(() => {
        const debit = lines.reduce((s, x) => s + Number(x.debit || 0), 0);
        const credit = lines.reduce((s, x) => s + Number(x.credit || 0), 0);
        return { debit, credit, difference: debit - credit };
    }, [lines]);

    const balanced = totals.debit > 0 && Math.abs(totals.difference) < 0.005;

    const changeLine = (index, field, value) => {
        setLines(current => current.map((line, i) => {
            if (i !== index) return line;
            if (field === "debit" && Number(value || 0) > 0) {
                return { ...line, debit: value, credit: "0" };
            }
            if (field === "credit" && Number(value || 0) > 0) {
                return { ...line, credit: value, debit: "0" };
            }
            return { ...line, [field]: value };
        }));
    };

    const addLine = () => setLines(current => [...current, newLine(current.length + 1)]);

    const removeLine = (index) => {
        if (lines.length <= 2) return;
        setLines(current => current.filter((_, i) => i !== index).map((x, i) => ({ ...x, line_no: i + 1 })));
    };

    const clearForm = () => {
        setVoucherDate(today());
        setNarration("");
        setLines([newLine(1), newLine(2)]);
        setError("");
        setSuccess("");
    };

    const save = async (status) => {
        setError("");
        setSuccess("");

        if (!voucherTypeId) return setError("Journal Voucher type is not configured.");
        if (!voucherDate) return setError("Voucher date is required.");
        if (!narration.trim()) return setError("Narration is required.");
        if (lines.length < 2) return setError("At least two voucher lines are required.");

        for (let i = 0; i < lines.length; i++) {
            const x = lines[i];
            const debit = Number(x.debit || 0);
            const credit = Number(x.credit || 0);

            if (!x.account_id) return setError(`Please select an account on line ${i + 1}.`);
            if (!Number.isFinite(debit) || !Number.isFinite(credit) || debit < 0 || credit < 0) {
                return setError(`Invalid amount on line ${i + 1}.`);
            }
            if ((debit > 0 && credit > 0) || (debit === 0 && credit === 0)) {
                return setError(`Line ${i + 1} must contain either debit or credit.`);
            }
        }

        if (!balanced) return setError("Voucher is not balanced. Total debit and credit must be equal.");

        try {
            setSaving(true);

            const r = await apiFetch("/api/vouchers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    voucher_type_id: Number(voucherTypeId),
                    voucher_date: voucherDate,
                    narration: narration.trim(),
                    status,
                    items: lines.map(x => ({
                        account_id: Number(x.account_id),
                        cost_center_id: x.cost_center_id ? Number(x.cost_center_id) : null,
                        description: x.description.trim() || null,
                        debit: Number(x.debit || 0),
                        credit: Number(x.credit || 0)
                    }))
                })
            });

            const data = await r.json();
            if (!r.ok) throw new Error(data.error || "Failed to create voucher");

            setSuccess(status === "DRAFT" ? "Journal voucher saved as draft." : "Journal voucher posted successfully.");

            if (data?.voucher?.id) {
                setTimeout(() => navigate(`/accounts/vouchers/${data.voucher.id}`), 400);
            }
        } catch (e) {
            console.error(e);
            setError(e.message || "Unable to create journal voucher");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ minHeight: "50vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CircularProgress sx={{ color: "#8B0000" }} />
            </Box>
        );
    }

    const jvType = voucherTypes.find(x => String(x.id) === String(voucherTypeId));

    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ xs: "stretch", sm: "center" }} sx={{ mb: 2.5 }}>
                <Box>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <AccountBalanceIcon sx={{ color: "#8B0000" }} />
                        <Typography variant="h5" fontWeight={800} sx={{ color: "#8B0000" }}>
                            Journal Voucher
                        </Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                        Create a manual accounting journal entry
                    </Typography>
                </Box>
            </Stack>

            {error && <Alert severity="error" sx={{ mb: 2.5 }} onClose={() => setError("")}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2.5 }}>{success}</Alert>}

            <Card sx={{ mb: 2.5 }}>
                <CardContent>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                        Voucher Details
                    </Typography>

                    <Grid container spacing={2.5}>
                        <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="body2" fontWeight={600} sx={{ mb: 0.6 }}>Voucher Date</Typography>
                            <TextField
                                fullWidth size="small" type="date" value={voucherDate}
                                onChange={e => setVoucherDate(e.target.value)}
                                inputProps={{ "aria-label": "Voucher Date" }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6} md={4}>
                            <Typography variant="body2" fontWeight={600} sx={{ mb: 0.6 }}>Voucher Type</Typography>
                            <TextField
                                fullWidth size="small"
                                value={jvType ? `${jvType.code} — ${jvType.name}` : "Journal Voucher"}
                                InputProps={{ readOnly: true }}
                            />
                        </Grid>

                        <Grid item xs={12} md={5}>
                            <Typography variant="body2" fontWeight={600} sx={{ mb: 0.6 }}>Narration</Typography>
                            <TextField
                                fullWidth size="small"
                                placeholder="Enter reason / narration for this voucher"
                                value={narration}
                                onChange={e => setNarration(e.target.value)}
                            />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <Card sx={{ mb: 2.5 }}>
                <Box sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
                    <Box>
                        <Typography variant="subtitle1" fontWeight={700}>Voucher Entries</Typography>
                        <Typography variant="caption" color="text.secondary">
                            Only active leaf accounts can be selected.
                        </Typography>
                    </Box>
                    <Button variant="outlined" startIcon={<AddIcon />} onClick={addLine}>Add Line</Button>
                </Box>

                <Divider />

                <TableContainer sx={{ overflowX: "auto" }}>
                    <Table size="small" sx={{ minWidth: 1120 }}>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: "#FFF3F3" }}>
                                {["#", "Account", "Cost Centre", "Description", "Debit", "Credit", ""].map((h, i) => (
                                    <TableCell key={h || i} align={h === "Debit" || h === "Credit" ? "right" : "left"} sx={{ fontWeight: 700, color: "#8B0000" }}>
                                        {h}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {lines.map((line, index) => {
                                const account = accounts.find(a => String(a.id) === String(line.account_id)) || null;

                                return (
                                    <TableRow key={index}>
                                        <TableCell>{index + 1}</TableCell>

                                        <TableCell sx={{ minWidth: 270 }}>
                                            <Autocomplete
                                                size="small"
                                                options={accounts}
                                                value={account}
                                                onChange={(_, value) => changeLine(index, "account_id", value ? value.id : "")}
                                                getOptionLabel={x => x ? `${x.account_code} — ${x.account_name}` : ""}
                                                isOptionEqualToValue={(a, b) => String(a.id) === String(b.id)}
                                                renderInput={params => <TextField {...params} placeholder="Select account" />}
                                            />
                                        </TableCell>

                                        <TableCell sx={{ minWidth: 180 }}>
                                            <Select
                                                fullWidth size="small" displayEmpty
                                                value={line.cost_center_id}
                                                onChange={e => changeLine(index, "cost_center_id", e.target.value)}
                                            >
                                                <MenuItem value="">No Cost Centre</MenuItem>
                                                {costCenters.map(c => (
                                                    <MenuItem key={c.id} value={c.id}>{c.code} — {c.name}</MenuItem>
                                                ))}
                                            </Select>
                                        </TableCell>

                                        <TableCell sx={{ minWidth: 220 }}>
                                            <TextField
                                                fullWidth size="small"
                                                placeholder="Optional description"
                                                value={line.description}
                                                onChange={e => changeLine(index, "description", e.target.value)}
                                            />
                                        </TableCell>

                                        <TableCell sx={{ width: 150 }}>
                                            <TextField
                                                fullWidth size="small" type="number"
                                                value={line.debit}
                                                onChange={e => changeLine(index, "debit", e.target.value)}
                                                inputProps={{ min: 0, step: "0.01", style: { textAlign: "right" } }}
                                                placeholder="0.00"
                                            />
                                        </TableCell>

                                        <TableCell sx={{ width: 150 }}>
                                            <TextField
                                                fullWidth size="small" type="number"
                                                value={line.credit}
                                                onChange={e => changeLine(index, "credit", e.target.value)}
                                                inputProps={{ min: 0, step: "0.01", style: { textAlign: "right" } }}
                                                placeholder="0.00"
                                            />
                                        </TableCell>

                                        <TableCell align="center">
                                            <IconButton color="error" disabled={lines.length <= 2} onClick={() => removeLine(index)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Divider />

                <Box sx={{ p: 2 }}>
                    <Grid container spacing={2} justifyContent="flex-end">
                        <Grid item xs={12} sm={4} md={2.5}>
                            <Paper variant="outlined" sx={{ p: 1.5, backgroundColor: "#FFF8F8" }}>
                                <Typography variant="caption" color="text.secondary">Total Debit</Typography>
                                <Typography fontWeight={800}>₹{money(totals.debit)}</Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={4} md={2.5}>
                            <Paper variant="outlined" sx={{ p: 1.5, backgroundColor: "#FFF8F8" }}>
                                <Typography variant="caption" color="text.secondary">Total Credit</Typography>
                                <Typography fontWeight={800}>₹{money(totals.credit)}</Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={4} md={2.5}>
                            <Paper variant="outlined" sx={{
                                p: 1.5,
                                backgroundColor: balanced ? "#F3FBF5" : "#FFF8F8",
                                borderColor: balanced ? "#A5D6A7" : "#E0B0B0"
                            }}>
                                <Typography variant="caption" color="text.secondary">Difference</Typography>
                                <Typography fontWeight={800} sx={{ color: balanced ? "#2E7D32" : "#C62828" }}>
                                    ₹{money(Math.abs(totals.difference))}
                                </Typography>
                            </Paper>
                        </Grid>
                    </Grid>

                    <Alert severity={balanced ? "success" : "warning"} sx={{ mt: 2 }}>
                        {balanced ? "Voucher is balanced and ready to save." : "Voucher must be balanced before it can be saved."}
                    </Alert>
                </Box>
            </Card>

            <Stack direction={{ xs: "column-reverse", sm: "row" }} justifyContent="space-between" spacing={1.5}>
                <Button variant="outlined" startIcon={<RestartAltIcon />} disabled={saving} onClick={clearForm}>
                    Clear
                </Button>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                    <Button variant="outlined" startIcon={<SaveIcon />} disabled={saving} onClick={() => save("DRAFT")}>
                        Save Draft
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<SendIcon />}
                        disabled={saving}
                        onClick={() => save("POSTED")}
                        sx={{ backgroundColor: "#8B0000", "&:hover": { backgroundColor: "#700000" } }}
                    >
                        Save &amp; Post
                    </Button>
                </Stack>
            </Stack>
        </Box>
    );
}
