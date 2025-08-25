
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
import { isSameDay, isSameWeek, startOfWeek } from 'date-fns';
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

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User>(defaultUser);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [leaderboardUsers, setLeaderboardUsers] = useState<User[]>([]);
  const [collectiveAllTimeCount, setCollectiveAllTimeCount] = useState(0);
  const [currentDate, setCurrentDate] = useState("");
  const [usersActiveToday, setUsersActiveToday] = useState(0);

  const updateLeaderboard = useCallback((users: User[]) => {
    // Sort by today's count to determine rank
    const sortedUsers = [...users].sort((a, b) => (b.stats?.today ?? 0) - (a.stats?.today ?? 0));
    setLeaderboardUsers(sortedUsers);
    localStorage.setItem('leaderboardLastUpdated', new Date().toISOString());
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
    const activeToday = storedUsers.filter(u => u.lastUpdated && isSameDay(new Date(u.lastUpdated), today)).length;
    // Check if current user is active but not yet counted
    const currentUserInStoredList = storedUsers.find(u=> u.email === user.email);
    if(currentUserInStoredList && isSameDay(new Date(currentUserInStoredList.lastUpdated!), today)) {
        setUsersActiveToday(activeToday);
    } else if (!currentUserInStoredList) {
        // new user signing in for the first time
        setUsersActiveToday(activeToday + 1);
    }
    else {
        // existing user who has not been active today
         const userIsNowActive = isSameDay(new Date(user.lastUpdated), today);
         if(userIsNowActive){
             const currentlyActive = storedUsers.filter(u => u.lastUpdated && isSameDay(new Date(u.lastUpdated), today));
             const userAlreadyCounted = currentlyActive.some(activeUser => activeUser.email === user!.email);
             if(!userAlreadyCounted){
                 setUsersActiveToday(currentlyActive.length + 1);
             } else {
                 setUsersActiveToday(currentlyActive.length);
             }
         } else {
            setUsersActiveToday(activeToday);
         }
    }
    
    // Leaderboard logic - only update every 60 minutes
    const lastUpdated = localStorage.getItem('leaderboardLastUpdated');
    const sixtyMinutes = 60 * 60 * 1000;
    if (!lastUpdated || (new Date().getTime() - new Date(lastUpdated).getTime() > sixtyMinutes)) {
      updateLeaderboard(storedUsers);
    } else {
      // Sort on load instead of getting from storage
      const sortedUsers = [...storedUsers].sort((a, b) => (b.stats?.today ?? 0) - (a.stats?.today ?? 0));
      setLeaderboardUsers(sortedUsers);
    }

    setLoading(false);
  }, [router, updateLeaderboard]);

  useEffect(() => {
    if (!loading) {
      const updatedUsers = allUsers.map(u => u.email === currentUser.email ? currentUser : u);
      // Ensure the currentUser, if new, is included in allUsers for state consistency
      if (!updatedUsers.find(u => u.email === currentUser.email)) {
          updatedUsers.push(currentUser);
      }

      // Remove profile picture before saving to avoid quota issues
      const usersToSave = updatedUsers.map(({ profilePicture, ...rest }) => rest);
      localStorage.setItem("users", JSON.stringify(usersToSave));
      localStorage.setItem("collectiveAllTimeCount", collectiveAllTimeCount.toString());
      
      // Keep leaderboard state in sync with allUsers state
      const sortedUsers = [...updatedUsers].sort((a, b) => (b.stats?.today ?? 0) - (a.stats?.today ?? 0));
      setLeaderboardUsers(sortedUsers);

      // Recalculate active users today accurately
      const today = new Date();
      const activeTodayCount = updatedUsers.filter(u => u.lastUpdated && isSameDay(new Date(u.lastUpdated), today)).length;
      setUsersActiveToday(activeTodayCount);
    }
  }, [allUsers, collectiveAllTimeCount, currentUser, loading]);


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
    
    // Update allUsers state immediately for instant UI feedback on personal stats
    // Check if the user exists, if so update, if not add them
    const userExists = allUsers.some(u => u.email === updatedUser.email);
    let updatedAllUsers;
    if (userExists) {
        updatedAllUsers = allUsers.map(u => u.email === updatedUser.email ? updatedUser : u);
    } else {
        updatedAllUsers = [...allUsers, updatedUser];
    }
    setAllUsers(updatedAllUsers);


    return updatedUser;
  };
  
  const handleBatchUpdate = (batchSize: number, updatedUser: User) => {
     setCollectiveAllTimeCount(prevCount => prevCount + batchSize);
     
     // Ensure the user passed to setAllUsers has the absolute latest stats.
     setCurrentUser(updatedUser);

     const userExists = allUsers.some(u => u.email === updatedUser.email);
      let updatedAllUsers;
      if (userExists) {
          updatedAllUsers = allUsers.map(u => u.email === updatedUser.email ? updatedUser : u);
      } else {
          updatedAllUsers = [...allUsers, updatedUser];
      }
     setAllUsers(updatedAllUsers);
     
     // Optionally refresh leaderboard here if you want it more live, or stick to the 60min rule
     const lastUpdated = localStorage.getItem('leaderboardLastUpdated');
     const sixtyMinutes = 60 * 60 * 1000;
     if (!lastUpdated || (new Date().getTime() - new Date(lastUpdated).getTime() > sixtyMinutes)) {
        updateLeaderboard(updatedAllUsers);
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
          <ZikrCounter onCountUpdate={handleCountUpdate} onTargetReached={handleBatchUpdate} />
        </div>

        {/* Community-focused section */}
        <div className="w-full max-w-4xl space-y-8 mt-8">
          <CollectiveCounter collectiveCount={collectiveAllTimeCount} />
          <CommunityStats totalUsers={allUsers.length} activeUsersToday={usersActiveToday} />
          <Leaderboard users={leaderboardUsers} />
        </div>
      </main>
      <footer className="py-6 px-4 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Durood Community Counter. All rights reserved.</p>
      </footer>
    </div>
  );
}

    