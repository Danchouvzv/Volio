'use client';

import React, { useEffect } from 'react'; // Added useEffect
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image'; // Import next/image
import { useI18n } from '@/context/I18nContext';

// Placeholder for potential canvas animation component
const HeroCanvasAnimation = () => {
    // Simulate canvas load or interaction
    useEffect(() => {
        // Placeholder for canvas initialization logic if needed
        // console.log('HeroCanvasAnimation mounted');
        // Example: Use requestAnimationFrame for a simple effect
        let frameId: number;
        const canvas = document.getElementById('hero-canvas') as HTMLCanvasElement | null;
        if (canvas) {
             const ctx = canvas.getContext('2d');
             // Very basic animation example - replace with actual implementation
             let x = 0;
             const animate = () => {
                 if (ctx) {
                     ctx.clearRect(0, 0, canvas.width, canvas.height);
                     ctx.fillStyle = 'hsla(var(--primary) / 0.1)';
                     ctx.fillRect(x, 50, 50, 50);
                     x = (x + 1) % canvas.width;
                 }
                 frameId = requestAnimationFrame(animate);
             };
             // animate(); // Uncomment to run basic animation
        }
        return () => cancelAnimationFrame(frameId); // Cleanup
    }, []);

    return (
        <div className="absolute inset-0 z-0 opacity-10 dark:opacity-[0.08] overflow-hidden">
           {/* Placeholder static SVG as fallback - ensure this exists or remove */}
           {/* <Image
             src="/static/volio-wave.svg" // Ensure this SVG exists or replace
             alt="Background wave pattern"
             layout="fill"
             objectFit="cover"
             priority
             className="animate-float" // Keep float animation
             data-ai-hint="abstract wave pattern background"
             /> */}
            {/* Canvas element - use absolute positioning and low z-index */}
             <canvas id="hero-canvas" className="absolute inset-0 w-full h-full"></canvas>
        </div>
    );
};


export function Hero() {
  const { t } = useI18n();
  
  // Animation variants for staggered effect
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', damping: 12, stiffness: 100 } },
  };

   const titleVariants = { // Specific variant for title wow effect
     hidden: { opacity: 0, y: -20 },
     show: {
       opacity: 1,
       y: 0,
       transition: {
         type: 'spring',
         stiffness: 80,
         damping: 10,
         delay: 0.1, // Slightly delayed start
       },
     },
   };

  return (
    <section className="relative text-center py-20 md:py-32 overflow-hidden min-h-[70vh] flex items-center justify-center bg-gradient-to-b from-background via-background to-primary/5 dark:to-primary/10">
      {/* Background Animation/Wave */}
       <HeroCanvasAnimation />

        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="container mx-auto px-4 relative z-10"
        >
            {/* Wow Effect Title - Apply specific variant */}
            <motion.h1
              variants={titleVariants}
              className="text-4xl md:text-6xl font-extrabold mb-4 tracking-tight text-foreground"
              style={{ fontFamily: "'Clash Display', sans-serif" }} // Apply Clash Display font
            >
                {t('home.welcome')} <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-destructive">Volio</span> {/* Updated gradient */}
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto"
            >
              {t('home.slogan')}
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="space-x-4"
            >
              {/* Primary CTA Button */}
              <Button
                 size="lg"
                 asChild
                 className="bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.97] transition-transform duration-100" // Adjusted active scale
              >
                <Link href="/events">
                  {t('home.exploreEvents')} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
               {/* Secondary CTA Button - Updated color and text per review */}
              <Button
                 size="lg"
                 variant="outline"
                 asChild
                 className="border-destructive text-destructive hover:bg-destructive/10 active:scale-[0.97] transition-transform duration-100" // Coral/Red outline
              >
                <Link href="/signup">{t('home.becomeOrganizer')}</Link>
              </Button>
            </motion.div>
        </motion.div>
    </section>
  );
}
