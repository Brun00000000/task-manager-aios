'use client'

import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface ActivityChartProps {
  data: { date: string; completed: number }[]
}

export function ActivityChart({ data }: ActivityChartProps) {
  const formatted = data.map((d) => ({
    ...d,
    label: format(parseISO(d.date), 'EEE', { locale: ptBR }),
  }))

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <p className="mb-4 text-sm font-medium text-muted-foreground">
        Tarefas concluídas (últimos 7 dias)
      </p>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={formatted} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: 'rgba(0,0,0,0.04)' }}
            formatter={(value) => [value ?? 0, 'Concluídas']}
            labelFormatter={(label) => `${label}`}
          />
          <Bar dataKey="completed" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
