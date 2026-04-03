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

const AreaComponent = ({ type, data }) => {
  if (!data || !Array.isArray(data)) return null;

  const labels = data.map((d) => d.dimension);
  const values = data.map((d) => d.measure);

  const chartData = {
    labels,
    datasets: [
      {
        fill: true,
        label: "Confirmed",
        data: values,
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0,
      },
    ],
  };

  const options = {
    ...allChartData[type]?.options,
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

export default AreaComponent;
