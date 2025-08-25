"use client";

// This file is no longer used to render the leaderboard directly on a separate page,
// but we'll keep it in case you want to have a dedicated leaderboard page in the future.
// The leaderboard is now rendered as a client component within the main dashboard page.

// Explicitly define props to prevent Next.js from erroring on `params` enumeration.
export default function LeaderboardPage({}: {
  params: {};
  searchParams: { [key: string]: string | string[] | undefined };
}) {
    return null;
}
