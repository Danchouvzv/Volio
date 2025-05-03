import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PulseSidebar } from './PulseSidebar';
import { useTranslation } from '@/context/I18nContext';
import { usePulse } from '@/hooks/usePulse';

type PulseFabState = 'idle' | 'blip' | 'attention' | 'busy';

export function PulseFab() {
  const [state, setState] = useState<PulseFabState>('idle');
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  const { newSuggestionsCount } = usePulse();

  // Effect to handle state changes based on suggestions
  useEffect(() => {
    if (newSuggestionsCount > 0 && !isOpen) {
      setState('attention');
    } else if (state === 'attention' && isOpen) {
      setState('idle');
    }
  }, [newSuggestionsCount, isOpen, state]);

  // Animation variants
  const fabVariants = {
    idle: { scale: 1 },
    blip: { 
      scale: 1.08, 
      boxShadow: '0 0 15px 2px rgba(42, 157, 143, 0.2)'
    },
    attention: {
      scale: [1, 1.08, 1],
      transition: {
        repeat: Infinity,
        repeatType: 'loop' as const,
        duration: 1.5
      }
    },
    busy: {
      rotate: [0, 30],
      transition: {
        repeat: Infinity,
        repeatType: 'reverse' as const,
        duration: 0.6
      }
    }
  };

  const togglePulse = () => {
    setIsOpen(!isOpen);
    if (state === 'attention') {
      setState('idle');
    }
  };

  return (
    <>
      <motion.button
        className="fixed bottom-8 right-8 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-[#2A9D8F] to-[#E76F51] text-white shadow-lg md:h-12 md:w-12 sm:h-11 sm:w-11 sm:bottom-4 sm:right-4"
        variants={fabVariants}
        animate={state}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={togglePulse}
        aria-label={t('pulse.openButton')}
        role="button"
        tabIndex={0}
      >
        {newSuggestionsCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {newSuggestionsCount}
          </span>
        )}
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
        </svg>
      </motion.button>

      <AnimatePresence>
        {isOpen && <PulseSidebar onClose={() => setIsOpen(false)} />}
      </AnimatePresence>
    </>
  );
} 