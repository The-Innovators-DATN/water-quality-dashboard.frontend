"use client";

import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";

interface BarData {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarData[];
}

export default function BarChart({ data }: BarChartProps) {
  const ref = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 600, height: 300 });

  useEffect(() => {
    if (!data || data.length === 0) return;
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 20, bottom: 50, left: 50 };
    const width = size.width - margin.left - margin.right;
    const height = size.height - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
      .domain(data.map(d => d.label))
      .range([0, width])
      .padding(0.2);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value)!])
      .nice()
      .range([height, 0]);

    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    g.append("g").call(d3.axisLeft(y));

    g.selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", d => x(d.label)!)
      .attr("y", d => y(d.value))
      .attr("width", x.bandwidth())
      .attr("height", d => height - y(d.value))
      .attr("fill", d => d.color ?? "#3B82F6");
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