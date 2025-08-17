"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Target } from "lucide-react";

export function ZikrCounter() {
  const [count, setCount] = useState(0);
  const [target, setTarget] = useState(100);
  const [newTarget, setNewTarget] = useState(target.toString());
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleIncrement = () => {
    setCount((prevCount) => prevCount + 1);
    // Haptic feedback for a more tangible experience
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(50);
    }
  };

  const handleSetTarget = () => {
    const targetValue = parseInt(newTarget, 10);
    if (!isNaN(targetValue) && targetValue > 0) {
      setTarget(targetValue);
    }
    setIsDialogOpen(false);
  };

  const progress = target > 0 ? (count / target) * 100 : 0;

  return (
    <Card className="w-full shadow-lg border-2 border-primary">
      <CardHeader className="items-center text-center">
        <CardTitle className="text-2xl font-headline">My Durood Count</CardTitle>
        <CardDescription>Press the button to increase your count. Your target today is {target.toLocaleString()}.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center gap-8">
        <div 
          className="relative text-7xl md:text-9xl font-bold font-headline text-primary"
          style={{ textShadow: '2px 2px 8px hsl(var(--primary) / 0.2)' }}
        >
          {count.toLocaleString()}
        </div>
        
        <div className="w-full max-w-sm space-y-2">
            <Progress value={progress} className="h-4" />
            <div className="flex justify-between text-sm font-medium text-muted-foreground">
                <span>{count.toLocaleString()}</span>
                <span>{target.toLocaleString()}</span>
            </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            onClick={handleIncrement}
            className="w-40 h-40 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-6xl font-bold shadow-2xl transform active:scale-95 transition-transform"
            aria-label="Increment Zikr count"
          >
            +
          </Button>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="w-14 h-14 rounded-full shadow-lg">
                <Target className="h-6 w-6" />
                <span className="sr-only">Set Target</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Set Your Daily Target</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <Input 
                  type="number"
                  value={newTarget}
                  onChange={(e) => setNewTarget(e.target.value)}
                  placeholder="e.g., 1000"
                />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleSetTarget}>Set Target</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
