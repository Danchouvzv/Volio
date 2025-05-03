import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/context/I18nContext';
import { User, CalendarIcon, MapPinIcon, UsersIcon, Award, Share2 } from 'lucide-react';
import { Suggestion, SuggestionType } from '@/types/pulse';
import { formatDistance } from '@/lib/utils';

type SuggestionCardProps = {
  suggestion: Suggestion;
};

export function SuggestionCard({ suggestion }: SuggestionCardProps) {
  const { t } = useTranslation();
  const [isDismissing, setIsDismissing] = useState(false);
  
  // Function to handle accepting a suggestion
  const handleAccept = async (e: React.MouseEvent) => {
    e.stopPropagation();
    // Implementation depends on suggestion type
    switch(suggestion.type) {
      case 'event_nearby':
        // Join event
        console.log('Joining event:', suggestion.id);
        break;
      case 'friend_invite':
        // Accept friend invite
        console.log('Accepting friend invite:', suggestion.id);
        break;
      case 'badge_nudge':
        // Navigate to complete badge task
        console.log('Navigating to complete badge task for:', suggestion.id);
        break;
      case 'organizer_request':
        // Review organizer request
        console.log('Reviewing organizer request:', suggestion.id);
        break;
    }
  };
  
  // Function to handle dismissing a suggestion
  const handleDismiss = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDismissing(true);
    // Send dismiss action to backend
    setTimeout(() => {
      console.log('Dismissed suggestion:', suggestion.id);
      // In real implementation, this would call a hook method
    }, 300);
  };
  
  // Get card accent color based on suggestion type
  const getAccentColor = () => {
    switch(suggestion.type) {
      case 'event_nearby':
        return 'border-l-[#2A9D8F]'; // secondary
      case 'friend_invite':
        return 'border-l-[#E76F51]'; // primary
      case 'badge_nudge':
        return 'border-l-[#FFD166]'; // notification
      case 'organizer_request':
        return 'border-l-[#A8DADC]'; // hover
      default:
        return 'border-l-gray-300';
    }
  };
  
  // Get card icon based on suggestion type
  const getIcon = () => {
    switch(suggestion.type) {
      case 'event_nearby':
        return <CalendarIcon className="text-[#2A9D8F]" />;
      case 'friend_invite':
        return <UsersIcon className="text-[#E76F51]" />;
      case 'badge_nudge':
        return <Award className="text-[#FFD166]" />;
      case 'organizer_request':
        return <Share2 className="text-[#A8DADC]" />;
      default:
        return <User />;
    }
  };
  
  // Get primary and secondary action text based on suggestion type
  const getActions = () => {
    switch(suggestion.type) {
      case 'event_nearby':
        return {
          primary: t('pulse.join'),
          secondary: t('pulse.details')
        };
      case 'friend_invite':
        return {
          primary: t('pulse.accept'),
          secondary: t('pulse.viewChat')
        };
      case 'badge_nudge':
        return {
          primary: t('pulse.finishTask'),
          secondary: t('pulse.skip')
        };
      case 'organizer_request':
        return {
          primary: t('pulse.review'),
          secondary: t('pulse.later')
        };
      default:
        return {
          primary: t('pulse.view'),
          secondary: t('pulse.dismiss')
        };
    }
  };
  
  if (isDismissing) {
    return (
      <motion.div
        className="h-40 overflow-hidden"
        initial={{ height: 'auto', opacity: 1 }}
        animate={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
        onAnimationComplete={() => {
          // In real implementation, this would remove the suggestion from the list
        }}
      />
    );
  }
  
  const { primary, secondary } = getActions();
  
  return (
    <motion.div
      className={`rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow ${getAccentColor()} border-l-4`}
      whileHover={{ y: -4 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
    >
      <div className="p-4">
        {/* Title and timestamp */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center">
            <div className="mr-3 p-2 rounded-full bg-gray-100 dark:bg-gray-700">
              {getIcon()}
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                {suggestion.title}
              </h3>
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                {suggestion.type === 'event_nearby' && suggestion.distance && (
                  <span className="flex items-center mr-2">
                    <MapPinIcon size={12} className="mr-1" />
                    {formatDistance(suggestion.distance)}
                  </span>
                )}
                {suggestion.timestamp && (
                  <span>{suggestion.timestamp}</span>
                )}
              </div>
            </div>
          </div>
          
          {suggestion.type === 'badge_nudge' && suggestion.progress && (
            <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {suggestion.progress}% {t('pulse.complete')}
            </div>
          )}
        </div>
        
        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
          {suggestion.description}
        </p>
        
        {/* Image for events */}
        {suggestion.type === 'event_nearby' && suggestion.image && (
          <div className="h-20 w-full rounded-md overflow-hidden mb-3">
            <img 
              src={suggestion.image} 
              alt={suggestion.title} 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        {/* Action buttons */}
        <div className="flex justify-between mt-2">
          <button
            onClick={handleAccept}
            className="px-3 py-1.5 text-sm font-medium rounded-md bg-gradient-to-r from-[#2A9D8F] to-[#E76F51] text-white hover:opacity-90 transition-opacity"
          >
            {primary}
          </button>
          <button
            onClick={handleDismiss}
            className="px-3 py-1.5 text-sm font-medium rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {secondary}
          </button>
        </div>
      </div>
    </motion.div>
  );
} 