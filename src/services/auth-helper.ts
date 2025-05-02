import { auth, db } from '@/config/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, Timestamp, getDoc } from 'firebase/firestore';
import { UserRole } from '@/types';

// Demo users credentials - in real app would be secured elsewhere
export const DEMO_USERS = {
  volunteer: {
    email: 'volunteer@demo.com',
    password: 'demopass123',
    role: 'Volunteer' as UserRole,
    name: 'Айнур Волонтер'
  },
  organizer: {
    email: 'organizer@demo.com',
    password: 'demopass123',
    role: 'Organizer' as UserRole,
    name: 'Ержан Организатор'
  },
  leagueLeader: {
    email: 'league@demo.com',
    password: 'demopass123',
    role: 'LeagueLeader' as UserRole,
    name: 'Алия Лига'
  }
};

/**
 * Signs in with a demo account
 */
export async function signInWithDemo(userType: keyof typeof DEMO_USERS) {
  const user = DEMO_USERS[userType];
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      user.email,
      user.password
    );
    return userCredential.user;
  } catch (error: any) {
    // If user doesn't exist, create it
    if (error.code === 'auth/user-not-found') {
      return createDemoAccount(userType);
    }
    throw error;
  }
}

/**
 * Creates a demo account if it doesn't exist
 */
async function createDemoAccount(userType: keyof typeof DEMO_USERS) {
  const user = DEMO_USERS[userType];
  try {
    // Create auth account
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      user.email,
      user.password
    );
    
    // Update profile
    await updateProfile(userCredential.user, {
      displayName: user.name,
      photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userType}`
    });
    
    // Create user profile document
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email: user.email,
      displayName: user.name,
      photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userType}`,
      role: user.role,
      createdAt: Timestamp.now(),
      onboardingComplete: true,
      interests: userType === 'volunteer' 
        ? ['Environment', 'Education', 'Community']
        : ['Leadership', 'Event Management'],
      location: { 
        lat: 43.25, 
        lng: 76.95,
        city: 'Алматы'
      },
      badges: userType === 'volunteer' 
        ? ['team-player', 'eco-warrior', 'first-event'] 
        : ['event-manager', 'leader', 'mentor'],
      completedEvents: userType === 'volunteer' ? 5 : 12,
      bio: `Это демо-аккаунт ${user.role} для тестирования платформы.`
    });
    
    return userCredential.user;
  } catch (error) {
    console.error('Error creating demo account:', error);
    throw error;
  }
}

/**
 * Helper to check if user has specific role
 */
export async function checkUserRole(uid: string, role: UserRole): Promise<boolean> {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.role === role;
    }
    return false;
  } catch (error) {
    console.error('Error checking user role:', error);
    return false;
  }
} 