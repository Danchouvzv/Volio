'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Check, Skeleton } from 'lucide-react';

const interestsList = [
    { id: 'environment', label: 'Environment & Nature' },
    { id: 'social', label: 'Social Causes & Community' },
    { id: 'animals', label: 'Animal Welfare' },
    { id: 'health', label: 'Health & Wellness' },
    { id: 'education', label: 'Education & Mentoring' },
    { id: 'arts', label: 'Arts & Culture' },
    { id: 'tech', label: 'Technology & Open Source' },
    { id: 'emergency', label: 'Emergency Response' },
];

export default function OnboardingPage() {
    const { user, userProfile, loading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Redirect if user is not logged in or already onboarded (optional, might be handled by middleware)
    React.useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
        if (!loading && userProfile?.onboardingComplete) {
             router.push('/'); // Redirect if already completed
        }
    }, [user, userProfile, loading, router]);


    const handleInterestChange = (interestId: string, checked: boolean) => {
        setSelectedInterests(prev =>
            checked
                ? [...prev, interestId]
                : prev.filter(id => id !== interestId)
        );
    };

    const handleCompleteOnboarding = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const userDocRef = doc(db, 'users', user.uid);
            await updateDoc(userDocRef, {
                interests: selectedInterests,
                onboardingComplete: true,
            });
            toast({
                title: "Welcome to Volio!",
                description: "Your profile is set up. Let's find some opportunities!",
                variant: "default" // Use default variant (greenish)
            });
            router.push('/'); // Redirect to home page
        } catch (error) {
            console.error("Error completing onboarding:", error);
            toast({
                title: "Onboarding Error",
                description: "Could not save your preferences. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (loading || !user) {
        // Show a loading state or skeleton
        return (
            <div className="container mx-auto flex min-h-screen items-center justify-center">
                 <Card className="w-full max-w-lg p-8">
                    <Skeleton className="h-8 w-3/4 mb-4" />
                    <Skeleton className="h-4 w-full mb-6" />
                    <div className="space-y-4">
                       {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                    </div>
                    <Skeleton className="h-10 w-full mt-8" />
                 </Card>
            </div>
        );
    }


    return (
        <div className="container mx-auto flex min-h-[calc(100vh-150px)] items-center justify-center px-4 py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-lg"
            >
                <Card className="neumorphism">
                    <CardHeader className="text-center">
                        <Sparkles className="h-12 w-12 mx-auto mb-4 text-accent" />
                        <CardTitle className="text-2xl">Welcome to Volio, {userProfile?.displayName || 'Volunteer'}!</CardTitle>
                        <CardDescription>Let's personalize your experience. Select your interests to find relevant opportunities.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <Label className="text-base font-medium mb-3 block">What are you passionate about?</Label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {interestsList.map(interest => (
                                    <div key={interest.id} className="flex items-center space-x-3 rounded-md border p-3 hover:bg-accent/10 transition-colors">
                                        <Checkbox
                                            id={`interest-${interest.id}`}
                                            checked={selectedInterests.includes(interest.id)}
                                            onCheckedChange={(checked) => handleInterestChange(interest.id, checked ?? false)}
                                        />
                                        <Label
                                            htmlFor={`interest-${interest.id}`}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                                        >
                                            {interest.label}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Optional: Newsletter Signup */}
                         <div className="flex items-center space-x-2 pt-4">
                           <Checkbox id="newsletter" />
                           <Label htmlFor="newsletter" className="text-sm">Subscribe to our weekly opportunities newsletter</Label>
                         </div>


                        <Button
                            onClick={handleCompleteOnboarding}
                            className="w-full"
                            disabled={isLoading || selectedInterests.length === 0}
                        >
                            {isLoading ? 'Saving...' : 'Complete Setup'}
                            {!isLoading && <Check className="ml-2 h-4 w-4" />}
                        </Button>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
