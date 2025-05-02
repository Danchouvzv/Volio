
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LucideProps } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepProps {
  step: number;
  title: string;
  copy: string;
  icon: React.ElementType<LucideProps>;
  index: number;
  isLast: boolean;
}

export const HowItWorksStep: React.FC<StepProps> = ({ step, title, copy, icon: Icon, index, isLast }) => {
  const variants = {
    hidden: { opacity: 0, x: -30 },
    show: { opacity: 1, x: 0, transition: { duration: 0.5, delay: index * 0.2 } },
  };

  return (
    <motion.div
      variants={variants}
      className="relative flex items-start space-x-4 p-4 group"
    >
      {/* Timeline Line (except for last item) */}
      {!isLast && (
        <div className="absolute left-6 top-8 h-full w-0.5 bg-border group-hover:bg-primary transition-colors duration-300" />
      )}

      {/* Step Number and Icon */}
      <div className="relative z-10 flex-shrink-0 flex flex-col items-center">
        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary border-2 border-primary group-hover:scale-110 transition-transform duration-300">
          <Icon className="h-6 w-6" />
        </div>
        <span className="mt-2 text-xs font-semibold text-muted-foreground">{`Step ${step}`}</span>
      </div>

      {/* Content */}
      <div className="flex-grow pt-1">
        <h4 className="text-lg font-semibold text-foreground mb-1">{title}</h4>
        <p className="text-muted-foreground">{copy}</p>
      </div>
    </motion.div>
  );
};

/*
Note: This component is created as per the roadmap, but the logic
is currently implemented directly within the HowItWorks.tsx component
for simplicity. This Step component can be extracted and used within
HowItWorks.tsx if preferred.
*/
