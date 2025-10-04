'use server';

import { z } from 'zod';
import { fetchMockWeatherData } from '@/lib/weather-api';
import type { FormState } from '@/lib/types';
import { locationSchema } from '@/lib/types';

const formSchema = z.object({
  location: z.string(),
  date: z.string().refine((d) => !isNaN(Date.parse(d)), { message: 'Invalid date' }),
});

export async function getWeatherDataAction(
  formData: FormData
): Promise<FormState> {
  const rawFormData = Object.fromEntries(formData.entries());

  const validatedFields = formSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      error: 'Invalid input. Please check your location and date.',
      data: null,
    };
  }

  let locationObj;
  try {
    locationObj = JSON.parse(validatedFields.data.location)
    const parsedLocation = locationSchema.safeParse(locationObj);
    if (!parsedLocation.success) throw new Error("Invalid location object");
  } catch (e) {
    return {
        error: 'Invalid location format. Please select a location from the suggestions.',
        data: null
    }
  }

  try {
    const data = await fetchMockWeatherData(locationObj, new Date(validatedFields.data.date));
    return { data, error: null };
  } catch (error) {
    return {
      error: 'Failed to fetch weather data. Please try again later.',
      data: null,
    };
  }
}
