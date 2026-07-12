export default function AppointmentSkeleton() {
    return (
        <div className="patient-appointments">

            {/* Header */}
            <div className="appointment-header">
                <div>
                    <div className="appointment-header-skeleton skeleton"></div>
                    <div className="line medium skeleton"></div>
                </div>

                <div
                    className="skeleton"
                    style={{
                        width: 300,
                        height: 46,
                        borderRadius: 12
                    }}
                ></div>
            </div>

            {/* Summary Cards */}
            <div className="appointment-summary-skeleton">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className="summary-card-skeleton skeleton"
                    ></div>
                ))}
            </div>

            {/* Filter Buttons */}
            <div
                style={{
                    display: "flex",
                    gap: 12,
                    marginBottom: 30,
                    flexWrap: "wrap",
                }}
            >
                {[1, 2, 3, 4, 5].map((i) => (
                    <div
                        key={i}
                        className="skeleton"
                        style={{
                            width: 95,
                            height: 38,
                            borderRadius: 30,
                        }}
                    ></div>
                ))}
            </div>

            {/* Appointment Cards */}
            {[1, 2].map((card) => (
                <div className="appointment-card-skeleton" key={card}>

                    {/* Doctor Header */}
                    <div className="appointment-top-skeleton">
                        <div className="avatar-skeleton skeleton"></div>

                        <div className="doctor-info-skeleton">
                            <div className="line large skeleton"></div>
                            <div className="line medium skeleton"></div>
                            <div
                                className="line skeleton"
                                style={{ width: 180, height: 15 }}
                            ></div>
                        </div>

                        <div className="badge-skeleton skeleton"></div>
                    </div>

                    {/* Today Badge */}
                    <div
                        className="line medium skeleton"
                        style={{
                            width: 120,
                            height: 18,
                            marginBottom: 20,
                        }}
                    ></div>

                    {/* Progress */}
                    <div
                        className="line skeleton"
                        style={{
                            width: 180,
                            height: 18,
                            marginBottom: 12,
                        }}
                    ></div>

                    <div
                        className="skeleton"
                        style={{
                            width: "100%",
                            height: 10,
                            borderRadius: 50,
                            marginBottom: 30,
                        }}
                    ></div>

                    {/* Info Grid */}
                    <div className="appointment-grid-skeleton">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div
                                key={i}
                                className="grid-box skeleton"
                            ></div>
                        ))}
                    </div>

                    {/* Reason */}
                    <div
                        className="skeleton"
                        style={{
                            width: "100%",
                            height: 95,
                            borderRadius: 16,
                            marginBottom: 25,
                        }}
                    ></div>

                    {/* Footer */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(auto-fit,minmax(180px,1fr))",
                            gap: 18,
                            marginBottom: 25,
                        }}
                    >
                        {[1, 2, 3, 4].map((i) => (
                            <div
                                key={i}
                                className="grid-box skeleton"
                            ></div>
                        ))}
                    </div>

                    {/* Buttons */}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: 12,
                            flexWrap: "wrap",
                        }}
                    >
                        {[1, 2, 3, 4].map((i) => (
                            <div
                                key={i}
                                className="skeleton"
                                style={{
                                    width: 120,
                                    height: 44,
                                    borderRadius: 10,
                                }}
                            ></div>
                        ))}
                    </div>

                </div>
            ))}
        </div>
    );
}