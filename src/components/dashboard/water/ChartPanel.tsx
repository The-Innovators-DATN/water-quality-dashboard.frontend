"use client";

import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

interface ChartPanelProps {
  param: string;
  type: "line" | "bar";
  color: string;
}

const ChartPanel: React.FC<ChartPanelProps> = ({ param, type, color }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous chart

    const width = 300;
    const height = 180;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };

    const data = d3.range(10).map((i) => ({
      x: i,
      y: Math.random() * 100,
    }));

    const x = d3.scaleLinear().domain([0, 9]).range([margin.left, width - margin.right]);
    const y = d3.scaleLinear().domain([0, 100]).nice().range([height - margin.bottom, margin.top]);

    const g = svg
      .attr("viewBox", `0 0 ${width} ${height}`)
      .classed("w-full", true);

    // Axis
    g.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(10));

    g.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));

    if (type === "line") {
      const line = d3
        .line<{ x: number; y: number }>()
        .x(d => x(d.x))
        .y(d => y(d.y));

      g.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", 2)
        .attr("d", line);
    }

    if (type === "bar") {
      g.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", d => x(d.x) - 10)
        .attr("y", d => y(d.y))
        .attr("width", 20)
        .attr("height", d => y(0) - y(d.y))
        .attr("fill", color);
    }
  }, [param, type, color]);

  return (
    <div className="border p-2 rounded shadow-md">
      <p className="font-semibold mb-1">{param}</p>
      <svg ref={svgRef} />
    </div>
  );
};

export default ChartPanel;