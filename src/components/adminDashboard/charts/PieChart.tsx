

'use client'

import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

interface PieDatum {
  label: string
  value: number
  color?: string
}

interface PieChartProps {
  data: PieDatum[]
  title?: string
}

const PieChart: React.FC<PieChartProps> = ({ data, title }) => {
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

    const radius = Math.min(dimensions.width, dimensions.height) / 2 - 20

    const pie = d3.pie<PieDatum>().value(d => d.value)
    const arc = d3.arc<d3.PieArcDatum<PieDatum>>()
      .innerRadius(0)
      .outerRadius(radius)

    const g = svg
      .append('g')
      .attr('transform', `translate(${dimensions.width / 2}, ${dimensions.height / 2})`)

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

    g.selectAll('path')
      .data(pie(data))
      .join('path')
      .attr('d', arc)
      .attr('fill', d => d.data.color || d3.schemeCategory10[d.index % 10])
      .on('mouseover', function (event, d) {
        tooltip
          .style('display', 'block')
          .html(`<div class="text-xs text-white font-medium">${d.data.label}: ${d.data.value}</div>`)
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

export default PieChart