"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Crown, Medal, Award } from 'lucide-react';
import type { User } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';

interface LeaderboardProps {
  users: User[];
  nextUpdateTime: Date | null;
}

const rankIcons = [
  <Crown key="1" className="h-5 w-5 md:h-6 md:w-6 text-yellow-500" />,
  <Medal key="2" className="h-5 w-5 md:h-6 md:w-6 text-slate-400" />,
  <Award key="3" className="h-5 w-5 md:h-6 md:w-6 text-amber-700" />,
];

export function Leaderboard({ users, nextUpdateTime }: LeaderboardProps) {
  
  const getInitials = (name: string) => {
    if (!name) return "";
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  const nextUpdateFormatted = nextUpdateTime ? format(nextUpdateTime, 'p') : 'the next hour';

  return (
    <Card className="shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-headline">Daily Top Readers</CardTitle>
        <CardDescription>
            The leaderboard refreshes periodically. Keep up the great work!
            <br />
            Next update around: <span className="font-bold">{nextUpdateFormatted}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px] px-2 text-center">Rank</TableHead>
                <TableHead className="px-2">User</TableHead>
                <TableHead className="px-2 hidden sm:table-cell">City</TableHead>
                <TableHead className="text-right px-2">Today's Count</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user, index) => (
                <TableRow key={user.email} className="font-medium">
                  <TableCell className="text-center px-2">
                    {index < 3 ? rankIcons[index] : <span className="font-bold text-sm">{index + 1}</span>}
                  </TableCell>
                  <TableCell className="px-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.profilePicture || `https://placehold.co/100x100.png`} alt={user.name} data-ai-hint="leaderboard avatar"/>
                        <AvatarFallback className="text-xs">{getInitials(user.name)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm truncate">{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-2 hidden sm:table-cell text-sm">{user.city}</TableCell>
                  <TableCell className="text-right px-2 text-base font-bold font-headline">{(user.stats?.today ?? 0).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
