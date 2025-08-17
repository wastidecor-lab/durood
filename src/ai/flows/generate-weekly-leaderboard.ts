'use server';

/**
 * @fileOverview Generates a weekly leaderboard of the top 3 users with the highest Zikr count.
 *
 * - generateWeeklyLeaderboard - A function that generates the weekly leaderboard.
 * - GenerateWeeklyLeaderboardInput - The input type for the generateWeeklyLeaderboard function.
 * - GenerateWeeklyLeaderboardOutput - The return type for the generateWeeklyLeaderboard function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateWeeklyLeaderboardInputSchema = z.object({
  users: z
    .array(
      z.object({
        name: z.string(),
        zikrCount: z.number(),
      })
    )
    .describe('An array of users with their names and Zikr counts.'),
});
export type GenerateWeeklyLeaderboardInput = z.infer<
  typeof GenerateWeeklyLeaderboardInputSchema
>;

const GenerateWeeklyLeaderboardOutputSchema = z.object({
  leaderboard: z
    .array(
      z.object({
        name: z.string(),
        zikrCount: z.number(),
      })
    )
    .describe('An array of the top 3 users with the highest Zikr counts.'),
});
export type GenerateWeeklyLeaderboardOutput = z.infer<
  typeof GenerateWeeklyLeaderboardOutputSchema
>;

export async function generateWeeklyLeaderboard(
  input: GenerateWeeklyLeaderboardInput
): Promise<GenerateWeeklyLeaderboardOutput> {
  return generateWeeklyLeaderboardFlow(input);
}

const generateWeeklyLeaderboardFlow = ai.defineFlow(
  {
    name: 'generateWeeklyLeaderboardFlow',
    inputSchema: GenerateWeeklyLeaderboardInputSchema,
    outputSchema: GenerateWeeklyLeaderboardOutputSchema,
  },
  async input => {
    // Sort users by Zikr count in descending order
    const sortedUsers = [...input.users].sort((a, b) => b.zikrCount - a.zikrCount);

    // Get the top 3 users
    const top3Users = sortedUsers.slice(0, 3);

    return {leaderboard: top3Users};
  }
);
