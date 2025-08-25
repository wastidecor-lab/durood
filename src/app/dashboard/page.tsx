"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/dashboard/header";
import { CollectiveCounter } from "@/components/dashboard/collective-counter";
import { ZikrCounter } from "@/components/dashboard/zikr-counter";
import { UserStats } from "@/components/dashboard/user-stats";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  // Mock initial counts
  const [collectiveCount, setCollectiveCount] = useState(1_234_567);
  const [userStats, setUserStats] = useState({
    today: 125,
    week: 875,
    allTime: 15320,
  });
  const [leaderboardHtml, setLeaderboardHtml] = useState<string>('');
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);

  useEffect(() => {
    fetch('/dashboard/leaderboard')
      .then(res => res.text())
      .then(html => {
        setLeaderboardHtml(html);
        setLoadingLeaderboard(false);
      })
      .catch(err => {
        console.error('Failed to load leaderboard:', err);
        setLoadingLeaderboard(false);
      });
  }, []);

  const handleCountUpdate = (increment: number) => {
    setUserStats(prevStats => ({
      today: prevStats.today + increment,
      week: prevStats.week + increment,
      allTime: prevStats.allTime + increment,
    }));
  };
  
  const handleBatchUpdate = (batchSize: number) => {
     setCollectiveCount(prevCount => prevCount + batchSize);
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex flex-1 flex-col items-center gap-8 p-4 md:p-8">
        <div className="w-full max-w-4xl space-y-8">
          <CollectiveCounter collectiveCount={collectiveCount} />
          <UserStats userStats={userStats} />
          <ZikrCounter onCountUpdate={handleCountUpdate} onTargetReached={handleBatchUpdate} />
          {loadingLeaderboard ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <div dangerouslySetInnerHTML={{ __html: leaderboardHtml }} />
          )}
        </div>
      </main>
      <footer className="py-6 px-4 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Durood Community Counter. All rights reserved.</p>
      </footer>
    </div>
  );
}
