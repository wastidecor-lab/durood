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
import { isSameDay, isSameWeek, startOfWeek } from 'date-fns';

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
  },
  lastUpdated: new Date().toISOString(),
};

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User>(defaultUser);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [collectiveCount, setCollectiveCount] = useState(0);
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    // Set date on client to avoid hydration mismatch
    setCurrentDate(new Date().toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }));

    const loggedInUserEmail = localStorage.getItem("loggedInUser");
    if (!loggedInUserEmail) {
      router.push("/");
      return;
    }

    const storedUsers: User[] = JSON.parse(localStorage.getItem("users") || "[]");
    let user = storedUsers.find((u: User) => u.email === loggedInUserEmail);

    if (user) {
      // Check if it's a new day or new week to reset stats
      const today = new Date();
      const lastUpdated = user.lastUpdated ? new Date(user.lastUpdated) : new Date();

      if (!isSameDay(today, lastUpdated)) {
        user.stats!.today = 0;
      }
      // Use Monday as the start of the week
      if (!isSameWeek(today, lastUpdated, { weekStartsOn: 1 })) {
        user.stats!.week = 0;
      }
      user.lastUpdated = today.toISOString();
    } else {
      user = defaultUser;
    }
    
    const storedCollectiveCount = parseInt(localStorage.getItem("collectiveCount") || "0", 10);
    
    setAllUsers(storedUsers);
    setCurrentUser(user);
    setCollectiveCount(storedCollectiveCount);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    if (!loading) {
      const updatedUsers = allUsers.map(u => u.email === currentUser.email ? currentUser : u);
      localStorage.setItem("users", JSON.stringify(updatedUsers));
      localStorage.setItem("collectiveCount", collectiveCount.toString());
    }
  }, [allUsers, collectiveCount, currentUser, loading]);

  const handleCountUpdate = (increment: number): User => {
    const updatedUser: User = {
      ...currentUser,
      stats: {
        today: (currentUser.stats?.today ?? 0) + increment,
        week: (currentUser.stats?.week ?? 0) + increment,
        allTime: (currentUser.stats?.allTime ?? 0) + increment,
      },
      lastUpdated: new Date().toISOString(),
    };
    setCurrentUser(updatedUser);
    return updatedUser;
  };
  
  const handleBatchUpdate = (batchSize: number, updatedUser: User) => {
     setCollectiveCount(prevCount => prevCount + batchSize);
     
     // Ensure the user passed to setAllUsers has the absolute latest stats.
     setCurrentUser(updatedUser);

     setAllUsers(prevAllUsers => 
      prevAllUsers.map(u => u.email === updatedUser.email ? updatedUser : u)
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
          <div className="text-center text-muted-foreground">{currentDate}</div>
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
