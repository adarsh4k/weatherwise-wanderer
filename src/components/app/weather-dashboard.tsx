'use client';

import type { WeatherData } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { ActivityRecommender } from './activity-recommender';
import { ProbabilityCharts } from './probability-charts';
import { TemperatureDistributionChart } from './temperature-distribution-chart';
import { HistoricalTrendsChart } from './historical-trends-chart';
import { DataExport } from './data-export';
import { CloudDrizzle, Terminal } from 'lucide-react';

interface WeatherDashboardProps {
  weatherData: WeatherData | null;
  error: string | null;
  isLoading: boolean;
}

function DashboardSkeleton() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-6 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-1/2" />
              <Skeleton className="mt-2 h-3 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="col-span-1 lg:col-span-3">
          <CardHeader>
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-60" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-full max-w-sm" />
        </CardHeader>
        <CardContent className="space-y-4">
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

export function WeatherDashboard({ weatherData, error, isLoading }: WeatherDashboardProps) {
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!weatherData) {
    return (
      <Card className="flex flex-col items-center justify-center p-12 text-center shadow-md">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <CloudDrizzle className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="font-headline text-2xl">Welcome to WeatherWise Wanderer</CardTitle>
          <CardDescription className="max-w-md">
            Enter a location and date to get started. We'll analyze historical data to give you
            personalized weather insights and activity recommendations.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
        <div>
            <h2 className="font-headline text-3xl font-bold">Dashboard for {weatherData.location.name}</h2>
            <p className="text-muted-foreground">Showing data for {new Date(weatherData.date).toLocaleDateString()}</p>
        </div>
        <DataExport weatherData={weatherData} />
      </div>

      <ProbabilityCharts probabilities={weatherData.probabilities} />
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <HistoricalTrendsChart data={weatherData.historicalTrends} />
        <TemperatureDistributionChart data={weatherData.tempDistribution} />
      </div>
      
      <ActivityRecommender probabilities={weatherData.probabilities} />
    </div>
  );
}
