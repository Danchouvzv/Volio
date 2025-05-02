'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarCheck, History, Users, Newspaper, Edit, BadgeCheck, QrCode, UserPlus, UserCheck as UserCheckIcon, UserX, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from '@/components/ui/separator'; // Import Separator

// Placeholder data - replace with actual data fetching via React Query
const activeEventsPlaceholder = [
    { id: 'event1', title: 'Park Cleanup Day', description: 'Upcoming event.' },
];
const pastEventsPlaceholder = [
    { id: 'event2', title: 'Charity Run', description: "Earned 'Runner' badge." },
];
const friendsPlaceholder = [
  { uid: 'friend1', displayName: 'Alice Smith', photoURL: 'https://picsum.photos/seed/alice/40/40', mutual: 5 },
  { uid: 'friend2', displayName: 'Bob Johnson', photoURL: 'https://picsum.photos/seed/bob/40/40', mutual: 2 },
];
const feedPlaceholder = [
    { id: 'feed1', timestamp: 'June 10, 2024', title: "You joined 'Community Cleanup Drive'." },
    { id: 'feed2', timestamp: 'June 8, 2024', title: 'You became friends with Alice Smith.' },
];


// --- Reusable Components for Tabs ---

// Active Events Card
const ActiveEventCard = ({ event }: { event: { id: string, title: string, description: string } }) => (
    <Card className="neumorphism">
        <CardHeader><CardTitle>{event.title}</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground">{event.description}</p></CardContent>
        <CardFooter><Button variant="link" asChild><Link href={`/events/${event.id}`}>View Details</Link></Button></CardFooter>
    </Card>
);

// Past Events Card
const PastEventCard = ({ event }: { event: { id: string, title: string, description: string } }) => (
    <Card className="neumorphism">
        <CardHeader><CardTitle>Completed: {event.title}</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground">{event.description}</p></CardContent>
        <CardFooter><Button variant="link" asChild><Link href="#">View Report</Link></Button></CardFooter> {/* Link to report if available */}
    </Card>
);

// Friend Item Card (Now used within the profile page)
const FriendItemCard = ({ user }: { user: any }) => {
    // Placeholder actions - replace with actual logic from friend services
    const handleRemoveFriend = () => console.log(`Removing friend ${user.uid}`);
    const handleSendMessage = () => console.log(`Messaging friend ${user.uid}`);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Card className="flex items-center justify-between p-3 md:p-4 neumorphism-inset">
                <div className="flex items-center gap-3 overflow-hidden">
                    <Avatar>
                        <AvatarImage src={user.photoURL || undefined} alt={user.displayName} data-ai-hint="person avatar"/>
                        <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{user.displayName}</p>
                        {user.mutual > 0 && <p className="text-xs text-muted-foreground">{user.mutual} mutual friends</p>}
                    </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={handleSendMessage}>
                                    <MessageSquare className="h-4 w-4"/>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Message</p></TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={handleRemoveFriend} className="text-destructive hover:bg-destructive/10">
                                    <UserX className="h-4 w-4"/>
                                </Button>
                             </TooltipTrigger>
                             <TooltipContent><p>Remove Friend</p></TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    {/* Optional: Keep View Profile button if it links to a public version */}
                    {/* <Button variant="outline" size="sm" asChild>
                        <Link href={`/profile/${user.uid}`}>View Profile</Link>
                    </Button> */}
                </div>
            </Card>
        </motion.div>
    );
};

// Feed Item Card
const FeedItemCard = ({ item }: { item: { id: string, timestamp: string, title: string } }) => (
    <Card className="neumorphism">
        <CardHeader className="p-4">
            <CardDescription className="text-xs text-muted-foreground">{item.timestamp}</CardDescription>
            <CardTitle className="text-base">{item.title}</CardTitle>
        </CardHeader>
    </Card>
);


// Badges Section (with QR code logic)
const BadgesSection = ({ topBadges }: { topBadges?: string[] }) => {
     // Placeholder fetch/map badge details
     const badges = (topBadges && topBadges.length > 0 ? topBadges : ['badge1', 'badge2', 'badge3']).slice(0, 3).map(id => ({ // Show max 3, use placeholders if empty
         id,
         name: `Badge ${id.slice(-1)}`,
         iconUrl: `https://picsum.photos/seed/${id}/64/64`,
         qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=volio://profile/user123/badge/${id}` // Example QR URL
     }));
    const [selectedBadgeQR, setSelectedBadgeQR] = useState<string | null>(null);

     return (
         <div className="mt-6">
             <h3 className="text-lg font-semibold mb-3 flex items-center"><BadgeCheck className="mr-2 h-5 w-5 text-accent"/> Top Badges</h3>
              {(!topBadges || topBadges.length === 0) && (
                  <p className="text-muted-foreground text-sm">
                    You haven't selected your top badges yet.
                    <Button variant="link" className="p-0 h-auto ml-1" asChild><Link href="/profile/edit">Select Top 3</Link></Button>
                  </p>
              )}
             <div className={`grid ${badges.length > 0 ? 'grid-cols-3' : ''} gap-4`}>
                 {badges.map(badge => (
                     <motion.div
                         key={badge.id}
                         className="text-center cursor-pointer p-2 rounded-lg hover:bg-accent/10 neumorphism"
                         whileHover={{ scale: 1.05 }}
                         onClick={() => setSelectedBadgeQR(selectedBadgeQR === badge.qrCodeUrl ? null : badge.qrCodeUrl)}
                     >
                         <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                     <Image src={badge.iconUrl} alt={badge.name} width={64} height={64} className="mx-auto mb-2 rounded-full shadow-sm border-2 border-transparent group-hover:border-accent transition-colors" data-ai-hint="badge achievement award"/>
                                </TooltipTrigger>
                                <TooltipContent><p>{badge.name}</p></TooltipContent>
                            </Tooltip>
                         </TooltipProvider>
                         {/* <p className="text-xs font-medium">{badge.name}</p> */}
                         <QrCode className={`h-4 w-4 mx-auto mt-1 transition-colors ${selectedBadgeQR === badge.qrCodeUrl ? 'text-primary' : 'text-muted-foreground'}`} />
                     </motion.div>
                 ))}
             </div>
              {/* Display QR Code */}
              {selectedBadgeQR && (
                 <motion.div
                     initial={{ opacity: 0, height: 0 }}
                     animate={{ opacity: 1, height: 'auto' }}
                     exit={{ opacity: 0, height: 0 }}
                     className="mt-6 text-center bg-card p-4 rounded-lg border shadow-sm neumorphism-inset"
                 >
                     <h4 className="text-md font-semibold mb-2">Badge QR Code</h4>
                     <Image src={selectedBadgeQR} alt="Badge QR Code" width={150} height={150} className="mx-auto rounded border" />
                     <p className="text-xs text-muted-foreground mt-2">Scan to view profile and leave feedback.</p>
                     <Button variant="ghost" size="sm" className="mt-2" onClick={() => setSelectedBadgeQR(null)}>Close QR</Button>
                 </motion.div>
              )}
         </div>
     );
};

// Friends Section (Moved from tab content)
const FriendsSection = () => (
    <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold flex items-center"><Users className="mr-2 h-5 w-5"/> Friends</h3>
            <Button variant="outline" size="sm" asChild>
                <Link href="/find-friends"> {/* Link to a potential find friends page */}
                    <UserPlus className="mr-2 h-4 w-4"/> Find Friends
                </Link>
            </Button>
        </div>
        <div className="space-y-4">
           {/* TODO: Replace with actual friend data mapping */}
           {friendsPlaceholder.length > 0 ? (
                friendsPlaceholder.map(friend => <FriendItemCard key={friend.uid} user={friend} />)
           ) : (
              <p className="text-center text-muted-foreground py-4">You haven't added any friends yet.</p>
           )}
        </div>
    </div>
);


export default function ProfilePage() {
  const { user, userProfile, loading } = useAuth();
  // TODO: Fetch actual data for events, feed using useQuery

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="space-y-2 pt-2 flex-1">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-9 w-24 rounded-md" />
        </div>
         <Skeleton className="h-10 w-full md:w-3/4 rounded-lg mb-6" /> {/* Tabs skeleton */}
         <div className="mt-8 space-y-4">
             <Skeleton className="h-24 w-full rounded-lg" />
             <Skeleton className="h-24 w-full rounded-lg" />
         </div>
      </div>
    );
  }

  if (!user || !userProfile) {
    // Optional: Redirect to login or show a message
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Please log in to view your profile.</p>
        <Button asChild className="mt-4">
          <Link href="/login">Login</Link>
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 py-8"
    >
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
        <Avatar className="h-24 w-24 border-2 border-primary neumorphism">
          <AvatarImage src={userProfile.photoURL || undefined} alt={userProfile.displayName || 'User'} data-ai-hint="person avatar"/>
          <AvatarFallback className="text-3xl">
            {userProfile.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 text-center md:text-left pt-2">
          <h1 className="text-2xl md:text-3xl font-bold">{userProfile.displayName || 'Anonymous User'}</h1>
          <p className="text-muted-foreground">{userProfile.email}</p>
           <p className="text-sm text-muted-foreground mt-1">{userProfile.bio || 'No bio yet.'}</p>
          <Badge variant="secondary" className="mt-2">{userProfile.role}</Badge>
        </div>
        <Button variant="outline" size="sm" asChild className="flex-shrink-0">
          <Link href="/profile/edit">
            <Edit className="mr-2 h-4 w-4" /> Edit Profile
          </Link>
        </Button>
      </div>

        {/* Badges Section */}
       <BadgesSection topBadges={userProfile.topBadges} />

      {/* Tabs for Events & Feed */}
      <Tabs defaultValue="active" className="mt-12">
        <TabsList className="grid w-full grid-cols-3"> {/* Changed to 3 columns */}
          <TabsTrigger value="active"><CalendarCheck className="mr-1 h-4 w-4 md:hidden"/> Active Events</TabsTrigger>
          <TabsTrigger value="past"><History className="mr-1 h-4 w-4 md:hidden"/> Past Events</TabsTrigger>
          {/* Removed Friends Trigger */}
          <TabsTrigger value="feed"><Newspaper className="mr-1 h-4 w-4 md:hidden"/> Feed</TabsTrigger>
        </TabsList>

        {/* Active Events Tab */}
        <TabsContent value="active" className="mt-6">
           <div className="space-y-4">
               {/* TODO: Replace with actual data mapping */}
               {activeEventsPlaceholder.length > 0 ? (
                   activeEventsPlaceholder.map(event => <ActiveEventCard key={event.id} event={event} />)
               ) : (
                   <p className="text-muted-foreground text-center pt-4">No active events found.</p>
               )}
           </div>
        </TabsContent>

         {/* Past Events Tab */}
        <TabsContent value="past" className="mt-6">
           <div className="space-y-4">
               {/* TODO: Replace with actual data mapping */}
               {pastEventsPlaceholder.length > 0 ? (
                   pastEventsPlaceholder.map(event => <PastEventCard key={event.id} event={event} />)
               ) : (
                   <p className="text-muted-foreground text-center pt-4">No past event history.</p>
               )}
           </div>
        </TabsContent>

         {/* Removed Friends Tab Content */}

         {/* Feed Tab */}
        <TabsContent value="feed" className="mt-6">
           <div className="space-y-4">
               {/* TODO: Replace with actual feed data mapping */}
               {feedPlaceholder.length > 0 ? (
                   feedPlaceholder.map(item => <FeedItemCard key={item.id} item={item} />)
               ) : (
                   <p className="text-muted-foreground text-center pt-4">Your activity feed is empty.</p>
               )}
           </div>
        </TabsContent>
      </Tabs>

      {/* Friends Section (Displayed below tabs) */}
      <Separator className="my-12" /> {/* Add separator */}
      <FriendsSection />

    </motion.div>
  );
}
