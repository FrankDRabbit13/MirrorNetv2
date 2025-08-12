
/**
 * @fileOverview Shared Zod schemas for AI flows.
 * This file does not contain 'use server' and can safely export non-async objects.
 */

import {z} from 'zod';

export const SummarizeTraitsInputSchema = z.object({
  circleName: z.string().describe('The name of the circle the traits belong to (e.g., "Work", "Family").'),
  traits: z.array(z.object({
    name: z.string().describe('The name of the trait.'),
    averageScore: z.number().describe('The average score for the trait, from 0 to 10.'),
  })).describe('An array of traits and their average scores.'),
});
export type SummarizeTraitsInput = z.infer<typeof SummarizeTraitsInputSchema>;

export const SummarizeTraitsOutputSchema = z.object({
    summary: z.string().describe("A 2-3 sentence, encouraging, and insightful summary of the user's strengths and areas for growth based on the provided trait scores. The tone should be positive and constructive."),
    strengths: z.array(z.string()).describe("A list of 1-2 key strengths identified from the highest scores."),
    opportunities: z.array(z.string()).describe("A list of 1-2 potential areas for growth, framed constructively, based on the lowest scores."),
});
export type SummarizeTraitsOutput = z.infer<typeof SummarizeTraitsOutputSchema>;


export const GenerateGoalTipsInputSchema = z.object({
  trait: z.string().describe('The family goal trait to generate a tip for (e.g., "Patience").'),
});
export type GenerateGoalTipsInput = z.infer<typeof GenerateGoalTipsInputSchema>;

export const GenerateGoalTipsOutputSchema = z.object({
    tip: z.string().describe("A concise, actionable, and encouraging tip for practicing the given trait within a family context."),
});
export type GenerateGoalTipsOutput = z.infer<typeof GenerateGoalTipsOutputSchema>;
