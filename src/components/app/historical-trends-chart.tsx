'use client';

import { Bar, BarChart, ComposedChart, Line, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import type { HistoricalTrend } from '@/lib/types';

interface HistoricalTrendsChartProps {
  data: HistoricalTrend;
}

const chartConfig = {
  precipitation: {
    label: 'Precipitation (mm)',
    color: 'hsl(var(--chart-1))',
  },
  avgTemp: {
    label: 'Avg. Temp (°C)',
    color: 'hsl(var(--chart-2))',
  },
};

export function HistoricalTrendsChart({ data }: HistoricalTrendsChartProps) {
  return (
    <Card className="col-span-1 lg:col-span-3">
      <CardHeader>
        <CardTitle>20-Year Historical Trends</CardTitle>
        <CardDescription>Average temperature and precipitation over the last two decades.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <ComposedChart data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="year"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.toString().slice(-2)}
            />
            <YAxis yAxisId="left" orientation="left" stroke="var(--color-precipitation)" />
            <YAxis yAxisId="right" orientation="right" stroke="var(--color-avgTemp)" />
            <ChartTooltip
              content={<ChartTooltipContent />}
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="precipitation" yAxisId="left" fill="var(--color-precipitation)" radius={4} />
            <Line dataKey="avgTemp" yAxisId="right" type="monotone" stroke="var(--color-avgTemp)" strokeWidth={2} dot={false} />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
