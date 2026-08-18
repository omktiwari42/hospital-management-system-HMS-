import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function DashboardLayout({ children }) {
    return (
        <div className="hms-shell">

            {/* =========================
                SIDEBAR
            ========================= */}

            <Sidebar />


            {/* =========================
                MAIN AREA
            ========================= */}

            <div className="hms-main">

                {/* Navbar stays inside main area */}
                <Navbar />


                {/* Page content */}
                <main className="hms-page">
                    {children}
                </main>

            </div>

        </div>
    );
}

export default DashboardLayout;