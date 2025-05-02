'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User, signOut as firebaseSignOut, signInWithEmailAndPassword } from 'firebase/auth'; // Import signOut and signInWithEmailAndPassword
import { doc, getDoc, Timestamp, setDoc, serverTimestamp } from 'firebase/firestore'; // Use serverTimestamp
import { auth, db } from '@/config/firebase';
import type { UserProfile } from '@/types';
import { Skeleton } from '@/components/ui/skeleton'; // For loading state

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: Error | null;
  signOut: () => Promise<void>; // Add signOut method
  signIn: (email: string, password: string) => Promise<void>; // Add signIn method
  demoSignIn: () => Promise<void>; // Add demo signIn method
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to check and create user profile if none exists
async function checkAndCreateUserProfile(user: User): Promise<UserProfile | null> {
    const userDocRef = doc(db, 'users', user.uid);
    try {
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
            // Ensure createdAt is converted if it's not a Timestamp (backward compatibility)
            const data = userDocSnap.data();
            const profile: UserProfile = {
                uid: user.uid,
                ...data,
                createdAt: data.createdAt && isTimestamp(data.createdAt) ? data.createdAt : Timestamp.fromDate(new Date()), // Handle potential non-timestamp
                // Ensure optional fields exist
                interests: data.interests || [],
                bio: data.bio || '',
                topBadges: data.topBadges || [],
                onboardingComplete: data.onboardingComplete || false, // Default to false if missing
            } as UserProfile;
            return profile;
        } else {
            console.warn(`User profile not found in Firestore for UID: ${user.uid}. Creating default profile.`);
            const creationTimestamp = serverTimestamp() as Timestamp; // Use serverTimestamp for new profiles

            const basicProfile: Omit<UserProfile, 'uid'> = {
                email: user.email || null,
                displayName: user.displayName || null,
                photoURL: user.photoURL || null,
                role: 'Volunteer', // Default role
                createdAt: creationTimestamp,
                interests: [],
                bio: '',
                topBadges: [],
                onboardingComplete: false, // Initialize as false
            };
            await setDoc(userDocRef, basicProfile);
            console.log('Default user profile created in Firestore for:', user.uid);
            // Re-fetch after creation to get server timestamp resolved (or construct locally)
            // For simplicity, returning the constructed profile
            return {
                 uid: user.uid,
                 ...basicProfile,
                 createdAt: Timestamp.now() // Approximate with client time if serverTimestamp not immediately available
            };
        }
    } catch (err) {
        console.error('Error fetching or creating user profile:', err);
        // Provide a minimal fallback profile on error
         const minimalProfile: UserProfile = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            role: 'Volunteer', // Fallback role
            createdAt: Timestamp.fromDate(new Date()), // Fallback timestamp
            onboardingComplete: false,
         };
         return minimalProfile;
    }
}

// Mock user for development mode
const mockUser = {
  uid: 'mock-user-123',
  email: 'demo@volio.app',
  displayName: 'Demo User',
  photoURL: 'https://picsum.photos/seed/demo/200/200',
  emailVerified: true,
  getIdToken: () => Promise.resolve('mock-token-123'),
  // Add other required User properties as needed
} as User;

const mockUserProfile: UserProfile = {
  uid: 'mock-user-123',
  email: 'demo@volio.app',
  displayName: 'Demo User',
  photoURL: 'https://picsum.photos/seed/demo/200/200',
  role: 'Volunteer',
  interests: ['Environment', 'Education', 'Community'],
  bio: 'Demo user for development',
  topBadges: ['first-event', 'eco-warrior', 'team-player'],
  createdAt: Timestamp.fromDate(new Date()),
  onboardingComplete: true,
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
        setLoading(false);
        return;
    }

    // In development mode with no emulators, use mockUser after a delay
    if (process.env.NODE_ENV === 'development' && !window.location.hostname.includes('localhost')) {
        const timer = setTimeout(() => {
            console.log('Using mock user for development mode');
            setUser(mockUser);
            setUserProfile(mockUserProfile);
            setLoading(false);
        }, 1000); // Simulate auth delay
        return () => clearTimeout(timer);
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
       setLoading(true);
       setError(null);

      if (firebaseUser) {
        setUser(firebaseUser);
        try {
            const profile = await checkAndCreateUserProfile(firebaseUser);
            setUserProfile(profile);
            // Optional: Redirect logic based on onboardingComplete
            // if (profile && !profile.onboardingComplete && window.location.pathname !== '/onboarding') {
            //     window.location.href = '/onboarding'; // Or use Next Router
            // }
        } catch (err) {
            console.error('Error during profile check/creation:', err);
            setError(err instanceof Error ? err : new Error('Failed to process user profile'));
             const minimalProfile: UserProfile = {
                 uid: firebaseUser.uid,
                 email: firebaseUser.email,
                 displayName: firebaseUser.displayName,
                 photoURL: firebaseUser.photoURL,
                 role: 'Volunteer',
                 createdAt: Timestamp.fromDate(new Date()),
                 onboardingComplete: false,
             };
             setUserProfile(minimalProfile);
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

   // Sign out function
   const handleSignOut = async () => {
       try {
           if (process.env.NODE_ENV === 'development') {
               // In development mode, just clear the state
               setUser(null);
               setUserProfile(null);
               console.log('Demo user signed out');
               return;
           }
           
           await firebaseSignOut(auth);
           // State updates (user, userProfile to null) are handled by onAuthStateChanged
           console.log('User signed out successfully.');
           // Optional: Redirect to login page after sign out
           // router.push('/login');
       } catch (err) {
           console.error('Error signing out:', err);
           setError(err instanceof Error ? err : new Error('Failed to sign out'));
       }
   };

   // Sign in function
   const handleSignIn = async (email: string, password: string) => {
       try {
           setLoading(true);
           await signInWithEmailAndPassword(auth, email, password);
           // State updates are handled by onAuthStateChanged
       } catch (err) {
           console.error('Error signing in:', err);
           setError(err instanceof Error ? err : new Error('Failed to sign in'));
           throw err; // Re-throw for UI handling
       } finally {
           setLoading(false);
       }
   };

   // Demo sign in function - for development only
   const handleDemoSignIn = async () => {
       try {
           setLoading(true);
           // If in development, set mock user
           if (process.env.NODE_ENV === 'development') {
               setUser(mockUser);
               setUserProfile(mockUserProfile);
               console.log('Demo user signed in successfully');
           } else {
               // In production, use a real demo account if available
               await signInWithEmailAndPassword(auth, 'demo@volio.app', 'demo123');
           }
       } catch (err) {
           console.error('Error with demo sign in:', err);
           setError(err instanceof Error ? err : new Error('Failed to sign in with demo account'));
       } finally {
           setLoading(false);
       }
   };

  return (
    <AuthContext.Provider value={{ 
        user, 
        userProfile, 
        loading, 
        error, 
        signOut: handleSignOut,
        signIn: handleSignIn,
        demoSignIn: handleDemoSignIn
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper type guard for Timestamp
function isTimestamp(value: any): value is Timestamp {
  return value && typeof value.toDate === 'function';
}
