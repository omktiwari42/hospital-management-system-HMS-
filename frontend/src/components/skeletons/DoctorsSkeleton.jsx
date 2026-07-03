import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

function DoctorsSkeleton() {
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
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        style={{
                            display: "flex",
                            gap: "20px",
                            marginBottom: "20px",
                        }}
                    >
                        <Skeleton circle width={70} height={70} />

                        <div style={{ flex: 1 }}>
                            <Skeleton width={220} />
                            <Skeleton width={170} />
                            <Skeleton width={120} />
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
}

export default DoctorsSkeleton;