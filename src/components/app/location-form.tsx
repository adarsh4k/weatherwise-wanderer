
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarIcon, Loader2, LocateFixedIcon, Search } from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { fetchLocationSuggestions, fetchLocationByCoords, locationSchema } from '@/lib/weather-api';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  location: locationSchema.nullable().refine(val => val !== null, { message: "Location is required." }),
  date: z.date({
    required_error: 'A date is required.',
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface LocationFormProps {
  formAction: (payload: FormData) => void;
  isPending: boolean;
}

export function LocationForm({ formAction, isPending }: LocationFormProps) {
  const [suggestions, setSuggestions] = React.useState<z.infer<typeof locationSchema>[]>([]);
  const [query, setQuery] = React.useState('');
  const [isFetchingSuggestions, setIsFetchingSuggestions] = React.useState(false);
  const [isFetchingCurrentLocation, setIsFetchingCurrentLocation] = React.useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: null,
      date: new Date(),
    },
  });

  React.useEffect(() => {
    const debouncedFetch = setTimeout(async () => {
      if (query.length > 2) {
        setIsFetchingSuggestions(true);
        setIsPopoverOpen(true);
        const fetchedSuggestions = await fetchLocationSuggestions(query);
        setSuggestions(fetchedSuggestions);
        setIsFetchingSuggestions(false);
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(debouncedFetch);
  }, [query, form]);
  
  React.useEffect(() => {
    const selectedLocation = form.getValues('location');
    if (selectedLocation && query !== selectedLocation.name) {
      form.setValue('location', null);
    }
  }, [query, form]);

  const handleGetCurrentLocation = () => {
    setIsFetchingCurrentLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const locationDetails = await fetchLocationByCoords(latitude, longitude);
        if (locationDetails) {
            form.setValue('location', locationDetails, { shouldValidate: true });
            setQuery(locationDetails.name);
            toast({ title: "Success", description: "Current location fetched." });
        } else {
            toast({ variant: 'destructive', title: "Error", description: "Could not get details for current location." });
        }
        setIsFetchingCurrentLocation(false);
      },
      (error) => {
        toast({ variant: 'destructive', title: "Error", description: "Could not get current location. Please enable location services." });
        setIsFetchingCurrentLocation(false);
      }
    );
  };
  
  function onSubmit(values: FormValues) {
    const formData = new FormData();
    formData.append('location', JSON.stringify(values.location));
    formData.append('date', values.date.toISOString());
    formAction(formData);
  }

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle>Plan Your Adventure</CardTitle>
        <CardDescription>
          Enter a location and select a date to get weather probabilities and personalized advice.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 md:grid-cols-3">
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Location</FormLabel>
                   <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <div className="relative">
                            <Input
                                placeholder="Search for a city..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="pr-10"
                            />
                             <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground" onClick={handleGetCurrentLocation} disabled={isFetchingCurrentLocation}>
                                {isFetchingCurrentLocation ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixedIcon className="h-4 w-4" />}
                            </Button>
                        </div>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                        <Command shouldFilter={false}>
                            <CommandInput placeholder="Search location..." value={query} onValueChange={setQuery} />
                            <CommandList>
                                {isFetchingSuggestions && <div className="p-2 text-center text-sm">Loading...</div>}
                                <CommandEmpty>{!isFetchingSuggestions && query.length > 2 ? 'No results found.' : 'Type to search...'}</CommandEmpty>
                                <CommandGroup>
                                    {suggestions.map((suggestion) => (
                                    <CommandItem
                                        key={`${suggestion.lat}-${suggestion.lon}`}
                                        value={suggestion.name}
                                        onSelect={() => {
                                            form.setValue("location", suggestion, { shouldValidate: true });
                                            setQuery(suggestion.name);
                                            setIsPopoverOpen(false);
                                        }}
                                    >
                                        {suggestion.name}
                                    </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date.getFullYear() > 2100 || date < new Date('1900-01-01')}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-end">
              <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Get Forecast
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
