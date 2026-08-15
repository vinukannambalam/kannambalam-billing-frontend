import { Box, Paper, Typography } from "@mui/material";

export default function JournalVoucher() {

    return (
        <Box sx={{ p: 3 }}>

            <Typography
                variant="h4"
                sx={{
                    mb: 3,
                    fontWeight: 600
                }}
            >
                Journal Voucher
            </Typography>

            <Paper
                sx={{
                    p: 4
                }}
            >
                <Typography variant="body1">
                    Journal Voucher module is under development.
                </Typography>
            </Paper>

        </Box>
    );
}
