export default function PatientDashboardSkeleton() {

    const summaryCards = Array.from({
        length: 6,
    });

    const quickActions = Array.from({
        length: 6,
    });

    const activities = Array.from({
        length: 4,
    });

    const medicines = Array.from({
        length: 3,
    });

    const tips = Array.from({
        length: 4,
    });


    return (

        <div className="patient-dashboard dashboard-loading">


            {/* WELCOME */}

            <section className="pds-welcome skeleton">

                <div className="pds-welcome-content">

                    <div className="pds-line pds-eyebrow skeleton"></div>

                    <div className="pds-line pds-welcome-title skeleton"></div>

                    <div className="pds-line pds-welcome-date skeleton"></div>

                    <div className="pds-line pds-welcome-text skeleton"></div>

                </div>


                <div className="pds-welcome-button skeleton"></div>

            </section>


            {/* HEALTH SCORE */}

            <section className="pds-health skeleton">

                <div className="pds-health-content">

                    <div className="pds-line pds-small skeleton"></div>

                    <div className="pds-line pds-health-value skeleton"></div>

                    <div className="pds-line pds-health-status skeleton"></div>

                    <div className="pds-line pds-health-text skeleton"></div>

                </div>


                <div className="pds-health-circle skeleton"></div>

            </section>


            {/* SUMMARY */}

            <section className="pds-summary-grid">

                {summaryCards.map(
                    (_, index) => (

                        <div
                            className="pds-summary-card skeleton"
                            key={index}
                        >

                            <div className="pds-summary-icon skeleton"></div>

                            <div className="pds-summary-copy">

                                <div className="pds-line pds-small skeleton"></div>

                                <div className="pds-line pds-value skeleton"></div>

                            </div>

                        </div>

                    )
                )}

            </section>


            {/* NEXT APPOINTMENT */}

            <section className="pds-next-appointment skeleton">

                <div className="pds-next-content">

                    <div className="pds-line pds-small skeleton"></div>

                    <div className="pds-line pds-doctor skeleton"></div>

                    <div className="pds-line pds-department skeleton"></div>


                    <div className="pds-next-meta">

                        <div className="pds-line pds-meta skeleton"></div>

                        <div className="pds-line pds-meta skeleton"></div>

                    </div>

                </div>


                <div className="pds-next-side">

                    <div className="pds-line pds-countdown-label skeleton"></div>

                    <div className="pds-line pds-countdown skeleton"></div>

                    <div className="pds-line pds-next-button skeleton"></div>

                </div>

            </section>


            {/* QUICK ACTION TITLE */}

            <div className="pds-section-heading">

                <div className="pds-line pds-section-title skeleton"></div>

            </div>


            {/* QUICK ACTIONS */}

            <section className="pds-actions-grid">

                {quickActions.map(
                    (_, index) => (

                        <div
                            className="pds-action-card skeleton"
                            key={index}
                        >

                            <div className="pds-action-icon skeleton"></div>


                            <div className="pds-action-copy">

                                <div className="pds-line pds-action-title skeleton"></div>

                                <div className="pds-line pds-action-text skeleton"></div>

                            </div>


                            <div className="pds-action-arrow skeleton"></div>

                        </div>

                    )
                )}

            </section>


            {/* ACTIVITY + MEDICINES */}

            <section className="pds-two-column">


                <div className="pds-panel skeleton">

                    <div className="pds-panel-heading">

                        <div className="pds-line pds-panel-title skeleton"></div>

                        <div className="pds-line pds-panel-action skeleton"></div>

                    </div>


                    {activities.map(
                        (_, index) => (

                            <div
                                className="pds-list-item"
                                key={index}
                            >

                                <div className="pds-item-icon skeleton"></div>


                                <div className="pds-item-copy">

                                    <div className="pds-line pds-item-title skeleton"></div>

                                    <div className="pds-line pds-item-subtitle skeleton"></div>

                                </div>


                                <div className="pds-item-status skeleton"></div>

                            </div>

                        )
                    )}

                </div>


                <div className="pds-panel skeleton">

                    <div className="pds-panel-heading">

                        <div className="pds-line pds-panel-title skeleton"></div>

                        <div className="pds-line pds-panel-action skeleton"></div>

                    </div>


                    {medicines.map(
                        (_, index) => (

                            <div
                                className="pds-list-item"
                                key={index}
                            >

                                <div className="pds-item-icon skeleton"></div>


                                <div className="pds-item-copy">

                                    <div className="pds-line pds-item-title skeleton"></div>

                                    <div className="pds-line pds-item-subtitle skeleton"></div>

                                </div>


                                <div className="pds-medicine-time skeleton"></div>

                            </div>

                        )
                    )}

                </div>

            </section>


            {/* HEALTH TIPS */}

            <section className="pds-panel skeleton">

                <div className="pds-panel-heading">

                    <div className="pds-line pds-panel-title skeleton"></div>

                </div>


                <div className="pds-tips-grid">

                    {tips.map(
                        (_, index) => (

                            <div
                                className="pds-tip-card"
                                key={index}
                            >

                                <div className="pds-tip-icon skeleton"></div>


                                <div className="pds-tip-copy">

                                    <div className="pds-line pds-tip-title skeleton"></div>

                                    <div className="pds-line pds-tip-text skeleton"></div>

                                    <div className="pds-line pds-tip-text-short skeleton"></div>

                                </div>

                            </div>

                        )
                    )}

                </div>

            </section>


            {/* PROGRESS */}

            <section className="pds-panel skeleton">

                <div className="pds-panel-heading">

                    <div className="pds-line pds-progress-title skeleton"></div>

                    <div className="pds-line pds-progress-value skeleton"></div>

                </div>


                <div className="pds-progress-bar skeleton"></div>


                <div className="pds-progress-footer">

                    <div className="pds-line pds-progress-label skeleton"></div>

                    <div className="pds-line pds-progress-label skeleton"></div>

                </div>

            </section>

        </div>
    );
}