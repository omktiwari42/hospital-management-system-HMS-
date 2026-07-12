export default function NotificationSkeleton() {
    return (
        <div className="notifications-page">

            {/* Header */}
            <div className="notifications-header">

                <div>
                    <div
                        className="skeleton"
                        style={{
                            width: 260,
                            height: 36,
                            borderRadius: 8,
                            marginBottom: 12,
                        }}
                    ></div>

                    <div
                        className="skeleton"
                        style={{
                            width: 340,
                            height: 18,
                            borderRadius: 6,
                        }}
                    ></div>
                </div>

                <div
                    className="skeleton"
                    style={{
                        width: 150,
                        height: 44,
                        borderRadius: 10,
                    }}
                ></div>

            </div>

            {/* Summary Cards */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "repeat(auto-fit,minmax(220px,1fr))",
                    gap: 20,
                    marginBottom: 30,
                }}
            >
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        style={{
                            padding: 24,
                            borderRadius: 18,
                            background: "var(--card-bg,#fff)",
                            border: "1px solid rgba(0,0,0,.08)",
                        }}
                    >
                        <div
                            className="skeleton"
                            style={{
                                width: 52,
                                height: 52,
                                borderRadius: "50%",
                                marginBottom: 18,
                            }}
                        ></div>

                        <div
                            className="skeleton"
                            style={{
                                width: "70%",
                                height: 18,
                                borderRadius: 6,
                                marginBottom: 10,
                            }}
                        ></div>

                        <div
                            className="skeleton"
                            style={{
                                width: "40%",
                                height: 28,
                                borderRadius: 6,
                            }}
                        ></div>
                    </div>
                ))}
            </div>

            {/* Notification Cards */}
            {[1, 2, 3, 4, 5, 6].map((item) => (
                <div
                    key={item}
                    className="notification-card"
                >

                    <div
                        className="skeleton"
                        style={{
                            width: 58,
                            height: 58,
                            borderRadius: "50%",
                            flexShrink: 0,
                        }}
                    ></div>

                    <div
                        style={{
                            flex: 1,
                            marginLeft: 20,
                        }}
                    >

                        <div
                            className="skeleton"
                            style={{
                                width: "40%",
                                height: 22,
                                borderRadius: 6,
                                marginBottom: 12,
                            }}
                        ></div>

                        <div
                            className="skeleton"
                            style={{
                                width: "92%",
                                height: 16,
                                borderRadius: 6,
                                marginBottom: 8,
                            }}
                        ></div>

                        <div
                            className="skeleton"
                            style={{
                                width: "70%",
                                height: 16,
                                borderRadius: 6,
                                marginBottom: 14,
                            }}
                        ></div>

                        <div
                            className="skeleton"
                            style={{
                                width: 140,
                                height: 14,
                                borderRadius: 6,
                            }}
                        ></div>

                    </div>

                    <div
                        className="skeleton"
                        style={{
                            width: 14,
                            height: 14,
                            borderRadius: "50%",
                        }}
                    ></div>

                </div>
            ))}

        </div>
    );
}