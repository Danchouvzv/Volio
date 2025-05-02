'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, db } from '@/config/firebase'; // Import db
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'; // Import Firestore functions
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { motion } from 'framer-motion';
import type { UserProfile } from '@/types'; // Import UserProfile type
import { useAuth } from '@/context/AuthContext'; // Import useAuth

// SVG for Google Icon
const GoogleIcon = () => (
  <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
    <path fill="currentColor" d="M488 261.8C488 403.3 381.7 512 244 512 109.8 512 0 402.2 0 261.8S109.8 11.6 244 11.6C318.3 11.6 375 37.5 414.9 72.8L361.7 124.1C336.9 101.7 301.1 85.3 244 85.3 155.1 85.3 82.9 155.7 82.9 244.8S155.1 404.3 244 404.3c90.3 0 126.1-46.7 131.1-70.3H244V261.8h244z"></path>
  </svg>
);


const loginFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, demoSignIn } = useAuth(); // Use AuthContext instead

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Function to check and create user profile if it doesn't exist
  const checkAndCreateUserProfile = async (user: import('firebase/auth').User) => {
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
          // Create a basic profile - Role 'Volunteer' is default
          const newUserProfile: Omit<UserProfile, 'uid'> = {
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              role: 'Volunteer', // Default role
              createdAt: serverTimestamp() as any, // Use serverTimestamp
              interests: [],
              bio: '',
              topBadges: [],
          };
          try {
              await setDoc(userDocRef, newUserProfile);
              console.log('New user profile created in Firestore for:', user.uid);
          } catch (firestoreError) {
              console.error('Error creating user profile in Firestore:', firestoreError);
              // Handle Firestore error (e.g., show a specific message)
          }
      }
  };


  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);
    setError(null);
    try {
      await signIn(data.email, data.password);
      router.push('/'); // Go to home page after login
    } catch (err: any) {
      console.error("Login Error:", err);
      setError(err.message || 'Failed to log in. Please check your credentials.');
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
      await checkAndCreateUserProfile(result.user); // Check/create profile
       // Redirect based on role or to a default page (similar logic as email/pass)
       const userProfileSnap = await getDoc(doc(db, 'users', result.user.uid));
       if (userProfileSnap.exists() && userProfileSnap.data()?.onboardingComplete) {
            router.push('/');
       } else {
            router.push('/onboarding');
       }
    } catch (err: any) {
      console.error("Google Sign-In Error:", err);
      // Handle specific errors like 'auth/popup-closed-by-user'
      if (err.code !== 'auth/popup-closed-by-user') {
          setError(err.message || 'Failed to sign in with Google.');
      }
    } finally {
        setIsLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await demoSignIn();
      router.push('/'); // Go to home page after demo login
    } catch (err: any) {
      console.error("Demo Login Error:", err);
      setError(err.message || 'Failed to log in with demo account.');
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
              <CardTitle className="text-2xl">Login to Volio</CardTitle> {/* Updated Name */}
              <CardDescription>Enter your credentials or use Google</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
               {error && (
                 <Alert variant="destructive">
                   <AlertCircle className="h-4 w-4" />
                   <AlertTitle>Login Failed</AlertTitle>
                   <AlertDescription>{error}</AlertDescription>
                 </Alert>
               )}

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                         <div className="text-right text-sm">
                             <Link href="/forgot-password" className="text-muted-foreground hover:text-primary underline-offset-4 hover:underline">
                                Forgot password?
                             </Link>
                         </div>
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Logging in...' : 'Login'}
                  </Button>
                </form>
              </Form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground"> {/* Changed bg to card */}
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading}>
                    {isLoading ? 'Processing...' : <><GoogleIcon /> Google</>}
                </Button>
                
                {/* Demo Login Button */}
                {process.env.NODE_ENV === 'development' && (
                  <Button variant="outline" className="w-full" onClick={handleDemoSignIn} disabled={isLoading}>
                    {isLoading ? 'Processing...' : 'Demo Account'}
                  </Button>
                )}
              </div>

               <p className="text-center text-sm text-muted-foreground">
                   Don't have an account?{' '}
                   <Link href="/signup" className="font-medium text-primary underline-offset-4 hover:underline">
                       Sign up
                   </Link>
               </p>

            </CardContent>
          </Card>
       </motion.div>
    </div>
  );
}
