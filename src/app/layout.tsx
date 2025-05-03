import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Providers } from './providers'; // Centralized providers
import { Sidebar } from '@/components/layout/sidebar'; // Import our new custom Sidebar
import { Footer } from '@/components/layout/footer';
import { Toaster } from '@/components/ui/toaster'; // Import Toaster
import { I18nProvider } from '@/context/I18nContext';
import { AuthProvider } from '@/context/AuthContext';
import { MenuProvider } from '@/context/MenuContext';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { PulseFab } from '@/components/pulse/PulseFab'; // Add PulseFab import

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Volio - Community Volunteering Platform', // Updated title
  description: 'Connecting volunteers with opportunities.',
  // Add Open Graph and other meta tags here if needed
  // openGraph: {
  //   title: 'Volio - Community Volunteering Platform', // Updated title
  //   description: 'Connecting volunteers with opportunities.',
  //   // url: 'https://yourdomain.com', // Replace with your actual domain
  //   // siteName: 'Volio', // Updated siteName
  //   // images: [ { url: 'https://yourdomain.com/og-image.png', width: 1200, height: 630 } ], // Replace with your OG image
  //   // locale: 'en_US',
  //   type: 'website',
  // },
  // twitter: {
  //   card: 'summary_large_image',
  //   title: 'Volio - Community Volunteering Platform', // Updated title
  //   description: 'Connecting volunteers with opportunities.',
  //   // images: ['https://yourdomain.com/twitter-image.png'], // Replace with your Twitter image
  // },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          geistSans.variable,
          geistMono.variable
        )}
      >
         {/* Skip Link - Positioned for screen readers but visually hidden until focused */}
         <a href="#main-content" className="skip-link">Skip to main content</a>

        <I18nProvider>
          <Providers>
            <AuthProvider>
              <MenuProvider>
                <div className="relative flex min-h-screen">
                  {/* Боковая навигация */}
                  <Sidebar />
                  
                  {/* Основное содержимое */}
                  <main id="main-content" className="flex-1 pl-[100px] md:pl-[100px] sm:pl-[60px]">
                    {children}
                  </main>
                </div>
                <Toaster />
                <PulseFab /> {/* Add PulseFab component */}
              </MenuProvider>
            </AuthProvider>
          </Providers>
        </I18nProvider>
      </body>
    </html>
  );
}
