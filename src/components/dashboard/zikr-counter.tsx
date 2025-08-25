"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Target, Trophy } from "lucide-react";
import Confetti from "react-confetti";

interface ZikrCounterProps {
  onDailyCountUpdate: () => void;
  onBatchCommit: (batchSize: number) => void;
}

const BATCH_SIZE = 25;

export function ZikrCounter({ onDailyCountUpdate, onBatchCommit }: ZikrCounterProps) {
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
    onDailyCountUpdate(); 

    if (newUncommittedCount >= BATCH_SIZE) {
      onBatchCommit(newUncommittedCount);
      newUncommittedCount = 0; // Reset after committing.
    }

    setUncommittedCount(newUncommittedCount);

    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(50);
    }

    if (newCount >= target) {
      if (newUncommittedCount > 0) {
          onBatchCommit(newUncommittedCount);
          setUncommittedCount(0);
      }
      setIsCongratsDialogOpen(true);
      setShowConfetti(true);
       if (typeof window !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate([100, 30, 100, 30, 100]);
      }
    }
  };

  const handleSetTarget = () => {
    const targetValue = parseInt(newTarget, 10);
    if (!isNaN(targetValue) && targetValue > 0) {
      setTarget(targetValue);
      setCount(0);
      setUncommittedCount(0);
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
  
  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  return (
    <Card className="w-full shadow-lg border-2 border-primary">
       {showConfetti && typeof window !== "undefined" && <Confetti width={window.innerWidth} height={window.innerHeight} />}
      <CardHeader className="items-center text-center">
        <CardTitle className="text-2xl font-headline">My Zikr Count</CardTitle>
        <CardDescription>Press the button to increase your count. Your target today is {target.toLocaleString()}.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center gap-6">
        
        <div className="text-6xl sm:text-7xl md:text-8xl font-bold font-headline text-primary" style={{ textShadow: '2px 2px 8px hsl(var(--primary) / 0.2)' }}>
          {count.toLocaleString()}
        </div>

        <div className="w-full max-w-xs mx-auto space-y-2">
            <Progress value={progress} className="h-3" />
            <div className="flex justify-between text-xs font-medium text-muted-foreground">
                <span>{count.toLocaleString()}</span>
                <span>{target.toLocaleString()}</span>
            </div>
        </div>

        <div className="flex items-center justify-center gap-4">
          <Button
            onClick={handleIncrement}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-4xl sm:text-5xl font-bold shadow-2xl transform active:scale-95 transition-transform flex items-center justify-center"
            aria-label="Increment Zikr count"
          >
            +
          </Button>

          <Dialog open={isTargetDialogOpen} onOpenChange={setIsTargetDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="w-10 h-10 sm:w-12 sm:h-12 rounded-full shadow-lg">
                <Target className="h-4 w-4 sm:h-5 sm:w-5" />
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
        <p className="text-sm text-muted-foreground text-center px-4">Collective count updates after every {BATCH_SIZE} recitations.</p>
      </CardContent>

      <Dialog open={isCongratsDialogOpen} onOpenChange={handleCongratsDialogClose}>
        <DialogContent>
          <DialogHeader className="items-center text-center">
            <Trophy className="h-16 w-16 text-yellow-500 mb-4" />
            <DialogTitle className="text-3xl font-headline text-primary">Masha'Allah!</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center">
            <p className="text-lg">You have reached your target of {target.toLocaleString()} Zikr.</p>
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
