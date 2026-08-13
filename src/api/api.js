const API_BASE = "https://billing-api.kannambalam.com";
export async function apiFetch(
    endpoint,
    options = {}
) {
    const token =
        localStorage.getItem("billing_token");
    const headers = {
        ...(options.headers || {})
    };
    if (token) {

        headers.Authorization =
            `Bearer ${token}`;

    }
    const response =
        await fetch(
            `${API_BASE}${endpoint}`,
            {
                ...options,
                headers
            }
        );
    if (
        response.status === 401
    ) {

        localStorage.removeItem(
            "billing_token"
        );

        localStorage.removeItem(
            "billing_user"
        );

        window.location.href =
            "/login";

        return response;

    }
    return response;

}