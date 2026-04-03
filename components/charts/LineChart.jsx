"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
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
  Tooltip,
  Legend,
  Filler,
);

const LineChart = ({ type, data }) => {
  if (!data || !Array.isArray(data)) return null;

  const labels = data.map((d) => d.dimension);
  const values = data.map((d) => d.measure);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Do Released",
        data: values,
        fill: true,
        backgroundColor: "rgba(75,192,192,0.2)",
        borderColor: "rgba(75,192,192,1)",
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0,
      },
    ],
  };

  const options = {
    ...allChartData[type]?.options,

    scales: {
      x: { grid: { display: false } },
      y: { grid: { display: false } },
    },

    responsive: true,

    animations: {
      tension: {
        duration: 1000,
        easing: "easeOutQuart",
        from: 0,
        to: 0.4,
      },
    },
  };

  return <Line data={chartData} options={options} height={300} />;
};

export default LineChart;
