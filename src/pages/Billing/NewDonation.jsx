import { useEffect, useState } from "react";
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Divider,
    MenuItem,
    Paper,
    Stack,
    TextField,
    Typography
} from "@mui/material";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../api/api";

export default function NewDonation() {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [paymentModes, setPaymentModes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [donorName, setDonorName] = useState("");
    const [phoneNo, setPhoneNo] = useState("");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [amount, setAmount] = useState("");
    const [paymentModeId, setPaymentModeId] = useState("");
    const [remarks, setRemarks] = useState("");
    const [donationDate, setDonationDate] = useState(
        new Date().toISOString().slice(0, 10)
    );

    const loadMasters = async () => {
        try {
            setLoading(true);
            setError("");
            const [catResponse, modeResponse] = await Promise.all([
                apiFetch("/api/donation-categories"),
                apiFetch("/api/payment-modes")
            ]);

            const catData = await catResponse.json();
            const modeData = await modeResponse.json();

            if (!catResponse.ok) {
                throw new Error(catData.error || "Failed to load donation categories");
            }
            if (!modeResponse.ok) {
                throw new Error(modeData.error || "Failed to load payment modes");
            }

            setCategories(Array.isArray(catData) ? catData : []);
            setPaymentModes(Array.isArray(modeData) ? modeData : []);
        } catch (err) {
            setError(err.message || "Unable to load donation masters");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMasters();
    }, []);

    const clearForm = () => {
        setDonorName("");
        setPhoneNo("");
        setEmail("");
        setAddress("");
        setCategoryId("");
        setAmount("");
        setPaymentModeId("");
        setRemarks("");
        setDonationDate(new Date().toISOString().slice(0, 10));
    };

    const saveDonation = async () => {
        setError("");
        setSuccess("");

        if (!donorName.trim()) return setError("Donor name is required");
        if (!phoneNo.trim()) return setError("Phone number is required");
        if (!categoryId) return setError("Please select a donation category");
        if (!amount || Number(amount) <= 0) return setError("Please enter a valid donation amount");
        if (!paymentModeId) return setError("Please select a payment mode");
        if (!donationDate) return setError("Donation date is required");

        try {
            setSaving(true);
            const response = await apiFetch("/api/donations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    donor_name: donorName.trim(),
                    phone_no: phoneNo.trim(),
                    email: email.trim() || null,
                    address: address.trim() || null,
                    category_id: Number(categoryId),
                    amount: Number(amount),
                    payment_mode_id: Number(paymentModeId),
                    remarks: remarks.trim() || null,
                    donation_date: donationDate
                })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Failed to save donation");
            }

            setSuccess(`Donation ${data.donation_no} saved successfully.`);
            clearForm();
            setTimeout(() => navigate(`/donations/${data.id}`), 500);
        } catch (err) {
            setError(err.message || "Unable to save donation");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 1100, mx: "auto" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
                <VolunteerActivismIcon sx={{ fontSize: 34, color: "#990000" }} />
                <Typography variant="h4" sx={{ fontWeight: 700, color: "#17202a" }}>
                    New Donation
                </Typography>
            </Box>
            <Typography sx={{ color: "text.secondary", mb: 3, ml: 5.5 }}>
                Record donations received at the temple premises.
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Paper elevation={2} sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: "#990000", mb: 2 }}>
                        Donor Details
                    </Typography>

                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
                        <TextField label="Donor Name" required value={donorName} onChange={e => setDonorName(e.target.value)} fullWidth />
                        <TextField label="Phone Number" required value={phoneNo} onChange={e => setPhoneNo(e.target.value)} fullWidth />
                        <TextField label="Email ID" type="email" value={email} onChange={e => setEmail(e.target.value)} fullWidth />
                        <TextField label="Donation Date" type="date" value={donationDate} onChange={e => setDonationDate(e.target.value)} InputLabelProps={{ shrink: true }} fullWidth />
                        <TextField label="Address" value={address} onChange={e => setAddress(e.target.value)} multiline minRows={3} fullWidth sx={{ gridColumn: { md: "1 / -1" } }} />
                    </Box>

                    <Divider sx={{ my: 3 }} />
                    <Typography variant="h6" sx={{ fontWeight: 700, color: "#990000", mb: 2 }}>
                        Donation Details
                    </Typography>

                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" }, gap: 2 }}>
                        <TextField select label="Donation Category" required value={categoryId} onChange={e => setCategoryId(e.target.value)} fullWidth>
                            {categories.map(item => (
                                <MenuItem key={item.id} value={item.id}>
                                    <Box>
                                        <Typography>{item.category_name}</Typography>
                                        <Typography variant="caption" sx={{ color: "#990000" }}>{item.category_name_ml}</Typography>
                                    </Box>
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField label="Amount" required type="number" value={amount} onChange={e => setAmount(e.target.value)} inputProps={{ min: 0, step: "0.01" }} fullWidth />
                        <TextField select label="Payment Mode" required value={paymentModeId} onChange={e => setPaymentModeId(e.target.value)} fullWidth>
                            {paymentModes.map(item => (
                                <MenuItem key={item.id} value={item.id}>
                                    <Box>
                                        <Typography>{item.payment_mode}</Typography>
                                        <Typography variant="caption" sx={{ color: "#990000" }}>{item.mode_name_ml}</Typography>
                                    </Box>
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField label="Remarks" value={remarks} onChange={e => setRemarks(e.target.value)} multiline minRows={3} fullWidth sx={{ gridColumn: { md: "1 / -1" } }} helperText="For example: Cheque number, bank transfer reference, etc." />
                    </Box>

                    <Stack direction="row" justifyContent="flex-end" spacing={1.5} sx={{ mt: 3 }}>
                        <Button variant="outlined" onClick={() => navigate("/donations")} disabled={saving}>Cancel</Button>
                        <Button variant="contained" onClick={saveDonation} disabled={saving} sx={{ backgroundColor: "#990000", "&:hover": { backgroundColor: "#7d0000" } }}>
                            {saving ? "Saving..." : "Save Donation"}
                        </Button>
                    </Stack>
                </Paper>
            )}
        </Box>
    );
}
