export default function DashboardSkeleton() {
    return (
        <div className="patient-dashboard">

            <div className="dashboard-skeleton skeleton header"></div>

            <div className="dashboard-skeleton skeleton health"></div>

            <div className="dashboard-summary-grid">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div className="dashboard-card skeleton-card" key={i}>
                        <div className="circle"></div>

                        <div className="text">
                            <div className="line short"></div>
                            <div className="line"></div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="dashboard-skeleton skeleton appointment"></div>

            <div className="section-title skeleton title"></div>

            <div className="quick-action-grid">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div className="quick-action-card skeleton-card" key={i}>
                        <div className="circle"></div>
                        <div className="line"></div>
                    </div>
                ))}
            </div>

            <div className="dashboard-two-column">

                <div className="dashboard-panel">

                    <div className="line title"></div>

                    {[1, 2, 3, 4].map(i => (
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

                    <div className="line title"></div>

                    {[1, 2, 3].map(i => (
                        <div className="medicine-card" key={i}>
                            <div style={{ flex: 1 }}>
                                <div className="line"></div>
                                <div className="line short"></div>
                            </div>

                            <div className="line tiny"></div>
                        </div>
                    ))}

                </div>

            </div>

            <div className="dashboard-panel">

                <div className="line title"></div>

                <div className="tips-grid">

                    {[1, 2, 3, 4, 5].map(i => (
                        <div className="tip-card skeleton-card" key={i}>
                            <div className="line"></div>
                            <div className="line"></div>
                            <div className="line short"></div>
                        </div>
                    ))}

                </div>

            </div>

            <div className="dashboard-panel">

                <div className="line title"></div>

                <div className="progress-bar">
                    <div className="progress-fill" style={{ width: "40%" }}></div>
                </div>

            </div>

        </div>
    );
}