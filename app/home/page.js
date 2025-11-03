import { ChartRender } from "@/components/charts/page";

export default function HomePage() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center  p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start"></main>
      <ChartRender type={"line"} />
      <ChartRender type={"area"} />
      <ChartRender type={"bar"} />
      {/* <ChartRender type={"dounut"} /> */}
      <ChartRender type={"pie"} />
    </div>
  );
}
