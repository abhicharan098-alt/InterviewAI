"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { prepareChartData, RawChartDataPoint } from "@/lib/chartUtils";

type Point = RawChartDataPoint & { interviewId?: string };

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; payload: any }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  const dateLabel = point.fullDateTime || label;

  return (
    <div className="rounded-xl border border-white/[0.1] bg-[#0D1424] px-4 py-3 shadow-xl">
      <div className="mb-2 flex items-center justify-between gap-6 text-xs">
        <span className="font-semibold text-slate-400">Date</span>
        <span className="font-medium text-slate-300">{dateLabel}</span>
      </div>

      <div className="flex items-center justify-between gap-6 text-sm">
        <span className="font-semibold text-white">Score</span>
        <span className="text-lg font-bold text-white tabular-nums">
          {payload[0].value}
          <span className="text-purple-400">%</span>
        </span>
      </div>
    </div>
  );
}

export function ProgressChart({ data }: { data: Point[] }) {
  const chartData = prepareChartData(data);
  const avg = chartData.length > 0 
    ? Math.round(chartData.reduce((s, p) => s + p.score, 0) / chartData.length)
    : 0;

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 8, right: 16, bottom: 0, left: -16 }}>
          <defs>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#7C3AED" />
              <stop offset="100%" stopColor="#A855F7" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="displayDate"
            tick={{ fill: "#64748B", fontSize: 12 }}
            axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
            tick={{ fill: "#64748B", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <ReferenceLine
            y={avg}
            stroke="rgba(139,92,246,0.35)"
            strokeDasharray="4 4"
            label={{
              value: `Avg ${avg}%`,
              fill: "#8B5CF6",
              fontSize: 11,
              position: "insideTopRight",
            }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(139,92,246,0.4)", strokeWidth: 1 }} />
          <Line
            type="monotone"
            dataKey="score"
            stroke="url(#lineGrad)"
            strokeWidth={2.5}
            dot={{ r: 4, fill: "#8B5CF6", stroke: "#0D1424", strokeWidth: 2 }}
            activeDot={{ r: 6, fill: "#A855F7", stroke: "#0D1424", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
