import { Navigate } from "react-router-dom";

function PublicRoute({
    children,
}) {
    const token =
        sessionStorage.getItem(
            "token"
        );

    return token ? (
        <Navigate
            to="/dashboard"
        />
    ) : (
        children
    );
}

export default PublicRoute;