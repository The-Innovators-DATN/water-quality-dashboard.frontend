"use client";

import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";
import type { Dataset, ChartPoint } from "@/lib/types/chartType";

interface LineChartProps {
  datasets: Dataset[];
}

export default function LineChart({ datasets }: LineChartProps) {
  const ref = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 600, height: 300 });

  useEffect(() => {
    if (!datasets || datasets.length === 0) return;

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 30, bottom: 60, left: 50 };
    const chartHeight = size.height * 0.75;
    const width = size.width - margin.left - margin.right;
    const height = chartHeight - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
    const flat = datasets.flatMap((d) => [...d.actual, ...d.forecast]);

    const x = d3.scaleTime()
      .domain(d3.extent(flat, (d) => d.timestamp) as [Date, Date])
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([d3.min(flat, (d) => d.value)! - 1, d3.max(flat, (d) => d.value)! + 1])
      .range([height, 0]);

    g.append("g").call(d3.axisLeft(y));
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(
        d3.axisBottom(x).tickFormat((d, i) => d3.timeFormat("%d/%m/%Y")(d as Date))
      );

    let tooltipDiv = containerRef.current
      ? d3.select(containerRef.current).select<HTMLDivElement>(".tooltip-html")
      : null;

    if (!tooltipDiv || tooltipDiv.empty()) {
      tooltipDiv = d3
        .select(containerRef.current!)
        .append<HTMLDivElement>("div")
        .attr("class", "tooltip-html")
        .style("position", "absolute")
        .style("z-index", "999")
        .style("background", "white")
        .style("border", "1px solid #ccc")
        .style("padding", "6px 10px")
        .style("font-size", "12px")
        .style("border-radius", "4px")
        .style("pointer-events", "none")
        .style("display", "none");
    }

    datasets.forEach((ds) => {
      const combined = [...ds.actual, ...ds.forecast];
      const pathArea = g.append("g");

      pathArea.append("path")
        .datum(ds.actual)
        .attr("fill", "none")
        .attr("stroke", ds.color)
        .attr("stroke-width", 2)
        .attr("d", d3.line<ChartPoint>().x((d) => x(d.timestamp)).y((d) => y(d.value)));

      if (ds.forecast.length > 0) {
        pathArea.append("path")
          .datum(ds.forecast)
          .attr("fill", "none")
          .attr("stroke", ds.color)
          .attr("stroke-width", 2)
          .attr("stroke-dasharray", "4 2")
          .attr("d", d3.line<ChartPoint>().x((d) => x(d.timestamp)).y((d) => y(d.value)));
      }

      const highlightCircle = g
        .append("circle")
        .attr("r", 5)
        .attr("fill", ds.color)
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .style("display", "none");

      pathArea.append("path")
        .datum(combined)
        .attr("fill", "none")
        .attr("stroke", "transparent")
        .attr("stroke-width", 15)
        .attr("d", d3.line<ChartPoint>().x((d) => x(d.timestamp)).y((d) => y(d.value)))
        .on("mousemove", function (event) {
          const [mx] = d3.pointer(event);
          const mxTime = x.invert(mx);

          let closest: ChartPoint | null = null;
          let minDist = Infinity;

          for (const point of combined) {
            const dist = Math.abs(point.timestamp.getTime() - mxTime.getTime());
            if (dist < minDist) {
              closest = point;
              minDist = dist;
            }
          }

          if (!closest || !tooltipDiv || !containerRef.current) return;

          highlightCircle
            .attr("cx", x(closest.timestamp))
            .attr("cy", y(closest.value))
            .style("display", "block");

          const containerRect = containerRef.current.getBoundingClientRect();
          const svgX = event.clientX - containerRect.left;
          const svgY = event.clientY - containerRect.top;

          const tooltipWidth = 160;
          const tooltipHeight = 60;

          const left = Math.min(Math.max(8, svgX + 16), size.width - tooltipWidth - 16);
          const top = Math.min(Math.max(8, svgY + 8), size.height - tooltipHeight - 8);

          tooltipDiv
            .style("left", `${left}px`)
            .style("top", `${top}px`)
            .style("display", "block")
            .html(`
              <div><strong>${closest.label}</strong></div>
              <div>${d3.timeFormat("%d/%m/%y %H:%M")(closest.timestamp)}</div>
              <div>Giá trị: ${closest.value.toFixed(2)} ${closest.forecast ? "(dự đoán)" : ""}</div>
            `);
        })
        .on("mouseleave", () => {
          tooltipDiv?.style("display", "none");
          highlightCircle.style("display", "none");
        });
    });

    const legend = svg.append("g").attr("transform", `translate(${margin.left}, ${chartHeight + 20})`);

    datasets.forEach((ds, i) => {
      const xOffset = i * 140;
      legend.append("rect").attr("x", xOffset).attr("y", 0).attr("width", 12).attr("height", 12).attr("fill", ds.color);
      legend.append("text").attr("x", xOffset + 18).attr("y", 10).attr("font-size", "12px").text(ds.label);
    });
  }, [datasets, size]);

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={{ height: `${size.height}px` }}
    >
      <svg
        ref={ref}
        className="w-full h-full overflow-visible"
        viewBox={`0 0 ${size.width} ${size.height}`}
        preserveAspectRatio="xMidYMid meet"
      />
    </div>
  );
}
