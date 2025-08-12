
'use server';
/**
 * @fileOverview An AI flow to generate tips for family goals.
 *
 * - generateGoalTips - A function that generates a helpful tip for a given family goal trait.
 */

import {ai as aiPromise} from '@/ai/genkit';
import { GenerateGoalTipsInputSchema, GenerateGoalTipsOutputSchema, type GenerateGoalTipsInput, type GenerateGoalTipsOutput } from '@/ai/schemas';

let generateGoalTipsFlow: (input: GenerateGoalTipsInput) => Promise<GenerateGoalTipsOutput>;

// Initialize the flow asynchronously
const init = async () => {
    const ai = await aiPromise;
    const prompt = ai.definePrompt({
      name: 'generateGoalTipsPrompt',
      input: {schema: GenerateGoalTipsInputSchema},
      output: {schema: GenerateGoalTipsOutputSchema},
      prompt: `You are a supportive family counselor. A user has set a shared family goal to work on the trait "{{trait}}".

Generate one concise, actionable, and encouraging tip for how two family members can practice this together. The tip should be a single sentence.

Example for "Patience": "Try taking a deep breath and counting to five before responding during a disagreement."
Example for "Better Listening": "Practice active listening by summarizing what the other person said before sharing your own perspective."`,
    });

    generateGoalTipsFlow = ai.defineFlow(
      {
        name: 'generateGoalTipsFlow',
        inputSchema: GenerateGoalTipsInputSchema,
        outputSchema: GenerateGoalTipsOutputSchema,
      },
      async (input) => {
        const {output} = await prompt(input);
        return output!;
      }
    );
};
init();

export async function generateGoalTips(input: GenerateGoalTipsInput): Promise<GenerateGoalTipsOutput> {
  if (!generateGoalTipsFlow) await init(); // Ensure initialization is complete
  return generateGoalTipsFlow(input);
}
