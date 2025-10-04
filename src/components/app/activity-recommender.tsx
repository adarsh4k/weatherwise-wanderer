'use client';

import * as React from 'react';
import { Loader2, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { ActivityRecommendation, WeatherProbabilities } from '@/lib/types';
import { getPersonalizedActivityRecommendations } from '@/ai/flows/personalized-activity-recommendations';
import { Skeleton } from '../ui/skeleton';

interface ActivityRecommenderProps {
  probabilities: WeatherProbabilities;
}

const activities = [
  'Hiking',
  'Picnic',
  'Beach Day',
  'City Tour',
  'Skiing',
  'Outdoor Photography',
  'Gardening',
];

export function ActivityRecommender({ probabilities }: ActivityRecommenderProps) {
  const [selectedActivity, setSelectedActivity] = React.useState('');
  const [recommendation, setRecommendation] = React.useState<ActivityRecommendation | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleGetRecommendation = async () => {
    if (!selectedActivity) {
        setError('Please select an activity first.');
        return;
    }

    setIsLoading(true);
    setError(null);
    setRecommendation(null);

    try {
      const result = await getPersonalizedActivityRecommendations({
        ...probabilities,
        hotProbability: probabilities.hot,
        coldProbability: probabilities.cold,
        wetProbability: probabilities.wet,
        windyProbability: probabilities.windy,
        uncomfortableProbability: probabilities.uncomfortable,
        selectedActivity,
      });
      setRecommendation(result);
    } catch (e) {
      setError('Could not get recommendation. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personalized Activity Recommender</CardTitle>
        <CardDescription>
          Select an activity to get an AI-powered recommendation based on the weather forecast.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Select onValueChange={setSelectedActivity} value={selectedActivity}>
            <SelectTrigger className="w-full sm:w-[280px]">
              <SelectValue placeholder="Select an activity..." />
            </SelectTrigger>
            <SelectContent>
              {activities.map((activity) => (
                <SelectItem key={activity} value={activity}>
                  {activity}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleGetRecommendation} disabled={isLoading || !selectedActivity} className="w-full sm:w-auto">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-4 w-4" />
            )}
            Get Advice
          </Button>
        </div>

        {error && (
            <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}
        
        {isLoading && (
            <div className="space-y-4 rounded-lg border p-4">
                <Skeleton className="h-5 w-1/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
            </div>
        )}

        {recommendation && (
            <div className="rounded-lg border bg-card p-6 shadow-inner">
                <h3 className="mb-2 font-headline text-lg font-semibold text-primary">{recommendation.recommendation}</h3>
                <p className="text-sm text-muted-foreground">{recommendation.reasoning}</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
