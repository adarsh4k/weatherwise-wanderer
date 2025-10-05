// src/app/api/genkit/[...slug]/route.ts
import {genkit} from '@/ai/genkit';
import {nextHandler} from '@genkit-ai/next';

// Ensure all flows are loaded
import '@/ai/flows/personalized-activity-recommendations';

export const {POST} = nextHandler(genkit);
