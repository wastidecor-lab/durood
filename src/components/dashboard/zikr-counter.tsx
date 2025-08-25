
"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Target, Trophy, ChevronsDown } from "lucide-react";
import Confetti from "react-confetti";
import { motion } from "framer-motion";

interface ZikrCounterProps {
  onDailyCountUpdate: () => void;
  onBatchCommit: (batchSize: number) => void;
}

const BATCH_SIZE = 25;

const SwipeIndicator = () => (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="text-muted-foreground/50"
        >
            <ChevronsDown className="h-8 w-8" />
        </motion.div>
    </div>
);


export function ZikrCounter({ onDailyCountUpdate, onBatchCommit }: ZikrCounterProps) {
  const [count, setCount] = useState(0);
  const [uncommittedCount, setUncommittedCount] = useState(0);
  const [target, setTarget] = useState(100);
  const [newTarget, setNewTarget] = useState(target.toString());
  const [isTargetDialogOpen, setIsTargetDialogOpen] = useState(false);
  const [isCongratsDialogOpen, setIsCongratsDialogOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const touchStartY = useRef(0);
  const isIncrementing = useRef(false);

  const handleIncrement = () => {
    // Debounce to prevent multiple increments from a single swipe/scroll
    if (isIncrementing.current) return;
    isIncrementing.current = true;

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
    
    // Reset debounce flag
    setTimeout(() => {
        isIncrementing.current = false;
    }, 100); // 100ms cooldown
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

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.deltaY > 0) {
      handleIncrement();
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const touchEndY = e.changedTouches[0].clientY;
    if (touchStartY.current > 0 && touchEndY > touchStartY.current + 10) { // Swipe down
      handleIncrement();
      touchStartY.current = 0; // Reset after swipe
    }
  };

  const progress = target > 0 ? (count / target) * 100 : 0;
  
  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  return (
    <Card className="w-full shadow-lg border-2 border-primary overflow-hidden">
       {showConfetti && typeof window !== "undefined" && <Confetti width={window.innerWidth} height={window.innerHeight} />}
      <CardHeader className="items-center text-center">
        <CardTitle className="text-2xl font-headline">My Durood Count</CardTitle>
        <CardDescription>Press the button or swipe down to count. Your target today is {target.toLocaleString()}.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center gap-6">
        
        <div 
            className="w-full max-w-sm h-48 rounded-lg relative flex flex-col items-center justify-center select-none cursor-grab active:cursor-grabbing"
            onWheel={handleWheel}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
        >
            <SwipeIndicator />
            <div 
              className="text-7xl md:text-8xl font-bold font-headline text-primary z-10"
              style={{ textShadow: '2px 2px 8px hsl(var(--primary) / 0.2)' }}
            >
              {count.toLocaleString()}
            </div>
            <div className="w-full max-w-xs mx-auto space-y-2 z-10 mt-2">
                <Progress value={progress} className="h-3" />
                <div className="flex justify-between text-xs font-medium text-muted-foreground">
                    <span>{count.toLocaleString()}</span>
                    <span>{target.toLocaleString()}</span>
                </div>
            </div>
        </div>


        <div className="flex items-center gap-4 -mt-4">
          <Button
            onClick={handleIncrement}
            className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-5xl font-bold shadow-2xl transform active:scale-95 transition-transform flex items-center justify-center z-10"
            aria-label="Increment Zikr count"
          >
            +
          </Button>

          <Dialog open={isTargetDialogOpen} onOpenChange={setIsTargetDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="w-12 h-12 rounded-full shadow-lg z-10">
                <Target className="h-5 w-5" />
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
        <p className="text-sm text-muted-foreground">Collective count updates after every {BATCH_SIZE} recitations.</p>
      </CardContent>

      <Dialog open={isCongratsDialogOpen} onOpenChange={handleCongratsDialogClose}>
        <DialogContent>
          <DialogHeader className="items-center text-center">
            <Trophy className="h-16 w-16 text-yellow-500 mb-4" />
            <DialogTitle className="text-3xl font-headline text-primary">Masha'Allah!</DialogTitle>
          </Header>
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
