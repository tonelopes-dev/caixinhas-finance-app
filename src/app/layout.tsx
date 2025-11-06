
'use client';

import type {Metadata, Viewport} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { PwaPrompt } from '@/components/pwa-prompt';
import { FirebaseClientProvider } from '@/firebase';
import { useEffect } from 'react';

const APP_NAME = "Caixinhas";
const APP_DESCRIPTION = "Sonhar juntos é o primeiro passo para conquistar.";

// Metadata and viewport can't be exported from a client component, but we'll keep the logic
// and apply it dynamically if needed, or assume this file might switch back and forth.
/*
export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_NAME,
    template: `%s - ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_NAME,
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: {
      default: APP_NAME,
      template: `%s - ${APP_NAME}`,
    },
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: {
      default: APP_NAME,
      template: `%s - ${APP_NAME}`,
    },
    description: APP_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
};
*/

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

  useEffect(() => {
    const userId = localStorage.getItem('CAIXINHAS_USER_ID');
    if (!userId) return; // Se não houver usuário, não faz nada

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
    
    loadTheme('background');
    loadTheme('primary');
  }, []);

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <title>Caixinhas</title>
        <meta name="description" content="Sonhar juntos é o primeiro passo para conquistar." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Alegreya:wght@400;500;700&display=swap" rel="stylesheet" />
        <link rel='icon' href='/favicon.ico' sizes='any' />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          {children}
          <Toaster />
          <PwaPrompt />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
