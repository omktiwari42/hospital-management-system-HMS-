function MedicalHistorySkeleton() {
    return (
        <div className="history-grid">

            {[...Array(6)].map((_, index) => (
                <div
                    key={index}
                    className="history-card skeleton-card"
                >
                    <div className="skeleton skeleton-icon"></div>

                    <div className="skeleton skeleton-title"></div>

                    <div className="skeleton skeleton-line"></div>
                    <div className="skeleton skeleton-line"></div>
                    <div className="skeleton skeleton-line short"></div>
                </div>
            ))}

        </div>
    );
}

export default MedicalHistorySkeleton;