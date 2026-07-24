import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function PrescriptionSkeleton() {
    return (
        <div className="patient-prescriptions-skeleton">

            {/* Header */}
            <div className="prescription-skeleton-header">

                <div>
                    <Skeleton width={240} height={36} />
                    <div className="mt-10">
                        <Skeleton width={320} height={18} />
                    </div>
                </div>

                <Skeleton width={220} height={42} borderRadius={10} />

            </div>

            {/* Stats */}
            <div className="prescription-skeleton-stats">

                {[1, 2, 3].map((item) => (
                    <div
                        key={item}
                        className="prescription-skeleton-stat"
                    >
                        <Skeleton width={60} height={34} />
                        <div className="mt-10">
                            <Skeleton width={130} height={18} />
                        </div>
                    </div>
                ))}

            </div>

            {/* Main Card */}
            <div className="prescription-skeleton-card">

                <div className="prescription-skeleton-top">

                    <Skeleton width={180} height={30} />
                    <Skeleton width={80} height={30} />

                </div>

                <div className="prescription-skeleton-doctor">

                    <Skeleton
                        circle
                        width={60}
                        height={60}
                    />

                    <div>
                        <Skeleton width={170} height={22} />
                        <div className="mt-10">
                            <Skeleton width={120} height={18} />
                        </div>
                    </div>

                </div>

                <div className="prescription-skeleton-grid">

                    {[1, 2, 3, 4].map((item) => (
                        <Skeleton
                            key={item}
                            height={70}
                            borderRadius={10}
                        />
                    ))}

                </div>

                <div className="mb-20">
                    <Skeleton
                        height={120}
                        borderRadius={12}
                    />
                </div>

                <div className="mb-20">
                    <Skeleton
                        height={90}
                        borderRadius={12}
                    />
                </div>

                <div className="prescription-skeleton-bottom">

                    <div className="prescription-skeleton-chips">

                        <Skeleton width={85} height={36} borderRadius={20} />
                        <Skeleton width={95} height={36} borderRadius={20} />
                        <Skeleton width={85} height={36} borderRadius={20} />

                    </div>

                    <div className="prescription-skeleton-buttons">

                        <Skeleton width={110} height={44} borderRadius={10} />
                        <Skeleton width={140} height={44} borderRadius={10} />

                    </div>

                </div>

            </div>

        </div>
    );
}