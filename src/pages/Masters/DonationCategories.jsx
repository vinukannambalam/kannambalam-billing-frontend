import { useEffect, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Paper,
    Stack,
    Switch,
    TextField,
    Typography
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import { apiFetch } from "../../api/api";

export default function DonationCategories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [nameEn, setNameEn] = useState("");
    const [nameMl, setNameMl] = useState("");
    const [displayOrder, setDisplayOrder] = useState(0);
    const [active, setActive] = useState(true);

    const load = async () => {
        try {
            setLoading(true);
            setError("");
            const response = await apiFetch("/api/admin/donation-categories");
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Failed to load donation categories");
            setCategories(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message || "Unable to load donation categories");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const newCategory = () => {
        setEditing(null);
        setNameEn("");
        setNameMl("");
        setDisplayOrder(categories.length + 1);
        setActive(true);
        setError("");
        setOpen(true);
    };

    const editCategory = item => {
        setEditing(item);
        setNameEn(item.category_name || "");
        setNameMl(item.category_name_ml || "");
        setDisplayOrder(item.display_order || 0);
        setActive(item.active !== false);
        setError("");
        setOpen(true);
    };

    const save = async () => {
        if (!nameEn.trim()) return setError("English category name is required");
        if (!nameMl.trim()) return setError("Malayalam category name is required");

        try {
            setSaving(true);
            setError("");
            const url = editing
                ? `/api/admin/donation-categories/${editing.id}`
                : "/api/admin/donation-categories";
            const response = await apiFetch(url, {
                method: editing ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    category_name: nameEn.trim(),
                    category_name_ml: nameMl.trim(),
                    display_order: Number(displayOrder) || 0,
                    active
                })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Unable to save category");
            setOpen(false);
            setMessage(editing ? "Category updated successfully" : "Category added successfully");
            await load();
        } catch (err) {
            setError(err.message || "Unable to save category");
        } finally {
            setSaving(false);
        }
    };

    const toggleActive = async item => {
        try {
            setSaving(true);
            const response = await apiFetch(`/api/admin/donation-categories/${item.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    category_name: item.category_name,
                    category_name_ml: item.category_name_ml,
                    display_order: item.display_order,
                    active: !item.active
                })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Unable to update category");
            await load();
        } catch (err) {
            setError(err.message || "Unable to update category");
        } finally {
            setSaving(false);
        }
    };

    const remove = async item => {
        if (!window.confirm(`Delete donation category "${item.category_name}"?`)) return;
        try {
            setSaving(true);
            const response = await apiFetch(`/api/admin/donation-categories/${item.id}`, { method: "DELETE" });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Unable to delete category");
            await load();
            setMessage("Category deleted successfully");
        } catch (err) {
            setError(err.message || "Unable to delete category");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <VolunteerActivismIcon sx={{ fontSize: 34, color: "#990000" }} />
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: "#17202a" }}>Donation Categories</Typography>
                        <Typography sx={{ color: "text.secondary", mt: 0.25 }}>Manage categories used for donations.</Typography>
                    </Box>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={newCategory} sx={{ backgroundColor: "#990000", "&:hover": { backgroundColor: "#7d0000" } }}>New Category</Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}

            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress /></Box>
            ) : (
                <Paper sx={{ overflow: "hidden" }}>
                    <Box sx={{ overflowX: "auto" }}>
                        <Box sx={{ minWidth: 700 }}>
                            <Box sx={{ display: "grid", gridTemplateColumns: "70px 1fr 1fr 120px 150px", px: 2, py: 1.25, backgroundColor: "#f7f7f7", fontWeight: 700 }}>
                                <Typography>#</Typography><Typography>Category</Typography><Typography>Malayalam</Typography><Typography>Order</Typography><Typography>Status / Actions</Typography>
                            </Box>
                            {categories.map((item, index) => (
                                <Box key={item.id} sx={{ display: "grid", gridTemplateColumns: "70px 1fr 1fr 120px 150px", alignItems: "center", px: 2, py: 1.1, borderTop: "1px solid #eee" }}>
                                    <Typography>{index + 1}</Typography>
                                    <Typography sx={{ fontWeight: 600 }}>{item.category_name}</Typography>
                                    <Typography sx={{ color: "#990000" }}>{item.category_name_ml}</Typography>
                                    <Typography>{item.display_order}</Typography>
                                    <Stack direction="row" alignItems="center" spacing={0.5}>
                                        <Chip size="small" label={item.active ? "Active" : "Inactive"} color={item.active ? "success" : "default"} />
                                        <IconButton size="small" onClick={() => editCategory(item)} disabled={saving}><EditIcon fontSize="small" /></IconButton>
                                        <Switch size="small" checked={item.active} onChange={() => toggleActive(item)} disabled={saving} />
                                        <IconButton size="small" onClick={() => remove(item)} disabled={saving} color="error">×</IconButton>
                                    </Stack>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                </Paper>
            )}

            <Dialog open={open} onClose={() => !saving && setOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle sx={{ fontWeight: 700 }}>{editing ? "Edit Donation Category" : "New Donation Category"}</DialogTitle>
                <DialogContent dividers>
                    <TextField fullWidth label="Category Name (English)" required value={nameEn} onChange={e => setNameEn(e.target.value)} margin="normal" autoFocus />
                    <TextField fullWidth label="Category Name (Malayalam)" required value={nameMl} onChange={e => setNameMl(e.target.value)} margin="normal" />
                    <TextField fullWidth label="Display Order" type="number" value={displayOrder} onChange={e => setDisplayOrder(e.target.value)} margin="normal" />
                    <Stack direction="row" alignItems="center" sx={{ mt: 1 }}>
                        <Switch checked={active} onChange={e => setActive(e.target.checked)} />
                        <Typography>{active ? "Active" : "Inactive"}</Typography>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
                    <Button variant="contained" onClick={save} disabled={saving} sx={{ backgroundColor: "#990000", "&:hover": { backgroundColor: "#7d0000" } }}>{saving ? "Saving..." : editing ? "Update Category" : "Save Category"}</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
