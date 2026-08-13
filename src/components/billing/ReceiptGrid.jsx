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
    onItemsChange
}) {

    // =====================================================
    // STATE
    // =====================================================

    const [items, setItems] = useState([]);
    const [offerings, setOfferings] = useState([]);
    const [nakshathras, setNakshathras] = useState([]);
    const [offeringId, setOfferingId] = useState("");
    const [beneficiaryName, setBeneficiaryName] = useState("");
    const [nakshathra, setNakshathra] = useState("");
    const [qty, setQty] = useState(1);
    const [loadingOfferings, setLoadingOfferings] = useState(false);
    const [loadingNakshathras, setLoadingNakshathras] = useState(false);
    const [error, setError] = useState("");
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
    }, [items, onItemsChange]);

    // =====================================================
    // DEFAULT FOR NAME FROM SELECTED DEVOTEE
    // =====================================================
    useEffect(() => {
    if (devotee?.full_name) {
        setBeneficiaryName(devotee.full_name);
    } else {
        setBeneficiaryName("");
    }
}, [devotee]);

    // =====================================================
    // LOAD OFFERINGS
    // =====================================================
    const loadOfferings = async () => {
        try {
            setLoadingOfferings(true);
            setError("");
    const response = await apiFetch("/api/offerings");
    const data = await response.json();
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
            (item) =>
                item.id === Number(offeringId)
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
            (star) =>
                star.id === Number(nakshathra)
        );


    // =====================================================
    // RATE
    // =====================================================

    const rate = selectedOffering
        ? Number(selectedOffering.amount)
        : 0;


    // =====================================================
    // OFFERING CHANGE
    // =====================================================

    const handleOfferingChange = (event) => {
        const newOfferingId = event.target.value;
        setOfferingId(newOfferingId);
    const newOffering =
            offerings.find(
                (item) =>
                    item.id ===
                    Number(newOfferingId)
            );
        if (
            !newOffering ||
            !newOffering.requires_nakshathra
        ) {

            setNakshathra("");

        }

    };


    // =====================================================
    // ADD OFFERING
    // =====================================================

    const addItem = () => {

        if (!selectedOffering) {

            alert(
                "Please select an offering"
            );

            return;

        }


        if (!beneficiaryName.trim()) {

            alert(
                "Please enter the name of the person for whom the offering is made"
            );

            return;

        }


        // Nakshathra is mandatory ONLY when
        // the Offering Master says it is required.

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


        const newItem = {

            id: Date.now(),

            offering_id:
                selectedOffering.id,

            offering_name:
                selectedOffering.offering_name,

            offering_name_ml:
                selectedOffering.offering_name_ml || "",


            beneficiary_name:
                beneficiaryName.trim(),

            beneficiary_devotee_id:
                devotee && devotee.id
                    ? Number(devotee.id)
                    : null,


            // Nakshathra is optional.

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
            (previousItems) => [
                ...previousItems,
                newItem
            ]
        );


        // =================================================
        // CLEAR OFFERING ONLY
        // =================================================
        //
        // Keep For Name populated with the selected
        // devotee so the next offering automatically
        // uses the same person.
        //
        // =================================================

        setOfferingId("");

        setNakshathra("");

        setQty(1);

    };


    // =====================================================
    // REMOVE ITEM
    // =====================================================

    const removeItem = (id) => {

        setItems(
            (previousItems) =>
                previousItems.filter(
                    (item) =>
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

                        gridTemplateColumns:
                            "1.4fr 1.4fr 1.2fr 100px 100px",

                        gap: 2,

                        alignItems: "center",

                        "@media (max-width: 1000px)": {

                            gridTemplateColumns:
                                "1fr 1fr"

                        }

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
                        disabled={loadingOfferings}
                    >

                        <MenuItem value="">
                            {loadingOfferings
                                ? "Loading Offerings..."
                                : "Select Offering"}
                        </MenuItem>


                        {offerings.map(
                            (item) => (

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
                        fullWidth
                        label="For Name"
                        placeholder="Person receiving offering"
                        value={beneficiaryName}
                        onChange={(e) =>
                            setBeneficiaryName(
                                e.target.value
                            )
                        }
                    />


                    {/* NAKSHATHRA */}

                    <TextField
    select
    fullWidth
    label={
        requiresNakshathra
            ? "Nakshathra *"
            : "Nakshathra"
    }
    value={nakshathra}
    onChange={(e) =>
        setNakshathra(e.target.value)
    }
    required={requiresNakshathra}
>
    <MenuItem value="">
        Select Nakshathra
    </MenuItem>

    {nakshathras.map((star) => (
        <MenuItem
            key={star.id}
            value={star.id}
        >
            {star.name_en}
            {star.name_ml
                ? ` - ${star.name_ml}`
                : ""}
        </MenuItem>
    ))}
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
                        onChange={(e) =>
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
                        justifyContent:
                            "flex-end",
                        mt: 2
                    }}
                >

                    <Button
                        variant="contained"
                        startIcon={
                            <AddIcon />
                        }
                        onClick={addItem}
                        disabled={
                            loadingOfferings
                        }
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

                    <Table>

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
                                (item) => (

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
                                            {
                                                item.beneficiary_name
                                            }
                                        </TableCell>


                                        <TableCell>

                                            {item.nakshathra_en
                                                ? (
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
                                                )
                                                : (
                                                    <Typography
                                                        color="text.secondary"
                                                    >
                                                        —
                                                    </Typography>
                                                )}

                                        </TableCell>


                                        <TableCell
                                            align="right"
                                        >
                                            {
                                                item.quantity
                                            }
                                        </TableCell>


                                        <TableCell
                                            align="right"
                                        >
                                            ₹
                                            {Number(
                                                item.rate
                                            ).toFixed(2)}
                                        </TableCell>


                                        <TableCell
                                            align="right"
                                        >
                                            ₹
                                            {Number(
                                                item.amount
                                            ).toFixed(2)}
                                        </TableCell>


                                        <TableCell
                                            align="center"
                                        >

                                            <IconButton
                                                color="error"
                                                onClick={() =>
                                                    removeItem(
                                                        item.id
                                                    )
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

                )}


                {/* TOTAL */}

                <Box
                    sx={{
                        display: "flex",
                        justifyContent:
                            "flex-end",
                        mt: 3
                    }}
                >

                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 700
                        }}
                    >

                        Total: ₹
                        {total.toFixed(2)}

                    </Typography>

                </Box>

            </Paper>

        </Box>

    );

}