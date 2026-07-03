import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

function AppointmentsSkeleton() {
    return (
        <div className="page">

            <div className="page-header">
                <Skeleton width={130} height={40} />
                <Skeleton width={180} height={40} />
            </div>

            <br />

            <Skeleton width={180} height={45} />

            <br /><br />

            <Skeleton height={50} />

            <br /><br />

            <div className="card">
                {[...Array(8)].map((_, i) => (
                    <Skeleton
                        key={i}
                        height={55}
                        style={{ marginBottom: 10 }}
                    />
                ))}
            </div>

        </div>
    );
}

export default AppointmentsSkeleton;