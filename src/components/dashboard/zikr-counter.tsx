"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function ZikrCounter() {
  const [count, setCount] = useState(0);

  const handleIncrement = () => {
    setCount((prevCount) => prevCount + 1);
    // Haptic feedback for a more tangible experience
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(50);
    }
  };

  return (
    <Card className="w-full shadow-lg border-2 border-primary">
      <CardHeader className="items-center text-center">
        <CardTitle className="text-2xl font-headline">My Durood Count</CardTitle>
        <CardDescription>Press the button to increase your count.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center gap-8">
        <div 
          className="relative text-7xl md:text-9xl font-bold font-headline text-primary"
          style={{ textShadow: '2px 2px 8px hsl(var(--primary) / 0.2)' }}
        >
          {count.toLocaleString()}
        </div>
        <Button
          onClick={handleIncrement}
          className="w-40 h-40 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-6xl font-bold shadow-2xl transform active:scale-95 transition-transform"
          aria-label="Increment Zikr count"
        >
          +
        </Button>
      </CardContent>
    </Card>
  );
}
