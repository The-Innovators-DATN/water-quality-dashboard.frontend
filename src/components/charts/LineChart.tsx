"use client";

import * as d3 from "d3";
import { useEffect, useRef, useState, useCallback } from "react";

type Target = {
  target_type: string;
  display_name: string;
  color: string;
  api: string;
};

interface LineChartProps {
  targets: Target[];
  refreshInterval?: number;
  timeRange?: string;
  triggerFetch?: boolean;
}

type ChartPoint = {
  timestamp: Date;
  value: number;
  anomaly: boolean;
  forecast: boolean;
  label: string;
  color: string;
};

type ApiPoint = {
  timestamp: string;
  value: number;
  anomaly: boolean;
};

type ApiResponse = {
  parameter: string;
  data: ApiPoint[];
  forecast: ApiPoint[];
} | null;

export default function LineChart({
  targets,
  refreshInterval = 60,
  timeRange = "1h",
  triggerFetch = false,
}: LineChartProps) {
  const ref = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 600, height: 300 });

  const targetsRef = useRef(targets);
  const timeRangeRef = useRef(timeRange);

  useEffect(() => {
    targetsRef.current = targets;
  }, [targets]);

  useEffect(() => {
    timeRangeRef.current = timeRange;
  }, [timeRange]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      setTimeout(() => {
        const width = container.clientWidth;
        const height = container.clientHeight;
        if (width > 300 && height > 200) {
          setSize({ width, height });
        }
      }, 0);
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []); 

  const drawChart = useCallback((responses: ApiResponse[]) => {
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 40, bottom: 60, left: 50 };
    const itemsPerColumn = 2;
    const columnWidth = 120;

    const usableHeight = size.height;
    const chartHeight = usableHeight * 0.75;

    const width = size.width - margin.left - margin.right;
    const height = chartHeight - margin.top - margin.bottom;

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const datasets: ChartPoint[][] = responses.map((res, i) => {
      const color = targetsRef.current[i].color;
      const label = targetsRef.current[i].display_name;
    
      const actual: ChartPoint[] =
        res?.data?.map((d: ApiPoint) => ({
          timestamp: new Date(d.timestamp),
          value: d.value,
          anomaly: d.anomaly,
          forecast: false,
          label,
          color,
        })) ?? [];
    
      const forecast: ChartPoint[] =
        res?.forecast?.map((d: ApiPoint) => ({
          timestamp: new Date(d.timestamp),
          value: d.value,
          anomaly: d.anomaly,
          forecast: true,
          label,
          color,
        })) ?? [];
    
      if (forecast.length > 0) {
        const bridgePoint: ChartPoint = { ...forecast[0], forecast: false };
        actual.push(bridgePoint);
      }
    
      return [...actual, ...forecast].sort(
        (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
      );
    });

    const flatData: ChartPoint[] = datasets.flat();
    if (flatData.length === 0) return;

    const x = d3
      .scaleTime()
      .domain(d3.extent(flatData, (d) => d.timestamp) as [Date, Date])
      .range([0, width]);

    const y = d3
      .scaleLinear()
      .domain([
        d3.min(flatData, (d) => d.value)! - 1,
        d3.max(flatData, (d) => d.value)! + 1,
      ])
      .range([height, 0]);

    const forecastStart = flatData.find((d) => d.forecast)?.timestamp;
    if (forecastStart) {
      g.append("rect")
        .attr("x", x(forecastStart))
        .attr("y", 0)
        .attr("width", width - x(forecastStart))
        .attr("height", height)
        .attr("fill", "#f0f0f0");
    }

    g.append("g").call(d3.axisLeft(y));
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

      let tooltipDiv = containerRef.current
      ? d3.select(containerRef.current).select<HTMLDivElement>(".tooltip-html")
      : d3.select(document.createElement("div"))
    if (tooltipDiv.empty()) {
      tooltipDiv = d3
        .select(containerRef.current as HTMLDivElement)
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

    svg.on("mousemove", function (event) {
      const [mx, my] = d3.pointer(event, this);
      const mxTime = x.invert(mx - margin.left);
    
      // Nếu ngoài vùng trục thì ẩn luôn
      if (
        mx < margin.left ||
        mx > margin.left + width ||
        my < margin.top ||
        my > margin.top + height
      ) {
        tooltipDiv.style("display", "none");
        return;
      }
    
      let closest = null;
      let minDist = Infinity;
      for (const d of flatData) {
        const dist = Math.abs(d.timestamp.getTime() - mxTime.getTime());
        if (dist < minDist) {
          closest = d;
          minDist = dist;
        }
      }

      if (!closest) {
        tooltipDiv.style("display", "none");
        return;
      }
    
      const xMouse = mx - margin.left;
      const xClosest = x(closest.timestamp);
      const pixelDistance = Math.abs(xClosest - xMouse);
      const maxAllowableDistance = (x.range()[1] - x.range()[0]) / 30;
    
      if (!closest || pixelDistance > maxAllowableDistance) {
        tooltipDiv.style("display", "none");
        return;
      }
    
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (!containerRect) return;
      const svgX = event.clientX - containerRect.left;
      const svgY = event.clientY - containerRect.top;
    
      const tooltipWidth = 160;
      const tooltipHeight = 50;
    
      const clampedX = Math.max(
        margin.left,
        Math.min(svgX + 16, size.width - margin.right - tooltipWidth)
      );
      const clampedY = Math.max(
        margin.top,
        Math.min(svgY + 8, chartHeight - margin.bottom - tooltipHeight)
      );
    
      tooltipDiv
        .style("left", `${clampedX}px`)
        .style("top", `${clampedY}px`)
        .style("display", "block")
        .html(`
          <div><strong>${closest.label}</strong> | ${d3.timeFormat("%H:%M")(closest.timestamp)}</div>
          <div>Giá trị: ${closest.value.toFixed(2)} ${closest.forecast ? "(dự đoán)" : ""}</div>
        `);
    });

    svg.on("mouseleave", () => {
      tooltipDiv.style("display", "none");
    });

    datasets.forEach((data) => {
      const actual = data.filter((d) => !d.forecast);
      const forecast = data.filter((d) => d.forecast);

      const line = d3.line<ChartPoint>()
        .x((d) => x(d.timestamp))
        .y((d) => y(d.value));

      g.append("path")
        .datum(actual)
        .attr("fill", "none")
        .attr("stroke", actual[0]?.color || "steelblue")
        .attr("stroke-width", 2)
        .attr("d", line);

      g.append("path")
        .datum(forecast)
        .attr("fill", "none")
        .attr("stroke", forecast[0]?.color || "steelblue")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5 5")
        .attr("d", line);

      actual.concat(forecast).forEach((d) => {
        if (d.anomaly) {
          g.append("circle")
            .attr("cx", x(d.timestamp))
            .attr("cy", y(d.value))
            .attr("r", 5)
            .attr("fill", "red")
            .append("title")
            .text(
              `⚠ Anomaly: ${d.label} lúc ${d3.timeFormat("%H:%M")(d.timestamp)}`
            );
        }
      });

      if (forecast.length > 0) {
        g.append("line")
          .attr("x1", x(forecast[0].timestamp))
          .attr("x2", x(forecast[0].timestamp))
          .attr("y1", 0)
          .attr("y2", height)
          .attr("stroke", forecast[0]?.color || "gray")
          .attr("stroke-dasharray", "2 2");
      }
    });

    // Legend không còn "Dự đoán"
    const legend = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${chartHeight + 20})`);

    targetsRef.current.forEach((target, i) => {
      const col = Math.floor(i / itemsPerColumn);
      const row = i % itemsPerColumn;
      const xOffset = col * columnWidth;
      const yOffset = row * 20;

      legend
        .append("rect")
        .attr("x", xOffset)
        .attr("y", yOffset)
        .attr("width", 12)
        .attr("height", 12)
        .attr("fill", target.color);

      legend
        .append("text")
        .attr("x", xOffset + 18)
        .attr("y", yOffset + 10)
        .text(target.display_name)
        .attr("font-size", "12px");
    });
  }, [size]);

  const fetchAndDraw = useCallback(async () => {
    const t = targetsRef.current;
    const range = timeRangeRef.current;
  
    const responses: ApiResponse[] = await Promise.all(
      t.map((target) =>
        fetch(`${target.api}?range=${range}`)
          .then((res) => res.json())
          .catch(() => null)
      )
    );
  
    drawChart(responses);
  }, [drawChart]); 

  useEffect(() => {
    fetchAndDraw();
    const intervalId =
      refreshInterval > 0 ? setInterval(fetchAndDraw, refreshInterval * 1000) : null;
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [refreshInterval, fetchAndDraw]);
  
  useEffect(() => {
    fetchAndDraw();
  }, [timeRange, size, triggerFetch, fetchAndDraw]);  

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[300px] overflow-hidden"
    >
      <svg ref={ref} className="w-full h-full overflow-visible" />
    </div>
  );
}
