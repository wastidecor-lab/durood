import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';

export function AdBanner() {
  return (
    <Card className="w-full border-dashed">
      <a href="https://google.com" target="_blank" rel="noopener noreferrer" className="block hover:opacity-90 transition-opacity">
        <CardContent className="p-2">
            <div className="relative aspect-[6/1] w-full">
                 <Image
                    src="https://i.imgur.com/aBCdEfG.png"
                    alt="Advertisement for Wasti Interior Decor"
                    layout="fill"
                    objectFit="cover"
                    className="rounded-md"
                    data-ai-hint="advertisement banner"
                 />
                 <div className="absolute top-1 right-1 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded-full flex items-center gap-1">
                    Ad <ExternalLink className="w-3 h-3" />
                </div>
            </div>
        </CardContent>
      </a>
    </Card>
  );
}
