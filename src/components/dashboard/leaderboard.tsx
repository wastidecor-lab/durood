"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Crown, Medal, Award } from 'lucide-react';
import type { User } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEffect, useState } from 'react';

interface LeaderboardProps {
  users: User[];
}

const rankIcons = [
  <Crown key="1" className="h-6 w-6 text-yellow-500" />,
  <Medal key="2" className="h-6 w-6 text-slate-400" />,
  <Award key="3" className="h-6 w-6 text-amber-700" />,
];

export function Leaderboard({ users }: LeaderboardProps) {
  const [displayUsers, setDisplayUsers] = useState<User[]>([]);
  
  const getInitials = (name: string) => {
    if (!name) return "";
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  // Effect to hydrate profile pictures on the client
  useEffect(() => {
    const usersWithPics = users.map(user => {
      const profilePicture = typeof window !== 'undefined' ? localStorage.getItem(`${user.email}-profilePicture`) : null;
      return {
        ...user,
        profilePicture: profilePicture || user.profilePicture || "",
      };
    });
    // Sort by today's count to determine rank
    const sortedUsers = [...usersWithPics].sort((a, b) => (b.stats?.today ?? 0) - (a.stats?.today ?? 0));
    setDisplayUsers(sortedUsers);
     if (typeof window !== 'undefined') {
        try {
            // Save the hydrated & sorted list for the next page load within the 60min window
            const usersToSave = sortedUsers.map(({ profilePicture, ...rest }) => rest);
            localStorage.setItem('leaderboardUsers', JSON.stringify(usersToSave));
        } catch (e) {
            console.error("Failed to save leaderboard users to localStorage", e);
        }
    }
  }, [users]);

  return (
    <Card className="shadow-lg bg-accent/20">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-headline text-accent-foreground">Daily Top Readers</CardTitle>
        <CardDescription className="text-accent-foreground/80">The leaderboard updates throughout the day (list refreshes every 60 mins). Keep up the great work!</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px] text-center">Rank</TableHead>
                <TableHead>User</TableHead>
                <TableHead className="text-right">Today's Count</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayUsers.map((user, index) => (
                <TableRow key={user.email} className="font-medium">
                  <TableCell className="text-center">
                    {index < 3 ? rankIcons[index] : <span className="font-bold">{index + 1}</span>}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={user.profilePicture || `https://placehold.co/100x100.png`} alt={user.name} data-ai-hint="leaderboard avatar"/>
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                      </Avatar>
                      <span>{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-lg font-bold font-headline">{(user.stats?.today ?? 0).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
