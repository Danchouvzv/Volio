'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { User, Bell, Lock, Globe, CreditCard, Code, Upload, Mail, Phone } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
// TODO: Import necessary services (e.g., updateProfile, updateUserSettings)

// Placeholder components for each settings section
const ProfileSettings = ({ userProfile }: { userProfile: any }) => {
    // TODO: Implement form handling (react-hook-form) and update logic
    return (
        <Card>
            <CardHeader>
                <CardTitle>Profile & Security</CardTitle>
                <CardDescription>Update your personal information and security settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                        <AvatarImage src={userProfile?.photoURL} alt={userProfile?.displayName || 'User'} />
                        <AvatarFallback>{userProfile?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <Button variant="outline" size="sm"><Upload className="mr-2 h-4 w-4" /> Upload Photo</Button>
                     <Button variant="ghost" size="sm" className="text-destructive">Remove</Button>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="displayName">Display Name</Label>
                        <Input id="displayName" defaultValue={userProfile?.displayName || ''} />
                    </div>
                    <div>
                        <Label htmlFor="pronouns">Pronouns (Optional)</Label>
                        <Input id="pronouns" placeholder="e.g., she/her, they/them" defaultValue={userProfile?.pronouns || ''}/>
                    </div>
                </div>
                <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea id="bio" placeholder="Tell us a bit about yourself" defaultValue={userProfile?.bio || ''} className="min-h-[80px]"/>
                </div>
                <div className="space-y-2">
                    <Label>Email</Label>
                    <div className="flex items-center gap-2">
                        <Input value={userProfile?.email || ''} readOnly className="bg-muted/50"/>
                        {/* TODO: Add verification status badge */}
                        <Button variant="outline" size="sm" disabled>Change Email</Button>
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <div className="flex items-center gap-2">
                         <Input placeholder="+1 234 567 8900" defaultValue={userProfile?.phoneNumber || ''}/>
                         <Button variant="outline" size="sm">Verify</Button>
                         {/* TODO: Add MFA toggle */}
                    </div>
                 </div>
                 {/* TODO: Add Password Change Section */}
                 <Button>Save Profile</Button>
            </CardContent>
        </Card>
    );
};

const LocalizationSettings = () => {
     // TODO: Implement state and update logic for language/timezone
     const [language, setLanguage] = useState('en'); // Default or from user prefs
     const [timezone, setTimezone] = useState('UTC'); // Default or from user prefs

    return (
         <Card>
            <CardHeader>
                <CardTitle>Localization</CardTitle>
                <CardDescription>Set your preferred language and time zone.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <Label htmlFor="language">Interface Language</Label>
                     <Select value={language} onValueChange={setLanguage}>
                       <SelectTrigger id="language">
                         <SelectValue placeholder="Select language" />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="en">English</SelectItem>
                         <SelectItem value="ru">Русский</SelectItem>
                         <SelectItem value="kz">Қазақша</SelectItem>
                       </SelectContent>
                     </Select>
                </div>
                 <div>
                     <Label htmlFor="timezone">Time Zone</Label>
                      <Select value={timezone} onValueChange={setTimezone}>
                        <SelectTrigger id="timezone">
                          <SelectValue placeholder="Select time zone" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                           {/* TODO: Populate with actual time zones */}
                           <SelectItem value="UTC">UTC</SelectItem>
                           <SelectItem value="Europe/London">Europe/London</SelectItem>
                           <SelectItem value="America/New_York">America/New York</SelectItem>
                           <SelectItem value="Asia/Almaty">Asia/Almaty</SelectItem>
                        </SelectContent>
                      </Select>
                 </div>
                  {/* TODO: Add Date Format Preference */}
                 <Button>Save Localization</Button>
            </CardContent>
        </Card>
    );
}

const NotificationSettings = () => {
    // TODO: Implement state and update logic
    return (
        <Card>
            <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Manage how you receive updates from Volio.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <h4 className="font-medium text-sm">Push Notifications (Mobile/Web)</h4>
                 <div className="flex items-center justify-between rounded-lg border p-3">
                    <Label htmlFor="push-chat">New Chat Messages</Label>
                    <Switch id="push-chat" />
                 </div>
                  <div className="flex items-center justify-between rounded-lg border p-3">
                     <Label htmlFor="push-events">Event Updates & Reminders</Label>
                     <Switch id="push-events" />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-3">
                      <Label htmlFor="push-friends">Friend Requests</Label>
                      <Switch id="push-friends" />
                  </div>

                  <h4 className="font-medium text-sm pt-4">Email Notifications</h4>
                  <div className="flex items-center justify-between rounded-lg border p-3">
                      <Label htmlFor="email-digest">Email Digest Schedule</Label>
                       <Select defaultValue="weekly">
                         <SelectTrigger id="email-digest" className="w-[180px]">
                           <SelectValue placeholder="Select schedule" />
                         </SelectTrigger>
                         <SelectContent>
                           <SelectItem value="daily">Daily</SelectItem>
                           <SelectItem value="weekly">Weekly</SelectItem>
                           <SelectItem value="off">Off</SelectItem>
                         </SelectContent>
                       </Select>
                  </div>
                 <Button>Save Notifications</Button>
            </CardContent>
        </Card>
    );
};

const PrivacySettings = () => {
    // TODO: Implement state and update logic
    return (
        <Card>
            <CardHeader>
                <CardTitle>Privacy</CardTitle>
                <CardDescription>Control who can see your profile and activity.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <Label htmlFor="profile-visibility">Profile Visibility</Label>
                    <Select defaultValue="public">
                       <SelectTrigger id="profile-visibility">
                         <SelectValue placeholder="Select visibility" />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="public">Public</SelectItem>
                         <SelectItem value="friends">Friends Only</SelectItem>
                         <SelectItem value="private">Only Me</SelectItem>
                       </SelectContent>
                     </Select>
                     <p className="text-xs text-muted-foreground mt-1">Who can view your full profile details.</p>
                </div>
                 <div className="flex items-center justify-between rounded-lg border p-3">
                     <Label htmlFor="hide-activity">Hide My Activity from Feed</Label>
                     <Switch id="hide-activity" />
                 </div>
                  {/* TODO: Add Blocked Users List */}
                 <Button>Save Privacy Settings</Button>
            </CardContent>
        </Card>
    );
};

const BillingSettings = ({ userProfile }: { userProfile: any }) => {
    // Visible only to SmallOrg, Organizer roles etc.
    if (!['SmallOrg', 'Organizer', 'Admin'].includes(userProfile?.role)) {
        return null;
    }

    // TODO: Fetch subscription details from backend/Stripe
    const subscription = { status: 'active', renews: 'July 30, 2024', plan: 'Pro Monthly' }; // Placeholder

    return (
        <Card>
            <CardHeader>
                <CardTitle>Subscription & Billing</CardTitle>
                <CardDescription>Manage your Volio organization subscription.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 {subscription ? (
                     <>
                         <p><strong>Current Plan:</strong> {subscription.plan}</p>
                         <p><strong>Status:</strong> <Badge variant={subscription.status === 'active' ? 'default' : 'destructive'}>{subscription.status}</Badge></p>
                         <p><strong>Renews On:</strong> {subscription.renews}</p>
                         <div className="flex gap-2 pt-2">
                              <Button variant="outline">View Invoices</Button>
                              <Button>Manage Subscription (Stripe)</Button> {/* Links to Stripe Portal */}
                         </div>
                     </>
                 ) : (
                     <>
                         <p className="text-muted-foreground">You do not have an active subscription.</p>
                         <Button>Upgrade to Pro</Button>
                     </>
                 )}
            </CardContent>
        </Card>
    );
};

const DeveloperSettings = ({ userProfile }: { userProfile: any }) => {
     // TODO: Check feature flag or specific role for visibility
     if (userProfile?.role !== 'Admin') return null; // Example: Admin only

     // TODO: Implement API key generation/management and webhook testing
    return (
        <Card>
            <CardHeader>
                <CardTitle>Developer Settings</CardTitle>
                <CardDescription>Manage API keys and webhooks for integrations.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="font-medium">API Keys</p>
                <div className="border rounded p-3 text-muted-foreground">No API keys generated yet.</div>
                 <Button>Generate New API Key</Button>
                 <p className="font-medium pt-4">Webhooks</p>
                 <Input placeholder="Webhook URL for event notifications" />
                 <Button variant="outline">Test Webhook</Button>
            </CardContent>
        </Card>
    );
};


export default function SettingsPage() {
    const { user, userProfile, loading } = useAuth();
    const { toast } = useToast();

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Skeleton className="h-8 w-1/4 mb-6" />
                <div className="flex gap-8">
                    <Skeleton className="h-16 w-48 rounded-lg" /> {/* Tabs Skeleton */}
                    <div className="flex-1 space-y-4">
                         <Skeleton className="h-64 w-full rounded-lg" />
                         <Skeleton className="h-32 w-full rounded-lg" />
                    </div>
                </div>
            </div>
        );
    }

    if (!user || !userProfile) {
        // Should be protected by middleware or redirect in AuthProvider ideally
        return <div className="container mx-auto px-4 py-8 text-center">Please log in to access settings.</div>;
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-5xl">
            <h1 className="text-3xl font-bold mb-8">Settings</h1>
            <Tabs defaultValue="profile" orientation="vertical" className="flex gap-8">
                <TabsList className="flex flex-col h-auto justify-start items-stretch min-w-[180px] bg-transparent p-0 border-r">
                    <TabsTrigger value="profile" className="justify-start px-4 py-2"><User className="mr-2 h-4 w-4"/> Profile & Security</TabsTrigger>
                    <TabsTrigger value="localization" className="justify-start px-4 py-2"><Globe className="mr-2 h-4 w-4"/> Localization</TabsTrigger>
                    <TabsTrigger value="notifications" className="justify-start px-4 py-2"><Bell className="mr-2 h-4 w-4"/> Notifications</TabsTrigger>
                    <TabsTrigger value="privacy" className="justify-start px-4 py-2"><Lock className="mr-2 h-4 w-4"/> Privacy</TabsTrigger>
                    {['SmallOrg', 'Organizer', 'Admin'].includes(userProfile.role) && (
                        <TabsTrigger value="billing" className="justify-start px-4 py-2"><CreditCard className="mr-2 h-4 w-4"/> Subscription</TabsTrigger>
                    )}
                     {/* Conditionally render Developer tab */}
                      {userProfile.role === 'Admin' && (
                           <TabsTrigger value="developer" className="justify-start px-4 py-2"><Code className="mr-2 h-4 w-4"/> Developer</TabsTrigger>
                      )}
                </TabsList>

                <div className="flex-1">
                    <TabsContent value="profile">
                        <ProfileSettings userProfile={userProfile} />
                    </TabsContent>
                    <TabsContent value="localization">
                        <LocalizationSettings />
                    </TabsContent>
                    <TabsContent value="notifications">
                        <NotificationSettings />
                    </TabsContent>
                    <TabsContent value="privacy">
                        <PrivacySettings />
                    </TabsContent>
                    {['SmallOrg', 'Organizer', 'Admin'].includes(userProfile.role) && (
                         <TabsContent value="billing">
                             <BillingSettings userProfile={userProfile} />
                         </TabsContent>
                     )}
                      {userProfile.role === 'Admin' && (
                           <TabsContent value="developer">
                               <DeveloperSettings userProfile={userProfile} />
                           </TabsContent>
                      )}
                </div>
            </Tabs>
        </div>
    );
}
