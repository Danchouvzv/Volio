import { auth, db } from '@/config/firebase';
import { 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  updateProfile,
  deleteUser,
  updateEmail
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  Timestamp,
  collection,
  query,
  orderBy,
  getDocs
} from 'firebase/firestore';
import { UserRole, UserProfile, WithId } from '@/types';

/**
 * Создать нового пользователя с указанной ролью
 */
export async function createUser({
  email,
  password,
  displayName,
  role = 'Volunteer',
  sendInvite = true
}: {
  email: string;
  password: string;
  displayName: string;
  role?: UserRole;
  sendInvite?: boolean;
}): Promise<string> {
  try {
    // Создаем пользователя в Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const { user } = userCredential;
    
    // Обновляем профиль пользователя
    await updateProfile(user, {
      displayName,
      photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}` // Генерируем аватар
    });
    
    // Подготавливаем документ профиля
    const userProfile: Omit<UserProfile, 'uid'> = {
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      role,
      createdAt: Timestamp.now(),
      onboardingComplete: false,
      interests: [],
    };
    
    // Сохраняем документ в Firestore
    await setDoc(doc(db, 'users', user.uid), userProfile);
    
    // Если нужно отправить приглашение, отправляем сброс пароля
    if (sendInvite) {
      await sendPasswordResetEmail(auth, email);
    }
    
    console.log(`Пользователь создан: ${user.uid} с ролью ${role}`);
    return user.uid;
  } catch (error) {
    console.error('Ошибка при создании пользователя:', error);
    throw error;
  }
}

/**
 * Обновить роль пользователя
 */
export async function updateUserRole(userId: string, newRole: UserRole): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    
    // Проверяем существование пользователя
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      throw new Error('Пользователь не найден');
    }
    
    // Обновляем роль
    await updateDoc(userRef, { role: newRole });
    console.log(`Роль пользователя ${userId} обновлена на ${newRole}`);
  } catch (error) {
    console.error('Ошибка при обновлении роли:', error);
    throw error;
  }
}

/**
 * Получить список всех пользователей
 */
export async function getAllUsers(): Promise<WithId<UserProfile>[]> {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as UserProfile
    }));
  } catch (error) {
    console.error('Ошибка при получении списка пользователей:', error);
    throw error;
  }
}

/**
 * Получить пользователя по ID
 */
export async function getUserById(userId: string): Promise<WithId<UserProfile> | null> {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return null;
    }
    
    return {
      id: userDoc.id,
      ...userDoc.data() as UserProfile
    };
  } catch (error) {
    console.error('Ошибка при получении пользователя:', error);
    throw error;
  }
}

/**
 * Обновить профиль пользователя
 */
export async function updateUserProfile(
  userId: string, 
  profileData: Partial<UserProfile>
): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    
    // Проверяем существование пользователя
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      throw new Error('Пользователь не найден');
    }
    
    // Обновляем профиль
    await updateDoc(userRef, { 
      ...profileData,
      updatedAt: Timestamp.now()
    });
    
    console.log(`Профиль пользователя ${userId} обновлен`);
  } catch (error) {
    console.error('Ошибка при обновлении профиля:', error);
    throw error;
  }
}

/**
 * Отправить приглашение по email
 */
export async function sendUserInvitation(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email);
    console.log(`Приглашение отправлено на ${email}`);
  } catch (error) {
    console.error('Ошибка при отправке приглашения:', error);
    throw error;
  }
}

/**
 * Удалить пользователя
 * Примечание: эту функцию должен вызывать только администратор
 */
export async function deleteUserAccount(userId: string): Promise<void> {
  try {
    // Удаляем из Firestore
    const userRef = doc(db, 'users', userId);
    await deleteDoc(userRef);
    
    // В реальном приложении удаление аккаунта в Firebase Auth 
    // обычно выполняется через Cloud Functions с правами админа
    console.log(`Пользователь ${userId} удален`);
  } catch (error) {
    console.error('Ошибка при удалении пользователя:', error);
    throw error;
  }
} 