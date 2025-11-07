import dynamic from "next/dynamic";

export const chartRegister = {
  line: dynamic(() => import("./LineChart")),
  area: dynamic(() => import("./AreaComponent")),
  bar: dynamic(() => import("./BarComponent")),
  pie: dynamic(() => import("./PieWrapper")),
  dounut: dynamic(() => import("./DonutWrapper")),
};
