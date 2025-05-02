
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Search, UserPlus, CalendarCheck, LucideProps } from 'lucide-react';

interface StepProps {
  step: number;
  title: string;
  copy: string;
  icon: React.ElementType<LucideProps>;
}

const steps: StepProps[] = [
  { step: 1, title: 'Find Your Cause', copy: 'Search events by location, category, or skills needed.', icon: Search },
  { step: 2, title: 'Sign Up & Join', copy: 'Quickly register for events that match your interests.', icon: UserPlus },
  { step: 3, title: 'Volunteer & Track', copy: 'Participate, earn badges, and see your impact grow.', icon: CalendarCheck },
];

const HowItWorksStep: React.FC<StepProps & { index: number }> = ({ step, title, copy, icon: Icon, index }) => {
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
      {index < steps.length - 1 && (
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


export function HowItWorks() {
  return (
    <section className="py-16 bg-secondary/50">
      <div className="container mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-3xl font-bold text-center mb-12 text-foreground"
        >
          How VolioLite Works
        </motion.h2>
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }} // Trigger when 20% of the container is in view
          className="max-w-2xl mx-auto space-y-8"
        >
          {steps.map((step, index) => (
            <HowItWorksStep key={step.step} {...step} index={index} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
