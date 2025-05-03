import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/context/I18nContext';
import { SuggestionCard } from './SuggestionCard';
import { usePulse } from '@/hooks/usePulse';
import { CommandPalette } from './CommandPalette';
import { XIcon, SettingsIcon, CommandIcon } from 'lucide-react';

type PulseSidebarProps = {
  onClose: () => void;
};

export function PulseSidebar({ onClose }: PulseSidebarProps) {
  const { t } = useTranslation();
  const { suggestions, loading, markAllAsRead } = usePulse();
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Handle escape key
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      } else if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        setIsCommandPaletteOpen(true);
        event.preventDefault();
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  return (
    <>
      <motion.div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      
      <motion.aside
        className="fixed right-0 top-0 z-50 flex h-full w-96 flex-col bg-white dark:bg-surface-dark shadow-lg overflow-hidden md:w-80 sm:w-full"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center">
            <h2 className="text-lg font-semibold">{t('pulse.title')}</h2>
            {suggestions.length > 0 && (
              <button 
                onClick={markAllAsRead}
                className="ml-4 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {t('pulse.markAllRead')}
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <XIcon size={18} />
          </button>
        </header>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            // Skeleton placeholders
            Array.from({ length: 3 }).map((_, index) => (
              <div 
                key={index} 
                className="h-40 rounded-lg bg-gray-200 dark:bg-gray-800 animate-pulse"
              />
            ))
          ) : suggestions.length > 0 ? (
            suggestions.map((suggestion) => (
              <SuggestionCard key={suggestion.id} suggestion={suggestion} />
            ))
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mb-4"
              >
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
              </svg>
              <p className="mb-2 text-lg font-medium">{t('pulse.noSuggestions')}</p>
              <p className="max-w-xs text-sm">{t('pulse.checkBackLater')}</p>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <footer className="border-t p-3 flex justify-between items-center">
          <button 
            onClick={() => setIsCommandPaletteOpen(true)}
            className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            <CommandIcon size={16} />
            <span>{t('pulse.openCommandPalette')}</span>
            <kbd className="ml-1 rounded border border-gray-300 px-1.5 py-0.5 text-xs font-light text-gray-600 dark:border-gray-600 dark:text-gray-400">
              ⌘K
            </kbd>
          </button>
          
          <button 
            className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label={t('pulse.settings')}
          >
            <SettingsIcon size={16} />
          </button>
        </footer>
      </motion.aside>
      
      {isCommandPaletteOpen && (
        <CommandPalette onClose={() => setIsCommandPaletteOpen(false)} />
      )}
    </>
  );
} 