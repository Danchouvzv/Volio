import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import type { SmartMatchRecommendation, SmartMatchCandidate, MatchFactors } from '@/types';
import { 
  getRecommendedEvents, 
  getEventCandidates,
  inviteTopCandidates,
  generateMockRecommendations,
  generateMockCandidates,
  inviteCandidate,
  joinRecommendedEvent,
  calculateMatchScore
} from '@/services/smart-match';

/**
 * Hook for volunteers to get recommended events
 * @param limit - maximum number of recommendations to fetch
 */
export function useRecommendedEvents(limit: number = 10) {
  const { user } = useAuth();
  const [isJoining, setIsJoining] = useState<string | null>(null);
  const queryClient = useQueryClient();
  
  // React Query for fetching recommendations
  const {
    data: recommendedEvents,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['recommendedEvents', user?.uid],
    queryFn: () => getRecommendedEvents(user?.uid, limit),
    enabled: !!user?.uid,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  const joinEventMutation = useMutation({
    mutationFn: (eventId: string) => {
      setIsJoining(eventId);
      return joinRecommendedEvent(user?.uid, eventId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendedEvents'] });
      queryClient.invalidateQueries({ queryKey: ['userEvents'] });
    },
    onSettled: () => {
      setIsJoining(null);
    }
  });
  
  const joinEvent = (eventId: string) => {
    joinEventMutation.mutate(eventId);
  };
  
  return {
    recommendedEvents,
    isLoading,
    error,
    refetch,
    joinEvent,
    isJoining
  };
}

/**
 * Hook for organizers to get candidates for an event
 * @param eventId - ID of the event
 * @param maxCandidates - maximum number of candidates to fetch
 */
export function useEventCandidates(eventId: string, limit: number = 10) {
  const { user } = useAuth();
  const [isInviting, setIsInviting] = useState<string | null>(null);
  const queryClient = useQueryClient();
  
  // React Query for fetching candidates
  const {
    data: candidates,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['eventCandidates', eventId],
    queryFn: () => getEventCandidates(eventId, limit),
    enabled: !!eventId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  const inviteMutation = useMutation({
    mutationFn: (userId: string) => {
      setIsInviting(userId);
      return inviteCandidate(eventId, userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventCandidates'] });
      queryClient.invalidateQueries({ queryKey: ['eventInvites'] });
    },
    onSettled: () => {
      setIsInviting(null);
    }
  });
  
  const inviteUser = (userId: string) => {
    inviteMutation.mutate(userId);
  };
  
  return {
    candidates,
    isLoading,
    error,
    refetch,
    inviteUser,
    isInviting
  };
}

/**
 * Hook for manual calculation of match score
 */
export function useMatchCalculator() {
  const calculateScore = async (userId: string, eventId: string): Promise<{
    score: number;
    factors: MatchFactors;
  }> => {
    return calculateMatchScore(userId, eventId);
  };

  return { calculateScore };
}

/**
 * Hook for getting the Match Score progress color based on score value
 * @param score - match score (0-100)
 */
export function useMatchScoreColor(score: number) {
  if (score >= 80) {
    return "from-green-500 to-green-600";
  } else if (score >= 60) {
    return "from-teal-500 to-teal-600";
  } else if (score >= 40) {
    return "from-blue-500 to-blue-600";
  } else if (score >= 20) {
    return "from-yellow-500 to-yellow-600";
  } else {
    return "from-red-500 to-red-600";
  }
} 