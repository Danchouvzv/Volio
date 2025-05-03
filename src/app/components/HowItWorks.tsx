'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Search, UserPlus, CalendarCheck, LucideProps } from 'lucide-react';
import { useI18n } from '@/context/I18nContext';

interface StepProps {
  step: number;
  titleKey: string;
  copyKey: string;
  icon: React.ElementType<LucideProps>;
}

const HowItWorksStep: React.FC<StepProps & { index: number }> = ({ step, titleKey, copyKey, icon: Icon, index }) => {
  const { t } = useI18n();
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
      {index < 3 - 1 && (
        <div className="absolute left-6 top-8 h-full w-0.5 bg-border group-hover:bg-primary transition-colors duration-300" />
      )}

      {/* Step Number and Icon */}
      <div className="relative z-10 flex-shrink-0 flex flex-col items-center">
        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary border-2 border-primary group-hover:scale-110 transition-transform duration-300">
          <Icon className="h-6 w-6" />
        </div>
        <span className="mt-2 text-xs font-semibold text-muted-foreground">{t(titleKey)}</span>
      </div>

      {/* Content */}
      <div className="flex-grow pt-1">
        <h4 className="text-lg font-semibold text-foreground mb-1">{t(titleKey)}</h4>
        <p className="text-muted-foreground">{t(copyKey)}</p>
      </div>
    </motion.div>
  );
};


export function HowItWorks() {
  const { t } = useI18n();
  
  const steps: StepProps[] = [
    { 
      step: 1, 
      titleKey: 'home.findCause', 
      copyKey: 'home.searchEvents', 
      icon: Search 
    },
    { 
      step: 2, 
      titleKey: 'home.signUpJoin', 
      copyKey: 'home.registerEvents', 
      icon: UserPlus 
    },
    { 
      step: 3, 
      titleKey: 'home.volunteerTrack', 
      copyKey: 'home.participateEarn', 
      icon: CalendarCheck 
    },
  ];
  
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
          {t('home.howItWorks')}
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
