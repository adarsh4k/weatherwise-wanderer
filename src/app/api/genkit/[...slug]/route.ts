'use server';
// src/app/api/genkit/[...slug]/route.ts
import {ai} from '@/ai/genkit';
import * as genkitNext from '@genkit-ai/next';

// Ensure all flows are loaded
import '@/ai/flows/personalized-activity-recommendations';

export const {POST} = genkitNext.nextHandler(ai);
