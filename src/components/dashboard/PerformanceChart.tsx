"use client";

import { Area, Line, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

type ChartData = {
  date: string;
  score: number;
  role: string;
};

const customSmoothCurve = (context: any) => {
  let points: [number, number][] = [];
  let isArea = false;
  let lineCount = 0;
  
  return {
    areaStart() {
      isArea = true;
      lineCount = 0;
    },
    areaEnd() {
      isArea = false;
    },
    lineStart() {
      points = [];
    },
    lineEnd() {
      if (points.length === 0) return;
      
      if (isArea && lineCount > 0) {
        context.lineTo(points[0][0], points[0][1]);
      } else {
        context.moveTo(points[0][0], points[0][1]);
      }
      
      lineCount++;
      
      if (points.length === 1) return;
      
      if (points.length === 2) {
        const [p0, p1] = points;
        const midX = (p0[0] + p1[0]) / 2;
        context.bezierCurveTo(midX, p0[1], midX, p1[1], p1[0], p1[1]);
        return;
      }
      
      const tension = 0.25;
      
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = i === 0 ? points[0] : points[i - 1];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = i === points.length - 2 ? points[i + 1] : points[i + 2];
        
        const cp1x = p1[0] + (p2[0] - p0[0]) * tension;
        const cp1y = p1[1] + (p2[1] - p0[1]) * tension;
        
        const cp2x = p2[0] - (p3[0] - p1[0]) * tension;
        const cp2y = p2[1] - (p3[1] - p1[1]) * tension;
        
        context.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2[0], p2[1]);
      }
    },
    point(x: number, y: number) {
      points.push([+x, +y]);
    }
  };
};

const CustomTooltip = ({ active, payload, label, globalStats }: any) => {
  if (active && payload && payload.length) {
    const dateLabel = payload[0].payload.fullDateTime || label;
    return (
      <div className="rounded-xl border border-white/[0.08] bg-[#0D1424]/90 p-4 shadow-2xl backdrop-blur-xl">
        <p className="mb-3 text-sm font-medium text-slate-300">{dateLabel}</p>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-6 text-sm">
            <span className="font-semibold text-white">MAX SCORE</span>
            <span className="font-bold text-purple-400">{globalStats.max}%</span>
          </div>
          <div className="flex items-center justify-between gap-6 text-sm">
            <span className="font-medium text-slate-200">AVG SCORE</span>
            <span className="font-semibold text-purple-400/90">{globalStats.avg}%</span>
          </div>
          <div className="flex items-center justify-between gap-6 text-sm">
            <span className="text-slate-400">MIN SCORE</span>
            <span className="font-medium text-purple-400/70">{globalStats.min}%</span>
          </div>
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

  // Aggregate data by LOCAL calendar date and calculate daily averages
  const groupedData: Record<string, { dateObj: Date; scores: number[]; roles: string[] }> = {};

  [...data].reverse().forEach(item => {
    const dateObj = new Date(item.date);
    // Use the user's local timezone to determine the calendar day
    const localDateStr = dateObj.toLocaleDateString(); 
    
    if (!groupedData[localDateStr]) {
      groupedData[localDateStr] = {
        dateObj,
        scores: [],
        roles: []
      };
    }
    groupedData[localDateStr].scores.push(item.score);
    if (item.role) groupedData[localDateStr].roles.push(item.role);
  });

  const chartData = Object.values(groupedData).map((group) => {
    // Average score for the day
    const avgScore = group.scores.length > 0 
      ? Math.round(group.scores.reduce((a, b) => a + b, 0) / group.scores.length)
      : 0;
    
    const displayDate = group.dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    
    return {
      date: group.dateObj.toISOString(),
      displayDate,
      score: avgScore,
      // For aggregated daily points, the tooltip just shows the day
      fullDateTime: group.dateObj.toLocaleDateString(undefined, {
        month: 'short', day: 'numeric', year: 'numeric'
      }),
      role: Array.from(new Set(group.roles)).join(", ")
    };
  });

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

  const allScores = data.map(d => d.score);
  const positiveScores = allScores.filter(score => score > 0);
  const globalStats = {
    max: allScores.length ? Math.max(...allScores) : 0,
    min: positiveScores.length ? Math.min(...positiveScores) : 0,
    avg: allScores.length ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 0,
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
              content={(props) => <CustomTooltip {...props} globalStats={globalStats} />}
            />
            <Area 
              type={customSmoothCurve as any} 
              dataKey="score" 
              stroke="none" 
              fillOpacity={1} 
              fill="url(#colorScore)"
              isAnimationActive={true}
              animationDuration={2000}
              animationEasing="ease-in-out"
            />
            <Line 
              type={customSmoothCurve as any}
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
