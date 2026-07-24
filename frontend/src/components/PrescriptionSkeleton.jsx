function PrescriptionSkeleton() {
    return (
        <div className="prescription-page">
            <div className="prescription-header">
                <div className="skeleton skeleton-title"></div>
            </div>

            {[1, 2, 3].map((i) => (
                <div
                    className="prescription-card skeleton-card"
                    key={i}
                >
                    <div className="skeleton skeleton-line"></div>
                    <div className="skeleton skeleton-line"></div>
                    <div className="skeleton skeleton-line"></div>
                    <div className="skeleton skeleton-line"></div>
                </div>
            ))}
        </div>
    );
}

export default PrescriptionSkeleton;