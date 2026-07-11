import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts"

interface QualityRadarDatum {
  label: string
  score: number
}

interface QualityRadarProps {
  data: QualityRadarDatum[]
}

export function QualityRadar({ data }: QualityRadarProps) {
  return (
    <div className="bg-card mb-4 h-72 w-full overflow-hidden rounded-xl border sm:h-80">
      <ul className="sr-only">
        {data.map(({ label, score }) => (
          <li key={label}>
            {label}: {score}/100
          </li>
        ))}
      </ul>

      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="62%" margin={{ top: 16, right: 24, bottom: 16, left: 24 }}>
          <PolarGrid stroke="var(--border)" />
          <PolarAngleAxis
            dataKey="label"
            tick={{ fill: "var(--foreground)", fontSize: 12 }}
            tickLine={false}
          />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            dataKey="score"
            stroke="var(--chart-1)"
            fill="var(--chart-1)"
            fillOpacity={0.24}
            strokeWidth={2}
            isAnimationActive={false}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
