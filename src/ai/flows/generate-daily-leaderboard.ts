'use server';

/**
 * @fileOverview Generates a daily leaderboard of the top 3 users with the highest Zikr count.
 *
 * - generateDailyLeaderboard - A function that generates the daily leaderboard.
 * - GenerateDailyLeaderboardInput - The input type for the generateDailyLeaderboard function.
 * - GenerateDailyLeaderboardOutput - The return type for the generateDailyLeaderboard function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDailyLeaderboardInputSchema = z.object({
  users: z
    .array(
      z.object({
        name: z.string(),
        zikrCount: z.number(),
      })
    )
    .describe('An array of users with their names and Zikr counts.'),
});
export type GenerateDailyLeaderboardInput = z.infer<
  typeof GenerateDailyLeaderboardInputSchema
>;

const GenerateDailyLeaderboardOutputSchema = z.object({
  leaderboard: z
    .array(
      z.object({
        name: z.string(),
        zikrCount: z.number(),
      })
    )
    .describe('An array of the top 3 users with the highest Zikr counts.'),
});
export type GenerateDailyLeaderboardOutput = z.infer<
  typeof GenerateDailyLeaderboardOutputSchema
>;

export async function generateDailyLeaderboard(
  input: GenerateDailyLeaderboardInput
): Promise<GenerateDailyLeaderboardOutput> {
  return generateDailyLeaderboardFlow(input);
}

const generateDailyLeaderboardFlow = ai.defineFlow(
  {
    name: 'generateDailyLeaderboardFlow',
    inputSchema: GenerateDailyLeaderboardInputSchema,
    outputSchema: GenerateDailyLeaderboardOutputSchema,
  },
  async input => {
    // Sort users by Zikr count in descending order
    const sortedUsers = [...input.users].sort((a, b) => b.zikrCount - a.zikrCount);

    // Get the top 3 users
    const top3Users = sortedUsers.slice(0, 3);

    return {leaderboard: top3Users};
  }
);
