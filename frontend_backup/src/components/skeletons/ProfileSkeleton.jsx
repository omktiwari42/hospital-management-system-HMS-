import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

function ProfileSkeleton() {
    return (
        <div className="page">

            <div className="card">

                <Skeleton
                    circle
                    width={120}
                    height={120}
                />

                <br /><br />

                <Skeleton width={220} height={35} />

                <br />

                <Skeleton width={300} />

                <br />

                <Skeleton width={280} />

                <br />

                <Skeleton width={250} />

            </div>

        </div>
    );
}

export default ProfileSkeleton;