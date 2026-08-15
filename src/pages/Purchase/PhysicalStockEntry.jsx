import { Box, Paper, Typography } from "@mui/material";

export default function PhysicalStockEntry() {

    return (
        <Box sx={{ p: 3 }}>

            <Typography
                variant="h4"
                sx={{
                    mb: 3,
                    fontWeight: 600
                }}
            >
                Physical Stock Entry
            </Typography>

            <Paper
                sx={{
                    p: 4
                }}
            >
                <Typography variant="body1">
                    Physical Stock Entry module is under development.
                </Typography>
            </Paper>

        </Box>
    );
}
