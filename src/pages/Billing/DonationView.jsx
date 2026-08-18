import { useEffect, useState } from "react";
import { Alert, Box, Button, CircularProgress, Divider, Paper, Stack, Typography } from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../../api/api";

export default function DonationView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const load = async () => {
            try {
                const response = await apiFetch(`/api/donations/${id}`);
                const result = await response.json();
                if (!response.ok) throw new Error(result.error || "Failed to load donation");
                setData(result);
            } catch (err) {
                setError(err.message || "Unable to load donation");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    if (loading) return <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">{error}</Alert>;
    if (!data) return null;

    const donation = data.donation;
    const money = Number(donation.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 });

    return (
        <Box sx={{ maxWidth: 900, mx: "auto" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                    <VolunteerActivismIcon sx={{ fontSize: 34, color: "#990000" }} />
                    <Box><Typography variant="h4" sx={{ fontWeight: 700 }}>Donation Receipt</Typography><Typography color="text.secondary">{donation.donation_no}</Typography></Box>
                </Stack>
                <Stack direction="row" spacing={1}>
                    <Button startIcon={<ArrowBackIcon />} variant="outlined" onClick={() => navigate("/donations")}>Back</Button>
                    <Button startIcon={<PrintIcon />} variant="contained" onClick={() => window.print()} sx={{ backgroundColor: "#990000", "&:hover": { backgroundColor: "#7d0000" } }}>Print</Button>
                </Stack>
            </Stack>

            <Paper sx={{ p: { xs: 2, md: 4 } }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: "#990000", textAlign: "center" }}>DONATION RECEIPT</Typography>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                    <Box><Typography variant="caption" color="text.secondary">Donation No.</Typography><Typography sx={{ fontWeight: 700 }}>{donation.donation_no}</Typography></Box>
                    <Box><Typography variant="caption" color="text.secondary">Donation Date</Typography><Typography>{String(donation.donation_date).slice(0, 10)}</Typography></Box>
                    <Box><Typography variant="caption" color="text.secondary">Donor Name</Typography><Typography sx={{ fontWeight: 600 }}>{donation.donor_name}</Typography></Box>
                    <Box><Typography variant="caption" color="text.secondary">Phone</Typography><Typography>{donation.phone_no}</Typography></Box>
                    {donation.email && <Box><Typography variant="caption" color="text.secondary">Email</Typography><Typography>{donation.email}</Typography></Box>}
                    <Box><Typography variant="caption" color="text.secondary">Donation Category</Typography><Typography>{donation.category_name}</Typography><Typography sx={{ color: "#990000" }}>{donation.category_name_ml}</Typography></Box>
                    {donation.address && <Box sx={{ gridColumn: { sm: "1 / -1" } }}><Typography variant="caption" color="text.secondary">Address</Typography><Typography sx={{ whiteSpace: "pre-line" }}>{donation.address}</Typography></Box>}
                </Box>
                <Divider sx={{ my: 2 }} />
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ gap: 3 }}><Typography sx={{ fontWeight: 700 }}>Amount</Typography><Typography variant="h5" sx={{ fontWeight: 800, color: "#990000", whiteSpace: "nowrap" }}>₹ {money}</Typography></Stack>
                <Box sx={{ mt: 2 }}><Typography variant="caption" color="text.secondary">Payment Mode</Typography><Typography>{donation.payment_mode || "—"}</Typography></Box>
                {donation.transaction_reference && <Box sx={{ mt: 1 }}><Typography variant="caption" color="text.secondary">Transaction Reference</Typography><Typography>{donation.transaction_reference}</Typography></Box>}
                {donation.remarks && <Box sx={{ mt: 2 }}><Typography variant="caption" color="text.secondary">Remarks</Typography><Typography sx={{ whiteSpace: "pre-line" }}>{donation.remarks}</Typography></Box>}
                <Box sx={{ mt: 4, textAlign: "center", color: "text.secondary" }}><Typography>Thank you for your generous contribution.</Typography></Box>
            </Paper>
        </Box>
    );
}
