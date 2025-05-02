import { db } from '@/config/firebase';
import { collection, query, where, getDocs, doc, getDoc, setDoc, orderBy, limit, Timestamp, updateDoc, arrayUnion } from 'firebase/firestore';
import type { Event, UserProfile, WithId, SmartMatchScore, SmartMatchRecommendation, SmartMatchCandidate } from '@/types';
import { getDistance } from 'geolib';

const MATCH_WEIGHTS = {
  BADGE: 0.3,       // 30% weight for badge matches
  SKILLS: 0.25,     // 25% weight for skills
  LOCATION: 0.15,   // 15% weight for location
  SOCIAL: 0.15,     // 15% weight for social connections
  INTERESTS: 0.15   // 15% weight for interests
};

/**
 * Calculate match score between volunteer and event
 */
export async function calculateMatchScore(
  user: UserProfile,
  event: WithId<Event>
): Promise<SmartMatchScore> {
  // Initialize match factors
  const matchFactors = {
    badgeMatch: 0,
    skillsMatch: 0,
    locationMatch: 0,
    socialMatch: 0,
    interestsMatch: 0
  };
  
  // 1. Badge Match: Check how many of user's top badges match event's required badges
  if (user.topBadges && event.requiredBadges) {
    const matchingBadges = user.topBadges.filter(badge => 
      event.requiredBadges?.includes(badge)
    );
    matchFactors.badgeMatch = matchingBadges.length / Math.max(1, user.topBadges.length);
  }
  
  // 2. Skills Match: Compare user skills to event requirements
  if (user.interests && event.category) {
    // For demo purposes, treat interests as skills too
    const userSkills = user.interests || [];
    const eventSkills = [event.category]; // Simplification: use category as main skill
    
    // Count matching skills
    const matchingSkills = userSkills.filter(skill => 
      eventSkills.includes(skill)
    );
    matchFactors.skillsMatch = matchingSkills.length / Math.max(1, eventSkills.length);
  }
  
  // 3. Location Match: Check proximity (if locations available)
  if (user.location && event.location) {
    // Calculate distance between user and event (example metric - could be enhanced)
    const distance = getDistance(
      { latitude: user.location.lat, longitude: user.location.lng },
      { latitude: event.location.lat, longitude: event.location.lng }
    );
    
    // Convert distance to a 0-1 score (closer = higher score)
    // Assume max relevant distance is 50km = 50000m
    matchFactors.locationMatch = Math.max(0, 1 - (distance / 50000));
  }
  
  // 4. Social Match: Check if friends participating
  const socialMatch = await getSocialMatchScore(user.uid, event.id);
  matchFactors.socialMatch = socialMatch;
  
  // 5. Interests Match: Compare user interests to event category
  if (user.interests && event.category) {
    matchFactors.interestsMatch = user.interests.includes(event.category) ? 1 : 0;
  }
  
  // Calculate weighted total score
  const score = Math.round(
    (matchFactors.badgeMatch * MATCH_WEIGHTS.BADGE +
    matchFactors.skillsMatch * MATCH_WEIGHTS.SKILLS +
    matchFactors.locationMatch * MATCH_WEIGHTS.LOCATION +
    matchFactors.socialMatch * MATCH_WEIGHTS.SOCIAL +
    matchFactors.interestsMatch * MATCH_WEIGHTS.INTERESTS) * 100
  );
  
  return {
    userId: user.uid,
    eventId: event.id,
    score,
    matchFactors,
    timestamp: Timestamp.now()
  };
}

/**
 * Calculate social match score based on friends participating
 */
async function getSocialMatchScore(userId: string, eventId: string): Promise<number> {
  try {
    // Get user's friends
    const userFriendsRef = collection(db, 'users', userId, 'friends');
    const friendsSnapshot = await getDocs(userFriendsRef);
    const friendIds = friendsSnapshot.docs.map(doc => doc.id);
    
    if (friendIds.length === 0) return 0;
    
    // Check how many friends are participating in the event
    const eventRef = doc(db, 'events', eventId);
    const eventDoc = await getDoc(eventRef);
    
    if (!eventDoc.exists()) return 0;
    
    const eventData = eventDoc.data() as Event;
    const participants = eventData.participants || [];
    
    const mutualParticipants = participants.filter(id => friendIds.includes(id));
    
    // Calculate social score (0 to 1)
    // If at least 3 friends are participating, give max score
    return Math.min(1, mutualParticipants.length / 3);
  } catch (error) {
    console.error('Error calculating social match:', error);
    return 0;
  }
}

/**
 * Get top recommended events for a volunteer
 */
export async function getRecommendedEvents(
  userId: string,
  limit: number = 5
): Promise<SmartMatchRecommendation[]> {
  try {
    // Get user profile
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) throw new Error('User not found');
    const user = { uid: userId, ...userDoc.data() } as UserProfile;
    
    // Get active events (that haven't ended yet)
    const now = Timestamp.now();
    const eventsRef = collection(db, 'events');
    const eventsQuery = query(
      eventsRef,
      where('endDate', '>', now),
      orderBy('endDate')
    );
    const eventsSnapshot = await getDocs(eventsQuery);
    
    // Calculate match scores for each event
    const matchPromises = eventsSnapshot.docs.map(async eventDoc => {
      const event = { id: eventDoc.id, ...eventDoc.data() } as WithId<Event>;
      const matchScore = await calculateMatchScore(user, event);
      
      return {
        event,
        matchScore: matchScore.score,
        matchFactors: matchScore.matchFactors
      } as SmartMatchRecommendation;
    });
    
    const recommendations = await Promise.all(matchPromises);
    
    // Sort by match score (highest first) and limit results
    return recommendations
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit);
  } catch (error) {
    console.error('Error getting recommended events:', error);
    return [];
  }
}

/**
 * Get top candidates for an event
 */
export async function getEventCandidates(
  eventId: string,
  maxCandidates: number = 10
): Promise<SmartMatchCandidate[]> {
  try {
    // Get event details
    const eventDoc = await getDoc(doc(db, 'events', eventId));
    if (!eventDoc.exists()) throw new Error('Event not found');
    const event = { id: eventId, ...eventDoc.data() } as WithId<Event>;
    
    // Get all users
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    
    // Calculate match scores for each user
    const matchPromises = usersSnapshot.docs.map(async userDoc => {
      const user = { uid: userDoc.id, ...userDoc.data() } as UserProfile;
      const matchScore = await calculateMatchScore(user, event);
      
      // Get mutual friends count
      let mutualFriendsCount = 0;
      try {
        const organizerFriendsRef = collection(db, 'users', event.organizerId, 'friends');
        const organizerFriendsSnapshot = await getDocs(organizerFriendsRef);
        const organizerFriendIds = organizerFriendsSnapshot.docs.map(doc => doc.id);
        
        if (organizerFriendIds.includes(user.uid)) {
          mutualFriendsCount = 1; // direct friend
        } else {
          // For simplicity, we're not calculating actual mutual friends
          // In a real implementation, you would check overlapping friend networks
          mutualFriendsCount = 0;
        }
      } catch (e) {
        console.error('Error getting mutual friends:', e);
      }
      
      return {
        user,
        matchScore: matchScore.score,
        matchFactors: matchScore.matchFactors,
        mutualFriendsCount
      } as SmartMatchCandidate;
    });
    
    const candidates = await Promise.all(matchPromises);
    
    // Sort by match score and limit results
    return candidates
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, maxCandidates);
  } catch (error) {
    console.error('Error getting event candidates:', error);
    return [];
  }
}

/**
 * Bulk invite top candidates for an event
 */
export async function inviteTopCandidates(
  eventId: string,
  count: number = 3
): Promise<string[]> {
  try {
    // Get top candidates
    const candidates = await getEventCandidates(eventId, count);
    
    // Send invitations
    const invitePromises = candidates.map(candidate => 
      sendEventInvitation(eventId, candidate.user.uid)
    );
    
    await Promise.all(invitePromises);
    
    // Return list of invited user IDs
    return candidates.map(c => c.user.uid);
  } catch (error) {
    console.error('Error inviting top candidates:', error);
    return [];
  }
}

/**
 * Send an invitation to a user for an event
 */
export async function sendEventInvitation(eventId: string, userId: string): Promise<void> {
  try {
    // Create invitation in Firestore
    const invitationRef = doc(db, 'users', userId, 'invitations', eventId);
    await setDoc(invitationRef, {
      eventId,
      timestamp: Timestamp.now(),
      status: 'pending'
    });
    
    // TODO: Send notification to user
    console.log(`Invitation sent to ${userId} for event ${eventId}`);
  } catch (error) {
    console.error('Error sending invitation:', error);
    throw error;
  }
}

/**
 * Send an invite directly to a candidate
 */
export async function inviteCandidate(eventId: string, userId: string): Promise<void> {
  return sendEventInvitation(eventId, userId);
}

/**
 * Store match score for analytics
 */
export async function storeMatchScore(score: SmartMatchScore): Promise<void> {
  try {
    const scoreRef = doc(
      db, 
      'smartMatch', 
      'scores', 
      'events', 
      score.eventId,
      'users',
      score.userId
    );
    
    await setDoc(scoreRef, {
      score: score.score,
      matchFactors: score.matchFactors,
      timestamp: score.timestamp
    });
  } catch (error) {
    console.error('Error storing match score:', error);
  }
}

// Mock data generator for development environment
export function generateMockRecommendations(count: number = 5): SmartMatchRecommendation[] {
  const categories = ['Environment', 'Education', 'Health', 'Animals', 'Community', 'Technology'];
  const locations = [
    { lat: 43.25, lng: 76.95 }, // Almaty
    { lat: 51.16, lng: 71.44 },  // Astana
    { lat: 49.80, lng: 73.10 },  // Karaganda
  ];
  
  return Array.from({ length: count }, (_, i) => {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];
    
    // Generate random match factors
    const badgeMatch = Math.random();
    const skillsMatch = Math.random();
    const locationMatch = Math.random();
    const socialMatch = Math.random();
    const interestsMatch = Math.random();
    
    // Calculate weighted score
    const score = Math.round(
      (badgeMatch * MATCH_WEIGHTS.BADGE +
       skillsMatch * MATCH_WEIGHTS.SKILLS +
       locationMatch * MATCH_WEIGHTS.LOCATION +
       socialMatch * MATCH_WEIGHTS.SOCIAL +
       interestsMatch * MATCH_WEIGHTS.INTERESTS) * 100
    );
    
    return {
      event: {
        id: `event-${i + 1}`,
        title: `${category} Volunteer Event ${i + 1}`,
        description: `This is a mock event for ${category.toLowerCase()} volunteers.`,
        category,
        location,
        isOnline: Math.random() > 0.7,
        startDate: Timestamp.fromDate(new Date(Date.now() + 86400000 * (i + 1))),
        endDate: Timestamp.fromDate(new Date(Date.now() + 86400000 * (i + 2))),
        organizerId: 'mock-organizer',
        organizerName: 'Mock Organizer',
        participants: [],
        createdAt: Timestamp.now(),
        requiredBadges: ['team-player', 'first-event']
      },
      matchScore: score,
      matchFactors: {
        badgeMatch,
        skillsMatch,
        locationMatch,
        socialMatch,
        interestsMatch
      }
    };
  });
}

// Mock candidates generator for development
export function generateMockCandidates(count: number = 10): SmartMatchCandidate[] {
  const skills = ['Communication', 'Leadership', 'Organization', 'Teaching', 'Medical', 'Technical'];
  const interests = ['Environment', 'Education', 'Health', 'Animals', 'Community'];
  
  return Array.from({ length: count }, (_, i) => {
    // Generate random match factors
    const badgeMatch = Math.random();
    const skillsMatch = Math.random();
    const locationMatch = Math.random();
    const socialMatch = Math.random();
    const interestsMatch = Math.random();
    
    // Calculate weighted score
    const score = Math.round(
      (badgeMatch * MATCH_WEIGHTS.BADGE +
       skillsMatch * MATCH_WEIGHTS.SKILLS +
       locationMatch * MATCH_WEIGHTS.LOCATION +
       socialMatch * MATCH_WEIGHTS.SOCIAL +
       interestsMatch * MATCH_WEIGHTS.INTERESTS) * 100
    );
    
    // Random selection of skills and interests
    const userSkills = [];
    for (let j = 0; j < Math.floor(Math.random() * 3) + 1; j++) {
      const skill = skills[Math.floor(Math.random() * skills.length)];
      if (!userSkills.includes(skill)) userSkills.push(skill);
    }
    
    const userInterests = [];
    for (let j = 0; j < Math.floor(Math.random() * 3) + 1; j++) {
      const interest = interests[Math.floor(Math.random() * interests.length)];
      if (!userInterests.includes(interest)) userInterests.push(interest);
    }
    
    return {
      user: {
        uid: `user-${i + 1}`,
        email: `volunteer${i + 1}@example.com`,
        displayName: `Volunteer ${i + 1}`,
        photoURL: `https://picsum.photos/seed/volunteer${i+1}/200/200`,
        role: 'Volunteer',
        interests: userInterests,
        bio: `Mock volunteer profile ${i + 1}`,
        topBadges: ['team-player', 'eco-warrior', 'first-event'].slice(0, Math.floor(Math.random() * 3) + 1),
        createdAt: Timestamp.now(),
        onboardingComplete: true,
      },
      matchScore: score,
      matchFactors: {
        badgeMatch,
        skillsMatch,
        locationMatch,
        socialMatch,
        interestsMatch
      },
      mutualFriendsCount: Math.floor(Math.random() * 5)
    };
  });
}

/**
 * Join recommended event for a volunteer
 */
export async function joinRecommendedEvent(userId: string | undefined, eventId: string): Promise<void> {
  if (!userId) {
    throw new Error('User ID is required to join an event');
  }

  try {
    // Update event participants
    const eventRef = doc(db, 'events', eventId);
    await updateDoc(eventRef, {
      participants: arrayUnion(userId)
    });
    
    // Add to user's joined events
    const userEventRef = doc(db, 'users', userId, 'events', eventId);
    await setDoc(userEventRef, {
      eventId,
      joinedAt: Timestamp.now(),
      status: 'joined'
    });
    
    console.log(`User ${userId} joined event ${eventId}`);
  } catch (error) {
    console.error('Error joining event:', error);
    throw error;
  }
} 