'use client';
import { ReactNode, useEffect, useState } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { SocketProvider } from '@/contexts/SocketContext';
import '@/styles/globals.css';

export default function RootLayout({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const theme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
  }, []);

  return (
    <html lang="en" data-theme="dark">
      <head>
        <title>ChatApp — Beautiful Real-Time Chat</title>
        <meta name="description" content="A stunning real-time chat application" />
      </head>
      <body>
        <AuthProvider>
          <SocketProvider>
            {mounted ? children : null}
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
