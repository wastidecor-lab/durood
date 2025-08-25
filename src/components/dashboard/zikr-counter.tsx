"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Target, Trophy } from "lucide-react";
import Confetti from "react-confetti";
import type { User } from "@/lib/types";

interface ZikrCounterProps {
  onCountUpdate: (newCount: number) => User;
  onTargetReached: (batchSize: number, updatedUser: User) => void;
}

const BATCH_SIZE = 25;

export function ZikrCounter({ onCountUpdate, onTargetReached }: ZikrCounterProps) {
  const [count, setCount] = useState(0);
  const [uncommittedCount, setUncommittedCount] = useState(0);
  const [target, setTarget] = useState(100);
  const [newTarget, setNewTarget] = useState(target.toString());
  const [isTargetDialogOpen, setIsTargetDialogOpen] = useState(false);
  const [isCongratsDialogOpen, setIsCongratsDialogOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleIncrement = () => {
    const newCount = count + 1;
    let newUncommittedCount = uncommittedCount + 1;

    setCount(newCount);
    // onCountUpdate now returns the *updated* user object
    const updatedUser = onCountUpdate(1); 

    // Check if the personal target is met.
    if (newCount >= target) {
      // If target is met, commit all uncommitted counts including the current one.
      // Pass the fully updated user object to the batch update function.
      onTargetReached(newUncommittedCount, updatedUser);
      setUncommittedCount(0); // Reset after committing.
      setIsCongratsDialogOpen(true);
      setShowConfetti(true);
    } else if (newUncommittedCount >= BATCH_SIZE) {
      // If batch size is reached before the target, commit the batch.
      onTargetReached(newUncommittedCount, updatedUser);
      setUncommittedCount(0); // Reset after committing.
    } else {
      // Otherwise, just update the local uncommitted count.
      setUncommittedCount(newUncommittedCount);
    }

    // Haptic feedback for a more tangible experience
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(50);
    }
  };

  const handleSetTarget = () => {
    const targetValue = parseInt(newTarget, 10);
    if (!isNaN(targetValue) && targetValue > 0) {
      setTarget(targetValue);
      setCount(0); // Reset count when new target is set
      setUncommittedCount(0); // Reset uncommitted count
    }
    setIsTargetDialogOpen(false);
  };
  
  const handleCongratsDialogClose = () => {
    setIsCongratsDialogOpen(false);
    setShowConfetti(false);
    setCount(0);
    setUncommittedCount(0);
  };

  const progress = target > 0 ? (count / target) * 100 : 0;
  
  // A little effect for when confetti should stop
  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 5000); // 5 seconds of confetti
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  return (
    <Card className="w-full shadow-lg border-2 border-primary">
       {showConfetti && typeof window !== "undefined" && <Confetti width={window.innerWidth} height={window.innerHeight} />}
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

          <Dialog open={isTargetDialogOpen} onOpenChange={setIsTargetDialogOpen}>
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
        <p className="text-sm text-muted-foreground">Collective count updates after every 25 recitations.</p>
      </CardContent>

      <Dialog open={isCongratsDialogOpen} onOpenChange={handleCongratsDialogClose}>
        <DialogContent>
          <DialogHeader className="items-center text-center">
            <Trophy className="h-16 w-16 text-yellow-500 mb-4" />
            <DialogTitle className="text-3xl font-headline text-primary">Masha'Allah!</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center">
            <p className="text-lg">You have reached your target of {target.toLocaleString()} Durood.</p>
            <p className="text-muted-foreground mt-2">May your efforts be accepted. Keep up the wonderful work!</p>
          </div>
          <DialogFooter>
            <Button onClick={handleCongratsDialogClose} className="w-full">Start New Count</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
