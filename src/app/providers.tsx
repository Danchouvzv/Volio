'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/AuthContext'; // Assuming AuthContext exists
import { ThemeProvider } from '@/context/ThemeContext'; // Assuming ThemeContext exists
import { APIProvider } from '@vis.gl/react-google-maps';
import { MenuProvider } from '@/context/MenuContext'; // Assuming MenuContext exists

const queryClient = new QueryClient();

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!googleMapsApiKey) {
    console.error("Google Maps API Key is missing. Maps functionality will be disabled.");
    // Optionally render a fallback or handle the missing key gracefully
    // For now, we proceed without the APIProvider if the key is missing.
  }

  const mapProviderWrapper = googleMapsApiKey
    ? <APIProvider apiKey={googleMapsApiKey}>{children}</APIProvider>
    : <>{children}</>; // Render children directly if key is missing

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <MenuProvider>
              {mapProviderWrapper}
          </MenuProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
