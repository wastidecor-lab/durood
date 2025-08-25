

"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/dashboard/header";
import { CollectiveCounter } from "@/components/dashboard/collective-counter";
import { ZikrCounter } from "@/components/dashboard/zikr-counter";
import { UserStats } from "@/components/dashboard/user-stats";
import { Leaderboard } from "@/components/dashboard/leaderboard";
import { Skeleton } from "@/components/ui/skeleton";
import type { User } from "@/lib/types";
import { isSameDay, isSameWeek, addMinutes } from 'date-fns';
import { CommunityStats } from "@/components/dashboard/community-stats";
import html2canvas from "html2canvas";
import { Button } from "@/components/ui/button";
import { Share2, Send, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";


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
const APP_URL = "https://durood.vercel.app";

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [currentUser, setCurrentUser] = useState<User>(defaultUser);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [leaderboardUsers, setLeaderboardUsers] = useState<User[]>([]);
  const [collectiveAllTimeCount, setCollectiveAllTimeCount] = useState(0);
  const [currentDate, setCurrentDate] = useState("");
  const [usersActiveToday, setUsersActiveToday] = useState(0);
  const [nextLeaderboardUpdate, setNextLeaderboardUpdate] = useState<Date | null>(null);
  
  const shareableRef = useRef<HTMLDivElement>(null);
  const inviteRef = useRef<HTMLDivElement>(null);


  const getInitials = (name: string) => {
    if (!name) return "";
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }


  const updateLeaderboard = useCallback((users: User[]) => {
    // Sort by today's count to determine rank
    const sortedUsers = [...users].sort((a, b) => (b.stats?.today ?? 0) - (a.stats?.today ?? 0));
    setLeaderboardUsers(sortedUsers);
    
    // Save hydrated & sorted list for the next page load within the 60min window
    const usersToSave = sortedUsers.map(({ profilePicture, ...rest }) => rest);
    localStorage.setItem('leaderboardUsers', JSON.stringify(usersToSave));
        
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

  // This effect will run a timer to check if the leaderboard needs updating
  useEffect(() => {
    const interval = setInterval(() => {
      const lastUpdatedStr = localStorage.getItem('leaderboardLastUpdated');
      const lastUpdated = lastUpdatedStr ? new Date(lastUpdatedStr) : null;
      if (lastUpdated && (new Date().getTime() - lastUpdated.getTime() > LEADERBOARD_UPDATE_INTERVAL)) {
        // The time has passed, let's update.
        const storedUsers: User[] = JSON.parse(localStorage.getItem("users") || "[]");
        updateLeaderboard(storedUsers);
      }
    }, 60 * 1000); // Check every minute

    return () => clearInterval(interval); // Cleanup on component unmount
  }, [updateLeaderboard]);


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
  }, [collectiveAllTimeCount, currentUser, loading, allUsers]);


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
      
      // Update allUsers in real-time for immediate personal feedback
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
  }

  const handleShare = async () => {
    if (!shareableRef.current) return;
    setIsSharing(true);
    
    const computedBgColor = window.getComputedStyle(document.body).backgroundColor;

    try {
        await new Promise(resolve => setTimeout(resolve, 100));

        const canvas = await html2canvas(shareableRef.current, {
            useCORS: true,
            backgroundColor: computedBgColor,
            scale: 2,
        });
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'durood-progress.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast({
            title: "Image Saved!",
            description: "Your progress image has been saved to your downloads.",
        });
    } catch (error) {
        console.error("Oops, something went wrong!", error);
        toast({
            variant: "destructive",
            title: "Sharing Failed",
            description: "Could not create the image. Please try again.",
        });
    } finally {
        setIsSharing(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteRef.current) return;
    setIsInviting(true);

    const computedBgColor = window.getComputedStyle(document.body).backgroundColor;

    try {
        const canvas = await html2canvas(inviteRef.current, {
            useCORS: true,
            backgroundColor: computedBgColor,
            scale: 2,
        });
        const dataUrl = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = "join-durood-community.png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast({
            title: "Invitation Saved!",
            description: "Your invitation image has been saved to your downloads.",
        });
    } catch (error) {
        console.error("Error creating invitation image:", error);
        toast({
            variant: "destructive",
            title: "Invite Failed",
            description: "Could not create the invitation image. Please try again.",
        });
    } finally {
        setIsInviting(false);
    }
};

  const hydratedLeaderboardUsers = useMemo(() => {
    return leaderboardUsers.map(user => {
      const profilePicture = typeof window !== 'undefined' ? localStorage.getItem(`${user.email}-profilePicture`) : null;
      return {
        ...user,
        profilePicture: profilePicture || user.profilePicture || "",
      };
    });
  }, [leaderboardUsers]);


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
    <div className="flex min-h-screen w-full flex-col bg-muted/20">
      <Header />
      <main className="flex flex-1 flex-col items-center gap-8 p-4 md:p-8">

        {/* Shareable Card */}
        <div className="w-full max-w-4xl">
             <Card ref={shareableRef} className="bg-background shadow-lg p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                  <div className="flex flex-col items-start pt-2">
                      <div className="flex items-center gap-2">
                           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className="h-6 w-6 sm:h-8 sm:w-8 fill-primary">
                             <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm-8-88a8,8,0,0,1,8-8,56,56,0,0,1,56,56,8,8,0,0,1-16,0,40,40,0,0,0-40-40,8,8,0,0,1-8-8Z"></path>
                           </svg>
                          <CardTitle className="text-lg sm:text-xl font-headline text-primary">Durood Community Counter</CardTitle>
                      </div>
                  </div>
                  <div className="flex flex-row sm:flex-row gap-2 w-full sm:w-auto" style={{ visibility: isSharing ? 'hidden' : 'visible' }}>
                      <Button onClick={handleShare} disabled={isSharing} variant="outline" size="sm" className="w-full sm:w-auto">
                          <Share2 className="mr-2 h-4 w-4" />
                          {isSharing ? "Sharing..." : "Share Progress"}
                      </Button>
                      <Button onClick={handleInvite} disabled={isInviting} variant="default" size="sm" className="w-full sm:w-auto">
                          <Send className="mr-2 h-4 w-4" />
                          {isInviting ? "Inviting..." : "Invite Friends"}
                      </Button>
                  </div>
                </div>


                <CardContent className="p-0">
                    <div className="flex items-center gap-4 border-y py-4">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src={currentUser.profilePicture || `https://placehold.co/100x100.png`} alt={currentUser.name} data-ai-hint="profile avatar"/>
                            <AvatarFallback>{getInitials(currentUser.name)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <h2 className="text-xl sm:text-2xl font-bold font-headline">{currentUser.name}</h2>
                            <p className="text-sm sm:text-base text-muted-foreground">{currentDate}</p>
                        </div>
                    </div>

                    <div className="my-6">
                      <h3 className="text-center text-lg font-semibold mb-4 text-muted-foreground">My Daily Progress</h3>
                      <UserStats userStats={currentUser.stats!} />
                    </div>
                    
                    {isSharing && (
                        <div className="text-center mt-8 pt-6 border-t-2 border-solid border-border">
                            <p className="text-lg font-semibold text-primary">Masha'Allah! May your efforts be accepted.</p>
                            <p className="font-urdu text-2xl mt-2 text-primary" dir="rtl">ماشاءالله! اللہ آپ کی کوششوں کو قبول فرمائے۔</p>
                        </div>
                    )}

                </CardContent>
            </Card>
        </div>


        {/* User-focused section */}
        <div className="w-full max-w-4xl space-y-8">
          <ZikrCounter onDailyCountUpdate={handleDailyCountUpdate} onBatchCommit={handleBatchCommit} />
        </div>

        {/* Community-focused section */}
        <div className="w-full max-w-4xl space-y-8 mt-8">
          <CollectiveCounter collectiveCount={collectiveAllTimeCount} />
          <CommunityStats totalUsers={allUsers.length} activeUsersToday={usersActiveToday} />
          <Leaderboard users={hydratedLeaderboardUsers} nextUpdateTime={nextLeaderboardUpdate} />
        </div>
      </main>
      <footer className="py-6 px-4 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Durood Community Counter. All rights reserved.</p>
      </footer>
      
      {/* Hidden Invitation Card for html2canvas */}
      <div className="fixed top-0 left-0 w-full h-full opacity-0 pointer-events-none z-[-1]">
        <div ref={inviteRef} className="p-8 bg-background" style={{ width: '600px' }}>
             <Card className="shadow-2xl border-4 border-primary">
                <CardHeader className="text-center items-center gap-4 py-8 bg-primary/10">
                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className="h-16 w-16 fill-primary">
                        <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm-8-88a8,8,0,0,1,8-8,56,56,0,0,1,56,56,8,8,0,0,1-16,0,40,40,0,0,0-40-40,8,8,0,0,1-8-8Z"></path>
                     </svg>
                    <CardTitle className="text-4xl font-headline text-primary">You're Invited!</CardTitle>
                </CardHeader>
                <CardContent className="p-8 text-center">
                    <div className="flex flex-col items-center gap-4 mb-6">
                        <Avatar className="h-20 w-20 border-2 border-primary">
                            <AvatarImage src={currentUser.profilePicture || `https://placehold.co/100x100.png`} alt={currentUser.name} data-ai-hint="profile avatar"/>
                            <AvatarFallback>{getInitials(currentUser.name)}</AvatarFallback>
                        </Avatar>
                        <p className="text-lg font-medium text-foreground">
                            Your friend, <span className="font-bold text-primary">{currentUser.name}</span>, invites you to join!
                        </p>
                    </div>
                    <p className="text-lg text-foreground mb-4">
                        Join our community on the <span className="font-bold text-primary">Durood Community Counter</span> app.
                        Let's unite to send blessings and track our collective progress.
                    </p>
                     <p className="text-lg font-urdu text-foreground mb-6" dir="rtl">
                        درود کمیونٹی کاؤنٹر ایپ پر ہماری کمیونٹی میں شامل ہوں۔ آئیے مل کر درود پاک پڑھیں اور اپنی اجتماعی ترقی کو ٹریک کریں۔
                    </p>
                    <Card className="bg-muted/50 p-4">
                         <p className="text-sm text-muted-foreground">Join us at:</p>
                         <p className="text-lg font-bold text-primary">{APP_URL}</p>
                    </Card>
                </CardContent>
                <CardHeader className="text-center items-center gap-2 py-4">
                     <CardDescription>Download the app and start counting today!</CardDescription>
                </CardHeader>
             </Card>
        </div>
      </div>
    </div>
  );
}
