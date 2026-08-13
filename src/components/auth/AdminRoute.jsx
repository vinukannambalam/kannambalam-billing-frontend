import { Navigate, Outlet } from "react-router-dom";

export default function AdminRoute() {

    const token = localStorage.getItem("billing_token");

    const user = JSON.parse(
        localStorage.getItem("billing_user") || "null"
    );


    // Not logged in
    if (!token) {

        return (
            <Navigate
                to="/login"
                replace
            />
        );

    }


    // Logged in but not Administrator
    if (
        !user ||
        String(user.role).trim().toLowerCase() !== "administrator"
    ) {

        return (
            <Navigate
                to="/"
                replace
            />
        );

    }


    return <Outlet />;
}