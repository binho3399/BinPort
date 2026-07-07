import './globals.css';
import type { ReactNode } from 'react';
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
        <link rel="stylesheet" href="https://use.typekit.net/nof0axs.css" />
      </head>
      <body suppressHydrationWarning>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
