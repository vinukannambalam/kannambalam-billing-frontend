import { Box, Paper, Typography } from "@mui/material";

export default function PurchaseInvoice() {

    return (
        <Box sx={{ p: 3 }}>

            <Typography
                variant="h4"
                sx={{
                    mb: 3,
                    fontWeight: 600
                }}
            >
                Purchase Invoice
            </Typography>

            <Paper
                sx={{
                    p: 4
                }}
            >
                <Typography variant="body1">
                    Purchase Invoice module is under development.
                </Typography>
            </Paper>

        </Box>
    );
}
