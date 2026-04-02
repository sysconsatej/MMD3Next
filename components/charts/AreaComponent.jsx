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
        label: "Measure",
        data: values,
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
    ],
  };

  return (
    <Line
      options={allChartData[`${type}`].options}
      data={data ? chartData : allChartData[`${type}`].data}
      height={300}
    />
  );
};

export default AreaComponent;
