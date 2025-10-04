import { z } from "zod";

export const locationSchema = z.object({
  name: z.string(),
  lat: z.number(),
  lon: z.number(),
});

export type WeatherProbabilities = {
  hot: number;
  cold: number;
  wet: number;
  windy: number;
  uncomfortable: number;
};

export type ChartDataPoint = {
  label: string;
  value: number;
};

export type TemperatureDistribution = ChartDataPoint[];

export type HistoricalTrend = {
  year: number;
  avgTemp: number;
  precipitation: number;
}[];

export type ActivityRecommendation = {
  recommendation: string;
  reasoning: string;
};

export type WeatherData = {
  location: z.infer<typeof locationSchema>;
  date: string;
  probabilities: WeatherProbabilities;
  tempDistribution: TemperatureDistribution;
  historicalTrends: HistoricalTrend;
};

export type FormState = {
  data: WeatherData | null;
  error: string | null;
};
