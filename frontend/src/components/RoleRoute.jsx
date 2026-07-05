import { Navigate } from "react-router-dom";

export default function RoleRoute({ children, roles }) {
    const role = sessionStorage.getItem("role");

    if (!roles.includes(role)) {
        switch (role) {
            case "admin":
                return <Navigate to="/dashboard" replace />;

            case "doctor":
                return <Navigate to="/doctor-dashboard" replace />;

            case "receptionist":
                return <Navigate to="/reception-dashboard" replace />;

            case "pharmacist":
                return <Navigate to="/pharmacist-dashboard" replace />;

            case "lab":
                return <Navigate to="/lab-dashboard" replace />;

            case "patient":
                return <Navigate to="/patient-dashboard" replace />;

            default:
                return <Navigate to="/login" replace />;
        }
    }

    return children;
}