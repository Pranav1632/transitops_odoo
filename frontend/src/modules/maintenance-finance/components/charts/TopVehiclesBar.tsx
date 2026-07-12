"use client";

import { useState } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  Cell 
} from "recharts";

interface TopVehiclesBarProps {
  data?: Array<{
    name: string;
    cost: number;
  }>;
}

const COLORS = [
  "oklch(0.627 0.22 28)",      // Red
  "oklch(0.65 0.25 50)",       // Orange
  "oklch(0.75 0.18 80)",       // Gold
  "oklch(0.556 0 0)",          // Grayish
  "oklch(0.708 0 0)"
];

export default function TopVehiclesBar({ data = [] }: TopVehiclesBarProps) {
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
          layout="vertical"
          margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
        >
          <XAxis 
            type="number"
            stroke="#71717a" 
            fontSize={11} 
            tickLine={false} 
            axisLine={false}
            tickFormatter={(val) => `₹${val / 1000}k`}
          />
          <YAxis 
            type="category"
            dataKey="name" 
            stroke="#71717a" 
            fontSize={11} 
            tickLine={false} 
            axisLine={false}
            width={120}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "rgba(9, 9, 11, 0.9)", 
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "12px",
              color: "#fff",
              fontSize: "12px"
            }}
            formatter={(value: number) => [`₹${Number(value).toLocaleString()}`, "Total Expense"]}
          />
          <Bar 
            dataKey="cost" 
            radius={[0, 4, 4, 0]} 
            maxBarSize={30}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
