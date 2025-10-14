'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Auto theme detection based on time
    const updateTheme = () => {
      const hour = new Date().getHours();
      const isDark = hour < 7 || hour >= 22; // Dark mode between 10 PM and 7 AM
      const isDusk = hour >= 19 && hour < 22; // Dusk mode between 7 PM and 10 PM

      const root = document.documentElement;

      // Check user preference first
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'light' || savedTheme === 'dark') {
        root.classList.toggle('dark', savedTheme === 'dark');
        return;
      }

      // Auto mode
      root.classList.toggle('dark', isDark || isDusk);
      if (isDusk) {
        root.style.setProperty('--glass-opacity', '0.8');
        root.style.setProperty('--glass-blur', '24px');
      } else {
        root.style.setProperty('--glass-opacity', '0.7');
        root.style.setProperty('--glass-blur', '20px');
      }
    };

    updateTheme();
    const interval = setInterval(updateTheme, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  if (!mounted) {return null;}

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
