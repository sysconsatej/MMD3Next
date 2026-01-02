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

const BarComponent = ({ type, data }) => {
  if (!data || !Array.isArray(data)) return null;

  const labels = data?.map((d) => d.dimension);
  const values = data?.map((d) => d.measure);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Bar",
        data: values,
        fill: true,
        backgroundColor: "rgba(37, 33, 164, 0.75)",
        borderRadius: 10,
      },
    ],
  };

  return (
    <Bar
      options={allChartData[`${type}`].options}
      data={!data ? allChartData[`${type}`].data : chartData}
      height={300}
    />
  );
};

export default BarComponent;
