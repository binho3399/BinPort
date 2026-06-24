import './globals.css';
import type { ReactNode } from 'react';
import PersistentExperience from '../components/PersistentExperience';
import { siteMeta } from '../lib/siteContent';

export const metadata = {
  title: siteMeta.title,
  description: siteMeta.description,
  icons: { icon: siteMeta.favicon },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" href="https://use.typekit.net/nof0axs.css" as="style" />
        <link rel="stylesheet" href="https://use.typekit.net/nof0axs.css" />
      </head>
      <body suppressHydrationWarning>
        <PersistentExperience>{children}</PersistentExperience>
      </body>
    </html>
  );
}
