import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

interface CollectiveCounterProps {
    collectiveCount: number;
}

export function CollectiveCounter({ collectiveCount }: CollectiveCounterProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-primary">
            <span className="hidden sm:inline">Collective Durood Count (ALL TIME FROM APP LOUNGE DATE 26 AUGUST 2025)</span>
            <span className="inline sm:hidden">Collective Count</span>
        </CardTitle>
        <Users className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold font-headline text-center py-4">
          {collectiveCount.toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
}

    