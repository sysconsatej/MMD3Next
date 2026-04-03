"use client";

import { useEffect, useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const COLORS = [
  "#4F46E5",
  "#16A34A",
  "#D97706",
  "#DC2626",
  "#0891B2",
  "#9333EA",
];

const GRAY = "#E5E7EB";

const DonutWrapper = ({ data }) => {
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

  const values = data.map((d) => d.measure);
  const labels = data.map((d) => d.dimension);

  const total = values.reduce((a, b) => a + b, 0);

  let cumulative = 0;

  const dynamicColors = values.map((val, i) => {
    const start = cumulative / total;
    const end = (cumulative + val) / total;
    cumulative += val;
    if (progress >= end) {
      return COLORS[i % COLORS.length];
    }
    if (progress <= start) {
      return GRAY;
    }
    return GRAY;
  });

  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: dynamicColors,
        borderColor: "#fff",
        borderWidth: 2,
      },
    ],
  };

  const options = {
    rotation: -90,
    circumference: progress * 360,
    animation: false,
    plugins: {
      legend: {
        position: "bottom",
      },
    },
  };

  return <Doughnut data={chartData} options={options} />;
};

export default DonutWrapper;
