import { generateWeeklyLeaderboard, type GenerateWeeklyLeaderboardInput } from '@/ai/flows/generate-weekly-leaderboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Crown, Medal, Award } from 'lucide-react';

// Mock data representing users and their Zikr counts for the week
const users: GenerateWeeklyLeaderboardInput['users'] = [
  { name: 'Aisha Siddiqa', zikrCount: 12500 },
  { name: 'Fatima Al-Fihri', zikrCount: 9800 },
  { name: 'Omar Khayyam', zikrCount: 15200 },
  { name: 'Ibn Sina', zikrCount: 7600 },
  { name: 'Al-Khwarizmi', zikrCount: 11300 },
  { name: 'Rumi', zikrCount: 8900 },
  { name: 'Zaynab al-Ghazali', zikrCount: 18400 },
  { name: 'Ibn Rushd', zikrCount: 6500 },
];

const rankIcons = [
  <Crown key="1" className="h-6 w-6 text-yellow-500" />,
  <Medal key="2" className="h-6 w-6 text-slate-400" />,
  <Award key="3" className="h-6 w-6 text-amber-700" />,
];

export async function Leaderboard() {
  const { leaderboard } = await generateWeeklyLeaderboard({ users });
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  return (
    <Card className="shadow-lg bg-accent/20">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-headline text-accent-foreground">Weekly Top Readers</CardTitle>
        <CardDescription className="text-accent-foreground/80">The leaderboard resets every week. Keep up the great work!</CardDescription>
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
            {leaderboard.map((user, index) => (
              <TableRow key={user.name} className="font-medium">
                <TableCell className="text-center">{rankIcons[index]}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={`https://placehold.co/100x100.png`} alt={user.name} data-ai-hint="leaderboard avatar"/>
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <span>{user.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right text-lg font-bold font-headline">{user.zikrCount.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
