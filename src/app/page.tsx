'use client';

import React from 'react';
import { Hero } from './components/Hero';
import { FeaturesGrid } from './components/FeaturesGrid';
import { HowItWorks } from './components/HowItWorks';
import { Testimonials } from './components/Testimonials';
import { StatsBar } from './components/StatsBar';
import { Button } from '@/components/ui/button';
import { PlusCircle, ArrowRight } from 'lucide-react'; // Added ArrowRight
import Link from 'next/link';
import { motion } from 'framer-motion';


export default function HomePage() {
  return (
    <>
      <a href="#main-content" className="skip-link">Skip to main content</a>

      <Hero />

      <main id="main-content">

          <FeaturesGrid />

          <HowItWorks />

          <Testimonials />

          <StatsBar />

           <section className="py-16 text-center bg-gradient-to-t from-primary/10 to-background">
             <div className="container mx-auto px-4">
               <motion.h2
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.5 }}
                 viewport={{ once: true }}
                 className="text-3xl font-bold mb-4 text-foreground"
               >
                 Ready to Make an Impact?
               </motion.h2>
               <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  viewport={{ once: true }}
                 className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto"
               >
                 Join the Volio community today and start your volunteering journey or organize your next event.
               </motion.p>
               <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2, type: 'spring', stiffness: 100, damping: 12 }} // Spring animation
                  viewport={{ once: true }}
                 className="space-x-4"
               >
                 {/* Updated CTA Button Styling */}
                 <Button
                    size="lg"
                    asChild
                    className="bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.97] transition-transform duration-100" // Removed burst, adjusted active scale
                 >
                   <Link href="/events">Find Events <ArrowRight className="ml-2 h-4 w-4" /></Link>
                 </Button>
                 {/* Changed second CTA to 'Sign Up' */}
                 <Button
                    size="lg"
                    variant="outline"
                    asChild
                    className="border-destructive text-destructive hover:bg-destructive/10 active:scale-[0.97] transition-transform duration-100" // Coral/Red color
                 >
                   <Link href="/signup">Become an Organizer</Link>
                 </Button>
               </motion.div>
             </div>
           </section>

      </main>

      {/* Floating Action Button (FAB) */}
       <Button
            asChild
            size="lg"
            className="fixed z-40 rounded-full h-16 w-16 p-0 shadow-lg bg-gradient-to-br from-accent to-primary text-primary-foreground hover:scale-105 transition-transform active:scale-95 animate-radial-burst" // Kept burst on FAB
            aria-label="Create New Event"
            style={{ bottom: 'clamp(1.5rem, 4vw, 2.5rem)', right: 'clamp(1.5rem, 4vw, 2.5rem)' }}
        >
            <Link href="/create-event">
                <PlusCircle className="h-8 w-8" />
            </Link>
        </Button>
    </>
  );
}
