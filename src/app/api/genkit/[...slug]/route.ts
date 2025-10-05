'use server';
/**
 * @fileoverview This file is the entrypoint for Genkit's Next.js integration.
 *
 * It is used to handle API requests for Genkit flows.
 */
import {ai} from '@/ai/genkit';
import * as genkitNext from '@genkit-ai/next';

// Ensure all flows are loaded
import '@/ai/flows/personalized-activity-recommendations';

export const {POST} = genkitNext.nextHandler(ai);
