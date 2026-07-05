import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function BookAppointmentSkeleton() {
    return (
        <div className="page">

            <Skeleton
                height={45}
                width={300}
                style={{ marginBottom: 30 }}
            />

            <div
                style={{
                    background: "#fff",
                    padding: 30,
                    borderRadius: 16,
                }}
            >
                {[...Array(8)].map((_, index) => (
                    <div
                        key={index}
                        style={{ marginBottom: 20 }}
                    >
                        <Skeleton
                            width={150}
                            height={18}
                        />

                        <Skeleton
                            height={45}
                            style={{ marginTop: 8 }}
                        />
                    </div>
                ))}

                <div
                    style={{
                        display: "flex",
                        gap: 15,
                        marginTop: 20,
                    }}
                >
                    <Skeleton
                        width={140}
                        height={45}
                    />

                    <Skeleton
                        width={180}
                        height={45}
                    />
                </div>
            </div>

        </div>
    );
}