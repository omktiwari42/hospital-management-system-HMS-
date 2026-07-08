function PatientAppointmentsSkeleton() {
    return (
        <div className="patient-appointments">

            <div className="appointment-header-skeleton">
                <div className="header-title skeleton"></div>
                <div className="header-search skeleton"></div>
            </div>

            <div className="appointment-summary-skeleton">
                {[1, 2, 3, 4].map((item) => (
                    <div className="summary-card-skeleton" key={item}>
                        <div className="summary-number skeleton"></div>
                        <div className="summary-text skeleton"></div>
                    </div>
                ))}
            </div>

            {[1, 2, 3].map((item) => (
                <div
                    className="appointment-card-skeleton"
                    key={item}
                >
                    <div className="appointment-top-skeleton">

                        <div className="avatar-skeleton skeleton"></div>

                        <div className="doctor-info-skeleton">
                            <div className="line large skeleton"></div>
                            <div className="line medium skeleton"></div>
                            <div className="line small skeleton"></div>
                        </div>

                        <div className="badge-skeleton skeleton"></div>

                    </div>

                    <div className="appointment-grid-skeleton">

                        {[1, 2, 3, 4, 5, 6].map((box) => (
                            <div
                                key={box}
                                className="grid-box skeleton"
                            ></div>
                        ))}

                    </div>

                    <div className="button-group-skeleton">
                        <div className="button-skeleton skeleton"></div>
                        <div className="button-skeleton skeleton"></div>
                        <div className="button-skeleton skeleton"></div>
                    </div>

                </div>
            ))}

        </div>
    );
}

export default PatientAppointmentsSkeleton;