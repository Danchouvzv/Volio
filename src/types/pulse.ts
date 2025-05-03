export type SuggestionType = 'event_nearby' | 'friend_invite' | 'badge_nudge' | 'organizer_request';

export interface Suggestion {
  id: string;
  type: SuggestionType;
  title: string;
  description: string;
  timestamp?: string;
  image?: string;
  
  // For event_nearby type
  distance?: number;
  location?: {
    lat: number;
    lng: number;
  };
  
  // For badge_nudge type
  progress?: number;
  
  // For friend_invite type
  friendIds?: string[];
  
  // For organizer_request type
  skills?: string[];
}

export interface PulseFeedResponse {
  suggestions: Suggestion[];
  totalCount: number;
  newCount: number;
  nextRefreshAt: string;
}

export interface PulseSettings {
  enabled: boolean;
  docked: boolean;
  notificationsEnabled: boolean;
  calendarIntegration: boolean;
  locationEnabled: boolean;
}

export interface Command {
  id: string;
  name: string;
  description: string;
  icon: JSX.Element;
  action: () => void;
  category: 'navigation' | 'action' | 'ai';
  shortcut?: string;
} 