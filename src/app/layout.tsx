import type { Metadata, Viewport } from 'next';
import './globals.css';
import { inter, alegreya } from '@/lib/fonts';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { RootLayoutClient } from '@/components/root-layout-client';
import { NextAuthProvider } from '@/components/providers/next-auth-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { LoadingProvider } from '@/components/providers/loading-provider';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { InitialLoadingHandler } from '@/components/ui/initial-loading-handler';
import { SessionValidator } from '@/components/auth/session-validator';
import MobileFloatingNav from '@/components/ui/mobile-floating-nav';
import { MobileNavWrapper } from '@/components/ui/mobile-nav-wrapper';

export const metadata: Metadata = {
  title: 'Caixinhas',
  description: 'Sonhar juntos é o primeiro passo para conquistar.',
  applicationName: 'Caixinhas',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Caixinhas',
  },
  icons: {
    icon: '/favicon.ico',
    apple: [
      { url: '/icons/icon-180x180.png', sizes: '180x180' },
      { url: '/icons/icon-192x192.png', sizes: '192x192' },
    ],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#f4efe7',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${inter.variable} ${alegreya.variable}`}
      style={{
        '--font-inter-google': `var(${inter.variable})`,
        '--font-alegreya-google': `var(${alegreya.variable})`,
      } as React.CSSProperties}
    >
      <head>
        <meta name="format-detection" content="telephone=no, email=no, address=no" />
        
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

        {/* Meta Pixel Code */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '420868668647496');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=420868668647496&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        {/* End Meta Pixel Code */}
      </head>
      <body>
        <NextAuthProvider>
          <ThemeProvider>
            <LoadingProvider>
              <FirebaseClientProvider>
                <ErrorBoundary>
                  <InitialLoadingHandler />
                  <SessionValidator />
                  <RootLayoutClient>
                    <MobileNavWrapper>
                      {children}
                    </MobileNavWrapper>
                  </RootLayoutClient>
                  <MobileFloatingNav />
                  <Toaster />
                </ErrorBoundary>
              </FirebaseClientProvider>
            </LoadingProvider>
          </ThemeProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
