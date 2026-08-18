function SkeletonBlock({
    className = "",
}) {
    return (
        <div
            className={`patient-doctors-skeleton ${className}`}
        />
    );
}


export default function PatientDoctorsSkeleton() {
    return (
        <div className="patient-doctors-page">

            {/* HEADER */}

            <div className="patient-doctors-header">

                <SkeletonBlock
                    className="back-button-skeleton"
                />

                <div className="patient-doctors-header-content">

                    <SkeletonBlock
                        className="eyebrow-skeleton"
                    />

                    <SkeletonBlock
                        className="title-skeleton"
                    />

                    <SkeletonBlock
                        className="subtitle-skeleton"
                    />

                </div>

            </div>


            {/* SUMMARY */}

            <div className="patient-doctors-summary">

                {[1, 2, 3].map((item) => (

                    <div
                        className="patient-doctors-summary-card"
                        key={item}
                    >

                        <SkeletonBlock
                            className="summary-icon-skeleton"
                        />

                        <div className="summary-content-skeleton">

                            <SkeletonBlock
                                className="summary-number-skeleton"
                            />

                            <SkeletonBlock
                                className="summary-label-skeleton"
                            />

                        </div>

                    </div>

                ))}

            </div>


            {/* FILTERS */}

            <div className="patient-doctors-filter-card">

                <SkeletonBlock
                    className="doctor-search-skeleton"
                />

                <SkeletonBlock
                    className="doctor-filter-skeleton"
                />

                <SkeletonBlock
                    className="doctor-filter-skeleton"
                />

            </div>


            {/* RESULT COUNT */}

            <SkeletonBlock
                className="doctor-result-count-skeleton"
            />


            {/* DOCTOR CARDS */}

            <div className="patient-doctors-grid">

                {[1, 2, 3, 4, 5, 6].map((item) => (

                    <div
                        className="patient-doctor-card-skeleton"
                        key={item}
                    >

                        <div className="doctor-card-top-skeleton">

                            <SkeletonBlock
                                className="doctor-avatar-skeleton"
                            />

                            <SkeletonBlock
                                className="doctor-status-skeleton"
                            />

                        </div>


                        <SkeletonBlock
                            className="doctor-name-skeleton"
                        />

                        <SkeletonBlock
                            className="doctor-specialization-skeleton"
                        />

                        <SkeletonBlock
                            className="doctor-trusted-skeleton"
                        />


                        <div className="doctor-stats-skeleton">

                            <div className="doctor-stat-skeleton">

                                <SkeletonBlock
                                    className="stat-icon-small-skeleton"
                                />

                                <div>

                                    <SkeletonBlock
                                        className="stat-value-skeleton"
                                    />

                                    <SkeletonBlock
                                        className="stat-label-small-skeleton"
                                    />

                                </div>

                            </div>


                            <div className="doctor-stat-skeleton">

                                <SkeletonBlock
                                    className="stat-icon-small-skeleton"
                                />

                                <div>

                                    <SkeletonBlock
                                        className="stat-value-skeleton"
                                    />

                                    <SkeletonBlock
                                        className="stat-label-small-skeleton"
                                    />

                                </div>

                            </div>

                        </div>


                        <SkeletonBlock
                            className="doctor-phone-skeleton"
                        />


                        <SkeletonBlock
                            className="doctor-book-button-skeleton"
                        />

                    </div>

                ))}

            </div>

        </div>
    );
}