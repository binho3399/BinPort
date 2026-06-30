import './globals.css';
import type { ReactNode } from 'react';
import Script from 'next/script';
import AppShell from '../components/AppShell';
import { siteMeta } from '../lib/siteContent';

export const metadata = {
  title: siteMeta.title,
  description: siteMeta.description,
  icons: { icon: siteMeta.favicon },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#050505',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://use.typekit.net" crossOrigin="anonymous" />
        <link rel="preload" href="https://use.typekit.net/nof0axs.css" as="style" />
        <Script id="typekit-async" strategy="lazyOnload">
          {`var l=document.createElement('link');l.rel='stylesheet';l.href='https://use.typekit.net/nof0axs.css';document.head.appendChild(l)`}
        </Script>
      </head>
      <body suppressHydrationWarning>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
