import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          {/* Use updated gradient text for Volio */}
          <span className="font-bold text-md bg-clip-text text-transparent bg-gradient-to-r from-primary to-destructive">
            Volio
          </span>
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built for the modern volunteer. © {new Date().getFullYear()}
          </p>
        </div>
        <div className="flex space-x-4 text-sm text-muted-foreground">
          <Link href="/about" className="hover:text-primary">About</Link>
          <Link href="/privacy" className="hover:text-primary">Privacy</Link>
          <Link href="/terms" className="hover:text-primary">Terms</Link>
          <Link href="/settings" className="hover:text-primary">Settings</Link> {/* Settings link is here */}
        </div>
      </div>
    </footer>
  );
}
