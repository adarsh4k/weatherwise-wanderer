'use client';

import { TrendingUp, TrendingDown, Wind, Umbrella, Frown } from 'lucide-react';
import { Pie, PieChart, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import type { WeatherProbabilities } from '@/lib/types';
import { useMemo } from 'react';

interface ProbabilityChartsProps {
  probabilities: WeatherProbabilities;
}

const probabilityConfig = [
  { key: 'hot', label: 'Hot', icon: TrendingUp, color: 'hsl(var(--chart-2))' },
  { key: 'cold', label: 'Cold', icon: TrendingDown, color: 'hsl(var(--chart-3))' },
  { key: 'wet', label: 'Wet', icon: Umbrella, color: 'hsl(var(--chart-1))' },
  { key: 'windy', label: 'Windy', icon: Wind, color: 'hsl(var(--chart-5))' },
];

export function ProbabilityCharts({ probabilities }: ProbabilityChartsProps) {
  const allProbabilities = useMemo(() => [
    ...probabilityConfig,
    { key: 'uncomfortable', label: 'Uncomfortable', icon: Frown, color: 'hsl(var(--chart-4))' },
  ].map(p => ({...p, value: probabilities[p.key as keyof WeatherProbabilities]})), [probabilities]);

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {allProbabilities.filter(p => p.key !== 'uncomfortable').map((prob) => {
        const chartData = [
          { name: prob.label, value: prob.value, fill: prob.color },
          { name: 'other', value: 1 - prob.value, fill: 'hsl(var(--muted))' },
        ];
        return (
          <Card key={prob.key}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{prob.label}</CardTitle>
              <prob.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-4">
                    <div className="text-2xl font-bold">{(prob.value * 100).toFixed(0)}%</div>
                    <div className="h-16 w-16">
                        <ChartContainer config={{}} className="h-full w-full">
                            <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                                <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={18} outerRadius={24} startAngle={90} endAngle={450}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} stroke={entry.fill} />
                                    ))}
                                </Pie>
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent hideLabel hideIndicator />}
                                />
                            </PieChart>
                        </ChartContainer>
                    </div>
                </div>
              <p className="text-xs text-muted-foreground">Probability of {prob.label.toLowerCase()} conditions</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
