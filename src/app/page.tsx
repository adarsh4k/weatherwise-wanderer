'use client';

import { useState, useTransition } from 'react';
import type { WeatherData, FormState } from '@/lib/types';
import { getWeatherDataAction } from '@/app/actions';
import { Header } from '@/components/app/header';
import { LocationForm } from '@/components/app/location-form';
import { WeatherDashboard } from '@/components/app/weather-dashboard';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleAction = (formData: FormData) => {
    startTransition(async () => {
      const result: FormState = await getWeatherDataAction(formData);
      if (result.error) {
        setError(result.error);
        setWeatherData(null);
        toast({
          variant: 'destructive',
          title: 'Error fetching data',
          description: result.error,
        });
      } else if (result.data) {
        setWeatherData(result.data);
        setError(null);
      }
    });
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex flex-1 flex-col items-center gap-8 p-4 md:p-8">
        <div className="w-full max-w-6xl">
          <LocationForm formAction={handleAction} isPending={isPending} />
        </div>
        <div className="w-full max-w-6xl">
          <WeatherDashboard
            weatherData={weatherData}
            error={error}
            isLoading={isPending}
          />
        </div>
      </main>
    </div>
  );
}
