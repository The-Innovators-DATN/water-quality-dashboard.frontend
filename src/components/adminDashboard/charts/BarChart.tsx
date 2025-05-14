'use client'

import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

interface BarDatum {
  label: string
  value: number
  color?: string
  time?: string
}

interface BarChartProps {
  data: BarDatum[]
  title?: string
}

const BarChart: React.FC<BarChartProps> = ({ data, title }) => {
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

    const margin = { top: 20, right: 10, bottom: 50, left: 40 }
    const innerWidth = dimensions.width - margin.left - margin.right
    const innerHeight = dimensions.height - margin.top - margin.bottom

    const xScale = d3.scaleBand()
      .domain(data.map(d => d.label))
      .range([0, innerWidth])
      .padding(0.3)

    const yMax = d3.max(data, d => d.value) ?? 500

    const yScale = d3.scaleLinear()
      .domain([0, yMax])
      .range([innerHeight, 0])

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))

    g.append('g')
      .call(d3.axisLeft(yScale).ticks(5).tickSize(-innerWidth).tickSizeOuter(0))

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

    g.selectAll('rect')
      .data(data)
      .join('rect')
      .attr('x', d => xScale(d.label)!)
      .attr('y', d => yScale(d.value))
      .attr('width', xScale.bandwidth())
      .attr('height', d => innerHeight - yScale(d.value))
      .attr('fill', d => d.color || '#93c5fd')
      .attr('rx', 4)
      .on('mouseover', function (event, d) {
        const timeStr = d.time ? `<br>${d3.timeFormat('%d/%m/%Y %H:%M')(new Date(d.time))}` : '';
        const titleStr = title ? `<strong>${title}</strong><br>` : '';
        tooltip
          .style('display', 'block')
          .html(`<div class="text-xs text-white font-medium">${titleStr}${d.label}: ${d.value}${timeStr}</div>`)
      })
      .on('mousemove', function (event) {
        const bounds = wrapperRef.current?.getBoundingClientRect()
        tooltip
          .style('left', `${event.clientX - (bounds?.left ?? 0) + 10}px`)
          .style('top', `${event.clientY - (bounds?.top ?? 0) - 28}px`)
          .style('opacity', 1)
      })
      .on('mouseout', () => tooltip.style('opacity', 0))
  }, [data, dimensions])

  return (
    <div ref={wrapperRef} className="bg-white rounded-xl p-2 shadow-sm w-full h-full overflow-hidden relative">
      {title && (
        <h2 className="text-base font-semibold text-gray-700 mb-2 text-center">{title}</h2>
      )}
      <svg ref={svgRef} width={dimensions.width} height={dimensions.height} />
    </div>
  )
}

export default BarChart
