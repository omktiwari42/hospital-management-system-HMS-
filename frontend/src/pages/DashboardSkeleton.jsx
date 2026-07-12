export default function DashboardSkeleton() {
    return (
        <div className="patient-dashboard">

            {/* Header */}
            <div className="dashboard-skeleton skeleton header"></div>

            {/* Health Score */}
            <div className="dashboard-skeleton skeleton health"></div>

            {/* Summary Cards */}
            <div className="dashboard-summary-grid">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div className="dashboard-card skeleton-card" key={i}>
                        <div className="circle"></div>

                        <div style={{ flex: 1 }}>
                            <div className="line short"></div>
                            <div className="line"></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ===========================
            NEW Upcoming Appointment
        ============================ */}

            <div className="next-appointment-card skeleton-card">

                <div style={{ flex: 1 }}>

                    <div
                        className="line"
                        style={{ width: "180px", height: "18px", marginBottom: "20px" }}
                    ></div>

                    <div
                        className="line"
                        style={{ width: "260px", height: "32px", marginBottom: "18px" }}
                    ></div>

                    <div
                        className="line"
                        style={{ width: "180px", marginBottom: "12px" }}
                    ></div>

                    <div
                        className="line"
                        style={{ width: "220px" }}
                    ></div>

                </div>

                <div style={{ width: "180px", textAlign: "right" }}>

                    <div
                        className="line"
                        style={{ width: "70px", marginLeft: "auto" }}
                    ></div>

                    <div
                        className="line"
                        style={{
                            width: "120px",
                            height: "40px",
                            marginLeft: "auto",
                            marginTop: "20px",
                        }}
                    ></div>

                </div>

            </div>

            {/* Quick Actions Title */}

            <div
                className="line"
                style={{
                    width: "220px",
                    height: "28px",
                    margin: "30px 0 20px",
                }}
            ></div>

            {/* Quick Actions */}

            <div className="quick-action-grid">

                {[1, 2, 3, 4, 5, 6].map((i) => (

                    <div className="quick-action-card skeleton-card" key={i}>

                        <div className="circle"></div>

                        <div
                            className="line"
                            style={{
                                width: "80%",
                                marginTop: "20px",
                            }}
                        ></div>

                    </div>

                ))}

            </div>

            {/* Recent Activity + Medicine */}

            <div className="dashboard-two-column">

                <div className="dashboard-panel">

                    <div
                        className="line"
                        style={{
                            width: "180px",
                            height: "25px",
                            marginBottom: "25px",
                        }}
                    ></div>

                    {[1, 2, 3, 4].map((i) => (

                        <div className="activity-item" key={i}>

                            <div className="circle"></div>

                            <div style={{ flex: 1 }}>

                                <div className="line"></div>

                                <div className="line short"></div>

                            </div>

                        </div>

                    ))}

                </div>

                <div className="dashboard-panel">

                    <div
                        className="line"
                        style={{
                            width: "220px",
                            height: "25px",
                            marginBottom: "25px",
                        }}
                    ></div>

                    {[1, 2, 3].map((i) => (

                        <div className="medicine-card" key={i}>

                            <div style={{ flex: 1 }}>

                                <div className="line"></div>

                                <div className="line short"></div>

                            </div>

                            <div
                                className="line"
                                style={{
                                    width: "80px",
                                    height: "24px",
                                }}
                            ></div>

                        </div>

                    ))}

                </div>

            </div>

            {/* Health Tips */}

            <div className="dashboard-panel">

                <div
                    className="line"
                    style={{
                        width: "180px",
                        height: "25px",
                        marginBottom: "25px",
                    }}
                ></div>

                <div className="tips-grid">

                    {[1, 2, 3, 4, 5].map((i) => (

                        <div className="tip-card skeleton-card" key={i}>

                            <div className="line"></div>

                            <div className="line"></div>

                            <div className="line short"></div>

                        </div>

                    ))}

                </div>

            </div>

            {/* Appointment Completion */}

            <div className="dashboard-panel">

                <div
                    className="line"
                    style={{
                        width: "240px",
                        height: "25px",
                        marginBottom: "25px",
                    }}
                ></div>

                <div className="progress-bar">

                    <div
                        className="progress-fill"
                        style={{
                            width: "45%",
                        }}
                    ></div>

                </div>

                <div
                    className="line"
                    style={{
                        width: "140px",
                        marginTop: "18px",
                    }}
                ></div>

            </div>

            {/* Footer */}

            <div
                className="dashboard-panel"
                style={{
                    textAlign: "center",
                    padding: "30px",
                }}
            >

                <div
                    className="line"
                    style={{
                        width: "260px",
                        margin: "0 auto 15px",
                    }}
                ></div>

                <div
                    className="line"
                    style={{
                        width: "180px",
                        margin: "0 auto",
                    }}
                ></div>

            </div>

        </div>
    );
}