import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, History, TrendingUp } from "lucide-react";

interface UserStatsProps {
  userStats: {
    today: number;
    week: number;
    allTime: number;
  };
}

export function UserStats({ userStats }: UserStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Today's Count</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{userStats.today.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Count for today</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">This Week's Count</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{userStats.week.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Your progress this week</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">All-Time Count</CardTitle>
          <History className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{userStats.allTime.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Since you joined</p>
        </CardContent>
      </Card>
    </div>
  );
}