import type {Metadata, Viewport} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { PwaPrompt } from '@/components/pwa-prompt';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { RootLayoutClient } from '@/components/root-layout-client';
import { NextAuthProvider } from '@/components/providers/next-auth-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { LoadingProvider } from '@/components/providers/loading-provider';
import { NavigationLoader } from '@/components/ui/navigation-loader';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { NetworkStatusIndicator } from '@/components/ui/network-status-indicator';
import { UpdateAvailableNotification } from '@/components/ui/update-available-notification';
import MobileFloatingNav from '@/components/ui/mobile-floating-nav';
import { MobileNavWrapper } from '@/components/ui/mobile-nav-wrapper';

const APP_NAME = "Caixinhas";
const APP_DESCRIPTION = "Sonhar juntos é o primeiro passo para conquistar.";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <title>Caixinhas</title>
        <meta name="description" content="Sonhar juntos é o primeiro passo para conquistar." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        
        {/* PWA Meta Tags */}
        <meta name="application-name" content="Caixinhas" />
        <meta name="theme-color" content="#f4efe7" />
        
        {/* iOS Safari PWA Meta Tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Caixinhas" />
        
        {/* Icons */}
        <link rel='icon' href='/favicon.ico' sizes='any' />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Apple Touch Icons - iOS específico */}
        <link rel="apple-touch-icon" href="/icons/icon-180x180.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-180x180.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192x192.png" />
        
        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Alegreya:wght@400;500;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        
        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js')
                    .then((registration) => {
                      console.log('SW registered: ', registration);
                    })
                    .catch((registrationError) => {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </head>
      <body>
        <NextAuthProvider>
          <ThemeProvider>
            <LoadingProvider>
              <FirebaseClientProvider>
                <ErrorBoundary>
                  <NavigationLoader />
                  {/* <NetworkStatusIndicator /> */}
                  <UpdateAvailableNotification />
                  <RootLayoutClient>
                    <MobileNavWrapper>
                      {children}
                    </MobileNavWrapper>
                  </RootLayoutClient>
                  <MobileFloatingNav />
                  <Toaster />
                  <PwaPrompt />
                </ErrorBoundary>
              </FirebaseClientProvider>
            </LoadingProvider>
          </ThemeProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
