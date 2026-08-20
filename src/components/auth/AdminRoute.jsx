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


    // Logged in but without an Administrator/Developer role
    const legacyRole =
        String(user?.role || "").trim().toLowerCase();

    const assignedRoles = Array.isArray(user?.roles)
        ? user.roles.map((item) =>
            String(item?.role_name || item || "")
                .trim()
                .toLowerCase()
        )
        : [];

    const canAccessAdministration =
        legacyRole === "admin" ||
        legacyRole === "administrator" ||
        legacyRole === "developer" ||
        assignedRoles.includes("admin") ||
        assignedRoles.includes("administrator") ||
        assignedRoles.includes("developer");

    if (!user || !canAccessAdministration) {

        return (
            <Navigate
                to="/"
                replace
            />
        );

    }


    return <Outlet />;
}