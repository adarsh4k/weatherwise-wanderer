import { z } from 'zod';
import type { WeatherData, TemperatureDistribution, HistoricalTrend, WeatherProbabilities } from './types';

export const locationSchema = z.object({
  name: z.string(),
  lat: z.number(),
  lon: z.number(),
});

// Helper function to generate a random number within a range
const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

// Generate data for a bell curve (normal distribution)
const generateBellCurveData = (mean: number, stdDev: number, count: number): TemperatureDistribution => {
  const data: TemperatureDistribution = [];
  for (let i = -3 * stdDev; i <= 3 * stdDev; i += (6 * stdDev) / count) {
    const x = mean + i;
    const y = (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mean) / stdDev, 2));
    data.push({ label: x.toFixed(1), value: parseFloat(y.toFixed(4)) });
  }
  return data;
};

// Generate mock historical weather data for 20 years
const generateHistoricalData = (baseTemp: number, basePrecip: number): HistoricalTrend => {
  const data: HistoricalTrend = [];
  const currentYear = new Date().getFullYear();
  for (let i = 0; i < 20; i++) {
    const year = currentYear - 20 + i;
    // Introduce a slight warming trend
    const tempFluctuation = randomInRange(-2, 2);
    const warmingTrend = i * 0.05;
    const avgTemp = parseFloat((baseTemp + tempFluctuation + warmingTrend).toFixed(1));

    const precipFluctuation = randomInRange(-10, 10);
    const precipitation = Math.max(0, parseFloat((basePrecip + precipFluctuation).toFixed(1)));

    data.push({ year, avgTemp, precipitation });
  }
  return data;
};


// Calculate probabilities based on historical data
const calculateProbabilities = (historicalData: HistoricalTrend): WeatherProbabilities => {
    let hotDays = 0;
    let coldDays = 0;
    let wetYears = 0; // Simplified to years with high precipitation
    let windyYears = 0; // Mocked
    let uncomfortableYears = 0; // Mocked combination of hot and wet

    const hotThreshold = 30; // Celsius
    const coldThreshold = 5; // Celsius
    const wetThreshold = 100; // mm

    historicalData.forEach(yearData => {
        if (yearData.avgTemp > hotThreshold) hotDays++;
        if (yearData.avgTemp < coldThreshold) coldDays++;
        if (yearData.precipitation > wetThreshold) wetYears++;
        if (randomInRange(0, 1) > 0.7) windyYears++; // 30% chance of being "windy"
        if (yearData.avgTemp > hotThreshold && yearData.precipitation > wetThreshold * 0.8) {
            uncomfortableYears++;
        }
    });

    const totalYears = historicalData.length;
    return {
        hot: hotDays / totalYears,
        cold: coldDays / totalYears,
        wet: wetYears / totalYears,
        windy: windyYears / totalYears,
        uncomfortable: uncomfortableYears / totalYears,
    };
};


// Main mock API function
export const fetchMockWeatherData = async (
  location: z.infer<typeof locationSchema>,
  date: Date
): Promise<WeatherData> => {
  // Simulate network delay
  await new Promise(res => setTimeout(res, 1500));

  // Base values change based on a hash of the location name to provide variety
  const nameHash = location.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const baseTemp = 15 + (nameHash % 15); // Base temp between 15 and 30
  const basePrecip = 80 + (nameHash % 40); // Base precip between 80 and 120

  const historicalTrends = generateHistoricalData(baseTemp, basePrecip);
  const probabilities = calculateProbabilities(historicalTrends);
  
  const avgTempFromHistory = historicalTrends.reduce((sum, d) => sum + d.avgTemp, 0) / historicalTrends.length;
  const tempDistribution = generateBellCurveData(avgTempFromHistory, 5, 50);

  return {
    location,
    date: date.toISOString(),
    probabilities,
    tempDistribution,
    historicalTrends,
  };
};

// Mock function for location suggestions
export const fetchLocationSuggestions = async (query: string): Promise<z.infer<typeof locationSchema>[]> => {
    if (!query || query.length < 2) return [];
    await new Promise(res => setTimeout(res, 300));
    
    const locations = [
        { name: 'New York, USA', lat: 40.7128, lon: -74.0060 },
        { name: 'London, UK', lat: 51.5072, lon: -0.1276 },
        { name: 'Tokyo, Japan', lat: 35.6762, lon: 139.6503 },
        { name: 'Sydney, Australia', lat: -33.8688, lon: 151.2093 },
        { name: 'Paris, France', lat: 48.8566, lon: 2.3522 },
        { name: 'Cairo, Egypt', lat: 30.0444, lon: 31.2357 },
        { name: 'Rio de Janeiro, Brazil', lat: -22.9068, lon: -43.1729 },
    ];

    return locations.filter(loc => loc.name.toLowerCase().includes(query.toLowerCase()));
}
