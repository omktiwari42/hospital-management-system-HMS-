import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

function PrescriptionSkeleton() {
    return (
        <div className="page">

            <div className="page-header">
                <Skeleton width={140} height={40} />
            </div>

            <br />

            <Skeleton height={50} />

            <br /><br />

            <div className="card">
                {[...Array(8)].map((_, i) => (
                    <Skeleton
                        key={i}
                        height={60}
                        style={{ marginBottom: 10 }}
                    />
                ))}
            </div>

        </div>
    );
}

export default PrescriptionSkeleton;