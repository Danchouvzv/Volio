import React from 'react';
import Link from 'next/link';
import { useT } from '@/context/I18nContext';

export function Footer() {
  const t = useT();
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="border-t bg-background">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          {/* Replace with SVG logo if available */}
          <span className="font-bold text-md bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-destructive"> {/* Use updated gradient */}
            Volio {/* Updated Name */}
          </span>
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            {t('footer.copyright')} {currentYear}
          </p>
        </div>
        <div className="flex space-x-4 text-sm text-muted-foreground">
          <Link href="/about" className="hover:text-primary">{t('footer.about')}</Link>
          <Link href="/privacy" className="hover:text-primary">{t('footer.privacy')}</Link>
          <Link href="/terms" className="hover:text-primary">{t('footer.terms')}</Link>
          <Link href="/settings" className="hover:text-primary">{t('nav.settings')}</Link>
        </div>
      </div>
    </footer>
  );
}
