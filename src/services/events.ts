import { db } from '@/config/firebase';
import type { Event, WithId } from '@/types';
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, query, where, Timestamp, QueryConstraint, orderBy, limit } from 'firebase/firestore';
import { arrayUnion, arrayRemove } from 'firebase/firestore'; // Import array helpers

const eventsCollection = collection(db, 'events');

// Type for filters passed to getEvents
interface EventFilters {
  category?: string;
  location?: string; // Simple text search for now, could be bounds later
  date?: string; // Date string (e.g., 'YYYY-MM-DD'), needs parsing
  isOnline?: boolean | string; // Allow boolean or string from checkbox state
  isLeague?: boolean | string;
  isUnofficial?: boolean | string; // Note: This might map to !isLeagueEvent && !isSmallOrgEvent
  isSmallOrgEvent?: boolean | string;
  // Add more filters as needed (e.g., bounds, specific date ranges)
}


// GET all events (with optional filtering)
export async function getEvents(filters?: {
  category?: string;
  isOnline?: boolean;
  upcoming?: boolean;
}): Promise<WithId<Event>[]> {
  try {
    const eventsCollection = collection(db, 'events');
    
    // Apply filters
    const constraints = [];
    
    if (filters?.category) {
      constraints.push(where('category', '==', filters.category));
    }
    
    if (filters?.isOnline !== undefined) {
      constraints.push(where('isOnline', '==', filters.isOnline));
    }
    
    if (filters?.upcoming) {
      const now = Timestamp.now();
      constraints.push(where('endDate', '>', now));
    }
    
    // Apply ordering by start date (newest first)
    constraints.push(orderBy('startDate', 'desc'));
    
    // Create the query with the constraints
    const q = constraints.length > 0 
      ? query(eventsCollection, ...constraints) 
      : query(eventsCollection);
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data() as Event;
      return { 
        ...data,
        id: doc.id 
      };
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
}


// GET single event by ID
export async function getEventById(id: string): Promise<WithId<Event> | null> {
  const docRef = doc(db, 'events', id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data() as Event;
    return { 
      ...data,
      id: docSnap.id
    };
  } else {
    console.log('No such event document!');
    return null;
  }
}

// CREATE a new event
export async function createEvent(eventData: Partial<Event>): Promise<string> {
  try {
    // Validate required fields
    if (!eventData.title || !eventData.description || !eventData.startDate || !eventData.endDate || !eventData.organizerId) {
      throw new Error('Missing required fields for event creation');
    }
    
    // Ensure dates are Firestore Timestamps
    const startDate = eventData.startDate instanceof Date 
      ? Timestamp.fromDate(eventData.startDate)
      : eventData.startDate;
      
    const endDate = eventData.endDate instanceof Date 
      ? Timestamp.fromDate(eventData.endDate)
      : eventData.endDate;
    
    // Prepare the event object
    const newEvent = {
      ...eventData,
      startDate,
      endDate,
      participants: eventData.participants || [],
      createdAt: Timestamp.now(),
    };
    
    // Add the document to Firestore
    const docRef = await addDoc(collection(db, 'events'), newEvent);
    console.log('Event created with ID:', docRef.id);
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
}

// UPDATE an event
export async function updateEvent(id: string, eventData: Partial<Event>): Promise<void> {
  try {
    const eventRef = doc(db, 'events', id);
    
    // Convert Date objects to Firestore Timestamps
    if (eventData.startDate instanceof Date) {
      eventData.startDate = Timestamp.fromDate(eventData.startDate);
    }
    
    if (eventData.endDate instanceof Date) {
      eventData.endDate = Timestamp.fromDate(eventData.endDate);
    }
    
    await updateDoc(eventRef, eventData);
    console.log('Event updated successfully');
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
}

// DELETE an event
export async function deleteEvent(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'events', id));
    console.log('Event deleted successfully');
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
}

// --- Participant Management ---

// Add participant to event
export async function joinEvent(eventId: string, userId: string): Promise<void> {
  const eventRef = doc(db, 'events', eventId);
   try {
       await updateDoc(eventRef, {
           participants: arrayUnion(userId)
       });
       console.log(`User ${userId} joined event ${eventId}`);
   } catch (e) {
       console.error('Error joining event: ', e);
       throw new Error("Failed to join event.");
   }
}

// Remove participant from event
export async function leaveEvent(eventId: string, userId: string): Promise<void> {
  const eventRef = doc(db, 'events', eventId);
   try {
       await updateDoc(eventRef, {
           participants: arrayRemove(userId)
       });
       console.log(`User ${userId} left event ${eventId}`);
   } catch (e) {
       console.error('Error leaving event: ', e);
       throw new Error("Failed to leave event.");
   }
}

// Get user's events (participating + organizing)
export async function getUserEvents(userId: string): Promise<WithId<Event>[]> {
  try {
    // Get events where user is organizer
    const organizerQuery = query(
      collection(db, 'events'),
      where('organizerId', '==', userId)
    );
    
    // Get events where user is participant
    const participantQuery = query(
      collection(db, 'events'),
      where('participants', 'array-contains', userId)
    );
    
    const [organizerSnapshot, participantSnapshot] = await Promise.all([
      getDocs(organizerQuery),
      getDocs(participantQuery)
    ]);
    
    // Combine and deduplicate events
    const eventsMap = new Map<string, WithId<Event>>();
    
    // Add organizer events
    organizerSnapshot.docs.forEach(doc => {
      const data = doc.data() as Event;
      eventsMap.set(doc.id, { 
        ...data,
        id: doc.id 
      });
    });
    
    // Add participant events (if not already added as organizer)
    participantSnapshot.docs.forEach(doc => {
      if (!eventsMap.has(doc.id)) {
        const data = doc.data() as Event;
        eventsMap.set(doc.id, { 
          ...data,
          id: doc.id 
        });
      }
    });
    
    // Sort by start date (newest first)
    return Array.from(eventsMap.values()).sort((a, b) => 
      b.startDate.seconds - a.startDate.seconds
    );
  } catch (error) {
    console.error('Error fetching user events:', error);
    throw error;
  }
}
