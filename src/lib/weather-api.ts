
'use server';

import { z } from 'zod';
import type { WeatherData, TemperatureDistribution, HistoricalTrend, WeatherProbabilities } from './types';
import { locationSchema } from './types';

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
export async function fetchMockWeatherData(
  location: z.infer<typeof locationSchema>,
  date: Date
): Promise<WeatherData> {
  // Simulate network delay
  await new Promise(res => setTimeout(res, 1500));

  // Base values change based on a hash of the location name to provide variety
  const nameHash = location.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const baseTemp = 15 + (nameHash % 15); // Base temp between 15 and 30
  const basePrecip = 80 + (nameHash % 40); // Base precip between 80 and 120

  const historicalTrends = generateHistoricalData(baseTemp, basePrecip);
  
  let seasonalAdjustment = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selectedDate = new Date(date);
  selectedDate.setHours(0, 0, 0, 0);

  if (selectedDate > today) {
    const dayDiff = (selectedDate.getTime() - today.getTime()) / (1000 * 3600 * 24);
    // More pronounced seasonal effect
    seasonalAdjustment = Math.sin((dayDiff / 365) * 2 * Math.PI) * 8; 
  }

  // Adjust historical data with the seasonal forecast
  const adjustedHistoricalTrends = historicalTrends.map(trend => ({
    ...trend,
    avgTemp: trend.avgTemp + seasonalAdjustment
  }));

  const probabilities = calculateProbabilities(adjustedHistoricalTrends);
  
  const avgTempFromHistory = historicalTrends.reduce((sum, d) => sum + d.avgTemp, 0) / historicalTrends.length;
  
  const tempDistributionMean = avgTempFromHistory + seasonalAdjustment;

  const tempDistribution = generateBellCurveData(tempDistributionMean, 5, 50);

  return {
    location,
    date: date.toISOString(),
    probabilities,
    tempDistribution,
    historicalTrends, // Return original historicals for the chart
  };
};

const GEOCODING_API_URL = 'https://nominatim.openstreetmap.org/search';

// Real function for location suggestions
export async function fetchLocationSuggestions(query: string): Promise<z.infer<typeof locationSchema>[]> {
    if (!query || query.length < 2) return [];
    
    try {
        const response = await fetch(`${GEOCODING_API_URL}?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`);
        if (!response.ok) {
            console.error('Failed to fetch location suggestions');
            return [];
        }
        const data = await response.json();
        
        const suggestions = data.map((item: any) => {
            // Nominatim provides name in address object, which can vary
            const name = item.display_name;
            return {
                name: name,
                lat: parseFloat(item.lat),
                lon: parseFloat(item.lon),
            };
        }).filter((item: any): item is z.infer<typeof locationSchema> => {
            try {
                locationSchema.parse(item);
                return true;
            } catch {
                return false;
            }
        });
        
        return suggestions;
    } catch (error) {
        console.error("Error fetching or parsing location suggestions:", error);
        return [];
    }
};

export async function fetchLocationByCoords(lat: number, lon: number): Promise<z.infer<typeof locationSchema> | null> {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
        if (!response.ok) {
            console.error('Failed to fetch location from coordinates');
            return null;
        }
        const data = await response.json();
        const name = data.display_name || 'Unnamed Location';
        const parsedLocation = locationSchema.safeParse({ name, lat, lon });
        if (parsedLocation.success) {
            return parsedLocation.data;
        }
        console.error("Could not parse location from coords", parsedLocation.error);
        return null;
    } catch (error) {
        console.error("Error fetching or parsing reverse geocoding:", error);
        return null;
    }
};
