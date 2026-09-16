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
}

export function StarsBarChart({ data, height = 320 }: StarsBarChartProps) {
  if (data.length === 0) {
    return (
      <div
        style={{
          height,
          display: "grid",
          placeItems: "center",
          border: "1px dashed #c5ced6",
          borderRadius: 10,
          color: "#5f6b76",
          background: "#fff",
        }}
      >
        Track repositories to see stars compared side by side.
      </div>
    );
  }

  const chartData = data.map((item) => ({
    ...item,
    shortLabel: item.label.includes("/")
      ? item.label.split("/")[1]
      : item.label,
  }));

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 16, left: 8, bottom: 48 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="shortLabel"
            interval={0}
            angle={-25}
            textAnchor="end"
            height={60}
            tick={{ fontSize: 12 }}
          />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(value: number) => [value.toLocaleString(), "Stars"]}
            labelFormatter={(_, payload) => {
              const row = payload?.[0]?.payload as { label?: string } | undefined;
              return row?.label ?? "";
            }}
          />
          <Bar dataKey="stars" fill="#0b3d5c" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
