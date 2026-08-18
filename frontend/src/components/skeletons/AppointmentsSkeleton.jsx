import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

function AppointmentsSkeleton() {
    return (
        <div className="appointments-skeleton-page">

            {/* =========================
                HEADER
            ========================= */}

            <div className="appointments-skeleton-header">

                <div className="appointments-skeleton-title">

                    <Skeleton
                        width={210}
                        height={30}
                        borderRadius={8}
                    />

                    <Skeleton
                        width={290}
                        height={14}
                        borderRadius={6}
                    />

                </div>

                <Skeleton
                    width={175}
                    height={42}
                    borderRadius={10}
                />

            </div>


            {/* =========================
                SUMMARY CARDS
            ========================= */}

            <div className="appointments-skeleton-summary">

                {[1, 2, 3, 4].map((item) => (

                    <div
                        className="appointments-skeleton-summary-card"
                        key={item}
                    >

                        <Skeleton
                            width={46}
                            height={46}
                            borderRadius={12}
                        />

                        <div className="appointments-skeleton-summary-content">

                            <Skeleton
                                width={80}
                                height={12}
                                borderRadius={5}
                            />

                            <Skeleton
                                width={55}
                                height={25}
                                borderRadius={6}
                            />

                        </div>

                    </div>

                ))}

            </div>


            {/* =========================
                FILTERS
            ========================= */}

            <div className="appointments-skeleton-filters">

                {[1, 2, 3, 4, 5].map((item) => (

                    <Skeleton
                        key={item}
                        width={82}
                        height={36}
                        borderRadius={999}
                    />

                ))}

            </div>


            {/* =========================
                APPOINTMENT CARDS
            ========================= */}

            {[1, 2].map((item) => (

                <div
                    className="appointments-skeleton-card"
                    key={item}
                >

                    {/* Doctor Header */}

                    <div className="appointments-skeleton-card-header">

                        <div className="appointments-skeleton-doctor">

                            <Skeleton
                                width={58}
                                height={58}
                                circle
                            />

                            <div className="appointments-skeleton-doctor-info">

                                <Skeleton
                                    width={150}
                                    height={20}
                                    borderRadius={6}
                                />

                                <Skeleton
                                    width={125}
                                    height={13}
                                    borderRadius={5}
                                />

                                <Skeleton
                                    width={105}
                                    height={11}
                                    borderRadius={5}
                                />

                            </div>

                        </div>


                        <Skeleton
                            width={105}
                            height={32}
                            borderRadius={999}
                        />

                    </div>


                    {/* Today */}

                    <Skeleton
                        width={90}
                        height={18}
                        borderRadius={8}
                        className="appointments-skeleton-today"
                    />


                    {/* Progress Title */}

                    <div className="appointments-skeleton-progress-title">

                        <Skeleton
                            width={145}
                            height={14}
                            borderRadius={5}
                        />

                        <Skeleton
                            width={35}
                            height={14}
                            borderRadius={5}
                        />

                    </div>


                    {/* Progress */}

                    <Skeleton
                        width="100%"
                        height={8}
                        borderRadius={999}
                    />


                    {/* Progress Labels */}

                    <div className="appointments-skeleton-progress-labels">

                        <Skeleton
                            width={50}
                            height={10}
                            borderRadius={4}
                        />

                        <Skeleton
                            width={60}
                            height={10}
                            borderRadius={4}
                        />

                        <Skeleton
                            width={55}
                            height={10}
                            borderRadius={4}
                        />

                    </div>


                    {/* Details */}

                    <div className="appointments-skeleton-details">

                        {[1, 2, 3, 4, 5, 6].map(
                            (detail) => (

                                <div
                                    className="appointments-skeleton-detail"
                                    key={detail}
                                >

                                    <Skeleton
                                        width={72}
                                        height={10}
                                        borderRadius={4}
                                    />

                                    <Skeleton
                                        width={105}
                                        height={17}
                                        borderRadius={5}
                                    />

                                </div>

                            )
                        )}

                    </div>


                    {/* Reason / Alert */}

                    <div className="appointments-skeleton-reason">

                        <Skeleton
                            width="100%"
                            height={34}
                            borderRadius={9}
                        />

                        <div className="appointments-skeleton-reason-text">

                            <Skeleton
                                width={105}
                                height={11}
                                borderRadius={4}
                            />

                            <Skeleton
                                width={80}
                                height={16}
                                borderRadius={5}
                            />

                        </div>

                    </div>


                    {/* Bottom Information */}

                    <div className="appointments-skeleton-bottom">

                        {[1, 2, 3, 4].map(
                            (bottom) => (

                                <div
                                    className="appointments-skeleton-bottom-card"
                                    key={bottom}
                                >

                                    <Skeleton
                                        width={70}
                                        height={10}
                                        borderRadius={4}
                                    />

                                    <Skeleton
                                        width={95}
                                        height={17}
                                        borderRadius={5}
                                    />

                                </div>

                            )
                        )}

                    </div>


                    {/* Buttons */}

                    <div className="appointments-skeleton-actions">

                        {[1, 2, 3, 4, 5].map(
                            (button) => (

                                <Skeleton
                                    key={button}
                                    width={
                                        button === 5
                                            ? 95
                                            : 105
                                    }
                                    height={40}
                                    borderRadius={9}
                                />

                            )
                        )}

                    </div>

                </div>

            ))}

        </div>
    );
}

export default AppointmentsSkeleton;