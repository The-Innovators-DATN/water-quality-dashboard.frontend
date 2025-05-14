'use client'

import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

type Series = {
  label: string
  color: string
  values: { time: string; value: number }[]
}

type Props = {
  data: Series[]
  title?: string
}

export default function LineChart({ data, title }: Props) {
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 })

  useEffect(() => {
    if (!wrapperRef.current) return

    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect
        setDimensions({ width, height })
      }
    })

    observer.observe(wrapperRef.current)

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0 || dimensions.height === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const margin = { top: 40, right: 20, bottom: 50, left: 50 }
    const innerWidth = dimensions.width - margin.left - margin.right
    const innerHeight = dimensions.height - margin.top - margin.bottom

    if (!Array.isArray(data) || data.length === 0) return

    if (title) {
      svg.append("text")
        .attr("x", dimensions.width / 2)
        .attr("y", margin.top / 2)
        .attr("text-anchor", "middle")
        .attr("class", "chart-title")
        .style("font-size", "14px")
        .style("font-weight", "600")
        .text(title)
    }

    const allTimes = data.flatMap(d => (d?.values ?? []).map(v => v.time))
    const allValues = data.flatMap(d => (d?.values ?? []).map(v => v.value))

    const parseTime = d3.isoParse
    const allParsedTimes = allTimes.map(parseTime).filter(Boolean) as Date[]

    const xScale = d3.scaleTime()
      .domain(d3.extent(allParsedTimes) as [Date, Date])
      .range([0, innerWidth])

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(allValues) ?? 100])
      .range([innerHeight, 0])

    const line = d3.line<{ time: string; value: number }>()
      .x(d => xScale(parseTime(d.time) as Date))
      .y(d => yScale(d.value))

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale)
        .ticks(5)
        .tickFormat((date: Date) => {
          const [start, end] = d3.extent(allParsedTimes) as [Date, Date];
          const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);

          if (diffDays <= 7) return d3.timeFormat("%d/%m %H:%M")(date);
          if (diffDays <= 183) return d3.timeFormat("%d/%m/%y")(date);
          return d3.timeFormat("%m/%Y")(date);
        })
        .tickSizeOuter(0))
      .selectAll("text")
      .style("text-anchor", "middle")

    g.append('g').call(d3.axisLeft(yScale))

    data.forEach(series => {
      if (!series || !Array.isArray(series.values)) return
      g.append('path')
        .datum(series.values ?? [])
        .attr('fill', 'none')
        .attr('stroke', series.color)
        .attr('stroke-width', 2)
        .attr('d', line)
    })

    // Tooltip
    const tooltip = d3.select(wrapperRef.current)
      .append("div")
      .style("position", "absolute")
      .style("background", "rgba(0,0,0,0.7)")
      .style("color", "white")
      .style("padding", "4px 8px")
      .style("border-radius", "4px")
      .style("font-size", "12px")
      .style("pointer-events", "none")
      .style("opacity", 0)

    svg.on("mousemove", function (event) {
      const [x, y] = d3.pointer(event)
      const x0 = xScale.invert(x - margin.left)

      tooltip.style("opacity", 0).html('') // Clear tooltip initially
      svg.selectAll(".hover-circle").remove()

      let nearestPoint: {
        series: Series
        point: { time: string; value: number }
        cx: number
        cy: number
      } | null = null

      data.forEach(series => {
        const bisect = d3.bisector((d: { time: string }) => parseTime(d.time) as Date).left
        const xDate = x0 as Date
        const idx = bisect(series.values, xDate)
        const a = series.values[idx - 1]
        const b = series.values[idx]
        const d = !a ? b : !b ? a : xDate.getTime() - parseTime(a.time)!.getTime() < parseTime(b.time)!.getTime() - xDate.getTime() ? a : b

        if (!d) return

        const cx = xScale(parseTime(d.time) as Date)
        const cy = yScale(d.value)

        const distance = Math.hypot(cx - (x - margin.left), cy - (y - margin.top))
        if (!nearestPoint || distance < Math.hypot(nearestPoint.cx - (x - margin.left), nearestPoint.cy - (y - margin.top))) {
          nearestPoint = { series, point: d, cx, cy }
        }
      })

      if (nearestPoint) {
        const { series, point, cx, cy } = nearestPoint
        const distanceToCursor = Math.hypot(cx - (x - margin.left), cy - (y - margin.top))
        if (distanceToCursor > 30) return

        const tooltipWidth = 120
        const tooltipLeftRaw = margin.left + cx + 10
        const tooltipTop = margin.top + cy
        let finalLeft = tooltipLeftRaw

        if (tooltipLeftRaw + tooltipWidth > dimensions.width) {
          finalLeft = dimensions.width - tooltipWidth - 10
        }
        if (finalLeft < 0) {
          finalLeft = 0
        }

        tooltip
          .style("left", `${finalLeft}px`)
          .style("top", `${tooltipTop}px`)
          .style("opacity", 1)
          .html(`<div><strong>${series.label}:</strong> ${point.value}<br>${d3.timeFormat("%d/%m/%Y %H:%M")(parseTime(point.time) as Date)}</div>`)

        svg.selectAll(".hover-circle").remove()
        svg.append("circle")
          .attr("class", "hover-circle")
          .attr("cx", margin.left + cx)
          .attr("cy", margin.top + cy)
          .attr("r", 4)
          .attr("fill", series.color)
          .attr("stroke", "#fff")
          .attr("stroke-width", 1.5)
      }
    })

    svg.on("mouseleave", () => {
      tooltip.style("opacity", 0)
      svg.selectAll(".hover-circle").remove()
    })
  }, [data, dimensions])

  return (
    <div ref={wrapperRef} className="bg-white rounded-xl p-2 shadow-sm w-full h-full overflow-hidden">
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height - (data.length > 1? 30 : 0)}
        preserveAspectRatio="xMinYMin meet"
      />
      {data.length > 1 && (
        <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2 text-sm text-gray-700 px-2">
          {data.map((series, index) => (
            <div key={index} className="flex items-center gap-2">
              <span
                className="inline-block w-3 h-3 rounded-full"
                style={{ backgroundColor: series.color }}
              />
              <span>{series.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}