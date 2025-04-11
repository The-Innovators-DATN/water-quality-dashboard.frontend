'use client'

import { useEffect, useState } from 'react'
import LineChart from '@/components/charts/LineChart'
// import BoxPlot from '@/components/BoxPlot'

type Target = {
    target_type: string
    display_name: string
    color: string
    api: string
}

type Panel = {
    id: number
    title: string
    type: string
    gridPos: { x: number; y: number; w: number; h: number }
    targets: Target[]
}

type DashboardConfig = {
  panels: Panel[]
}

export default function DashboardPage() {
    const [dashboard, setDashboard] = useState<DashboardConfig | null>(null)

    useEffect(() => {
        fetch('/dashboard.json')
        .then(res => res.json())
        .then(setDashboard)
    }, [])  

    if (!dashboard) return <p>Loading...</p>

    return (
        <div className="grid grid-cols-12 gap-4 p-4">
        {dashboard.panels.map(panel => {
            return (
            <div
                key={panel.id}
                className={`col-span-${panel.gridPos.w} row-span-${panel.gridPos.h}`}
            >
                <h2 className="text-lg font-bold mb-2">{panel.title}</h2>
                {panel.type === 'line_chart' && (
                    <LineChart targets={panel.targets} />
                )}
                {panel.type === 'box_plot' && (
                    <div className="text-sm italic text-gray-400">Chưa hỗ trợ box plot</div>
                // <BoxPlot api={target.api} color={target.color} />
                )}
            </div>
            )
        })}
        </div>
    )
}
