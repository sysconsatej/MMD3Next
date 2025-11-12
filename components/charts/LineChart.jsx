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

const LineChart = ({ type }) => {
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
        data={allChartData[`${type}`].data}
        height={300}
      />
    </>
  );
};

export default LineChart;
