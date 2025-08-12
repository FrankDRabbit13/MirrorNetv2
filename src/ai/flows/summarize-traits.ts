
'use server';
/**
 * @fileOverview An AI flow to summarize a user's traits and scores.
 *
 * - summarizeTraits - A function that analyzes trait scores and provides a summary.
 */

import {ai as aiPromise} from '@/ai/genkit';
import { SummarizeTraitsInputSchema, SummarizeTraitsOutputSchema, type SummarizeTraitsInput, type SummarizeTraitsOutput } from '@/ai/schemas';

let summarizeTraitsFlow: (input: SummarizeTraitsInput) => Promise<SummarizeTraitsOutput>;

// Initialize the flow asynchronously
const init = async () => {
    const ai = await aiPromise;
    const prompt = ai.definePrompt({
      name: 'summarizeTraitsPrompt',
      input: {schema: SummarizeTraitsInputSchema},
      output: {schema: SummarizeTraitsOutputSchema},
      prompt: `You are a professional and insightful life coach providing a consultation. Your task is to analyze a set of scores and provide a brief, constructive, and empowering analysis. The scores range from 1 to 10, where higher is better.

The scores are from the "{{circleName}}" category. This category is based on anonymous feedback from people in your {{circleName}} circle.

Here are the recent scores:
{{#each traits}}
- {{name}}: {{averageScore}}
{{/each}}

Based on this data, please provide your professional assessment. Structure your response as a cohesive narrative, not a list.
1. Begin with an overall summary of the results, acknowledging that this is based on peer feedback.
2. Discuss the most prominent strengths that the scores indicate. Frame these as well-developed aspects of character.
3. Identify the areas with the lowest scores as potential opportunities for growth. Discuss these with a supportive and forward-looking perspective, focusing on potential rather than deficits.

Your tone should be professional, empathetic, and clear, like a coach guiding a client toward greater self-awareness. Avoid overly clinical or casual language.`,
    });

    summarizeTraitsFlow = ai.defineFlow(
      {
        name: 'summarizeTraitsFlow',
        inputSchema: SummarizeTraitsInputSchema,
        outputSchema: SummarizeTraitsOutputSchema,
      },
      async (input) => {
        // Filter out traits with a score of 0, as they represent no data.
        const ratedTraits = input.traits.filter(t => t.averageScore > 0);

        // Return a default message if there are no rated traits to analyze.
        if (ratedTraits.length === 0) {
            if (input.circleName === "Eco Rating") {
                return {
                    summary: `You haven't completed your Eco Rating assessment yet. Once you do, an analysis of your environmental habits will appear here.`,
                    strengths: [],
                    opportunities: [],
                };
            }
            return {
                summary: `There are no ratings yet for the ${input.circleName} circle. Once you receive feedback from members, an analysis will appear here.`,
                strengths: [],
                opportunities: [],
            };
        }
        
        if (input.circleName === "Eco Rating") {
          const ecoPrompt = ai.definePrompt({
              name: 'summarizeEcoTraitsPrompt',
              input: {schema: SummarizeTraitsInputSchema},
              output: {schema: SummarizeTraitsOutputSchema},
              prompt: `You are an environmental coach providing a consultation. Your task is to analyze a set of self-assessed scores on ecological habits and provide a brief, constructive, and empowering analysis. The scores range from 1 to 10, where higher indicates more sustainable habits.

The scores are from the user's "Eco Rating" self-assessment.

Here are the user's scores:
{{#each traits}}
- {{name}}: {{averageScore}}
{{/each}}

Based on this data, please provide your professional assessment. Structure your response as a cohesive narrative, not a list.
1. Begin with an overall summary of the results, acknowledging that this is a self-assessment of the user's environmental habits.
2. Discuss the most prominent strengths, highlighting the areas where the user's habits are most sustainable.
3. Identify the areas with the lowest scores as potential opportunities for growth. Frame these in a supportive and forward-looking manner, suggesting areas for improvement.

Your tone should be encouraging, informative, and clear, like a coach guiding a client toward a greener lifestyle. Avoid judgmental language.`,
            });
            const {output} = await ecoPrompt({
              ...input,
              traits: ratedTraits,
            });
            return output!;
        }
        
        // Call the original prompt for non-eco circles
        const {output} = await prompt({
          ...input,
          traits: ratedTraits,
        });

        return output!;
      }
    );
};
init();

export async function summarizeTraits(input: SummarizeTraitsInput): Promise<SummarizeTraitsOutput> {
    if (!summarizeTraitsFlow) await init(); // Ensure initialization is complete
    return summarizeTraitsFlow(input);
}
