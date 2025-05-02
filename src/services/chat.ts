import { db } from '@/config/firebase';
import type { ChatMessage, Chat, WithId } from '@/types';
import {
    collection, addDoc, getDocs, doc, getDoc, updateDoc, query, where, orderBy, limit, Timestamp, serverTimestamp, collectionGroup
} from 'firebase/firestore';

// --- Chat Messages ---

// Get messages for a specific chat (event, group, or direct)
export async function getChatMessages(chatId: string, messageLimit: number = 50): Promise<WithId<ChatMessage>[]> {
    // Assuming messages are in a subcollection 'messages' under the chat document
    // For events/groups, the chat document might be in a 'chats' collection with ID = eventId/groupId
    // For direct chats, the ID might be user1_user2 (lexicographically sorted)
    const messagesCollection = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesCollection, orderBy('timestamp', 'desc'), limit(messageLimit));

    try {
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...(doc.data() as ChatMessage)
        })).reverse(); // Reverse to show oldest first
    } catch (e) {
        console.error(`Error fetching messages for chat ${chatId}:`, e);
        return [];
    }
}

// Send a chat message
export async function sendChatMessage(
    chatId: string,
    senderId: string,
    messageData: Partial<Pick<ChatMessage, 'text' | 'imageUrl' | 'fileUrl' | 'mentions'>>
): Promise<string> {
     if (!messageData.text && !messageData.imageUrl && !messageData.fileUrl) {
         throw new Error("Message content cannot be empty.");
     }

    const messagesCollection = collection(db, 'chats', chatId, 'messages');
    const newChatMessage: Omit<ChatMessage, 'id' | 'chatId'> = {
        senderId,
        timestamp: serverTimestamp() as Timestamp,
        ...messageData, // Include text, imageUrl, fileUrl, mentions
    };

    try {
        const docRef = await addDoc(messagesCollection, newChatMessage);

        // TODO: Update the lastMessage on the parent Chat document (in 'chats' collection)
        // This requires fetching the sender's name/photoURL for denormalization
        // Example: updateChatLastMessage(chatId, { ...newChatMessage, id: docRef.id });

        return docRef.id;
    } catch (e) {
        console.error(`Error sending message to chat ${chatId}:`, e);
        throw new Error("Failed to send message.");
    }
}


// --- Chat List ---

// Get chats a user is a member of
export async function getUserChats(userId: string): Promise<WithId<Chat>[]> {
    // This query assumes chat documents are in a top-level 'chats' collection
    // and each chat document has a 'members' array field containing user UIDs.
    const chatsCollection = collection(db, 'chats');
    const q = query(
        chatsCollection,
        where('members', 'array-contains', userId),
        // orderBy('lastMessage.timestamp', 'desc') // Order by last message time - requires index
    );

    try {
        const querySnapshot = await getDocs(q);
        // TODO: Consider adding ordering by last message timestamp after fetching if index is not set up
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...(doc.data() as Chat)
        }));
    } catch (e) {
        console.error(`Error fetching chats for user ${userId}:`, e);
        return [];
    }
}

// --- Utility (Example) ---

// Helper function to create or get a direct chat ID
function getDirectChatId(userId1: string, userId2: string): string {
    // Sort UIDs lexicographically to ensure consistency
    return userId1 < userId2 ? `${userId1}_${userId2}` : `${userId2}_${userId1}`;
}

// Example: Starting a direct chat (creates the chat doc if it doesn't exist)
export async function startDirectChat(userId1: string, userId2: string): Promise<string> {
     const chatId = getDirectChatId(userId1, userId2);
     const chatRef = doc(db, 'chats', chatId);
     const chatSnap = await getDoc(chatRef);

     if (!chatSnap.exists()) {
         // Create the chat document
          const newChatData: Omit<Chat, 'id'> = {
              type: 'direct',
              members: [userId1, userId2],
              createdAt: serverTimestamp() as Timestamp,
              // lastMessage can be initially null or undefined
          };
          try {
             await setDoc(chatRef, newChatData);
             console.log(`Created direct chat: ${chatId}`);
          } catch (e) {
             console.error(`Error creating direct chat ${chatId}:`, e);
             throw new Error("Failed to start direct chat.");
          }
     }
     return chatId;
}
import { setDoc } from 'firebase/firestore'; // Import setDoc
