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
  Legend,
);

const BarComponent = ({ type, data }) => {
  if (!data || !Array.isArray(data)) return null;

  const colors = [
    "#4F46E5",
    "#16A34A",
    "#D97706",
    "#DC2626",
    "#0891B2",
    "#9333EA",
  ];

  const datasets = data.map((item, index) => ({
    label: item.dimension,
    data: [item.measure],
    backgroundColor: colors[index % colors.length],
    borderRadius: 10,
  }));

  const chartData = {
    labels: [""],
    datasets,
  };

  return (
    <Bar
      options={{
        ...allChartData[type]?.options,

        animation: {
          y: {
            duration: 600,
            easing: "easeOutQuart",
            from: 0,
            delay: (ctx) => {
              return ctx.datasetIndex * 200;
            },
          },
        },
      }}
      data={!data ? allChartData[type].data : chartData}
      height={300}
    />
  );
};

export default BarComponent;
