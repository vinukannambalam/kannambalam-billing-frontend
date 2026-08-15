import { Box, Paper, Typography } from "@mui/material";

export default function SupplierMaster() {

    return (
        <Box sx={{ p: 3 }}>

            <Typography
                variant="h4"
                sx={{
                    mb: 3,
                    fontWeight: 600
                }}
            >
                Supplier Master
            </Typography>

            <Paper
                sx={{
                    p: 4
                }}
            >
                <Typography variant="body1">
                    Supplier Master module is under development.
                </Typography>
            </Paper>

        </Box>
    );
}
