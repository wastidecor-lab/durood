"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/dashboard/header";
import { CollectiveCounter } from "@/components/dashboard/collective-counter";
import { ZikrCounter } from "@/components/dashboard/zikr-counter";
import { UserStats } from "@/components/dashboard/user-stats";
import { Leaderboard } from "@/components/dashboard/leaderboard";
import { Skeleton } from "@/components/ui/skeleton";
import type { User } from "@/lib/types";

const defaultUser: User = {
  name: "Anonymous",
  email: "anonymous@example.com",
  city: "Unknown",
  whatsapp: "",
  profilePicture: "",
  stats: {
    today: 0,
    week: 0,
    allTime: 0,
  }
};

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User>(defaultUser);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [collectiveCount, setCollectiveCount] = useState(0);

  useEffect(() => {
    // Simulate loading user data and session
    const loggedInUserEmail = localStorage.getItem("loggedInUser");
    if (!loggedInUserEmail) {
      router.push("/");
      return;
    }

    const storedUsers = JSON.parse(localStorage.getItem("users") || "[]");
    const user = storedUsers.find((u: User) => u.email === loggedInUserEmail) || defaultUser;

    const storedCollectiveCount = parseInt(localStorage.getItem("collectiveCount") || "0", 10);
    
    setAllUsers(storedUsers);
    setCurrentUser(user);
    setCollectiveCount(storedCollectiveCount);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    // Save data to localStorage whenever it changes, but only if not loading.
    if (!loading) {
      // Find the currently logged-in user in the `allUsers` array and update them
      const userIndex = allUsers.findIndex(u => u.email === currentUser.email);
      if (userIndex !== -1) {
        const updatedUsers = [...allUsers];
        updatedUsers[userIndex] = currentUser;
        localStorage.setItem("users", JSON.stringify(updatedUsers));
      } else {
         // If for some reason the user isn't in the array, just save the current state
        localStorage.setItem("users", JSON.stringify(allUsers));
      }
      localStorage.setItem("collectiveCount", collectiveCount.toString());
    }
  }, [allUsers, collectiveCount, currentUser, loading]);


  const handleCountUpdate = (increment: number) => {
    // This function handles the LIVE update for the current user's personal stats.
    // It does NOT update the `allUsers` array for the leaderboard.
    setCurrentUser(prevUser => {
       const newStats = {
         today: (prevUser.stats?.today ?? 0) + increment,
         week: (prevUser.stats?.week ?? 0) + increment,
         allTime: (prevUser.stats?.allTime ?? 0) + increment,
       };
       return {...prevUser, stats: newStats};
    });
  };
  
  const handleBatchUpdate = (batchSize: number) => {
     // This function handles updates that should happen after a batch (e.g., 25 counts).
     // It updates the collective count and the user's data in the `allUsers` array for the leaderboard.
     setCollectiveCount(prevCount => prevCount + batchSize);
     setAllUsers(prevAllUsers => 
      prevAllUsers.map(u => u.email === currentUser.email ? currentUser : u)
    );
  }

  if (loading) {
    return (
       <div className="flex min-h-screen w-full flex-col">
          <Header />
          <main className="flex flex-1 flex-col items-center gap-8 p-4 md:p-8">
            <div className="w-full max-w-4xl space-y-8">
              <Skeleton className="h-24 w-full" />
              <div className="grid gap-4 md:grid-cols-3">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
              <Skeleton className="h-96 w-full" />
               <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          </main>
       </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex flex-1 flex-col items-center gap-8 p-4 md:p-8">
        <div className="w-full max-w-4xl space-y-8">
          <CollectiveCounter collectiveCount={collectiveCount} />
          <UserStats userStats={currentUser.stats!} />
          <ZikrCounter onCountUpdate={handleCountUpdate} onTargetReached={handleBatchUpdate} />
          <Leaderboard users={allUsers} />
        </div>
      </main>
      <footer className="py-6 px-4 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Durood Community Counter. All rights reserved.</p>
      </footer>
    </div>
  );
}
