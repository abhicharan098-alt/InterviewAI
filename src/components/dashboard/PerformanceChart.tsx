"use client";

import { Area, Line, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { prepareChartData, RawChartDataPoint } from "@/lib/chartUtils";

type ChartData = RawChartDataPoint & {
  role: string;
};



const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const point = payload[0].payload;
    const dateLabel = point.fullDateTime || label;
    return (
      <div className="rounded-xl border border-white/[0.08] bg-[#0D1424]/90 p-4 shadow-2xl backdrop-blur-xl">
        <div className="mb-3 flex items-center justify-between gap-6 text-sm">
          <span className="font-semibold text-white">Date</span>
          <span className="font-medium text-slate-300">{dateLabel}</span>
        </div>

        <div className="flex items-center justify-between gap-6 text-base">
          <span className="font-semibold text-white">Score</span>
          <span className="font-bold text-white">{payload[0].value}%</span>
        </div>
      </div>
    );
  }
  return null;
};

export function PerformanceChart({ data }: { data: ChartData[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-full min-h-[320px] w-full flex-col items-center justify-center rounded-2xl border border-white/[0.08] bg-[#0D1424]">
        <p className="text-sm text-slate-400">Complete interviews to see your performance trend.</p>
      </div>
    );
  }

  // Use exactly one point per valid interview, sorted chronologically
  const chartData = prepareChartData(data);

  const CustomDot = (props: any) => {
    const { cx, cy, index } = props;
    const isLast = index === chartData.length - 1;

    if (!isLast) {
      return <circle cx={cx} cy={cy} r={4} fill="#8B5CF6" opacity={0.4} className="transition-all duration-300 hover:opacity-100" />;
    }

    return (
      <g>
        <circle 
          cx={cx} 
          cy={cy} 
          r={14} 
          fill="#C4B5FD" 
          opacity={0.2} 
          className="animate-ping" 
          style={{ transformOrigin: `${cx}px ${cy}px`, animationDuration: '3s' }} 
        />
        <circle cx={cx} cy={cy} r={6} fill="#C4B5FD" filter="url(#glow)" />
        <circle cx={cx} cy={cy} r={3} fill="#FFFFFF" />
      </g>
    );
  };

  return (
    <div className="flex flex-col h-full min-h-[320px] rounded-2xl border border-white/[0.05] bg-gradient-to-br from-[#0D1424] to-[#0A0F1C] p-6 shadow-2xl relative overflow-hidden group">
      {/* Glow Effects */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 blur-[100px] pointer-events-none rounded-full transition-opacity duration-1000 group-hover:opacity-75" />
      <h3 className="text-lg font-semibold text-white/90 mb-6">Performance Trend</h3>
      <div className="flex-1 min-h-0 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4}>
                  <animate attributeName="stop-opacity" values="0.4;0.7;0.4" dur="4s" repeatCount="indefinite" />
                </stop>
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
              </linearGradient>
              
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="50%" stopColor="#E9D5FF">
                  <animate attributeName="offset" values="0;1;0" dur="5s" repeatCount="indefinite" />
                </stop>
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>

              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
            <XAxis 
              dataKey="displayDate" 
              stroke="#475569" 
              fontSize={12} 
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#64748B' }}
              tickMargin={12}
              minTickGap={10}
              interval={chartData.length <= 7 ? 0 : "preserveStartEnd"}
            />
            <YAxis 
              stroke="#475569" 
              fontSize={12} 
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#64748B' }}
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              tickMargin={8}
            />
            <Tooltip 
              cursor={{ stroke: 'rgba(139, 92, 246, 0.2)', strokeWidth: 2, strokeDasharray: '5 5' }}
              content={(props) => <CustomTooltip {...props} />}
            />
            <Area 
              type="monotone" 
              dataKey="score" 
              stroke="none" 
              fillOpacity={1} 
              fill="url(#colorScore)"
              isAnimationActive={true}
              animationDuration={2000}
              animationEasing="ease-in-out"
            />
            <Line 
              type="monotone"
              dataKey="score"
              stroke="url(#lineGradient)"
              strokeWidth={3}
              dot={(props) => <CustomDot {...props} />}
              activeDot={{ r: 8, fill: "#FFFFFF", stroke: "#8B5CF6", strokeWidth: 2, filter: "url(#glow)" }}
              isAnimationActive={true}
              animationDuration={2000}
              animationEasing="ease-in-out"
              style={{ filter: "url(#glow)" }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
