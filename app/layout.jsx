import './globals.css';

export const metadata = {
  title: 'Hiroto Sato',
  description: 'Portfolio site of Hiroto Sato.',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" href="https://use.typekit.net/nof0axs.css" as="style" />
        <link rel="stylesheet" href="https://use.typekit.net/nof0axs.css" />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
