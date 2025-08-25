"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Crown, Medal, Award } from 'lucide-react';
import type { User } from '@/lib/types';

interface LeaderboardProps {
  users: User[];
}

const rankIcons = [
  <Crown key="1" className="h-6 w-6 text-yellow-500" />,
  <Medal key="2" className="h-6 w-6 text-slate-400" />,
  <Award key="3" className="h-6 w-6 text-amber-700" />,
];

export function Leaderboard({ users }: LeaderboardProps) {
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  const sortedUsers = [...users].sort((a, b) => (b.stats?.today ?? 0) - (a.stats?.today ?? 0));
  const top3Users = sortedUsers.slice(0, 3);

  return (
    <Card className="shadow-lg bg-accent/20">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-headline text-accent-foreground">Daily Top Readers</CardTitle>
        <CardDescription className="text-accent-foreground/80">The leaderboard is live and updates throughout the day. Keep up the great work!</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px] text-center">Rank</TableHead>
              <TableHead>User</TableHead>
              <TableHead className="text-right">Durood Count</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {top3Users.map((user, index) => (
              <TableRow key={user.email} className="font-medium">
                <TableCell className="text-center">{rankIcons[index]}</TableCell>
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
      </CardContent>
    </Card>
  );
}
