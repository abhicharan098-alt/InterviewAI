"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type ChartData = {
  date: string;
  score: number;
  role: string;
};

export function PerformanceChart({ data }: { data: ChartData[] }) {
  if (!data || data.length === 0) {
    return (
      <div data-chaos-item="true" className="flex h-full min-h-[320px] w-full flex-col items-center justify-center rounded-2xl border border-white/[0.08] bg-[#0D1424]">
        <p className="text-sm text-slate-400">Complete interviews to see your performance trend.</p>
      </div>
    );
  }

  // Reverse data to show oldest to newest left to right
  const chartData = [...data].reverse();

  return (
    <div data-chaos-item="true" className="flex flex-col h-full min-h-[320px] rounded-2xl border border-white/[0.08] bg-[#0D1424] p-6">
      <h3 className="text-lg font-semibold text-white mb-6">Performance Trend</h3>
      <div className="flex-1 min-h-0 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="date" 
              stroke="#64748B" 
              fontSize={12} 
              tickLine={false}
              axisLine={false}
              minTickGap={30}
              tickFormatter={(val) => {
                const d = new Date(val);
                return `${d.getMonth() + 1}/${d.getDate()}`;
              }}
            />
            <YAxis 
              stroke="#64748B" 
              fontSize={12} 
              tickLine={false}
              axisLine={false}
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#111A2C', borderColor: 'rgba(148,163,184,0.14)', borderRadius: '8px' }}
              itemStyle={{ color: '#F8FAFC' }}
              labelStyle={{ color: '#94A3B8', marginBottom: '4px' }}
              formatter={(value: any) => [`${Number(value)}%`, 'Score']}
              labelFormatter={(label) => new Date(label as string | number).toLocaleDateString()}
            />
            <Area 
              type="monotone" 
              dataKey="score" 
              stroke="#8B5CF6" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorScore)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
