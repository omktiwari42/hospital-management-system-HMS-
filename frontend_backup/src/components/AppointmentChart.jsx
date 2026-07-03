import { useEffect, useState } from "react";
import api from "../services/api";

import {
    PieChart,
    Pie,
    Tooltip,
    Legend,
    Cell,
    ResponsiveContainer,
} from "recharts";

const COLORS = {
    Completed: "#22c55e",
    Scheduled: "#3b82f6",
    Pending: "#f59e0b",
    Cancelled: "#ef4444",
};

function AppointmentChart() {
    const [data, setData] = useState([]);
    const [loading, setLoading] =
        useState(true);

    useEffect(() => {
        getChartData();
    }, []);

    async function getChartData() {
        try {
            const response =
                await api.get(
                    "/appointment-status"
                );

            const formatted =
                response.data.map(
                    (item) => ({
                        name: item.status,
                        value: Number(item.count),
                    })
                );

            setData(formatted);
        } catch (error) {
            console.log(
                "Chart Error:",
                error
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="card">
            <h2>
                📊 Appointment Status
            </h2>

            {loading ? (
                <p>Loading Chart...</p>
            ) : data.length === 0 ? (
                <p>
                    No Appointment Data Found
                </p>
            ) : (
                <div
                    style={{
                        width: "100%",
                        height: "400px",
                    }}
                >
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie
                                data={data}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={130}
                                innerRadius={60}
                                label
                            >
                                {data.map(
                                    (entry, index) => (
                                        <Cell
                                            key={index}
                                            fill={
                                                COLORS[
                                                entry.name
                                                ] ||
                                                "#6366f1"
                                            }
                                        />
                                    )
                                )}
                            </Pie>

                            <Tooltip />

                            <Legend
                                verticalAlign="bottom"
                                height={36}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}

export default AppointmentChart;