import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cat Game",
  description: "A cute virtual pet cat game!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="antialiased bg-soft-pink">
        <link
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Orbitron:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        {children}
      </body>
    </html>
  );
}
