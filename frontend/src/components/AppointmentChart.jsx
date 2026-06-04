import { useEffect, useState } from "react";
import api from "../services/api";

import {
    PieChart,
    Pie,
    Tooltip,
    Legend,
    Cell,
} from "recharts";

const COLORS = [
    "#22c55e", // Completed - Green
    "#f59e0b", // Pending - Orange
    "#ef4444", // Cancelled - Red
    "#3b82f6", // Extra - Blue
];

function AppointmentChart() {
    const [data, setData] =
        useState([]);

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
                        value: Number(
                            item.count
                        ),
                    })
                );

            setData(formatted);
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div className="card">
            <h2>
                📊 Appointment Status
            </h2>

            <div
                style={{
                    display: "flex",
                    justifyContent:
                        "center",
                    alignItems:
                        "center",
                }}
            >
                <PieChart
                    width={500}
                    height={350}
                >
                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={120}
                        label
                    >
                        {data.map(
                            (
                                entry,
                                index
                            ) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={
                                        entry.name ===
                                            "Completed"
                                            ? "#22c55e"
                                            : entry.name ===
                                                "Pending"
                                                ? "#f59e0b"
                                                : entry.name ===
                                                    "Cancelled"
                                                    ? "#ef4444"
                                                    : COLORS[
                                                    index %
                                                    COLORS.length
                                                    ]
                                    }
                                />
                            )
                        )}
                    </Pie>

                    <Tooltip />

                    <Legend />
                </PieChart>
            </div>
        </div>
    );
}

export default AppointmentChart;
