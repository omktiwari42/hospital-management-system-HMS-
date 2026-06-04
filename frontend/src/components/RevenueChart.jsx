import { useEffect, useState } from "react";
import api from "../services/api";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
} from "recharts";

function RevenueChart() {
    const [data, setData] =
        useState([]);

    useEffect(() => {
        getRevenue();
    }, []);

    async function getRevenue() {
        try {
            const response =
                await api.get(
                    "/revenue-chart"
                );

            const formatted =
                response.data.map(
                    (bill) => ({
                        date:
                            bill.bill_date?.split(
                                "T"
                            )[0],
                        amount: Number(
                            bill.amount
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
                💰 Revenue Overview
            </h2>

            <BarChart
                width={700}
                height={300}
                data={data}
            >
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                    dataKey="date"
                />

                <YAxis />

                <Tooltip />

                <Bar
                    dataKey="amount"
                />
            </BarChart>
        </div>
    );
}

export default RevenueChart;