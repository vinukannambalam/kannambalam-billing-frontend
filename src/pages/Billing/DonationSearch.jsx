import { useEffect, useState } from "react";
import { Box, Button, Chip, CircularProgress, Paper, Stack, TextField, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../api/api";

export default function DonationSearch() {
    const navigate = useNavigate();
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const load = async () => {
        setLoading(true);
        try {
            const response = await apiFetch(`/api/donations?search=${encodeURIComponent(search.trim())}`);
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Failed to load donations");
            setDonations(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            setDonations([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    return (
        <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <VolunteerActivismIcon sx={{ fontSize: 34, color: "#990000" }} />
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: "#17202a" }}>Donations</Typography>
                        <Typography sx={{ color: "text.secondary", mt: 0.25 }}>Search and view recorded donations.</Typography>
                    </Box>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/donations/new")} sx={{ backgroundColor: "#990000", "&:hover": { backgroundColor: "#7d0000" } }}>New Donation</Button>
            </Box>

            <Paper sx={{ p: 2, mb: 2 }}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                    <TextField fullWidth size="small" label="Search donation no., donor name or phone" value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === "Enter" && load()} />
                    <Button variant="outlined" onClick={load}>Search</Button>
                </Stack>
            </Paper>

            <Paper sx={{ overflow: "hidden" }}>
                {loading ? <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}><CircularProgress /></Box> : (
                    <Box sx={{ overflowX: "auto" }}>
                        <Box sx={{ minWidth: 950 }}>
                            <Box sx={{ display: "grid", gridTemplateColumns: "130px 1.5fr 1.2fr 120px 130px 120px", px: 2, py: 1.25, backgroundColor: "#f7f7f7", fontWeight: 700 }}>
                                <Typography>Donation No.</Typography><Typography>Donor</Typography><Typography>Category</Typography><Typography>Amount</Typography><Typography>Payment Mode</Typography><Typography>Status</Typography>
                            </Box>
                            {donations.map(item => (
                                <Box key={item.id} sx={{ display: "grid", gridTemplateColumns: "130px 1.5fr 1.2fr 120px 130px 120px", alignItems: "center", px: 2, py: 1.2, borderTop: "1px solid #eee", cursor: "pointer", "&:hover": { backgroundColor: "#fff8f8" } }} onClick={() => navigate(`/donations/${item.id}`)}>
                                    <Typography sx={{ fontWeight: 700, color: "#990000" }}>{item.donation_no}</Typography>
                                    <Box><Typography sx={{ fontWeight: 600 }}>{item.donor_name}</Typography><Typography variant="caption" color="text.secondary">{item.phone_no}</Typography></Box>
                                    <Box><Typography>{item.category_name}</Typography><Typography variant="caption" sx={{ color: "#990000" }}>{item.category_name_ml}</Typography></Box>
                                    <Typography sx={{ fontWeight: 700 }}>₹ {Number(item.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</Typography>
                                    <Typography>{item.payment_mode || "—"}</Typography>
                                    <Chip size="small" label={item.payment_status} color={item.payment_status === "RECEIVED" || item.payment_status === "PAID" ? "success" : "default"} />
                                </Box>
                            ))}
                            {donations.length === 0 && <Typography sx={{ p: 3, textAlign: "center", color: "text.secondary" }}>No donations found.</Typography>}
                        </Box>
                    </Box>
                )}
            </Paper>
        </Box>
    );
}
