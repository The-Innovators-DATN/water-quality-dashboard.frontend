import * as d3 from 'd3'
import { useEffect, useRef } from 'react'

type Target = {
  target_type: string
  display_name: string
  color: string
  api: string
}

export default function LineChart({ targets }: { targets: Target[] }) {
  const ref = useRef(null)

  useEffect(() => {
    async function drawChart() {
      const responses = await Promise.all(
        targets.map(t =>
          fetch(t.api).then(res => res.json().catch(() => null))
        )
      )

      const datasets = responses.map((res, i) => {
        const color = targets[i].color
        const label = targets[i].display_name

        let actual = res?.data?.map((d: any) => ({
          timestamp: new Date(d.timestamp),
          value: d.value,
          anomaly: d.anomaly,
          forecast: false,
          label,
          color,
        })) ?? []

        let forecast = res?.forecast?.map((d: any) => ({
          timestamp: new Date(d.timestamp),
          value: d.value,
          anomaly: d.anomaly,
          forecast: true,
          label,
          color,
        })) ?? []

        // Bridge point để nối line
        if (forecast.length > 0) {
          const bridgePoint = {
            ...forecast[0],
            forecast: false,
          }
          actual.push(bridgePoint)
        }

        actual.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
        forecast.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())

        return [...actual, ...forecast]
      })

      const flatData = datasets.flat()
      if (flatData.length === 0) return

      const svg = d3.select(ref.current)
      svg.selectAll('*').remove()

      const margin = { top: 20, right: 40, bottom: 80, left: 50 }
      const width = 600 - margin.left - margin.right
      const height = 300 - margin.top - margin.bottom

      const g = svg
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom + 40)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`)

      const x = d3.scaleTime()
        .domain(d3.extent(flatData, d => d.timestamp) as [Date, Date])
        .range([0, width])

      const y = d3.scaleLinear()
        .domain([
          d3.min(flatData, d => d.value)! - 1,
          d3.max(flatData, d => d.value)! + 1,
        ])
        .range([height, 0])

      // Forecast background
      const forecastStart = flatData.find(d => d.forecast)?.timestamp
      if (forecastStart) {
        g.append('rect')
          .attr('x', x(forecastStart))
          .attr('y', 0)
          .attr('width', width - x(forecastStart))
          .attr('height', height)
          .attr('fill', '#f0f0f0')
      }

      g.append('g').call(d3.axisLeft(y))
      g.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x))

      // Tooltip elements
      const tooltipGroup = g.append('g').style('display', 'none')

      const tooltipBox = tooltipGroup
        .append('rect')
        .attr('width', 160)
        .attr('height', 50)
        .attr('fill', '#ffffff')
        .attr('stroke', '#333')
        .attr('rx', 5)

      const tooltipText = tooltipGroup
        .append('text')
        .attr('x', 10)
        .attr('y', 18)
        .attr('font-size', '12px')
        .attr('fill', '#000')

      tooltipGroup.append('text').attr('x', 10).attr('y', 36).attr('id', 'line2').attr('font-size', '12px')

      svg.on('mousemove', function (event) {
        const [mx] = d3.pointer(event, this)
        const mxTime = x.invert(mx - margin.left)

        let closest = null
        let minDist = Infinity
        for (const d of flatData) {
          const dist = Math.abs(d.timestamp.getTime() - mxTime.getTime())
          if (dist < minDist) {
            closest = d
            minDist = dist
          }
        }

        if (closest) {
          tooltipGroup.style('display', null)
          tooltipGroup.attr('transform', `translate(${x(closest.timestamp)},${y(closest.value) - 60})`)
          tooltipText.text(
            `${closest.label} | ${d3.timeFormat('%H:%M')(closest.timestamp)}`
          )
          tooltipGroup.select('#line2').text(
            `Giá trị: ${closest.value} ${closest.forecast ? '(dự đoán)' : ''}`
          )
        }
      })

      svg.on('mouseleave', () => {
        tooltipGroup.style('display', 'none')
      })

      // Draw lines
      datasets.forEach(data => {
        const actual = data.filter(d => !d.forecast)
        const forecast = data.filter(d => d.forecast)

        const line = d3.line<any>()
          .x(d => x(d.timestamp))
          .y(d => y(d.value))

        g.append('path')
          .datum(actual)
          .attr('fill', 'none')
          .attr('stroke', actual[0]?.color || 'steelblue')
          .attr('stroke-width', 2)
          .attr('d', line)

        g.append('path')
          .datum(forecast)
          .attr('fill', 'none')
          .attr('stroke', forecast[0]?.color || 'steelblue')
          .attr('stroke-width', 2)
          .attr('stroke-dasharray', '5 5')
          .attr('d', line)

        // Anomaly
        actual.concat(forecast).forEach(d => {
          if (d.anomaly) {
            g.append('circle')
              .attr('cx', x(d.timestamp))
              .attr('cy', y(d.value))
              .attr('r', 5)
              .attr('fill', 'red')
              .append('title')
              .text(`⚠ Anomaly: ${d.label} lúc ${d3.timeFormat('%H:%M')(d.timestamp)}`)
          }
        })

        // Đường chia forecast
        if (forecast.length > 0) {
          g.append('line')
            .attr('x1', x(forecast[0].timestamp))
            .attr('x2', x(forecast[0].timestamp))
            .attr('y1', 0)
            .attr('y2', height)
            .attr('stroke', forecast[0].color || 'gray')
            .attr('stroke-dasharray', '2 2')
        }
      })

      // LEGEND phía dưới
      const legend = svg.append('g')
        .attr('transform', `translate(${margin.left}, ${height + margin.top + 40})`)

      targets.forEach((target, i) => {
        const yOffset = i * 20
        legend.append('rect')
          .attr('x', 0)
          .attr('y', yOffset)
          .attr('width', 12)
          .attr('height', 12)
          .attr('fill', target.color)

        legend.append('text')
          .attr('x', 18)
          .attr('y', yOffset + 10)
          .text(target.display_name)
          .attr('font-size', '12px')
      })

      // Giải thích dự đoán
      const offset = targets.length * 20 + 10
      legend.append('line')
        .attr('x1', 0)
        .attr('x2', 20)
        .attr('y1', offset)
        .attr('y2', offset)
        .attr('stroke', '#333')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5 5')

      legend.append('text')
        .attr('x', 25)
        .attr('y', offset + 5)
        .text('Dự đoán')
        .attr('font-size', '12px')
    }

    drawChart()
  }, [targets])

  return <svg ref={ref}></svg>
}
