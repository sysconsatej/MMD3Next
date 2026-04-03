"use client";

import { useEffect, useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import { allChartData } from "./allChartData";

ChartJS.register(ArcElement, Tooltip, Legend);

const COLORS = [
  "#DC2626",
  "#0891B2",
  "#16A34A",
  "#9333EA",
  "#4F46E5",

  "#D97706",
];

const GRAY = "#E5E7EB";

const PieWrapper = ({ type, data }) => {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let start = null;
    const duration = 1200;
    const animate = (t) => {
      if (!start) start = t;
      const elapsed = t - start;
      const p = Math.min(elapsed / duration, 1);
      setProgress(p);
      if (p < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, []);

  if (!data || !Array.isArray(data)) return null;
  const labels = data.map((d) => d.dimension);
  const values = data.map((d) => d.measure);
  const total = values.reduce((a, b) => a + b, 0);
  let cumulative = 0;
  const dynamicColors = values.map((val, i) => {
    const start = cumulative / total;
    const end = (cumulative + val) / total;
    cumulative += val;

    if (progress >= end) {
      return COLORS[i % COLORS.length];
    }
    return GRAY;
  });

  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: dynamicColors,
        borderColor: "#0f172a",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    ...allChartData[type]?.options,
    rotation: -90,
    circumference: progress * 360,
    animation: false,
    plugins: {
      ...allChartData[type]?.options?.plugins,
    },
  };

  return <Pie data={chartData} options={options} />;
};

export default PieWrapper;
