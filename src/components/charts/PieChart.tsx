"use client";

import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";

interface PieData {
  label: string;
  value: number;
  color?: string;
}

interface PieChartProps {
  data: PieData[];
}

export default function PieChart({ data }: PieChartProps) {
  const ref = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 400, height: 400 });

  useEffect(() => {
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const radius = Math.min(size.width, size.height) / 2;
    const g = svg.append("g").attr("transform", `translate(${size.width / 2},${size.height / 2})`);

    const pie = d3.pie<PieData>().value(d => d.value);
    const arc = d3.arc<d3.PieArcDatum<PieData>>().innerRadius(0).outerRadius(radius);

    const pieData = pie(data);

    g.selectAll("path")
      .data(pieData)
      .enter()
      .append("path")
      .attr("d", arc)
      .attr("fill", d => d.data.color ?? d3.schemeCategory10[d.index % 10]);

    g.selectAll("text")
      .data(pieData)
      .enter()
      .append("text")
      .attr("transform", d => `translate(${arc.centroid(d)})`)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .text(d => d.data.label);
  }, [data, size]);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setSize({ width, height });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <svg
        ref={ref}
        className="w-full h-full overflow-visible"
        viewBox={`0 0 ${size.width} ${size.height}`}
        preserveAspectRatio="xMidYMid meet"
      />
    </div>
  );
}