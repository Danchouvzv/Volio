'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, updateProfile } from 'firebase/auth';
import { auth, db } from '@/config/firebase';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { useRouter, useSearchParams } from 'next/navigation'; // Added useSearchParams
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { motion } from 'framer-motion';
import type { UserProfile, UserRole } from '@/types'; // Import UserProfile and UserRole type

// SVG for Google Icon
const GoogleIcon = () => (
    <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
      <path fill="currentColor" d="M488 261.8C488 403.3 381.7 512 244 512 109.8 512 0 402.2 0 261.8S109.8 11.6 244 11.6C318.3 11.6 375 37.5 414.9 72.8L361.7 124.1C336.9 101.7 301.1 85.3 244 85.3 155.1 85.3 82.9 155.7 82.9 244.8S155.1 404.3 244 404.3c90.3 0 126.1-46.7 131.1-70.3H244V261.8h244z"></path>
    </svg>
  );

const signupFormSchema = z.object({
  displayName: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type SignupFormValues = z.infer<typeof signupFormSchema>;

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams(); // Get query parameters
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Determine initial role based on query param (e.g., /signup?role=organizer)
   const initialRoleParam = searchParams.get('role');
   let initialRole: UserRole = 'Volunteer'; // Default
   if (initialRoleParam === 'organizer') {
       initialRole = 'Organizer'; // Allow Organizer signup directly if param exists
   } // Add other roles if needed


  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      displayName: '',
      email: '',
      password: '',
    },
  });

  // Function to create user profile in Firestore with a specific role
   const createUserProfile = async (user: import('firebase/auth').User, role: UserRole = 'Volunteer', displayName?: string | null) => {
       const userDocRef = doc(db, 'users', user.uid);
       const newUserProfile: Omit<UserProfile, 'uid' | 'onboardingComplete'> = { // Exclude onboardingComplete initially
           email: user.email,
           displayName: displayName || user.displayName,
           photoURL: user.photoURL,
           role: role, // Assign the determined role
           createdAt: serverTimestamp() as any,
           interests: [],
           bio: '',
           topBadges: [],
           // onboardingComplete: false, // Initialize as false
       };
       try {
           await setDoc(userDocRef, newUserProfile);
           console.log(`User profile created in Firestore for: ${user.uid} with role ${role}`);
       } catch (firestoreError) {
           console.error('Error creating user profile in Firestore:', firestoreError);
           throw new Error('Failed to save user profile.');
       }
   };


  async function onSubmit(data: SignupFormValues) {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      // 2. Update Firebase Auth profile with display name
       await updateProfile(user, { displayName: data.displayName });

      // 3. Create user profile document in Firestore with the initial role
      await createUserProfile(user, initialRole, data.displayName);

      // Redirect to onboarding page after signup
      router.push('/onboarding');
    } catch (err: any) {
      console.error("Signup Error:", err);
      // Handle specific errors like 'auth/email-already-in-use'
      if (err.code === 'auth/email-already-in-use') {
           setError('This email address is already registered. Please login instead.');
      } else {
          setError(err.message || 'Failed to create account. Please try again.');
      }
    } finally {
        setIsLoading(false);
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      // Check if user profile exists, if not create it with the initial role
      const userDocRef = doc(db, 'users', result.user.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (!userDocSnap.exists()) {
          await createUserProfile(result.user, initialRole); // Pass initialRole
          router.push('/onboarding'); // New user goes to onboarding
      } else {
         // Existing user logged in via Google, check if onboarding was completed
         if (userDocSnap.data()?.onboardingComplete) {
              router.push('/'); // Go home if already onboarded
         } else {
              router.push('/onboarding'); // Go to onboarding if not completed
         }
      }
    } catch (err: any) {
      console.error("Google Sign-In Error:", err);
       if (err.code !== 'auth/popup-closed-by-user') {
           setError(err.message || 'Failed to sign in with Google.');
       }
    } finally {
        setIsLoading(false);
    }
  };


  return (
    <div className="container mx-auto flex min-h-[calc(100vh-150px)] items-center justify-center px-4 py-12">
       <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
       >
          <Card className="neumorphism">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Create your Volio Account</CardTitle> {/* Updated Name */}
               {initialRole === 'Organizer' ? (
                    <CardDescription>Sign up to start organizing events!</CardDescription>
               ) : (
                    <CardDescription>Join the community and start volunteering!</CardDescription>
               )}
            </CardHeader>
            <CardContent className="space-y-6">
               {error && (
                 <Alert variant="destructive">
                   <AlertCircle className="h-4 w-4" />
                   <AlertTitle>Signup Failed</AlertTitle>
                   <AlertDescription>{error}</AlertDescription>
                 </Alert>
               )}

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                   <FormField
                     control={form.control}
                     name="displayName"
                     render={({ field }) => (
                       <FormItem>
                         <FormLabel>Full Name</FormLabel>
                         <FormControl>
                           <Input placeholder="Your Name" {...field} />
                         </FormControl>
                         <FormMessage />
                       </FormItem>
                     )}
                   />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="you@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="•••••••• (min. 6 characters)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Creating Account...' : 'Sign Up'}
                  </Button>
                </form>
              </Form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground"> {/* Changed bg to card */}
                    Or sign up with
                  </span>
                </div>
              </div>

              <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading}>
                   {isLoading ? 'Processing...' : <><GoogleIcon /> Google</>}
              </Button>

               <p className="text-center text-sm text-muted-foreground">
                   Already have an account?{' '}
                   <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
                       Login
                   </Link>
               </p>

            </CardContent>
          </Card>
       </motion.div>
    </div>
  );
}
