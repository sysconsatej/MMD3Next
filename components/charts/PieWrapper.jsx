import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import { allChartData } from "./allChartData";

ChartJS.register(ArcElement, Tooltip, Legend);

const PieWrapper = ({ type }) => {
  return (
    <Pie
      data={allChartData[`${type}`].data}
      options={allChartData[`${type}`].options}
    />
  );
};

export default PieWrapper;
