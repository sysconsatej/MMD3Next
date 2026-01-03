

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
  Legend
);

const AreaComponent = ({ type  , data}) => {
  return (
      <Line
        options={allChartData[`${type}`].options}
        data={allChartData[`${type}`].data}
        height={300}
      />
  );
};

export default AreaComponent;
