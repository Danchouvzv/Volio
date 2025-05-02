'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LucideProps } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeatureCardProps {
  icon: React.ElementType<LucideProps>;
  title: string;
  copy: string;
  accentColor?: string; // e.g., 'text-primary', 'text-accent', 'text-destructive'
  index: number;
}

export function FeatureCard({ icon: Icon, title, copy, accentColor = 'text-primary', index }: FeatureCardProps) {
  // Determine background color for the icon circle based on the text color
  const iconBgColor = accentColor.replace('text-', 'bg-') + '/10'; // e.g., bg-primary/10

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      viewport={{ once: true }}
      className="flex flex-col items-center text-center p-6 rounded-lg neumorphism bg-card h-full" // Added h-full for consistent height
      whileHover={{ y: -5, scale: 1.03, transition: { type: 'spring', stiffness: 300, damping: 15 } }} // Springy hover effect
    >
      <div className={cn("mb-4 p-3 rounded-full", iconBgColor)}>
          <Icon className={cn("h-8 w-8", accentColor)} />
      </div>
      <h3 className="text-xl font-semibold mb-2 text-foreground">{title}</h3>
      <p className="text-muted-foreground">{copy}</p>
    </motion.div>
  );
}
