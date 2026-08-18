export default function BookAppointmentSkeleton() {
    return (
        <div className="book-appointment-skeleton-page">

            {/* =========================================
                MAIN CARD
            ========================================= */}

            <div className="book-appointment-skeleton-container">

                {/* =====================================
                    HEADER
                ===================================== */}

                <div className="book-skeleton-header">

                    <div className="book-skeleton-title-area">

                        <div className="book-skeleton-eyebrow skeleton-shimmer"></div>

                        <div className="book-skeleton-title skeleton-shimmer"></div>

                        <div className="book-skeleton-subtitle skeleton-shimmer"></div>

                    </div>

                    <div className="book-skeleton-back skeleton-shimmer"></div>

                </div>


                {/* =====================================
                    SELECTED DOCTOR
                ===================================== */}

                <div className="book-skeleton-doctor-card">

                    <div className="book-skeleton-doctor-left">

                        <div className="book-skeleton-doctor-icon skeleton-shimmer"></div>

                        <div className="book-skeleton-doctor-info">

                            <div className="book-skeleton-selected-label skeleton-shimmer"></div>

                            <div className="book-skeleton-doctor-name skeleton-shimmer"></div>

                            <div className="book-skeleton-doctor-specialization skeleton-shimmer"></div>

                        </div>

                    </div>


                    <div className="book-skeleton-doctor-meta">

                        <div className="book-skeleton-meta">

                            <div className="book-skeleton-meta-label skeleton-shimmer"></div>

                            <div className="book-skeleton-meta-value skeleton-shimmer"></div>

                        </div>

                        <div className="book-skeleton-meta">

                            <div className="book-skeleton-meta-label skeleton-shimmer"></div>

                            <div className="book-skeleton-meta-value skeleton-shimmer"></div>

                        </div>

                    </div>

                </div>


                {/* =====================================
                    APPOINTMENT DETAILS
                ===================================== */}

                <div className="book-skeleton-details-card">

                    <div className="book-skeleton-details-heading">

                        <div className="book-skeleton-details-title skeleton-shimmer"></div>

                        <div className="book-skeleton-details-subtitle skeleton-shimmer"></div>

                    </div>


                    <div className="book-skeleton-divider"></div>


                    {/* FORM */}

                    <div className="book-skeleton-form-grid">

                        {[1, 2, 3, 4, 5, 6].map((item) => (

                            <div
                                className="book-skeleton-field"
                                key={item}
                            >

                                <div className="book-skeleton-field-label skeleton-shimmer"></div>

                                <div className="book-skeleton-field-input skeleton-shimmer"></div>

                            </div>

                        ))}


                        {/* Reason */}

                        <div className="book-skeleton-field">

                            <div className="book-skeleton-field-label reason skeleton-shimmer"></div>

                            <div className="book-skeleton-textarea skeleton-shimmer"></div>

                        </div>

                    </div>


                    <div className="book-skeleton-bottom-divider"></div>


                    {/* ACTIONS */}

                    <div className="book-skeleton-actions">

                        <div className="book-skeleton-clear skeleton-shimmer"></div>

                        <div className="book-skeleton-pay skeleton-shimmer"></div>

                    </div>

                </div>

            </div>

        </div>
    );
}