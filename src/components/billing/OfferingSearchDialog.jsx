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
            PaperProps={{
                sx: {
                    m: { xs: 1, sm: 2 },
                    width: { xs: "calc(100% - 16px)", sm: "calc(100% - 32px)" },
                    maxHeight: { xs: "calc(100% - 16px)", sm: "calc(100% - 32px)" }
                }
            }}
        >

            <DialogTitle
                sx={{
                    px: { xs: 2, sm: 3 },
                    py: { xs: 1.5, sm: 2 }
                }}
            >
                Select Offering
            </DialogTitle>

            <DialogContent
                sx={{
                    px: { xs: 2, sm: 3 },
                    py: { xs: 1, sm: 2 }
                }}
            >

                <TextField
                    fullWidth
                    label="Search Offering"
                    size="small"
                    sx={{ mt: 1, mb: { xs: 1.5, sm: 2 } }}
                />

                <div style={{ height: 300, width: "100%" }}>

                    <DataGrid

                        rows={rows}

                        columns={columns}

                        onRowClick={(params) =>
                            setSelected(params.row)
                        }

                        sx={{
                            "& .MuiDataGrid-columnHeaderTitle": {
                                fontWeight: 600
                            },
                            "& .MuiDataGrid-row": {
                                minHeight: { xs: "52px !important", sm: "52px !important" }
                            },
                            "& .MuiDataGrid-cell": {
                                py: { xs: 1, sm: 0.5 }
                            }
                        }}

                    />

                </div>

                <Grid
                    container
                    spacing={2}
                    sx={{ mt: { xs: 1, sm: 2 } }}
                >

                    <Grid item xs={12} sm={4}>

                        <TextField
                            fullWidth
                            type="number"
                            label="Quantity"
                            value={qty}
                            inputProps={{ min: 1 }}
                            size="small"
                            onChange={(e) =>
                                setQty(Number(e.target.value))
                            }
                        />

                    </Grid>

                </Grid>

            </DialogContent>

            <DialogActions
                sx={{
                    px: { xs: 2, sm: 3 },
                    py: { xs: 1.5, sm: 2 },
                    gap: 1,
                    flexDirection: { xs: "column-reverse", sm: "row" },
                    alignItems: { xs: "stretch", sm: "center" }
                }}
            >

                <Button
                    onClick={onClose}
                    fullWidth
                    sx={{
                        minHeight: 48,
                        width: { xs: "100%", sm: "auto" }
                    }}
                >
                    Cancel
                </Button>

                <Button

                    variant="contained"

                    disabled={!selected}
                    fullWidth
                    sx={{
                        minHeight: 48,
                        width: { xs: "100%", sm: "auto" }
                    }}

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