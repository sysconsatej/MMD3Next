'use client';

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { allChartData } from "./allChartData";

ChartJS.register(ArcElement, Tooltip, Legend);

export function DonutWrapper({ type }) {
  return (
    <Doughnut
      data={allChartData[`${type}`].data}
      options={allChartData[`${type}`].options}
    />
  );
}
