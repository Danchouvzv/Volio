import type { Timestamp } from 'firebase/firestore';

export type UserRole =
  | 'Volunteer'
  | 'Organizer'
  | 'SmallOrg'
  | 'Coordinator'
  | 'Analyst'
  | 'LeagueLeader'
  | 'Moderator'
  | 'Admin';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  interests?: string[];
  bio?: string;
  topBadges?: string[]; // Array of Badge IDs
  createdAt: Timestamp;
  onboardingComplete?: boolean; // Flag for onboarding status
  // Add other profile fields as needed
}

export interface Event {
  id: string;
  title: string;
  description: string;
  category: string; // e.g., 'Environment', 'Social', 'Animals'
  location: {
    lat: number;
    lng: number;
    address?: string; // Optional address string
  } | null; // Null for online events
  isOnline: boolean;
  startDate: Timestamp;
  endDate: Timestamp;
  organizerId: string; // User ID of the organizer
  organizerName?: string; // Optional: denormalized organizer name
  participants: string[]; // Array of User IDs
  tasks?: Task[];
  gallery?: string[]; // Array of image URLs
  invitedBy?: Record<string, string>; // { invitedUserId: invitingFriendId }
  requiredBadges?: string[]; // Array of Badge IDs required for participation
  customIcon?: string; // URL or identifier for custom map icon
  colorPalette?: string; // Custom color theme identifier
  isLeagueEvent?: boolean; // Flag for official league events
  isSmallOrgEvent?: boolean; // Flag for small org events
  createdAt: Timestamp;
  // Add other event fields as needed
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  assignedTo?: string[]; // Array of User IDs
  status: 'todo' | 'inProgress' | 'done';
  dueDate?: Timestamp;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  iconUrl: string; // URL to the badge icon
  criteria: string; // How the badge is earned
  issuedBy: string; // Organizer/System ID
  issuedAt: Timestamp;
}

export interface Participation {
  id: string; // Typically userId + eventId
  userId: string;
  eventId: string;
  joinedAt: Timestamp;
  tasksCompleted?: string[]; // Array of Task IDs
  feedback?: Feedback;
  certificateUrl?: string; // URL to the downloadable certificate
}

export interface Feedback {
  rating: number; // e.g., 1-5 stars
  comment: string;
  submittedBy: string; // User ID of the reviewer
  submittedAt: Timestamp;
}

export interface ChatMessage {
  id: string;
  chatId: string; // Can be eventId, groupId, or directChatId (e.g., user1_user2)
  senderId: string;
  senderName?: string; // Optional: Denormalized sender name
  senderPhotoUrl?: string; // Optional: Denormalized sender photo
  text?: string;
  imageUrl?: string;
  fileUrl?: string;
  mentions?: string[]; // Array of User IDs or Role names
  timestamp: Timestamp;
  isPinned?: boolean;
  reactions?: Record<string, string[]>; // { emoji: [userId1, userId2] }
  threadId?: string; // Link to parent thread if this is a reply
  seenBy?: string[]; // Array of User IDs who have read the message
}

export interface Chat {
  id: string; // eventId, groupId, or directChatId
  type: 'event' | 'group' | 'direct';
  name?: string; // Group name or Event title
  members: string[]; // Array of User IDs
  lastMessage?: ChatMessage; // For previews
  createdAt: Timestamp;
  // Add other chat metadata as needed
}

export interface FriendRequest {
    id: string; // Typically senderId_receiverId
    senderId: string;
    receiverId: string;
    status: 'pending' | 'accepted' | 'rejected' | 'cancelled'; // Added cancelled
    createdAt: Timestamp;
}

export interface FeedItem {
    id: string;
    userId: string; // User whose feed this belongs to
    type: 'achievement' | 'new_friend' | 'event_join' | 'event_update' | 'system' | 'feedback_received'; // Added feedback type
    content: string; // Text description of the feed item
    relatedEventId?: string;
    relatedUserId?: string; // e.g., the new friend or feedback author
    relatedBadgeId?: string;
    timestamp: Timestamp;
    isRead: boolean;
}

export interface SmallOrgSubscription {
    id: string; // Stripe Subscription ID
    orgId: string; // User ID of the SmallOrg
    status: 'active' | 'canceled' | 'past_due' | 'trialing'; // Added trialing
    currentPeriodEnd: Timestamp;
    createdAt: Timestamp;
    planId?: string; // Stripe Plan ID
}

// Define a generic type for Firestore documents that include an id
export type WithId<T> = T & { id: string };

export interface SmartMatchScore {
  eventId: string;
  userId: string;
  score: number; // 0-100 match score
  matchFactors: {
    badgeMatch: number; // 0-1 score for badge matching
    skillsMatch: number; // 0-1 score for skills matching
    locationMatch: number; // 0-1 score for location proximity
    socialMatch: number; // 0-1 score for social connections
    interestsMatch: number; // 0-1 score for interests matching
  };
  timestamp: Timestamp;
}

export interface SmartMatchRecommendation {
  event: WithId<Event>;
  matchScore: number;
  matchFactors: {
    badgeMatch: number;
    skillsMatch: number; 
    locationMatch: number;
    socialMatch: number;
    interestsMatch: number;
  };
}

export interface SmartMatchCandidate {
  user: UserProfile;
  matchScore: number;
  matchFactors: {
    badgeMatch: number;
    skillsMatch: number;
    locationMatch: number;
    socialMatch: number;
    interestsMatch: number;
  };
  mutualFriendsCount: number;
}
