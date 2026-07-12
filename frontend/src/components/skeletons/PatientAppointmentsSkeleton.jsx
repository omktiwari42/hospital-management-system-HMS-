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
                        width: 320,
                        height: 48,
                        borderRadius: 12,
                    }}
                ></div>
            </div>

            {/* Summary Cards */}
            <div className="appointment-summary-skeleton">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="summary-card-skeleton">
                        <div
                            className="skeleton"
                            style={{
                                width: 55,
                                height: 55,
                                borderRadius: "50%",
                                marginBottom: 15,
                            }}
                        ></div>

                        <div className="line medium skeleton"></div>
                        <div className="line small skeleton"></div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div
                style={{
                    display: "flex",
                    gap: 12,
                    marginBottom: 28,
                    flexWrap: "wrap",
                }}
            >
                {[1, 2, 3, 4, 5].map((i) => (
                    <div
                        key={i}
                        className="skeleton"
                        style={{
                            width: 95,
                            height: 40,
                            borderRadius: 25,
                        }}
                    ></div>
                ))}
            </div>

            {/* Appointment Cards */}
            {[1, 2].map((card) => (
                <div className="appointment-card-skeleton" key={card}>

                    {/* Doctor */}
                    <div className="appointment-top-skeleton">

                        <div
                            className="avatar-skeleton skeleton"
                            style={{
                                width: 70,
                                height: 70,
                                borderRadius: "50%",
                            }}
                        ></div>

                        <div
                            className="doctor-info-skeleton"
                            style={{ flex: 1 }}
                        >
                            <div className="line large skeleton"></div>
                            <div className="line medium skeleton"></div>
                            <div
                                className="line skeleton"
                                style={{
                                    width: 170,
                                    height: 14,
                                }}
                            ></div>
                        </div>

                        <div
                            className="badge-skeleton skeleton"
                            style={{
                                width: 110,
                                height: 36,
                                borderRadius: 20,
                            }}
                        ></div>

                    </div>

                    {/* Today Badge */}
                    <div
                        className="skeleton"
                        style={{
                            width: 120,
                            height: 22,
                            borderRadius: 15,
                            margin: "18px 0",
                        }}
                    ></div>

                    {/* Progress */}
                    <div
                        className="line skeleton"
                        style={{
                            width: 190,
                            height: 18,
                            marginBottom: 10,
                        }}
                    ></div>

                    <div
                        className="skeleton"
                        style={{
                            width: "100%",
                            height: 10,
                            borderRadius: 20,
                            marginBottom: 30,
                        }}
                    ></div>

                    {/* Details */}
                    <div className="appointment-grid-skeleton">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="grid-box">
                                <div className="line small skeleton"></div>
                                <div className="line medium skeleton"></div>
                            </div>
                        ))}
                    </div>

                    {/* Alert */}
                    <div
                        className="skeleton"
                        style={{
                            width: "100%",
                            height: 70,
                            borderRadius: 14,
                            margin: "25px 0",
                        }}
                    ></div>

                    {/* Footer Cards */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(auto-fit,minmax(180px,1fr))",
                            gap: 18,
                            marginBottom: 30,
                        }}
                    >
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="grid-box">
                                <div className="line small skeleton"></div>
                                <div className="line medium skeleton"></div>
                            </div>
                        ))}
                    </div>

                    {/* Action Buttons */}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: 12,
                            flexWrap: "wrap",
                        }}
                    >
                        {[1, 2, 3, 4, 5].map((i) => (
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