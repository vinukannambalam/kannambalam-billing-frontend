import { useEffect, useState } from "react";

import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    MenuItem,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    IconButton,
    Divider,
    Alert
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

import { apiFetch } from "../../api/api";

export default function ReceiptGrid({
    devotee,
    onItemsChange,
    resetKey = 0
}) {

    // =====================================================
    // STATE
    // =====================================================

    const [items, setItems] = useState([]);

    const [offerings, setOfferings] = useState([]);

    const [nakshathras, setNakshathras] = useState([]);

    const [familyMembers, setFamilyMembers] = useState([]);

    const [offeringId, setOfferingId] = useState("");

    const [selectedFamilyPersonId, setSelectedFamilyPersonId] =
        useState("");

    const [beneficiaryName, setBeneficiaryName] =
        useState("");

    const [beneficiaryNameMl, setBeneficiaryNameMl] =
        useState("");

    const [beneficiaryRelationship, setBeneficiaryRelationship] =
        useState("Self");

    const [nakshathra, setNakshathra] =
        useState("");

    const [qty, setQty] =
        useState(1);

    const [otherPersonName, setOtherPersonName] =
        useState("");

    const [loadingOfferings, setLoadingOfferings] =
        useState(false);

    const [loadingNakshathras, setLoadingNakshathras] =
        useState(false);

    const [loadingFamilyMembers, setLoadingFamilyMembers] =
        useState(false);

    const [error, setError] =
        useState("");


    // =====================================================
    // LOAD MASTER DATA
    // =====================================================

    useEffect(() => {

        loadOfferings();

        loadNakshathras();

    }, []);


    // =====================================================
    // SEND ITEMS TO PARENT
    // =====================================================

    useEffect(() => {

        if (onItemsChange) {

            onItemsChange(items);

        }

    }, [
        items,
        onItemsChange
    ]);


    // =====================================================
    // RESET GRID AFTER SUCCESSFUL RECEIPT SAVE
    // =====================================================

    useEffect(() => {

        if (resetKey === 0) {
            return;
        }

        setItems([]);
        setOfferingId("");
        setSelectedFamilyPersonId("");
        setBeneficiaryName("");
        setBeneficiaryNameMl("");
        setBeneficiaryRelationship("Self");
        setNakshathra("");
        setQty(1);
        setOtherPersonName("");
        setError("");

    }, [resetKey]);


    // =====================================================
    // DEVOTEE CHANGE
    // =====================================================

    useEffect(() => {

        if (!devotee?.id) {

            setFamilyMembers([]);

            setSelectedFamilyPersonId("");

            setBeneficiaryName("");

            setBeneficiaryRelationship("Self");

            setNakshathra("");

            setOtherPersonName("");

            setLoadingFamilyMembers(false);

            return;

        }

        loadFamilyMembers();

    }, [devotee]);


    // =====================================================
    // LOAD FAMILY MEMBERS
    // =====================================================

    const loadFamilyMembers = async () => {

        try {

            setLoadingFamilyMembers(true);

            setError("");

            const response =
                await apiFetch(
                    `/api/devotees/${devotee.id}/family-members`
                );

            const contentType =
                response.headers.get("content-type") || "";

            const data =
                contentType.includes("application/json")
                    ? await response.json()
                    : null;

            if (!response.ok) {

                throw new Error(
                    data?.error ||
                    `Failed to load family members (${response.status})`
                );

            }

            const members =
                Array.isArray(data)
                    ? data
                    : [];

            setFamilyMembers(members);


            // -------------------------------------------------
            // DEFAULT = DEVOTEE / SELF
            // -------------------------------------------------

            const self =
                members.find(
                    member =>
                        member.relationship === "Self"
                );

            if (self) {

                setSelectedFamilyPersonId(
                    String(self.family_person_id)
                );

                setBeneficiaryName(
                    self.name || devotee.full_name || ""
                );

                setBeneficiaryNameMl(
                    self.malayalam_name || ""
                );

                setBeneficiaryRelationship(
                    "Self"
                );

                setNakshathra(
                    self.birth_star_id
                        ? String(self.birth_star_id)
                        : ""
                );

            }
            else {

                // Devotee not linked to family tree

                setSelectedFamilyPersonId("");

                setBeneficiaryName(
                    devotee.full_name || ""
                );

                setBeneficiaryNameMl("");

                setBeneficiaryRelationship(
                    "Self"
                );

                setNakshathra("");

            }

            setOtherPersonName("");

        }
        catch (error) {

            console.error(
                "Family member loading error:",
                error
            );

            setFamilyMembers([]);

            // -------------------------------------------------
            // Fallback to selected devotee
            // -------------------------------------------------

            setSelectedFamilyPersonId("");

            setBeneficiaryName(
                devotee?.full_name || ""
            );

            setBeneficiaryNameMl("");

            setBeneficiaryRelationship(
                "Self"
            );

            setNakshathra("");

            setError(
                error.message ||
                "Unable to load family members"
            );

        }
        finally {

            setLoadingFamilyMembers(false);

        }

    };


    // =====================================================
    // FAMILY MEMBER CHANGE
    // =====================================================

    const handleFamilyMemberChange = (event) => {

        const value =
            event.target.value;

        // -------------------------------------------------
        // OTHER PERSON
        // -------------------------------------------------

        if (value === "OTHER") {

            setSelectedFamilyPersonId(
                "OTHER"
            );

            setBeneficiaryRelationship(
                "Other Person"
            );

            setBeneficiaryName("");
            setBeneficiaryNameMl("");

            setOtherPersonName("");

            // No automatic Nakshathra for outside person

            setNakshathra("");

            return;

        }


        // -------------------------------------------------
        // FAMILY MEMBER
        // -------------------------------------------------

        const selected =
            familyMembers.find(
                member =>
                    String(
                        member.family_person_id
                    ) === String(value)
            );

        if (!selected) {

            return;

        }

        setSelectedFamilyPersonId(
            String(
                selected.family_person_id
            )
        );

        setBeneficiaryName(
            selected.name || ""
        );

        setBeneficiaryNameMl(
            selected.malayalam_name || ""
        );

        setBeneficiaryRelationship(
            selected.relationship || "Family"
        );

        // -------------------------------------------------
        // AUTOMATIC NAKSHATHRA
        // -------------------------------------------------

        setNakshathra(
            selected.birth_star_id
                ? String(selected.birth_star_id)
                : ""
        );

        setOtherPersonName("");

    };


    // =====================================================
    // OTHER PERSON NAME CHANGE
    // =====================================================

    const handleOtherPersonNameChange = (event) => {

        const value =
            event.target.value;

        setOtherPersonName(value);

        setBeneficiaryName(value);
        setBeneficiaryNameMl("");

    };


    // =====================================================
    // LOAD OFFERINGS
    // =====================================================

    const loadOfferings = async () => {

        try {

            setLoadingOfferings(true);

            setError("");

            const response =
                await apiFetch(
                    "/api/offerings"
                );

            const data =
                await response.json();

            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Failed to load offerings"
                );

            }

            setOfferings(
                Array.isArray(data)
                    ? data
                    : []
            );

        }
        catch (error) {

            console.error(
                "Offering loading error:",
                error
            );

            setOfferings([]);

            setError(
                error.message ||
                "Unable to load offerings"
            );

        }
        finally {

            setLoadingOfferings(false);

        }

    };


    // =====================================================
    // LOAD NAKSHATHRAS
    // =====================================================

    const loadNakshathras = async () => {

        try {

            setLoadingNakshathras(true);

            const response =
                await apiFetch(
                    "/api/birth-stars"
                );

            const data =
                await response.json();

            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Failed to load birth stars"
                );

            }

            setNakshathras(
                Array.isArray(data)
                    ? data
                    : []
            );

        }
        catch (error) {

            console.error(
                "Birth star loading error:",
                error
            );

            setNakshathras([]);

            setError(
                error.message ||
                "Unable to load birth stars"
            );

        }
        finally {

            setLoadingNakshathras(false);

        }

    };


    // =====================================================
    // SELECTED OFFERING
    // =====================================================

    const selectedOffering =
        offerings.find(
            item =>
                item.id ===
                Number(offeringId)
        );


    // =====================================================
    // WHETHER NAKSHATHRA IS REQUIRED
    // =====================================================

    const requiresNakshathra =
        selectedOffering
            ? selectedOffering.requires_nakshathra === true
            : false;


    // =====================================================
    // SELECTED NAKSHATHRA
    // =====================================================

    const selectedNakshathra =
        nakshathras.find(
            star =>
                star.id ===
                Number(nakshathra)
        );


    // =====================================================
    // RATE
    // =====================================================

    const rate =
        selectedOffering
            ? Number(
                selectedOffering.amount
            )
            : 0;


    // =====================================================
    // OFFERING CHANGE
    // =====================================================

    const handleOfferingChange = (event) => {

        const newOfferingId =
            event.target.value;

        setOfferingId(
            newOfferingId
        );

        const newOffering =
            offerings.find(
                item =>
                    item.id ===
                    Number(newOfferingId)
            );

        // -------------------------------------------------
        // IMPORTANT:
        // Do not clear Nakshathra automatically when
        // changing offering.
        //
        // The selected person's Nakshathra should remain.
        // -------------------------------------------------

        if (!newOffering) {

            setNakshathra("");

        }

    };


    // =====================================================
    // ADD OFFERING
    // =====================================================

    const addItem = () => {

        if (!devotee) {

            alert(
                "Please select a devotee first"
            );

            return;

        }


        if (!selectedOffering) {

            alert(
                "Please select an offering"
            );

            return;

        }


        // -------------------------------------------------
        // OTHER PERSON
        // -------------------------------------------------

        if (
            selectedFamilyPersonId === "OTHER" &&
            !otherPersonName.trim()
        ) {

            alert(
                "Please enter the name of the other person"
            );

            return;

        }


        if (!beneficiaryName.trim()) {

            alert(
                "Please enter the name of the person for whom the offering is made"
            );

            return;

        }


        // -------------------------------------------------
        // NAKSHATHRA
        // -------------------------------------------------

        if (
            requiresNakshathra &&
            !selectedNakshathra
        ) {

            alert(
                `Please select Nakshathra for ${selectedOffering.offering_name}`
            );

            return;

        }


        if (Number(qty) <= 0) {

            alert(
                "Quantity must be at least 1"
            );

            return;

        }


        const quantity =
            Number(qty);


        // =================================================
        // CREATE ITEM
        // =================================================

        const newItem = {

            id:
                Date.now(),

            offering_id:
                selectedOffering.id,

            offering_name:
                selectedOffering.offering_name,

            offering_name_ml:
                selectedOffering.offering_name_ml ||
                "",


            // -------------------------------------------------
            // BENEFICIARY
            // -------------------------------------------------

            beneficiary_name:
                beneficiaryName.trim(),

            beneficiary_name_ml:
                beneficiaryNameMl.trim(),

            // Keep the ORIGINAL devotee ID here.
            // This preserves the current backend meaning.
            beneficiary_devotee_id:
                devotee?.id
                    ? Number(devotee.id)
                    : null,


            // -------------------------------------------------
            // NAKSHATHRA
            // -------------------------------------------------

            nakshathra_id:
                selectedNakshathra
                    ? selectedNakshathra.id
                    : null,

            nakshathra_en:
                selectedNakshathra
                    ? selectedNakshathra.name_en
                    : "",

            nakshathra_ml:
                selectedNakshathra
                    ? selectedNakshathra.name_ml || ""
                    : "",


            // -------------------------------------------------
            // FAMILY BENEFICIARY INFORMATION
            // Stored in item_details by backend.
            // -------------------------------------------------

            beneficiary_family_person_id:
                selectedFamilyPersonId === "OTHER"
                    ? null
                    : (
                        selectedFamilyPersonId
                            ? Number(
                                selectedFamilyPersonId
                            )
                            : null
                    ),

            beneficiary_relationship:
                beneficiaryRelationship,


            // -------------------------------------------------
            // QUANTITY / AMOUNT
            // -------------------------------------------------

            qty:
                quantity,

            quantity:
                quantity,

            rate:
                rate,

            amount:
                rate * quantity

        };


        setItems(
            previousItems => [
                ...previousItems,
                newItem
            ]
        );


        // =================================================
        // CLEAR OFFERING ONLY
        // =================================================
        //
        // IMPORTANT:
        // Keep the selected For Name and Nakshathra.
        //
        // This allows the operator to add several offerings
        // for the same family member without selecting them
        // again.
        //
        // =================================================

        setOfferingId("");

        setQty(1);

    };


    // =====================================================
    // REMOVE ITEM
    // =====================================================

    const removeItem = (id) => {

        setItems(
            previousItems =>
                previousItems.filter(
                    item =>
                        item.id !== id
                )
        );

    };


    // =====================================================
    // TOTAL
    // =====================================================

    const total =
        items.reduce(
            (sum, item) =>
                sum +
                Number(
                    item.amount || 0
                ),
            0
        );


    // =====================================================
    // UI
    // =====================================================

    return (

        <Box>

            <Typography
                variant="h6"
                sx={{
                    mb: 2,
                    fontWeight: 600
                }}
            >
                Offerings
            </Typography>


            {error && (

                <Alert
                    severity="error"
                    sx={{
                        mb: 2
                    }}
                    onClose={() =>
                        setError("")
                    }
                >
                    {error}
                </Alert>

            )}


            <Paper
                variant="outlined"
                sx={{
                    p: 2
                }}
            >

                {/* =========================================
                    OFFERING ENTRY
                ========================================= */}

                <Box
                    sx={{
                        display: "grid",

                        gridTemplateColumns: {
                            xs: "1fr",
                            sm: "1fr 1fr",
                            md: "1.4fr 1.4fr 1.2fr 100px 100px"
                        },

                        gap: {
                            xs: 1.5,
                            sm: 2
                        },

                        alignItems: "stretch"
                    }}
                >

                    {/* OFFERING */}

                    <TextField
                        select
                        fullWidth
                        label="Offering"
                        value={offeringId}
                        onChange={
                            handleOfferingChange
                        }
                        disabled={
                            loadingOfferings
                        }
                    >

                        <MenuItem value="">

                            {loadingOfferings
                                ? "Loading Offerings..."
                                : "Select Offering"}

                        </MenuItem>


                        {offerings.map(
                            item => (

                                <MenuItem
                                    key={item.id}
                                    value={item.id}
                                >

                                    {item.offering_name}

                                    {item.offering_name_ml
                                        ? ` - ${item.offering_name_ml}`
                                        : ""}

                                </MenuItem>

                            )
                        )}

                    </TextField>


                    {/* FOR NAME */}

                    <TextField
                        select
                        fullWidth
                        label="For Name"
                        value={
                            selectedFamilyPersonId
                        }
                        onChange={
                            handleFamilyMemberChange
                        }
                        disabled={
                            !devotee ||
                            loadingFamilyMembers
                        }
                    >

                        <MenuItem value="">

                            {loadingFamilyMembers
                                ? "Loading Family Members..."
                                : "Select Person"}

                        </MenuItem>


                        {familyMembers.map(
                            member => (

                                <MenuItem
                                    key={
                                        member.family_person_id ??
                                        `self-${member.name}`
                                    }
                                    value={
                                        String(
                                            member.family_person_id
                                        )
                                    }
                                >

                                    {member.name}

                                    {member.relationship
                                        ? ` (${member.relationship})`
                                        : ""}

                                </MenuItem>

                            )
                        )}


                        <MenuItem value="OTHER">

                            Other Person

                        </MenuItem>

                    </TextField>


                    {/* OTHER PERSON NAME */}

                    {selectedFamilyPersonId === "OTHER" ? (

                        <TextField
                            fullWidth
                            label="Other Person Name"
                            placeholder="Enter person's name"
                            value={
                                otherPersonName
                            }
                            onChange={
                                handleOtherPersonNameChange
                            }
                        />

                    ) : null}


                    {/* NAKSHATHRA */}

                    <TextField
                        select
                        fullWidth
                        label={
                            requiresNakshathra
                                ? "Nakshathra *"
                                : "Nakshathra"
                        }
                        value={
                            nakshathra
                        }
                        onChange={
                            (e) =>
                                setNakshathra(
                                    e.target.value
                                )
                        }
                        required={
                            requiresNakshathra
                        }
                        disabled={
                            selectedFamilyPersonId !== "OTHER"
                        }
                    >

                        <MenuItem value="">

                            Select Nakshathra

                        </MenuItem>


                        {nakshathras.map(
                            star => (

                                <MenuItem
                                    key={star.id}
                                    value={star.id}
                                >

                                    {star.name_en}

                                    {star.name_ml
                                        ? ` - ${star.name_ml}`
                                        : ""}

                                </MenuItem>

                            )
                        )}

                    </TextField>


                    {/* RATE */}

                    <TextField
                        fullWidth
                        label="Rate"
                        value={
                            rate
                                ? `₹${rate.toFixed(2)}`
                                : ""
                        }
                        InputProps={{
                            readOnly: true
                        }}
                    />


                    {/* QUANTITY */}

                    <TextField
                        fullWidth
                        label="Qty"
                        type="number"
                        value={qty}
                        onChange={
                            e =>
                                setQty(
                                    e.target.value
                                )
                        }
                        inputProps={{
                            min: 1
                        }}
                    />

                </Box>


                {/* ADD BUTTON */}

                <Box
                    sx={{
                        display: "flex",
                        justifyContent: {
                            xs: "stretch",
                            sm: "flex-end"
                        },
                        mt: {
                            xs: 1.5,
                            md: 2
                        }
                    }}
                >

                    <Button
                        variant="contained"
                        startIcon={
                            <AddIcon />
                        }
                        onClick={
                            addItem
                        }
                        disabled={
                            loadingOfferings ||
                            !devotee
                        }
                        fullWidth
                        sx={{
                            minHeight: 48,
                            width: {
                                xs: "100%",
                                sm: "auto"
                            }
                        }}
                    >

                        Add Offering

                    </Button>

                </Box>


                <Divider
                    sx={{
                        my: 3
                    }}
                />


                {/* NO ITEMS */}

                {items.length === 0 && (

                    <Typography
                        color="text.secondary"
                        sx={{
                            py: 2
                        }}
                    >
                        No offerings added yet.
                    </Typography>

                )}


                {/* OFFERING TABLE */}

                {items.length > 0 && (

                    <>

                        {/* Desktop/tablet table */}

                        <Box
                            sx={{
                                display: {
                                    xs: "none",
                                    sm: "block"
                                },
                                overflowX: "auto"
                            }}
                        >

                            <Table
                                sx={{
                                    minWidth: 720
                                }}
                            >

                                <TableHead>

                                    <TableRow>

                                        <TableCell>
                                            Offering
                                        </TableCell>

                                        <TableCell>
                                            For Name
                                        </TableCell>

                                        <TableCell>
                                            Nakshathra
                                        </TableCell>

                                        <TableCell align="right">
                                            Qty
                                        </TableCell>

                                        <TableCell align="right">
                                            Rate
                                        </TableCell>

                                        <TableCell align="right">
                                            Amount
                                        </TableCell>

                                        <TableCell align="center">
                                            Action
                                        </TableCell>

                                    </TableRow>

                                </TableHead>


                                <TableBody>

                                    {items.map(
                                        item => (

                                            <TableRow
                                                key={item.id}
                                            >

                                                <TableCell>

                                                    <Box>

                                                        <Typography>
                                                            {
                                                                item.offering_name
                                                            }
                                                        </Typography>

                                                        {item.offering_name_ml && (

                                                            <Typography
                                                                variant="caption"
                                                                color="text.secondary"
                                                            >
                                                                {
                                                                    item.offering_name_ml
                                                                }
                                                            </Typography>

                                                        )}

                                                    </Box>

                                                </TableCell>


                                                <TableCell>

                                                    <Box>

                                                        <Typography>
                                                            {
                                                                item.beneficiary_name
                                                            }
                                                        </Typography>

                                                        {item.beneficiary_relationship &&
                                                         item.beneficiary_relationship !== "Self" && (

                                                            <Typography
                                                                variant="caption"
                                                                color="text.secondary"
                                                            >
                                                                {
                                                                    item.beneficiary_relationship
                                                                }
                                                            </Typography>

                                                        )}

                                                    </Box>

                                                </TableCell>


                                                <TableCell>

                                                    {item.nakshathra_en ? (

                                                        <Box>

                                                            <Typography>
                                                                {
                                                                    item.nakshathra_en
                                                                }
                                                            </Typography>

                                                            {item.nakshathra_ml && (

                                                                <Typography
                                                                    variant="caption"
                                                                    color="text.secondary"
                                                                >
                                                                    {
                                                                        item.nakshathra_ml
                                                                    }
                                                                </Typography>

                                                            )}

                                                        </Box>

                                                    ) : (

                                                        <Typography
                                                            color="text.secondary"
                                                        >
                                                            —
                                                        </Typography>

                                                    )}

                                                </TableCell>


                                                <TableCell align="right">

                                                    {
                                                        item.quantity
                                                    }

                                                </TableCell>


                                                <TableCell align="right">

                                                    ₹
                                                    {
                                                        Number(
                                                            item.rate
                                                        ).toFixed(2)
                                                    }

                                                </TableCell>


                                                <TableCell align="right">

                                                    ₹
                                                    {
                                                        Number(
                                                            item.amount
                                                        ).toFixed(2)
                                                    }

                                                </TableCell>


                                                <TableCell align="center">

                                                    <IconButton
                                                        color="error"
                                                        onClick={() =>
                                                            removeItem(
                                                                item.id
                                                            )
                                                        }
                                                        aria-label={
                                                            `Remove ${item.offering_name}`
                                                        }
                                                    >

                                                        <DeleteIcon />

                                                    </IconButton>

                                                </TableCell>

                                            </TableRow>

                                        )
                                    )}

                                </TableBody>

                            </Table>

                        </Box>


                        {/* Mobile cards */}

                        <Box
                            sx={{
                                display: {
                                    xs: "flex",
                                    sm: "none"
                                },
                                flexDirection: "column",
                                gap: 1.5
                            }}
                        >

                            {items.map(
                                item => (

                                    <Paper
                                        key={item.id}
                                        variant="outlined"
                                        sx={{
                                            p: 1.5,
                                            borderRadius: 1.5
                                        }}
                                    >

                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent:
                                                    "space-between",
                                                alignItems:
                                                    "flex-start",
                                                gap: 1
                                            }}
                                        >

                                            <Box
                                                sx={{
                                                    minWidth: 0,
                                                    flex: 1
                                                }}
                                            >

                                                <Typography
                                                    sx={{
                                                        fontWeight: 600,
                                                        lineHeight: 1.3,
                                                        overflowWrap:
                                                            "anywhere"
                                                    }}
                                                >
                                                    {
                                                        item.offering_name
                                                    }
                                                </Typography>


                                                {item.offering_name_ml && (

                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                    >
                                                        {
                                                            item.offering_name_ml
                                                        }
                                                    </Typography>

                                                )}

                                            </Box>


                                            <IconButton
                                                color="error"
                                                onClick={() =>
                                                    removeItem(
                                                        item.id
                                                    )
                                                }
                                                aria-label={
                                                    `Remove ${item.offering_name}`
                                                }
                                                sx={{
                                                    minWidth: 44,
                                                    minHeight: 44,
                                                    flexShrink: 0
                                                }}
                                            >

                                                <DeleteIcon />

                                            </IconButton>

                                        </Box>


                                        <Divider
                                            sx={{
                                                my: 1
                                            }}
                                        />


                                        <Box
                                            sx={{
                                                display: "grid",
                                                gridTemplateColumns:
                                                    "1fr 1fr",
                                                gap: 1.25
                                            }}
                                        >

                                            <Box>

                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                >
                                                    For Name
                                                </Typography>

                                                <Typography
                                                    sx={{
                                                        overflowWrap:
                                                            "anywhere"
                                                    }}
                                                >
                                                    {
                                                        item.beneficiary_name ||
                                                        "—"
                                                    }
                                                </Typography>

                                                {item.beneficiary_relationship &&
                                                 item.beneficiary_relationship !== "Self" && (

                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                    >
                                                        {
                                                            item.beneficiary_relationship
                                                        }
                                                    </Typography>

                                                )}

                                            </Box>


                                            <Box>

                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                >
                                                    Nakshathra
                                                </Typography>

                                                <Typography>
                                                    {
                                                        item.nakshathra_en ||
                                                        "—"
                                                    }
                                                </Typography>

                                                {item.nakshathra_ml && (

                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                    >
                                                        {
                                                            item.nakshathra_ml
                                                        }
                                                    </Typography>

                                                )}

                                            </Box>


                                            <Box>

                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                >
                                                    Quantity
                                                </Typography>

                                                <Typography>
                                                    {
                                                        item.quantity
                                                    }
                                                </Typography>

                                            </Box>


                                            <Box>

                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                >
                                                    Rate
                                                </Typography>

                                                <Typography>

                                                    ₹
                                                    {
                                                        Number(
                                                            item.rate
                                                        ).toFixed(2)
                                                    }

                                                </Typography>

                                            </Box>


                                            <Box
                                                sx={{
                                                    gridColumn:
                                                        "1 / -1"
                                                }}
                                            >

                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                >
                                                    Amount
                                                </Typography>

                                                <Typography
                                                    sx={{
                                                        fontSize:
                                                            "1.1rem",
                                                        fontWeight:
                                                            700
                                                    }}
                                                >

                                                    ₹
                                                    {
                                                        Number(
                                                            item.amount
                                                        ).toFixed(2)
                                                    }

                                                </Typography>

                                            </Box>

                                        </Box>

                                    </Paper>

                                )
                            )}

                        </Box>

                    </>

                )}


                {/* TOTAL */}

                <Box
                    sx={{
                        display: "flex",
                        justifyContent: {
                            xs: "stretch",
                            sm: "flex-end"
                        },
                        mt: {
                            xs: 2,
                            md: 3
                        }
                    }}
                >

                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 700,
                            fontSize: {
                                xs: "1.5rem",
                                sm: "1.75rem",
                                md: "2rem"
                            }
                        }}
                    >

                        Total: ₹
                        {
                            total.toFixed(2)
                        }

                    </Typography>

                </Box>

            </Paper>

        </Box>

    );

}