import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { allChartData } from "./allChartData";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const BarComponent = ({ type }) => {
  return (
    <Bar
      options={allChartData[`${type}`].options}
      data={allChartData[`${type}`].data}
      height={400}
    />
  );
};

export default BarComponent;
