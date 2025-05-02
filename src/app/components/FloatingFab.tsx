'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export function FloatingFab() {
  return (
    <Button
        asChild
        size="lg" // Make it larger
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 lg:bottom-10 lg:right-10 z-40 rounded-full h-16 w-16 p-0 shadow-lg bg-gradient-to-br from-accent to-primary text-primary-foreground hover:scale-105 transition-transform active:scale-95 animate-radial-burst" // Use Accent Yellow to Primary gradient, added animation
        aria-label="Create New Event" // Accessibility label
        style={{ bottom: 'clamp(1.5rem, 4vw, 2.5rem)', right: 'clamp(1.5rem, 4vw, 2.5rem)' }} // Use clamp as per roadmap
    >
        <Link href="/create-event">
            <PlusCircle className="h-8 w-8" />
        </Link>
    </Button>
  );
}

/*
Note: This component is created as per the roadmap, but the FAB logic
is currently implemented directly within page.tsx for simplicity.
This component can be used instead by importing it into page.tsx.
*/
