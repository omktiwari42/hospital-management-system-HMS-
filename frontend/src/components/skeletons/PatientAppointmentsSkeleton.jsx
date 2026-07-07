function PatientAppointmentsSkeleton() {
    return (
        <div className="patient-appointments">

            <div className="appointment-header-skeleton skeleton"></div>

            <div className="appointment-summary-skeleton">

                <div className="summary-card-skeleton skeleton"></div>

                <div className="summary-card-skeleton skeleton"></div>

                <div className="summary-card-skeleton skeleton"></div>

                <div className="summary-card-skeleton skeleton"></div>

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

                        </div>

                        <div className="badge-skeleton skeleton"></div>

                    </div>

                    <div className="appointment-grid-skeleton">

                        <div className="grid-box skeleton"></div>

                        <div className="grid-box skeleton"></div>

                        <div className="grid-box skeleton"></div>

                        <div className="grid-box skeleton"></div>

                    </div>

                    <div className="button-skeleton skeleton"></div>

                </div>

            ))}

        </div>
    );
}

export default PatientAppointmentsSkeleton;