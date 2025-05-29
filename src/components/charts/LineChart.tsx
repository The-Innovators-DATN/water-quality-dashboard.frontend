"use client";

import * as d3 from "d3";
import type { NumberValue } from "d3";
import { useEffect, useRef, useState } from "react";
import type { Dataset, ChartPoint } from "@/lib/types/chartType";

interface LineChartProps {
  datasets: Dataset[];
  timeRange: { from: string | Date, to: string | Date };
}

function darkenColor(hex: string, amount: number = 0.2): string {
  const rgb = d3.color(hex);
  if (!rgb || !(rgb instanceof d3.rgb)) return hex;

  const hsl = d3.hsl(rgb);
  hsl.s = Math.min(1, hsl.s + amount);
  hsl.l = Math.max(0, hsl.l - amount);

  return hsl.formatHex();
}

function parseRelativeTimeString(relativeStr: string): Date {
  const now = new Date();
  if (relativeStr === "now") return now;

  const match = relativeStr.match(/^now-(\d+)([smhdMy])$/);
  if (!match) return now;

  const [, amountStr, unit] = match;
  const amount = parseInt(amountStr, 10);

  switch (unit) {
    case "s": now.setSeconds(now.getSeconds() - amount); break;
    case "m": now.setMinutes(now.getMinutes() - amount); break;
    case "h": now.setHours(now.getHours() - amount); break;
    case "d": now.setDate(now.getDate() - amount); break;
    case "M": now.setMonth(now.getMonth() - amount); break;
    case "y": now.setFullYear(now.getFullYear() - amount); break;
  }

  return now;
}

export default function LineChart({ datasets, timeRange }: LineChartProps) {
  const ref = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 600, height: 300 });

  const fromDate = (typeof timeRange.from === "string" ? parseRelativeTimeString(timeRange.from) : timeRange.from);
  const toDate = (typeof timeRange.to === "string" ? parseRelativeTimeString(timeRange.to) : timeRange.to);

  useEffect(() => {
    if (!datasets || datasets.length === 0) return;

    datasets.forEach(ds => {
      ds.actual.forEach(p => {
        if (!(p.datetime instanceof Date)) {
          p.datetime = new Date(p.datetime);
        }
      });
      ds.forecast.forEach(p => {
        if (!(p.datetime instanceof Date)) {
          p.datetime = new Date(p.datetime);
        }
      });
    });

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 30, bottom: 60, left: 50 };
    const chartHeight = size.height * 0.75;
    const width = size.width - margin.left - margin.right;
    const height = chartHeight - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
    const flat = datasets.flatMap((d) => [...d.actual, ...d.forecast]);

    const [startTime, endTime] = [new Date(fromDate), new Date(toDate)];
    const filteredDatasets = datasets.map(ds => ({
      ...ds,
      actual: ds.actual.filter(p => p.datetime >= startTime && p.datetime <= endTime),
      forecast: ds.forecast,
    }));
    const flatFiltered = filteredDatasets.flatMap(d => [...d.actual, ...d.forecast]);

    const flatActual = filteredDatasets.flatMap(d => d.actual);
    const flatForecast = filteredDatasets.flatMap(d => d.forecast);

    const maxActualdatetime = d3.max(flatActual, d => d.datetime) ?? endTime;
    const maxForecastdatetime = d3.max(flatForecast, d => d.datetime) ?? endTime;

    const maxdatetime = maxActualdatetime > maxForecastdatetime ? maxActualdatetime : maxForecastdatetime;

    const x = d3.scaleTime()
      .domain([startTime, maxdatetime > endTime ? maxdatetime : endTime])
      .range([0, width]);

    const values = flatFiltered.map(d => d.value).filter((v): v is number => typeof v === "number");
    const minVal = d3.min(values) ?? 0;
    const maxVal = d3.max(values) ?? 0;
    const padding = (maxVal - minVal) * 0.1 || 0.0001;
    
    const y = d3.scaleLinear()
      .domain([minVal - padding, maxVal + padding])
      .range([height, 0]);

    g.append("g").call(d3.axisLeft(y));
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(
        d3.axisBottom(x)
          .ticks(5)
          .tickFormat((domainValue: Date | NumberValue, index: number) => {
            const date = domainValue as Date;
            const diffDays = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60 * 24);

            if (diffDays <= 7) return d3.timeFormat("%d/%m %H:%M:%S")(date);
            if (diffDays <= 183) return d3.timeFormat("%d/%m/%y")(date);
            return d3.timeFormat("%m/%Y")(date);
          })
          .tickSizeOuter(0)
      )
      .selectAll("text")
      .attr("text-anchor", "middle")

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

    filteredDatasets.forEach((ds, i) => {
      const lineGenerator = d3.line<ChartPoint>()
        .x((d) => x(d.datetime))
        .y((d) => y(d.value));

      // Vẽ actual
      g.append("path")
        .datum(ds.actual)
        .attr("fill", "none")
        .attr("stroke", ds.color)
        .attr("stroke-width", 2)
        .attr("d", lineGenerator);

      // Vẽ forecast với nét đứt
      if (ds.forecast.length > 0) {
        g.append("path")
          .datum(ds.forecast)
          .attr("fill", "none")
          .attr("stroke", ds.color)
          .attr("stroke-width", 2)
          .attr("stroke-dasharray", "6 4")
          .attr("d", lineGenerator);
      }

      if (ds.actual.length > 0 && ds.forecast.length > 0) {
        const lastActual = ds.actual[ds.actual.length - 1];
        const firstForecast = ds.forecast[0];
        g.append("path")
          .datum([lastActual, firstForecast])
          .attr("fill", "none")
          .attr("stroke", ds.color)
          .attr("stroke-width", 2)
          .attr("d", d3.line<ChartPoint>()
            .x(d => x(d.datetime))
            .y(d => y(d.value))
          );
      }
      
      filteredDatasets.forEach((ds) => {
        const allPoints = [...ds.actual, ...ds.forecast];

        const safeClass = `point-${ds.label.replace(/\s+/g, '-')}`;
        const escapedClass = CSS.escape(safeClass);
      
        g.selectAll(`.${escapedClass}`)
          .data(allPoints)
          .join("circle")
          .attr("class", safeClass)
          .attr("cx", d => x(d.datetime))
          .attr("cy", d => y(d.value))
          .attr("r", 4)
          .attr("fill", d => d.forecast ? "orange" : ds.color)
          .attr("stroke", "#fff")
          .attr("stroke-width", 1.5);

        allPoints
        .filter(p => p.pointAnomaly)
        .forEach((p) => {
          g.append("circle")
            .attr("cx", x(p.datetime))
            .attr("cy", y(p.value))
            .attr("r", 8)
            .attr("fill", "none")
            .attr("stroke", "red")
            .attr("stroke-width", 2);
        });
      });      

      const combined = [...ds.actual, ...ds.forecast];
      g.append("path")
        .datum(combined)
        .attr("fill", "none")
        .attr("stroke", "transparent")
        .attr("stroke-width", 15)
        .attr("d", lineGenerator)
        .on("mousemove", function (event) {
          const [mx] = d3.pointer(event);
          const mxTime = x.invert(mx);

          let closest: ChartPoint | null = null;
          let minDist = Infinity;

          for (const point of combined) {
            const dist = Math.abs(point.datetime.getTime() - mxTime.getTime());
            if (dist < minDist) {
              closest = point;
              minDist = dist;
            }
          }

          if (!closest || !tooltipDiv || !containerRef.current) return;

          highlightCircle
            .attr("cx", x(closest.datetime))
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
              <div>${d3.timeFormat("%d/%m/%y %H:%M:%S")(closest.datetime)}</div>
              <div>Giá trị: ${closest.value} ${closest.forecast ? "(dự đoán)" : ""}</div>
            `);
        })
        .on("mouseleave", () => {
          tooltipDiv?.style("display", "none");
          highlightCircle.style("display", "none");
        });

      const highlightCircle = g
        .append("circle")
        .attr("r", 5)
        .attr("fill", ds.color)
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .style("display", "none");

      for (let j = 0; j < combined.length; j++) {
        if (combined[j].trendAnomaly) {
          if (j > 0) {
            g.append("line")
            .attr("x1", x(combined[j - 1].datetime))
            .attr("y1", y(combined[j - 1].value))
            .attr("x2", x(combined[j].datetime))
            .attr("y2", y(combined[j].value))
            .attr("stroke", darkenColor(combined[j].color))
            .attr("stroke-width", 6)
            .attr("stroke-linecap", "round");
          }
          if (j < combined.length - 1) {
            g.append("line")
              .attr("x1", x(combined[j].datetime))
              .attr("y1", y(combined[j].value))
              .attr("x2", x(combined[j + 1].datetime))
              .attr("y2", y(combined[j + 1].value))
              .attr("stroke", darkenColor(combined[j].color))
              .attr("stroke-width", 6)
              .attr("stroke-opacity", 0.6)
              .attr("stroke-linecap", "round");
          }
        }
      }
    });

    const legend = svg.append("g").attr("transform", `translate(${margin.left}, ${chartHeight + 20})`);

    filteredDatasets.forEach((ds, i) => {
      const xOffset = i * 140;
      legend.append("rect").attr("x", xOffset).attr("y", 0).attr("width", 12).attr("height", 12).attr("fill", ds.color);
      legend.append("text").attr("x", xOffset + 18).attr("y", 10).attr("font-size", "12px").text(ds.label);
    });

    const legendX = filteredDatasets.length * 140;
    
    const hasForecast = datasets.some(ds => ds.forecast.length > 0);

    if (hasForecast) {
      legend.append("line")
        .attr("x1", legendX)
        .attr("y1", 6)
        .attr("x2", legendX + 30)
        .attr("y2", 6)
        .attr("stroke", "black")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "6 4");

      legend.append("text")
        .attr("x", legendX + 36)
        .attr("y", 10)
        .attr("font-size", "12px")
        .text("Dự đoán");
    }
      }, [datasets, size, timeRange]);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.contentRect) {
          const { width, height } = entry.contentRect;
          setSize({
            width: width,
            height: height,
          });
        }
      }
    });

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full"
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
