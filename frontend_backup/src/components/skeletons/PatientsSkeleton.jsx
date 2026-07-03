import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

function PatientsSkeleton() {
  return (
    <div className="page">
      <Skeleton height={50} width={280} />
      <br /><br />
      <Skeleton height={50} />
      <br /><br />
      <Skeleton height={350} />
      <br /><br />
      <Skeleton height={500} />
    </div>
  );
}

export default PatientsSkeleton;
