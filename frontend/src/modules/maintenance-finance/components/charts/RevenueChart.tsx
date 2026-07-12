"use client";

import { useState } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";

interface RevenueChartProps {
  data?: Array<{
    month: string;
    Revenue: number;
    Expenses: number;
  }>;
}

export default function RevenueChart({ data = [] }: RevenueChartProps) {
  const [mounted, setMounted] = useState(false);

  if (!mounted) {
    setMounted(true);
    return <div className="h-80 w-full bg-zinc-50 dark:bg-zinc-950 rounded-xl animate-pulse" />;
  }

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 10, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} opacity={0.1} />
          <XAxis 
            dataKey="month" 
            stroke="#71717a" 
            fontSize={11} 
            tickLine={false} 
            axisLine={false}
          />
          <YAxis 
            stroke="#71717a" 
            fontSize={11} 
            tickLine={false} 
            axisLine={false}
            tickFormatter={(val) => `₹${val / 1000}k`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "rgba(9, 9, 11, 0.9)", 
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "12px",
              color: "#fff",
              fontSize: "12px"
            }}
            formatter={(value: any) => [`₹${Number(value || 0).toLocaleString()}`, ""]}
          />
          <Legend 
            verticalAlign="top" 
            height={36} 
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: "12px" }}
          />
          <Bar 
            name="Revenue" 
            dataKey="Revenue" 
            fill="oklch(0.705 0.18 140)" 
            radius={[4, 4, 0, 0]} 
            maxBarSize={40}
          />
          <Bar 
            name="Total Expenses" 
            dataKey="Expenses" 
            fill="oklch(0.627 0.22 28)" 
            radius={[4, 4, 0, 0]} 
            maxBarSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
