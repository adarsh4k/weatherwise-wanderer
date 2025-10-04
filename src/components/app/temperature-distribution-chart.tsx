'use client';

import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import type { TemperatureDistribution } from '@/lib/types';
import { useMemo } from 'react';

interface TemperatureDistributionChartProps {
  data: TemperatureDistribution;
}

const chartConfig = {
  probability: {
    label: 'Probability',
    color: 'hsl(var(--chart-3))',
  },
};

export function TemperatureDistributionChart({ data }: TemperatureDistributionChartProps) {
  const chartData = useMemo(() => data.map(d => ({ temperature: d.label, probability: d.value })), [data]);

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Temperature Distribution</CardTitle>
        <CardDescription>Probability distribution of historical temperatures (°C).</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <AreaChart data={chartData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="fillTemperature" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-probability)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-probability)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="temperature"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value, index) => index % 5 === 0 ? value : ''}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  formatter={(value, name, props) => (
                    <div className="flex flex-col">
                      <span>Temp: {props.payload.temperature}°C</span>
                      <span>Prob. Density: {value}</span>
                    </div>
                  )}
                  hideLabel
                />
              }
            />
            <Area
              dataKey="probability"
              type="natural"
              fill="url(#fillTemperature)"
              stroke="var(--color-probability)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
