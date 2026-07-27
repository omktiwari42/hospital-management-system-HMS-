function MedicalReportsSkeleton() {
    return (
        <div className="page">
            <div className="page-header">
                <div className="skeleton skeleton-btn"></div>
                <div className="skeleton skeleton-title"></div>
            </div>

            <div className="card">
                <div className="skeleton skeleton-input"></div>
            </div>

            <div className="reports-grid">
                {[...Array(6)].map((_, index) => (
                    <div className="report-card" key={index}>
                        <div className="skeleton skeleton-avatar"></div>

                        <div className="skeleton skeleton-text"></div>
                        <div className="skeleton skeleton-text short"></div>

                        <div className="report-actions">
                            <div className="skeleton skeleton-action"></div>
                            <div className="skeleton skeleton-action"></div>
                            <div className="skeleton skeleton-action"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default MedicalReportsSkeleton;