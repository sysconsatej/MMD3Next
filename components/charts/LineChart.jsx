"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { allChartData } from "./allChartData";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,

  Title,
  Tooltip,
  Legend,
  Filler
);

const LineChart = ({ type, data }) => {
  if (!data || !Array.isArray(data)) return null;

  const labels = data.map((d) => d.dimension);
  const values = data.map((d) => d.measure);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Measure",
        data: values,
        fill: true,
        backgroundColor: "rgba(75,192,192,0.2)",
        borderColor: "rgba(75,192,192,1)",
      },
    ],
  };

  return (
    <>
      <Line
        options={
          (allChartData[`${type}`].options,
          {
            scales: {
              x: {
                grid: {
                  display: false,
                },
              },
              y: {
                grid: {
                  display: false,
                },
              },
            },
            responsive: true,
          })
        }
        data={data ? chartData : allChartData[`${type}`].data}
        height={300}
      />
    </>
  );
};

export default LineChart;
