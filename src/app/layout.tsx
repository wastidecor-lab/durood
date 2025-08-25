import type { Metadata } from 'next';
import { Inter, Space_Grotesk, Noto_Nastaliq_Urdu } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';

const fontBody = Inter({
  subsets: ['latin'],
  variable: '--font-body',
});

const fontHeadline = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-headline',
});

const fontUrdu = Noto_Nastaliq_Urdu({
  subsets: ['arabic'],
  variable: '--font-urdu',
  weight: ['400', '700'],
})


export const metadata: Metadata = {
  title: 'Durood Community Counter',
  description: 'A platform to track your Zikr and connect with a community.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-body antialiased",
          fontBody.variable,
          fontHeadline.variable,
          fontUrdu.variable
        )}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
