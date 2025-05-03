import { db } from '@/config/firebase';
import type { FriendRequest, UserProfile, WithId } from '@/types';
import {
    collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, query, where, Timestamp, writeBatch, serverTimestamp, orderBy, limit, collectionGroup
} from 'firebase/firestore';

const usersCollection = collection(db, 'users');
const friendRequestsCollection = collection(db, 'friendRequests');

// Helper to get friend UIDs for a user
async function getFriendUIDs(userId: string): Promise<string[]> {
    // Assuming friends are stored in a subcollection 'friends' under the user document
    const friendsSubCollection = collection(db, 'users', userId, 'friends');
    const q = query(friendsSubCollection); // Potentially filter for status='accepted' if needed
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.id); // Assuming the doc ID is the friend's UID
}


// --- Friend Requests ---

// Send a friend request
export async function sendFriendRequest(senderId: string, receiverId: string): Promise<string | null> {
    if (senderId === receiverId) {
        throw new Error("Cannot send friend request to yourself.");
    }

    // Check if request already exists or if they are already friends
    const requestId = `${senderId}_${receiverId}`;
    const reverseRequestId = `${receiverId}_${senderId}`;

    const requestRef = doc(friendRequestsCollection, requestId);
    const reverseRequestRef = doc(friendRequestsCollection, reverseRequestId);

    const requestSnap = await getDoc(requestRef);
    const reverseRequestSnap = await getDoc(reverseRequestRef);

    if (requestSnap.exists() || reverseRequestSnap.exists()) {
        // Handle existing request (pending, accepted, rejected)
        const existingData = requestSnap.data() || reverseRequestSnap.data();
        if (existingData?.status === 'accepted') throw new Error("Already friends.");
        if (existingData?.status === 'pending') throw new Error("Friend request already pending.");
        // Could allow resending if rejected, or just throw error
         throw new Error("Friend request already exists.");
    }


    // Check if they are already friends (assuming 'friends' subcollection)
     const friendRef = doc(db, 'users', senderId, 'friends', receiverId);
     const friendSnap = await getDoc(friendRef);
     if(friendSnap.exists()) {
         throw new Error("Already friends.");
     }


    const newRequest: Omit<FriendRequest, 'id'> = {
        senderId,
        receiverId,
        status: 'pending',
        createdAt: serverTimestamp() as Timestamp,
    };

    try {
        // Use the custom ID for the document
        await setDoc(requestRef, newRequest);
        console.log(`Friend request sent from ${senderId} to ${receiverId}`);
        return requestId; // Return the created request ID
    } catch (e) {
        console.error('Error sending friend request: ', e);
        throw new Error("Failed to send friend request.");
    }
}
import { setDoc } from 'firebase/firestore'; // Import setDoc

// Get pending friend requests received by a user
export async function getPendingFriendRequests(userId: string): Promise<WithId<FriendRequest>[]> {
    const q = query(
        friendRequestsCollection,
        where('receiverId', '==', userId),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
        const data = doc.data() as FriendRequest;
        return { 
            ...data, 
            id: doc.id 
        };
    });
}

// Accept a friend request
export async function acceptFriendRequest(requestId: string, userId: string): Promise<void> {
    const requestRef = doc(friendRequestsCollection, requestId);
    const requestSnap = await getDoc(requestRef);

    if (!requestSnap.exists()) {
        throw new Error("Friend request not found.");
    }

    const requestData = requestSnap.data() as FriendRequest;

    if (requestData.receiverId !== userId) {
        throw new Error("Cannot accept a request not sent to you.");
    }
    if (requestData.status !== 'pending') {
        throw new Error(`Cannot accept request with status: ${requestData.status}.`);
    }


    // Use a batch write to update request status and add to both users' friend lists
    const batch = writeBatch(db);

    // 1. Update request status
    batch.update(requestRef, { status: 'accepted' });

    // 2. Add sender to receiver's friend list
    const receiverFriendRef = doc(db, 'users', requestData.receiverId, 'friends', requestData.senderId);
    batch.set(receiverFriendRef, { addedAt: serverTimestamp() }); // Add friend UID as doc ID

    // 3. Add receiver to sender's friend list
    const senderFriendRef = doc(db, 'users', requestData.senderId, 'friends', requestData.receiverId);
    batch.set(senderFriendRef, { addedAt: serverTimestamp() });

    try {
        await batch.commit();
        console.log(`Friend request ${requestId} accepted.`);
    } catch (e) {
        console.error('Error accepting friend request: ', e);
        throw new Error("Failed to accept friend request.");
    }
}

// Reject a friend request
export async function rejectFriendRequest(requestId: string, userId: string): Promise<void> {
     const requestRef = doc(friendRequestsCollection, requestId);
     const requestSnap = await getDoc(requestRef);

     if (!requestSnap.exists()) {
         throw new Error("Friend request not found.");
     }

     const requestData = requestSnap.data() as FriendRequest;

      // Allow either sender or receiver to reject/cancel
     if (requestData.receiverId !== userId && requestData.senderId !== userId) {
         throw new Error("Cannot reject/cancel a request not involving you.");
     }
      if (requestData.status !== 'pending') {
          throw new Error(`Cannot reject request with status: ${requestData.status}.`);
      }

     try {
        // Option 1: Update status to 'rejected'
         await updateDoc(requestRef, { status: 'rejected' });
        // Option 2: Delete the request document
        // await deleteDoc(requestRef);
        console.log(`Friend request ${requestId} rejected/cancelled.`);
     } catch (e) {
         console.error('Error rejecting friend request: ', e);
         throw new Error("Failed to reject friend request.");
     }
}


// --- Friend List ---

// Get a user's friend list (fetching profiles)
export async function getFriends(userId: string): Promise<UserProfile[]> {
    const friendUIDs = await getFriendUIDs(userId);

    if (friendUIDs.length === 0) {
        return [];
    }

    // Firestore 'in' queries are limited to 30 items per query as of latest updates.
    // Chunk the UIDs if necessary.
    const MAX_IN_QUERY_SIZE = 30;
    const friendProfiles: UserProfile[] = [];
    for (let i = 0; i < friendUIDs.length; i += MAX_IN_QUERY_SIZE) {
        const chunk = friendUIDs.slice(i, i + MAX_IN_QUERY_SIZE);
        if (chunk.length > 0) {
             const q = query(usersCollection, where('__name__', 'in', chunk)); // __name__ refers to document ID (UID)
             const querySnapshot = await getDocs(q);
             querySnapshot.forEach(doc => {
                 const data = doc.data() as Omit<UserProfile, 'uid'>;
                 friendProfiles.push({ 
                     ...data, 
                     uid: doc.id 
                 });
             });
        }
    }

    return friendProfiles;
}


// Remove a friend
export async function removeFriend(userId: string, friendId: string): Promise<void> {
    const batch = writeBatch(db);

    // 1. Remove friend from user's list
    const userFriendRef = doc(db, 'users', userId, 'friends', friendId);
    batch.delete(userFriendRef);

    // 2. Remove user from friend's list
    const friendUserRef = doc(db, 'users', friendId, 'friends', userId);
    batch.delete(friendUserRef);

    // 3. Optional: Find and delete/update the corresponding friend request document
    const requestId = `${userId}_${friendId}`;
    const reverseRequestId = `${friendId}_${userId}`;
    const requestRef = doc(friendRequestsCollection, requestId);
    const reverseRequestRef = doc(friendRequestsCollection, reverseRequestId);
    // You might want to get() these first to see if they exist before deleting
    batch.delete(requestRef);
    batch.delete(reverseRequestRef);


    try {
        await batch.commit();
        console.log(`User ${userId} removed friend ${friendId}.`);
    } catch (e) {
        console.error('Error removing friend: ', e);
        throw new Error("Failed to remove friend.");
    }
}


// --- Suggestions ---

// Get friend suggestions (basic example - needs refinement)
export async function getFriendSuggestions(userId: string, count: number = 5): Promise<UserProfile[]> {
    // This is a very basic suggestion logic (e.g., random users excluding self and existing friends)
    // Real-world scenarios need more complex logic (mutual friends, common interests/events, location).

    const friends = await getFriendUIDs(userId);
    const excludedIds = [userId, ...friends];

    // Fetch users, excluding self and friends. This is inefficient for large user bases.
    // Consider dedicated suggestion engine or more targeted queries (e.g., users in same city/events).
     let q = query(usersCollection, limit(count + excludedIds.length)); // Fetch more initially

     try {
         const querySnapshot = await getDocs(q);
         const suggestions: UserProfile[] = [];
         querySnapshot.forEach(doc => {
             if (!excludedIds.includes(doc.id) && suggestions.length < count) {
                 const data = doc.data() as Omit<UserProfile, 'uid'>;
                 suggestions.push({ 
                     ...data, 
                     uid: doc.id 
                 });
             }
         });
         return suggestions;
     } catch (e) {
         console.error("Error fetching suggestions:", e);
         return [];
     }

}
