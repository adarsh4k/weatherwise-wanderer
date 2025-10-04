'use client';

import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { WeatherData } from '@/lib/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DataExportProps {
  weatherData: WeatherData;
}

const convertToCsv = (data: WeatherData) => {
    let csv = 'category,value\n';
    csv += `location,${data.location.name}\n`;
    csv += `date,${data.date}\n`;
    csv += '---PROBABILITIES---\n';
    Object.entries(data.probabilities).forEach(([key, value]) => {
        csv += `${key},${value}\n`;
    });
    csv += '---HISTORICAL TRENDS---\n';
    csv += 'year,avgTemp,precipitation\n';
    data.historicalTrends.forEach(d => {
        csv += `${d.year},${d.avgTemp},${d.precipitation}\n`;
    });
    return csv;
}

export function DataExport({ weatherData }: DataExportProps) {
  const handleExport = (format: 'json' | 'csv') => {
    const filename = `weatherwise_data_${weatherData.location.name.replace(/\s/g, '_')}`;
    let blob: Blob;

    if (format === 'json') {
      const dataStr = JSON.stringify(weatherData, null, 2);
      blob = new Blob([dataStr], { type: 'application/json' });
    } else {
      const csvStr = convertToCsv(weatherData);
      blob = new Blob([csvStr], { type: 'text/csv' });
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="shrink-0">
          <Download className="mr-2 h-4 w-4" />
          Export Data
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => handleExport('json')}>
          Export as JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('csv')}>
          Export as CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
