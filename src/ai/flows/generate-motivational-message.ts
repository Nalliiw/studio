// src/ai/flows/generate-motivational-message.ts
'use server';

/**
 * @fileOverview Generates personalized motivational messages for patients.
 *
 * - generateMotivationalMessage - A function that generates a motivational message for a patient.
 * - GenerateMotivationalMessageInput - The input type for the generateMotivationalMessage function.
 * - GenerateMotivationalMessageOutput - The return type for the generateMotivationalMessage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMotivationalMessageInputSchema = z.object({
  patientName: z.string().describe('The name of the patient.'),
  patientGoal: z.string().describe('The patient\u2019s health and wellness goal.'),
  nutritionistName: z.string().describe('The name of the nutritionist.'),
});

export type GenerateMotivationalMessageInput = z.infer<
  typeof GenerateMotivationalMessageInputSchema
>;

const GenerateMotivationalMessageOutputSchema = z.object({
  motivationalMessage: z.string().describe('The generated motivational message.'),
});

export type GenerateMotivationalMessageOutput = z.infer<
  typeof GenerateMotivationalMessageOutputSchema
>;

export async function generateMotivationalMessage(
  input: GenerateMotivationalMessageInput
): Promise<GenerateMotivationalMessageOutput> {
  return generateMotivationalMessageFlow(input);
}

const generateMotivationalMessagePrompt = ai.definePrompt({
  name: 'generateMotivationalMessagePrompt',
  input: {schema: GenerateMotivationalMessageInputSchema},
  output: {schema: GenerateMotivationalMessageOutputSchema},
  prompt: `You are a helpful AI assistant that generates motivational messages for patients.

  Given the patient's name, their goals, and the nutritionist's name, create a personalized motivational message.

  Patient Name: {{{patientName}}}
  Patient Goal: {{{patientGoal}}}
  Nutritionist Name: {{{nutritionistName}}}

  Motivational Message:`,
});

const generateMotivationalMessageFlow = ai.defineFlow(
  {
    name: 'generateMotivationalMessageFlow',
    inputSchema: GenerateMotivationalMessageInputSchema,
    outputSchema: GenerateMotivationalMessageOutputSchema,
  },
  async input => {
    const {output} = await generateMotivationalMessagePrompt(input);
    return output!;
  }
);
