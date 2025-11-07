
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
    const root = document.documentElement;
    // Sempre carrega o tema do usuário ou o padrão, garantindo consistência
    const userId = localStorage.getItem('CAIXINHAS_USER_ID');
    
    const loadTheme = (type: 'background' | 'primary') => {
      const themeKey = userId ? `app-theme-${type}-${userId}` : null;
      const themeName = themeKey ? localStorage.getItem(themeKey) || "Padrão" : "Padrão";
      const themeList = type === 'background' ? backgroundThemes : primaryThemes;
      const theme = themeList.find((t) => t.name === themeName);
      if (theme) {
        root.style.setProperty(`--${type}`, theme.color);
      }
    };

    loadTheme('background');
    loadTheme('primary');

    // Restaurar outras cores para o tema padrão do app
    root.style.setProperty('--background', '60 56% 91%');
    root.style.setProperty('--foreground', '26 29% 20%');
    root.style.setProperty('--card', '60 50% 96%');
    root.style.setProperty('--card-foreground', '26 29% 20%');
    root.style.setProperty('--popover', '60 50% 96%');
    root.style.setProperty('--popover-foreground', '26 29% 20%');
    root.style.setProperty('--primary', '45 65% 52%');
    root.style.setProperty('--primary-foreground', '45 65% 10%');
    root.style.setProperty('--secondary', '60 30% 88%');
    root.style.setProperty('--secondary-foreground', '26 29% 20%');
    root.style.setProperty('--muted', '60 30% 88%');
    root.style.setProperty('--muted-foreground', '26 29% 40%');
    root.style.setProperty('--accent', '26 29% 50%');
    root.style.setProperty('--accent-foreground', '26 29% 98%');
    root.style.setProperty('--destructive', '0 84.2% 60.2%');
    root.style.setProperty('--destructive-foreground', '0 0% 98%');
    root.style.setProperty('--border', '60 30% 85%');
    root.style.setProperty('--input', '60 30% 85%');
    root.style.setProperty('--ring', '45 65% 52%');

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
        "antialiased app-body", // app-body aplica o gradiente em todas as páginas
        pathname.startsWith('/landing') ? 'font-sans' : 'font-body'
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
