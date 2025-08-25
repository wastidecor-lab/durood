
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/dashboard/header";
import { CollectiveCounter } from "@/components/dashboard/collective-counter";
import { ZikrCounter } from "@/components/dashboard/zikr-counter";
import { UserStats } from "@/components/dashboard/user-stats";
import { Leaderboard } from "@/components/dashboard/leaderboard";
import { Skeleton } from "@/components/ui/skeleton";
import type { User } from "@/lib/types";
import { isSameDay, isSameWeek, startOfWeek, addMinutes, differenceInSeconds } from 'date-fns';
import { CommunityStats } from "@/components/dashboard/community-stats";

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

const LEADERBOARD_UPDATE_INTERVAL = 60 * 60 * 1000; // 60 minutes in milliseconds

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User>(defaultUser);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [leaderboardUsers, setLeaderboardUsers] = useState<User[]>([]);
  const [collectiveAllTimeCount, setCollectiveAllTimeCount] = useState(0);
  const [currentDate, setCurrentDate] = useState("");
  const [usersActiveToday, setUsersActiveToday] = useState(0);
  const [nextLeaderboardUpdate, setNextLeaderboardUpdate] = useState<Date | null>(null);

  const updateLeaderboard = useCallback((users: User[]) => {
    // Sort by today's count to determine rank
    const sortedUsers = [...users].sort((a, b) => (b.stats?.today ?? 0) - (a.stats?.today ?? 0));
    setLeaderboardUsers(sortedUsers);
    const now = new Date();
    localStorage.setItem('leaderboardLastUpdated', now.toISOString());
    setNextLeaderboardUpdate(addMinutes(now, 60));
  }, []);

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
      
      // Get profile picture from its separate storage
      const profilePicture = localStorage.getItem(`${user.email}-profilePicture`);
      if (profilePicture) {
        user.profilePicture = profilePicture;
      }

    } else {
      user = defaultUser;
    }
    
    const storedCollectiveCount = parseInt(localStorage.getItem("collectiveAllTimeCount") || "0", 10);
    
    setAllUsers(storedUsers);
    setCurrentUser(user);
    setCollectiveAllTimeCount(storedCollectiveCount);

    // Calculate users active today
    const today = new Date();
    const activeTodayCount = storedUsers.filter(u => u.lastUpdated && isSameDay(new Date(u.lastUpdated), today)).length;
    setUsersActiveToday(activeTodayCount);
    
    // Leaderboard logic - only update every 60 minutes
    const lastLeaderboardUpdateStr = localStorage.getItem('leaderboardLastUpdated');
    const lastLeaderboardUpdate = lastLeaderboardUpdateStr ? new Date(lastLeaderboardUpdateStr) : null;
    
    if (!lastLeaderboardUpdate || (new Date().getTime() - lastLeaderboardUpdate.getTime() > LEADERBOARD_UPDATE_INTERVAL)) {
      updateLeaderboard(storedUsers);
    } else {
      // Load the previously stored leaderboard state
      const storedLeaderboardUsers = JSON.parse(localStorage.getItem("leaderboardUsers") || "[]");
      setLeaderboardUsers(storedLeaderboardUsers);
      setNextLeaderboardUpdate(addMinutes(lastLeaderboardUpdate, 60));
    }

    setLoading(false);
  }, [router, updateLeaderboard]);

  useEffect(() => {
    if (!loading) {
      // Find the latest version of the current user, or add them if they are new.
      const userExists = allUsers.some(u => u.email === currentUser.email);
      const updatedUsers = userExists 
        ? allUsers.map(u => u.email === currentUser.email ? currentUser : u)
        : [...allUsers, currentUser];
      
      setAllUsers(updatedUsers);

      // Remove profile picture before saving to avoid quota issues
      const usersToSave = updatedUsers.map(({ profilePicture, ...rest }) => rest);
      localStorage.setItem("users", JSON.stringify(usersToSave));
      localStorage.setItem("collectiveAllTimeCount", collectiveAllTimeCount.toString());

      // Recalculate active users today accurately
      const today = new Date();
      const activeTodayCount = updatedUsers.filter(u => u.lastUpdated && isSameDay(new Date(u.lastUpdated), today)).length;
      setUsersActiveToday(activeTodayCount);
    }
  }, [collectiveAllTimeCount, currentUser, loading]);


  const handleDailyCountUpdate = () => {
    setCurrentUser(prevUser => {
       const updatedUser: User = {
        ...prevUser,
        stats: {
          ...prevUser.stats!,
          today: (prevUser.stats?.today ?? 0) + 1,
        },
        lastUpdated: new Date().toISOString(),
      };
      
      // Update allUsers in real-time for immediate personal feedback, but leaderboard uses its own state
      setAllUsers(prevAllUsers => {
          const userExists = prevAllUsers.some(u => u.email === updatedUser.email);
          if (userExists) {
              return prevAllUsers.map(u => u.email === updatedUser.email ? updatedUser : u);
          }
          return [...prevAllUsers, updatedUser];
      });

      return updatedUser;
    });
  };
  
  const handleBatchCommit = (batchSize: number) => {
     setCollectiveAllTimeCount(prevCount => prevCount + batchSize);
     
     // Update week and all-time stats only when a batch is committed
     setCurrentUser(prevUser => ({
       ...prevUser,
       stats: {
         ...prevUser.stats!,
         week: (prevUser.stats?.week ?? 0) + batchSize,
         allTime: (prevUser.stats?.allTime ?? 0) + batchSize,
       },
     }));
     
     // Leaderboard update check
     const lastUpdatedStr = localStorage.getItem('leaderboardLastUpdated');
     const lastUpdated = lastUpdatedStr ? new Date(lastUpdatedStr) : null;
     if (!lastUpdated || (new Date().getTime() - lastUpdated.getTime() > LEADERBOARD_UPDATE_INTERVAL)) {
        updateLeaderboard(allUsers);
     }
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
        {/* User-focused section */}
        <div className="w-full max-w-4xl space-y-8">
          <div className="text-center text-muted-foreground">{currentDate}</div>
          <UserStats userStats={currentUser.stats!} />
          <ZikrCounter onDailyCountUpdate={handleDailyCountUpdate} onBatchCommit={handleBatchCommit} />
        </div>

        {/* Community-focused section */}
        <div className="w-full max-w-4xl space-y-8 mt-8">
          <CollectiveCounter collectiveCount={collectiveAllTimeCount} />
          <CommunityStats totalUsers={allUsers.length} activeUsersToday={usersActiveToday} />
          <Leaderboard users={leaderboardUsers} nextUpdateTime={nextLeaderboardUpdate} />
        </div>
      </main>
      <footer className="py-6 px-4 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Durood Community Counter. All rights reserved.</p>
      </footer>
    </div>
  );
}
