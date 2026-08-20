import { Navigate, Outlet } from "react-router-dom";

export default function DeveloperRoute() {
    const storedUser =
        localStorage.getItem("billing_user");

    let user = null;

    try {
        user = storedUser
            ? JSON.parse(storedUser)
            : null;
    } catch (error) {
        console.error(
            "Unable to read logged-in user:",
            error
        );
    }

    const role =
        String(user?.role || "")
            .trim()
            .toLowerCase();

    if (
        role === "developer"
    ) {
        return <Outlet />;
    }

    return (
        <Navigate
            to="/"
            replace
        />
    );
}