import { useState } from "react";

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Grid
} from "@mui/material";

import { DataGrid } from "@mui/x-data-grid";

const rows = [
    {
        id: 1,
        offering_name: "Archana",
        rate: 20
    },
    {
        id: 2,
        offering_name: "Pushpanjali",
        rate: 50
    },
    {
        id: 3,
        offering_name: "Neyvilakku",
        rate: 100
    }
];

const columns = [

    {
        field: "offering_name",
        headerName: "Offering",
        flex: 1
    },

    {
        field: "rate",
        headerName: "Rate",
        width: 120
    }

];

export default function OfferingSearchDialog({

    open,

    onClose,

    onSelect

}) {

    const [selected, setSelected] = useState(null);

    const [qty, setQty] = useState(1);

    return (

        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="md"
        >

            <DialogTitle>

                Select Offering

            </DialogTitle>

            <DialogContent>

                <TextField
                    fullWidth
                    label="Search Offering"
                    sx={{ mt: 1, mb: 2 }}
                />

                <div style={{ height: 300 }}>

                    <DataGrid

                        rows={rows}

                        columns={columns}

                        onRowClick={(params) =>
                            setSelected(params.row)
                        }

                    />

                </div>

                <Grid container spacing={2} sx={{ mt: 2 }}>

                    <Grid item xs={4}>

                        <TextField
                            fullWidth
                            type="number"
                            label="Quantity"
                            value={qty}
                            onChange={(e) =>
                                setQty(Number(e.target.value))
                            }
                        />

                    </Grid>

                </Grid>

            </DialogContent>

            <DialogActions>

                <Button onClick={onClose}>

                    Cancel

                </Button>

                <Button

                    variant="contained"

                    disabled={!selected}

                    onClick={() => {

                        onSelect({

                            ...selected,

                            qty,

                            amount: qty * selected.rate

                        });

                        onClose();

                    }}

                >

                    Add

                </Button>

            </DialogActions>

        </Dialog>

    );

}