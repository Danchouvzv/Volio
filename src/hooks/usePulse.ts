import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { doc, collection, onSnapshot, updateDoc, serverTimestamp, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { Suggestion, PulseSettings } from '@/types/pulse';
import { useToast } from '@/components/ui/use-toast';

// Mock data for development
const MOCK_SUGGESTIONS: Suggestion[] = [
  {
    id: '1',
    type: 'event_nearby',
    title: 'Eco CleanUp at Central Park',
    description: 'Join us for a community cleanup event. Bring gloves and water.',
    timestamp: 'Today • 16:40',
    image: 'https://source.unsplash.com/random/800x600/?cleanup',
    distance: 0.8,
    location: {
      lat: 40.785091,
      lng: -73.968285
    }
  },
  {
    id: '2',
    type: 'friend_invite',
    title: 'Aiya and 2 friends invited you',
    description: 'Help at the Children\'s Hospital volunteer program tomorrow.',
    timestamp: 'Tomorrow • 18:00',
    friendIds: ['user1', 'user2', 'user3']
  },
  {
    id: '3',
    type: 'badge_nudge',
    title: 'Almost an Eco Hero!',
    description: 'Attend one more environmental event to earn the Eco Hero badge.',
    progress: 90
  },
  {
    id: '4',
    type: 'organizer_request',
    title: 'Volunteer needed: Tech Skills',
    description: 'Your skills match: Web Development, UI/UX, Teaching. Review this opportunity.',
    skills: ['web-development', 'ui-ux', 'teaching']
  }
];

export function usePulse() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [newSuggestionsCount, setNewSuggestionsCount] = useState(0);
  const [settings, setSettings] = useState<PulseSettings>({
    enabled: true,
    docked: false,
    notificationsEnabled: true,
    calendarIntegration: false,
    locationEnabled: true
  });

  // Fetch pulse settings
  const { data: pulseSettings } = useQuery({
    queryKey: ['pulseSettings', user?.uid],
    queryFn: async () => {
      // In a real implementation, this would fetch from Firestore
      // For now, return mock settings
      return {
        enabled: true,
        docked: false,
        notificationsEnabled: true,
        calendarIntegration: false,
        locationEnabled: true
      } as PulseSettings;
    },
    enabled: !!user
  });

  // Update settings when they change in the query
  useEffect(() => {
    if (pulseSettings) {
      setSettings(pulseSettings);
    }
  }, [pulseSettings]);

  // Listen for real-time updates to suggestions
  useEffect(() => {
    if (!user || !settings.enabled) return;
    
    // In a real implementation, this would be a Firestore listener
    // For the MVP, we'll use the mock data
    setSuggestions(MOCK_SUGGESTIONS);
    setNewSuggestionsCount(MOCK_SUGGESTIONS.length);
    
    // This is how the real implementation would look:
    /*
    const pulseRef = collection(db, 'pulse_feed', user.uid, 'suggestions');
    const q = query(
      pulseRef,
      where('expired', '==', false),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newSuggestions: Suggestion[] = [];
      let newCount = 0;
      
      snapshot.forEach((doc) => {
        const data = doc.data() as Suggestion;
        newSuggestions.push({
          id: doc.id,
          ...data
        });
        
        if (data.isNew) {
          newCount++;
        }
      });
      
      setSuggestions(newSuggestions);
      setNewSuggestionsCount(newCount);
    }, (error) => {
      console.error('Error fetching pulse suggestions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load recommendations. Please try again later.',
        variant: 'destructive'
      });
    });
    
    return () => unsubscribe();
    */
    
    // Cleanup function for the mock implementation
    return () => {
      // No cleanup needed for mock data
    };
  }, [user, settings.enabled, toast]);

  // Mark all suggestions as read
  const markAllAsRead = useCallback(() => {
    if (!user) return;
    
    // For the MVP, just update the local state
    setNewSuggestionsCount(0);
    
    // This is how the real implementation would look:
    /*
    const batch = writeBatch(db);
    
    suggestions.forEach((suggestion) => {
      const suggestionRef = doc(db, 'pulse_feed', user.uid, 'suggestions', suggestion.id);
      batch.update(suggestionRef, { isNew: false });
    });
    
    batch.commit().catch((error) => {
      console.error('Error marking suggestions as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to update suggestions. Please try again later.',
        variant: 'destructive'
      });
    });
    */
    
    toast({
      title: 'Updated',
      description: 'All notifications marked as read',
    });
  }, [user, suggestions, toast]);

  // Handle dismissing a suggestion
  const dismissSuggestion = useCallback((suggestionId: string) => {
    if (!user) return;
    
    // For the MVP, just update the local state
    setSuggestions((prev) => prev.filter((s) => s.id !== suggestionId));
    
    // This is how the real implementation would look:
    /*
    const suggestionRef = doc(db, 'pulse_feed', user.uid, 'suggestions', suggestionId);
    
    updateDoc(suggestionRef, {
      dismissed: true,
      dismissedAt: serverTimestamp()
    }).catch((error) => {
      console.error('Error dismissing suggestion:', error);
      toast({
        title: 'Error',
        description: 'Failed to dismiss recommendation. Please try again later.',
        variant: 'destructive'
      });
    });
    */
    
    toast({
      title: 'Dismissed',
      description: 'Suggestion removed from your feed',
    });
  }, [user, toast]);

  // Update pulse settings
  const updateSettings = useCallback(async (newSettings: Partial<PulseSettings>) => {
    if (!user) return;
    
    // For the MVP, just update the local state
    setSettings((prev) => ({ ...prev, ...newSettings }));
    
    // This is how the real implementation would look:
    /*
    const settingsRef = doc(db, 'users', user.uid, 'settings', 'pulse');
    
    try {
      await updateDoc(settingsRef, {
        ...newSettings,
        updatedAt: serverTimestamp()
      });
      
      toast({
        title: 'Updated',
        description: 'Pulse settings have been saved',
      });
    } catch (error) {
      console.error('Error updating pulse settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to update settings. Please try again later.',
        variant: 'destructive'
      });
    }
    */
    
    toast({
      title: 'Updated',
      description: 'Pulse settings have been saved',
    });
  }, [user, toast]);

  return {
    suggestions,
    newSuggestionsCount,
    settings,
    loading: false, // In a real implementation, this would be derived from the query state
    markAllAsRead,
    dismissSuggestion,
    updateSettings
  };
} 