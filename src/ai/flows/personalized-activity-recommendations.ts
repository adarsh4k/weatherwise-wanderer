'use server';

/**
 * @fileOverview Provides personalized activity recommendations based on weather probabilities and user-selected activity.
 *
 * - `getPersonalizedActivityRecommendations` - A function that takes weather probabilities and a user-selected activity and returns personalized recommendations.
 * - `PersonalizedActivityRecommendationsInput` - The input type for the `getPersonalizedActivityRecommendations` function.
 * - `PersonalizedActivityRecommendationsOutput` - The return type for the `getPersonalizedActivityRecommendations` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedActivityRecommendationsInputSchema = z.object({
  hotProbability: z.number().describe('The probability of hot weather conditions (0-1).'),
  coldProbability: z.number().describe('The probability of cold weather conditions (0-1).'),
  wetProbability: z.number().describe('The probability of wet weather conditions (0-1).'),
  windyProbability: z.number().describe('The probability of windy weather conditions (0-1).'),
  uncomfortableProbability: z
    .number()
    .describe('The probability of uncomfortable weather conditions (0-1).'),
  selectedActivity: z.string().describe('The user-selected activity (e.g., hiking, picnic, etc.).'),
});
export type PersonalizedActivityRecommendationsInput = z.infer<
  typeof PersonalizedActivityRecommendationsInputSchema
>;

const PersonalizedActivityRecommendationsOutputSchema = z.object({
  recommendation: z.string().describe('The personalized activity recommendation based on the weather.'),
  reasoning: z.string().describe('The reasoning behind the recommendation.'),
});
export type PersonalizedActivityRecommendationsOutput = z.infer<
  typeof PersonalizedActivityRecommendationsOutputSchema
>;

export async function getPersonalizedActivityRecommendations(
  input: PersonalizedActivityRecommendationsInput
): Promise<PersonalizedActivityRecommendationsOutput> {
  return personalizedActivityRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedActivityRecommendationsPrompt',
  input: {schema: PersonalizedActivityRecommendationsInputSchema},
  output: {schema: PersonalizedActivityRecommendationsOutputSchema},
  prompt: `You are an AI assistant designed to provide personalized activity recommendations based on weather conditions.

  Based on the following weather probabilities and user-selected activity, provide a recommendation and reasoning for that recommendation.

  Weather Probabilities:
  Hot: {{hotProbability}}
  Cold: {{coldProbability}}
  Wet: {{wetProbability}}
  Windy: {{windyProbability}}
  Uncomfortable: {{uncomfortableProbability}}

  Selected Activity: {{selectedActivity}}

  Consider the probabilities and how they might affect the user's enjoyment and safety during the selected activity. Provide a clear and concise recommendation, along with a brief explanation of your reasoning. For example, if the probability of wet weather is high and the selected activity is a picnic, you might recommend an indoor alternative.
  Your recommendation should take into account if there are conflicting probabilities (e.g. high probability of hot weather and high probability of cold weather) and address this in the reasoning.

  Recommendation: 
  Reasoning: `,
});

const personalizedActivityRecommendationsFlow = ai.defineFlow(
  {
    name: 'personalizedActivityRecommendationsFlow',
    inputSchema: PersonalizedActivityRecommendationsInputSchema,
    outputSchema: PersonalizedActivityRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
