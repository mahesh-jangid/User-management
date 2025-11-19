import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import RootLayoutClient from '@/components/RootLayoutClient';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata = {
  title: 'User Management Dashboard',
  description: 'Manage users efficiently',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-slate-950`}>
        <RootLayoutClient>{children}</RootLayoutClient>
      </body>
    </html>
  );
}
