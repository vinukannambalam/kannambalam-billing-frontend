import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Paper,
    TextField,
    Button,
    Typography,
    Alert,
    CircularProgress,
    IconButton,
    InputAdornment
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

const API_BASE = "https://billing-api.kannambalam.com";

export default function Login() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // ==================================================
    // LOGIN
    // ==================================================

    const handleLogin = async (event) => {

        event.preventDefault();

        setError("");

        if (!username.trim()) {

            setError("Please enter username");

            return;

        }

        if (!password) {

            setError("Please enter password");

            return;

        }


        try {

            setLoading(true);

            const response = await fetch(
                `${API_BASE}/api/auth/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        username: username.trim(),
                        password: password
                    })
                }
            );


            const data = await response.json();


            if (!response.ok) {

                throw new Error(
                    data.error || "Login failed"
                );

            }


            // ==================================================
            // CLEAR OLD LOGIN INFORMATION
            // ==================================================

            localStorage.removeItem("billing_token");
            localStorage.removeItem("billing_user");

            localStorage.removeItem("token");
            localStorage.removeItem("user");


            // ==================================================
            // STORE CURRENT LOGIN
            // ==================================================

            localStorage.setItem(
                "billing_token",
                data.token
            );

            localStorage.setItem(
                "billing_user",
                JSON.stringify(data.user)
            );


            // ==================================================
            // GO TO DASHBOARD
            // ==================================================

            navigate("/", {
                replace: true
            });

        }
        catch (error) {

            console.error(
                "Login error:",
                error
            );

            setError(
                error.message ||
                "Unable to login"
            );

        }
        finally {

            setLoading(false);

        }

    };


    // ==================================================
    // TOGGLE PASSWORD VISIBILITY
    // ==================================================

    const handleTogglePassword = () => {

        setShowPassword(
            (previous) => !previous
        );

    };


    // ==================================================
    // RENDER
    // ==================================================

    return (

        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#f5f5f5"
            }}
        >

            <Paper
                elevation={4}
                sx={{
                    width: 380,
                    maxWidth: "90%",
                    padding: 4
                }}
            >

                <Typography
                    variant="h5"
                    align="center"
                    fontWeight="bold"
                >
                    Kannambalam Temple
                </Typography>


                <Typography
                    variant="subtitle1"
                    align="center"
                    color="text.secondary"
                    sx={{
                        mb: 3
                    }}
                >
                    Billing System
                </Typography>


                {error && (

                    <Alert
                        severity="error"
                        sx={{
                            mb: 2
                        }}
                    >
                        {error}
                    </Alert>

                )}


                <Box
                    component="form"
                    onSubmit={handleLogin}
                >

                    {/* USERNAME */}

                    <TextField
                        fullWidth
                        label="Username"
                        value={username}
                        onChange={(event) =>
                            setUsername(
                                event.target.value
                            )
                        }
                        margin="normal"
                        autoFocus
                        autoComplete="username"
                    />


                    {/* PASSWORD */}

                    <TextField
                        fullWidth
                        label="Password"
                        type={
                            showPassword
                                ? "text"
                                : "password"
                        }
                        value={password}
                        onChange={(event) =>
                            setPassword(
                                event.target.value
                            )
                        }
                        margin="normal"
                        autoComplete="current-password"

                        slotProps={{
                            input: {

                                endAdornment: (

                                    <InputAdornment
                                        position="end"
                                    >

                                        <IconButton
                                            type="button"
                                            onClick={
                                                handleTogglePassword
                                            }
                                            edge="end"
                                            aria-label={
                                                showPassword
                                                    ? "Hide password"
                                                    : "Show password"
                                            }
                                            sx={{
                                                color: "text.secondary"
                                            }}
                                        >

                                            {showPassword ? (

                                                <VisibilityOffIcon />

                                            ) : (

                                                <VisibilityIcon />

                                            )}

                                        </IconButton>

                                    </InputAdornment>

                                )

                            }
                        }}

                    />


                    {/* LOGIN BUTTON */}

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        disabled={loading}
                        sx={{
                            mt: 3,
                            height: 45
                        }}
                    >

                        {loading ? (

                            <CircularProgress
                                size={24}
                                color="inherit"
                            />

                        ) : (

                            "Login"

                        )}

                    </Button>

                </Box>

            </Paper>

        </Box>

    );

}