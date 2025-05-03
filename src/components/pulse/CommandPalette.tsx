import { useState, useEffect, Fragment } from 'react';
import { Combobox, Dialog, Transition } from '@headlessui/react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/context/I18nContext';
import { 
  SearchIcon, Users, Calendar, Settings, 
  MessageSquare, Award, Map, ChevronRight 
} from 'lucide-react';
import { useGemini } from '@/hooks/useGemini';

type Command = {
  id: string;
  name: string;
  description: string;
  icon: JSX.Element;
  action: () => void;
  category: 'navigation' | 'action' | 'ai';
  shortcut?: string;
};

type CommandPaletteProps = {
  onClose: () => void;
};

export function CommandPalette({ onClose }: CommandPaletteProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [selectedCommand, setSelectedCommand] = useState<Command | null>(null);
  const { generateAICommands, loading: aiLoading } = useGemini();
  const [aiCommands, setAiCommands] = useState<Command[]>([]);

  // Define static commands
  const staticCommands: Command[] = [
    {
      id: 'events',
      name: t('pulse.commands.browseEvents'),
      description: t('pulse.commands.browseEventsDesc'),
      icon: <Calendar className="h-5 w-5 text-[#2A9D8F]" />,
      action: () => { window.location.href = '/events'; },
      category: 'navigation',
      shortcut: '⌘E'
    },
    {
      id: 'friends',
      name: t('pulse.commands.viewFriends'),
      description: t('pulse.commands.viewFriendsDesc'),
      icon: <Users className="h-5 w-5 text-[#E76F51]" />,
      action: () => { window.location.href = '/friends'; },
      category: 'navigation',
      shortcut: '⌘F'
    },
    {
      id: 'create-event',
      name: t('pulse.commands.createEvent'),
      description: t('pulse.commands.createEventDesc'),
      icon: <Calendar className="h-5 w-5 text-[#2A9D8F]" />,
      action: () => { window.location.href = '/create-event'; },
      category: 'action',
    },
    {
      id: 'settings',
      name: t('pulse.commands.openSettings'),
      description: t('pulse.commands.openSettingsDesc'),
      icon: <Settings className="h-5 w-5 text-gray-500" />,
      action: () => { window.location.href = '/settings'; },
      category: 'navigation',
      shortcut: '⌘,'
    },
    {
      id: 'messages',
      name: t('pulse.commands.checkMessages'),
      description: t('pulse.commands.checkMessagesDesc'),
      icon: <MessageSquare className="h-5 w-5 text-[#A8DADC]" />,
      action: () => { window.location.href = '/messages'; },
      category: 'navigation',
      shortcut: '⌘M'
    },
    {
      id: 'badges',
      name: t('pulse.commands.viewBadges'),
      description: t('pulse.commands.viewBadgesDesc'),
      icon: <Award className="h-5 w-5 text-[#FFD166]" />,
      action: () => { window.location.href = '/profile/badges'; },
      category: 'navigation',
    },
    {
      id: 'map',
      name: t('pulse.commands.exploreMap'),
      description: t('pulse.commands.exploreMapDesc'),
      icon: <Map className="h-5 w-5 text-[#2A9D8F]" />,
      action: () => { window.location.href = '/map'; },
      category: 'navigation',
    }
  ];

  // Request AI suggestions when query is specific enough
  useEffect(() => {
    if (query.length >= 3 && !query.startsWith('/')) {
      const fetchAiCommands = async () => {
        try {
          const commands = await generateAICommands(query);
          setAiCommands(commands);
        } catch (error) {
          console.error('Error generating AI commands:', error);
        }
      };
      
      fetchAiCommands();
    } else {
      setAiCommands([]);
    }
  }, [query, generateAICommands]);

  // All commands combined
  const allCommands = [...staticCommands, ...aiCommands];

  // Filter commands based on query
  const filteredCommands = query === ''
    ? staticCommands
    : allCommands.filter((command) => {
        return command.name.toLowerCase().includes(query.toLowerCase()) ||
               command.description.toLowerCase().includes(query.toLowerCase());
      });

  // Handle command selection
  const handleSelect = (command: Command) => {
    setSelectedCommand(command);
    command.action();
    onClose();
  };

  // Handle escape key
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  return (
    <Transition.Root show={true} as={Fragment} afterLeave={() => setQuery('')}>
      <Dialog 
        as="div" 
        className="fixed inset-0 z-50 overflow-y-auto p-4 pt-[20vh] sm:pt-[25vh]" 
        onClose={onClose}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <Dialog.Panel className="mx-auto max-w-xl transform divide-y divide-gray-200 overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-2xl ring-1 ring-black/5 transition-all">
            <Combobox onChange={handleSelect}>
              <div className="relative">
                <SearchIcon
                  className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
                <Combobox.Input
                  className="h-12 w-full border-0 bg-transparent pl-11 pr-4 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-0 sm:text-sm"
                  placeholder={t('pulse.commands.search')}
                  onChange={(event) => setQuery(event.target.value)}
                  autoComplete="off"
                />
              </div>

              {filteredCommands.length > 0 && (
                <Combobox.Options 
                  static 
                  className="max-h-80 scroll-py-2 overflow-y-auto py-2 text-sm"
                >
                  {/* Group commands by category */}
                  {query === '' ? (
                    <>
                      <li className="px-4 py-2 font-semibold text-gray-500 dark:text-gray-300">
                        {t('pulse.commands.navigation')}
                      </li>
                      {filteredCommands
                        .filter(command => command.category === 'navigation')
                        .map((command) => (
                          <CommandItem key={command.id} command={command} />
                        ))}
                      
                      <li className="px-4 py-2 font-semibold text-gray-500 dark:text-gray-300 mt-2">
                        {t('pulse.commands.actions')}
                      </li>
                      {filteredCommands
                        .filter(command => command.category === 'action')
                        .map((command) => (
                          <CommandItem key={command.id} command={command} />
                        ))}
                    </>
                  ) : (
                    filteredCommands.map((command) => (
                      <CommandItem key={command.id} command={command} />
                    ))
                  )}
                </Combobox.Options>
              )}

              {query && filteredCommands.length === 0 && !aiLoading && (
                <div className="py-14 px-6 text-center sm:px-14">
                  <SearchIcon
                    className="mx-auto h-6 w-6 text-gray-400"
                    aria-hidden="true"
                  />
                  <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                    {t('pulse.commands.noResults')}
                  </p>
                </div>
              )}
              
              {aiLoading && (
                <div className="py-10 px-6 text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="mx-auto h-6 w-6 text-[#2A9D8F]"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="20" strokeDashoffset="10" />
                    </svg>
                  </motion.div>
                  <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                    {t('pulse.commands.thinking')}
                  </p>
                </div>
              )}
            </Combobox>
          </Dialog.Panel>
        </Transition.Child>
      </Dialog>
    </Transition.Root>
  );
}

function CommandItem({ command }: { command: Command }) {
  return (
    <Combobox.Option
      value={command}
      className={({ active }) =>
        `relative cursor-default select-none px-4 py-2 ${
          active ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
        }`
      }
    >
      {({ active }) => (
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="flex h-8 w-8 items-center justify-center rounded-full">
              {command.icon}
            </span>
            <span className="ml-3 flex flex-col">
              <span className="text-sm font-medium">{command.name}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {command.description}
              </span>
            </span>
          </div>
          <div className="flex items-center">
            {command.shortcut && (
              <kbd className="rounded border border-gray-300 dark:border-gray-600 px-2 py-0.5 text-xs text-gray-400 mr-2">
                {command.shortcut}
              </kbd>
            )}
            {active && <ChevronRight className="h-4 w-4 text-gray-500" />}
          </div>
        </div>
      )}
    </Combobox.Option>
  );
} 