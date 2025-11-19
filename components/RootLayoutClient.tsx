'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useStore } from '@/lib/store';
import { useEffect } from 'react';
import Navbar from './Navbar';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
    },
  },
});

export default function RootLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const darkMode = useStore((state) => state.darkMode);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    
    if (darkMode) {
      html.classList.add('dark');
      html.style.backgroundColor = '#0f172a';
      html.style.color = '#e2e8f0';
      body.style.backgroundColor = '#0f172a';
      body.style.color = '#e2e8f0';
      console.log('✓ Dark mode applied');
    } else {
      html.classList.remove('dark');
      html.style.backgroundColor = '#ffffff';
      html.style.color = '#000000';
      body.style.backgroundColor = '#ffffff';
      body.style.color = '#000000';
      console.log('✓ Light mode applied');
    }
  }, [darkMode]);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="bg-white dark:bg-slate-950 min-h-screen transition-colors">
        <Navbar />
        <main className="min-h-[85vh] pt-4 bg-white dark:bg-slate-950 text-black dark:text-slate-100 transition-colors">
          {children}
        </main>
      </div>
    </QueryClientProvider>
  );
}
