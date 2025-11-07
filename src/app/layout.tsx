
'use client';

import type {Metadata, Viewport} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { PwaPrompt } from '@/components/pwa-prompt';
import { FirebaseClientProvider } from '@/firebase';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

const APP_NAME = "Caixinhas";
const APP_DESCRIPTION = "Sonhar juntos é o primeiro passo para conquistar.";


const backgroundThemes = [
  { name: "Padrão", color: "60 56% 91%" },
  { name: "Oceano", color: "210 40% 96%" },
  { name: "Verde", color: "140 40% 96%" },
  { name: "Névoa", color: "260 50% 96%" },
  { name: "Pêssego", color: "30 60% 96%" },
];

const primaryThemes = [
  { name: "Padrão", color: "45 65% 52%" },
  { name: "Oceano", color: "220 80% 55%" },
  { name: "Amanhecer", color: "25 95% 55%" },
  { name: "Floresta", color: "130 50% 45%" },
  { name: "Lavanda", color: "250 60% 60%" },
];


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  useEffect(() => {
    const userId = localStorage.getItem('CAIXINHAS_USER_ID');
    if (!userId) return; 

    const applyTheme = (type: 'background' | 'primary', color: string) => {
      document.documentElement.style.setProperty(`--${type}`, color);
    };

    const loadTheme = (type: 'background' | 'primary') => {
      const themeKey = `app-theme-${type}-${userId}`;
      const themeName = localStorage.getItem(themeKey) || "Padrão";
      const themeList = type === 'background' ? backgroundThemes : primaryThemes;
      const theme = themeList.find((t) => t.name === themeName);
      if (theme) {
        applyTheme(type, theme.color);
      }
    };
    
    if(!pathname.startsWith('/landing')) {
      loadTheme('background');
      loadTheme('primary');
    } else {
        document.documentElement.style.setProperty('--background', '0 0% 100%');
        document.documentElement.style.setProperty('--foreground', '0 0% 0%');
        document.documentElement.style.setProperty('--primary', '348 92% 52%');
        document.documentElement.style.setProperty('--primary-foreground', '0 0% 100%');
        document.documentElement.style.setProperty('--muted-foreground', '0 0% 45%');
    }
  }, [pathname]);

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <title>Caixinhas</title>
        <meta name="description" content="Sonhar juntos é o primeiro passo para conquistar." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Alegreya:wght@400;500;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link rel='icon' href='/favicon.ico' sizes='any' />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className={cn(
        "antialiased",
        pathname.startsWith('/landing') ? 'font-sans' : 'font-body app-body'
      )}>
        <FirebaseClientProvider>
          {children}
          <Toaster />
          <PwaPrompt />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
