import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface StarsChartDatum {
  label: string;
  stars: number;
}

export interface StarsBarChartProps {
  data: StarsChartDatum[];
  height?: number;
  barColor?: string;
  gridColor?: string;
  tickColor?: string;
  locale?: string;
  emptyLabel?: string;
  seriesName?: string;
}

export function StarsBarChart({
  data,
  height = 320,
  barColor = "#0b3d5c",
  gridColor = "currentColor",
  tickColor = "currentColor",
  locale,
  emptyLabel = "Track repositories to see stars compared side by side.",
  seriesName = "Stars",
}: StarsBarChartProps) {
  if (data.length === 0) {
    return (
      <div
        style={{
          height,
          display: "grid",
          placeItems: "center",
          border: "1px dashed currentColor",
          borderRadius: 10,
          opacity: 0.7,
        }}
      >
        {emptyLabel}
      </div>
    );
  }

  const chartData = data.map((item) => ({
    ...item,
    shortLabel: item.label.includes("/")
      ? (item.label.split("/")[1] ?? item.label)
      : item.label,
  }));

  return (
    <div style={{ width: "100%", height, minHeight: height }}>
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <BarChart
          data={chartData}
          margin={{ top: 16, right: 24, left: 8, bottom: 56 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} opacity={0.25} />
          <XAxis
            dataKey="shortLabel"
            interval={0}
            angle={-25}
            textAnchor="end"
            height={64}
            tick={{ fontSize: 12, fill: tickColor }}
          />
          <YAxis
            allowDecimals={false}
            width={72}
            tick={{ fontSize: 12, fill: tickColor }}
            tickFormatter={(value: number) => value.toLocaleString(locale)}
          />
          <Tooltip
            cursor={{ fill: barColor, fillOpacity: 0.06 }}
            formatter={(value: number) => [value.toLocaleString(locale), seriesName]}
            labelFormatter={(_, payload) => {
              const row = payload?.[0]?.payload as { label?: string } | undefined;
              return row?.label ?? "";
            }}
          />
          <Bar
            dataKey="stars"
            fill={barColor}
            radius={[6, 6, 0, 0]}
            maxBarSize={72}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
