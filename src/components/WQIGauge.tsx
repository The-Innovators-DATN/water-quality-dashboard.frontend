"use client";
import * as d3 from "d3";
import { useEffect, useRef } from "react";

interface GaugeRange {
  start: number;
  end: number;
  color: string;
}

interface WQIGaugeProps {
  value: number;
  className?: string;
}

const WQIGauge: React.FC<WQIGaugeProps> = ({ value, className = "" }) => {
  const ref = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const width = 350;
    const height = 200;
    const outerRadius = 150;
    const innerRadius = 100;
    const needleLength = 130;

    const ranges: GaugeRange[] = [
      { start: 0, end: 50, color: "#00cc44" },
      { start: 50, end: 100, color: "#ffff00" },
      { start: 100, end: 150, color: "#ff9933" },
      { start: 150, end: 200, color: "#ff0000" },
      { start: 200, end: 300, color: "#99004d" },
      { start: 300, end: 500, color: "#660033" },
    ];

    const scale = d3.scaleLinear().domain([0, 500]).range([-90, 90]);

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const g = svg
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height * 0.9})`);

    const arc = d3.arc<GaugeRange>()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .startAngle(d => scale(d.start) * (Math.PI / 180))
      .endAngle(d => scale(d.end) * (Math.PI / 180));

    g.selectAll("path")
      .data(ranges)
      .enter()
      .append("path")
      .attr("d", d => arc(d) as string)
      .attr("fill", d => d.color);

    const ticks = d3.range(0, 550, 50);
    ticks.forEach(tick => {
      const angle = scale(tick) - 90;
      const x = (outerRadius + 15) * Math.cos((angle * Math.PI) / 180);
      const y = (outerRadius + 15) * Math.sin((angle * Math.PI) / 180);

      g.append("text")
        .attr("x", x)
        .attr("y", y)
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .attr("font-size", "10px")
        .text(tick.toString());
    });

    const needleGroup = g.append("g").attr("class", "needle");

    needleGroup.append("line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", 0)
      .attr("y2", -needleLength)
      .attr("stroke", "#000")
      .attr("stroke-width", 3)
      .attr("transform", `rotate(${scale(0)})`);

    needleGroup.append("circle")
      .attr("r", 5)
      .attr("fill", "#555");

    needleGroup.select("line")
      .transition()
      .duration(1000)
      .attr("transform", `rotate(${scale(value)})`);
  }, [value]);

  return (
    <svg
      ref={ref}
      viewBox="0 0 350 200"
      preserveAspectRatio="xMidYMid meet"
      className={`w-full h-auto ${className}`}
    />
  );
};

export default WQIGauge;