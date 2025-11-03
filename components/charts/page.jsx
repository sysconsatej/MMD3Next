"use client";

import { chartRegister } from "./chartRegister";

export const ChartRender = ({ type }) => {
  const ChartComponent = chartRegister[type];

  if (!ChartComponent) return null;

  return (
    <div className="w-full max-w-[600px]">
      <ChartComponent type={type} />
    </div>
  );
};
