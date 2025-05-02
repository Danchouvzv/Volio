'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db, auth } from '@/config/firebase';
import type { Event, UserProfile, Task } from '@/types'; // Import Task type
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Calendar, Users, MessageSquare, CheckSquare, Image as ImageIcon, UserCheck, UserX, AlertCircle, Info, BookOpen, MessageCircle as ChatIcon, Sparkles, PencilSquare, Cloud } from 'lucide-react';
import { Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from 'next/image'; // Use next/image for gallery
import { Badge } from '@/components/ui/badge'; // Import Badge for Top 3 Badges
import { Link } from 'next/navigation';


// Placeholder fetch functions - replace with actual service calls
async function fetchEventDetails(eventId: string): Promise<Event | null> {
    const eventRef = doc(db, 'events', eventId);
    const eventSnap = await getDoc(eventRef);
    if (eventSnap.exists()) {
        // Ensure location is null if undefined, and dates are Timestamps
        const data = eventSnap.data();
        return {
            id: eventSnap.id,
            ...data,
            location: data.location || null, // Handle potential undefined location
            startDate: data.startDate, // Assuming these are already Timestamps
            endDate: data.endDate,
            createdAt: data.createdAt,
            participants: data.participants || [],
        } as Event;
    }
    return null;
}

async function fetchParticipantProfile(userId: string): Promise<UserProfile | null> {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
        return { uid: userSnap.id, ...userSnap.data() } as UserProfile;
    }
    return null;
}

// Placeholder Chat Component
const ChatWindow = ({ eventId }: { eventId: string }) => (
    <Card className="mt-6">
        <CardHeader>
            <CardTitle className="flex items-center"><ChatIcon className="mr-2 h-5 w-5" /> Event Chat</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">Chat functionality placeholder for event {eventId}.</p>
            {/* Add real chat implementation here */}
             <div className="h-64 border rounded p-4 overflow-y-auto mb-4 bg-muted/50">
                 {/* Messages will go here */}
                 <p className="text-sm text-center text-muted-foreground">No messages yet.</p>
             </div>
             <div className="flex gap-2">
                 <Input placeholder="Type your message..." />
                 <Button>Send</Button>
             </div>
        </CardContent>
    </Card>
);
import { Input } from '@/components/ui/input'; // Import Input for chat

// Placeholder Task List Component
const TaskList = ({ tasks, eventId }: { tasks: Task[] | undefined, eventId: string }) => (
    <div className="space-y-4 mt-4">
        <h3 className="text-lg font-semibold flex items-center"><CheckSquare className="mr-2 h-5 w-5" /> Tasks</h3>
        {tasks && tasks.length > 0 ? (
            tasks.map(task => (
                <Card key={task.id} className="p-4 flex justify-between items-center bg-secondary/50">
                    <div>
                        <p className="font-medium">{task.title}</p>
                        {task.description && <p className="text-sm text-muted-foreground">{task.description}</p>}
                    </div>
                    <Badge variant={task.status === 'done' ? 'default' : 'secondary'}>{task.status}</Badge>
                </Card>
            ))
        ) : (
            <p className="text-muted-foreground">No tasks defined for this event yet.</p>
        )}
    </div>
);

// Placeholder Participant List/Management Component
const ParticipantList = ({ participantIds, eventId, organizerId }: { participantIds: string[], eventId: string, organizerId: string }) => {
    const { user } = useAuth();
    const isOrganizer = user?.uid === organizerId;

    // Fetch profiles for participants (consider pagination for large lists)
    const { data: participants, isLoading } = useQuery({
        queryKey: ['eventParticipants', eventId, participantIds],
        queryFn: async () => {
            const profiles = await Promise.all(
                participantIds.map(id => fetchParticipantProfile(id))
            );
            return profiles.filter(p => p !== null) as UserProfile[];
        },
        enabled: participantIds.length > 0,
    });

    // Placeholder badge data - replace with actual fetch
    const getBadgeDetails = (badgeId: string) => ({ id: badgeId, name: `Badge ${badgeId}`, iconUrl: 'https://picsum.photos/seed/badge_icon/20/20' });


    return (
        <div className="space-y-4 mt-4">
            <h3 className="text-lg font-semibold flex items-center"><Users className="mr-2 h-5 w-5" /> Participants ({participantIds.length})</h3>
             {isLoading && <Skeleton className="h-10 w-full" />}
            {participants && participants.length > 0 ? (
                <ul className="space-y-3">
                    {participants.map(p => (
                        <li key={p.uid} className="flex items-center justify-between p-3 border rounded-md bg-secondary/50">
                           <div className="flex items-center gap-3">
                               <Avatar>
                                   <AvatarImage src={p.photoURL || undefined} alt={p.displayName || 'User'} data-ai-hint="person avatar"/>
                                   <AvatarFallback>{p.displayName?.charAt(0) || 'U'}</AvatarFallback>
                               </Avatar>
                                <div>
                                    <span className="font-medium">{p.displayName || 'Anonymous User'}</span>
                                    {/* Display Top 3 Badges */}
                                    {isOrganizer && p.topBadges && p.topBadges.length > 0 && (
                                        <div className="flex gap-1 mt-1">
                                            {p.topBadges.slice(0, 3).map(badgeId => {
                                                const badge = getBadgeDetails(badgeId);
                                                return (
                                                     <TooltipProvider key={badgeId}>
                                                         <Tooltip>
                                                            <TooltipTrigger>
                                                                <Image src={badge.iconUrl} alt={badge.name} width={16} height={16} className="rounded-full"/>
                                                             </TooltipTrigger>
                                                             <TooltipContent>
                                                                 <p>{badge.name}</p>
                                                             </TooltipContent>
                                                         </Tooltip>
                                                     </TooltipProvider>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                           </div>
                            {/* Organizer Actions Placeholder */}
                            {isOrganizer && user?.uid !== p.uid && (
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline" className="text-green-600 border-green-600 hover:bg-green-50"><UserCheck className="h-4 w-4 mr-1"/> Invite</Button>
                                    <Button size="sm" variant="outline" className="text-red-600 border-red-600 hover:bg-red-50"><UserX className="h-4 w-4 mr-1"/> Reject</Button>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            ) : (
                 !isLoading && <p className="text-muted-foreground">No participants yet.</p>
            )}
        </div>
    );
};
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"; // Import Tooltip

export default function EventDetailPage() {
    const params = useParams();
    const eventId = params.eventId as string;
    const { user, loading: authLoading } = useAuth();
    const queryClient = useQueryClient();

    const { data: event, isLoading: eventLoading, error: eventError } = useQuery<Event | null>({
        queryKey: ['eventDetails', eventId],
        queryFn: () => fetchEventDetails(eventId),
        enabled: !!eventId,
    });

    const isLoading = eventLoading || authLoading;

    const isParticipant = user && event?.participants?.includes(user.uid);
    const isOrganizer = user && event?.organizerId === user.uid;

    // Optimistic UI for Join/Leave
    const mutation = useMutation({
        mutationFn: async ({ action }: { action: 'join' | 'leave' }) => {
            if (!user || !event) throw new Error('User or event not loaded');
            const eventRef = doc(db, 'events', event.id);
            await updateDoc(eventRef, {
                participants: action === 'join' ? arrayUnion(user.uid) : arrayRemove(user.uid),
            });
        },
        onMutate: async ({ action }) => {
            // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
            await queryClient.cancelQueries({ queryKey: ['eventDetails', eventId] });

            // Snapshot the previous value
            const previousEvent = queryClient.getQueryData<Event>(['eventDetails', eventId]);

            // Optimistically update to the new value
            if (previousEvent && user) {
                 const newParticipants = action === 'join'
                     ? [...(previousEvent.participants || []), user.uid]
                     : (previousEvent.participants || []).filter(uid => uid !== user.uid);

                 queryClient.setQueryData<Event>(['eventDetails', eventId], {
                    ...previousEvent,
                    participants: newParticipants,
                });
            }

            // Return a context object with the snapshotted value
            return { previousEvent };
        },
        onError: (err, variables, context) => {
            // If the mutation fails, use the context returned from onMutate to roll back
             if (context?.previousEvent) {
                 queryClient.setQueryData(['eventDetails', eventId], context.previousEvent);
             }
            console.error("Error joining/leaving event:", err);
            // TODO: Show toast notification
        },
        onSettled: () => {
            // Always refetch after error or success:
            queryClient.invalidateQueries({ queryKey: ['eventDetails', eventId] });
            queryClient.invalidateQueries({ queryKey: ['eventParticipants', eventId] }); // Invalidate participants list too
        },
    });

    const handleJoinLeave = () => {
        if (!user) {
            // Redirect to login or show message
             console.log("User not logged in");
            return;
        }
        mutation.mutate({ action: isParticipant ? 'leave' : 'join' });
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8 space-y-6">
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-4">
                        <Skeleton className="h-48 w-full" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                    <div className="space-y-4">
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-64 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    if (eventError || !event) {
        return <div className="container mx-auto px-4 py-8 text-center text-destructive">
             <AlertCircle className="mx-auto h-12 w-12 mb-4"/>
             <p>Error loading event details or event not found.</p>
             {eventError && <p className="text-sm">{eventError.message}</p>}
             <Button asChild variant="link" className="mt-4">
                 <Link href="/events">Back to Events</Link>
             </Button>
         </div>;
    }

    // Format dates
    const startDateStr = new Date(event.startDate.seconds * 1000).toLocaleString();
    const endDateStr = new Date(event.endDate.seconds * 1000).toLocaleString();

     // Invited by friend logic (placeholder)
     const invitedByFriendId = user ? event.invitedBy?.[user.uid] : null;
     // Fetch friend's name if invitedByFriendId exists (using another query or pre-fetched data)
     const invitedByFriendName = invitedByFriendId ? `Friend ${invitedByFriendId}` : null; // Placeholder

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="container mx-auto px-4 py-8"
        >
            <Card className="mb-8 overflow-hidden neumorphism">
                {/* Optional Header Image/Gallery */}
                 {event.gallery && event.gallery.length > 0 && (
                    <div className="relative h-48 md:h-64 w-full">
                         <Image
                             src={event.gallery[0]} // Show first image for now
                             alt={`${event.title} gallery image`}
                             layout="fill"
                             objectFit="cover"
                             data-ai-hint="event photo community"
                         />
                    </div>
                 )}
                <CardHeader className="pt-6">
                    <CardTitle className="text-3xl md:text-4xl font-bold">{event.title}</CardTitle>
                    <CardDescription className="flex flex-wrap items-center gap-x-4 gap-y-1 text-md pt-2">
                        <span className="flex items-center"><Calendar className="mr-1.5 h-4 w-4 text-muted-foreground" /> {startDateStr} - {endDateStr}</span>
                        {event.location && (
                            <span className="flex items-center"><MapPin className="mr-1.5 h-4 w-4 text-muted-foreground" /> {event.location.address || 'Location on map'}</span>
                        )}
                        {event.isOnline && <span className="flex items-center"><Cloud className="mr-1.5 h-4 w-4 text-muted-foreground" /> Online Event</span>}
                         <span className="flex items-center"><Users className="mr-1.5 h-4 w-4 text-muted-foreground" /> {event.participants?.length || 0} participants</span>
                    </CardDescription>
                     {invitedByFriendName && (
                        <Badge variant="secondary" className="mt-2 w-fit">
                           <UserCheck className="h-4 w-4 mr-1" /> Invited by {invitedByFriendName}
                        </Badge>
                     )}
                </CardHeader>
                <CardContent>
                     {/* Join/Leave Button */}
                     <Button
                         onClick={handleJoinLeave}
                         disabled={mutation.isPending || !user} // Disable if mutating or not logged in
                         className={`w-full md:w-auto mb-6 ${isParticipant ? 'bg-destructive hover:bg-destructive/90' : ''}`}
                     >
                         {mutation.isPending ? 'Processing...' : isParticipant ? 'Leave Event' : 'Join Event'}
                     </Button>

                      {/* Tabs for Details, Participants, Tasks, Chat */}
                      <Tabs defaultValue="details" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-4">
                           <TabsTrigger value="details"><Info className="mr-1 h-4 w-4 md:hidden"/> Details</TabsTrigger>
                           <TabsTrigger value="participants"><Users className="mr-1 h-4 w-4 md:hidden"/> Participants</TabsTrigger>
                           <TabsTrigger value="tasks"><CheckSquare className="mr-1 h-4 w-4 md:hidden"/> Tasks</TabsTrigger>
                            <TabsTrigger value="chat"><ChatIcon className="mr-1 h-4 w-4 md:hidden"/> Chat</TabsTrigger>
                           {event.gallery && event.gallery.length > 0 && <TabsTrigger value="gallery"><ImageIcon className="mr-1 h-4 w-4 md:hidden"/> Gallery</TabsTrigger>}
                         </TabsList>

                         <TabsContent value="details">
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                 <div className="md:col-span-2 space-y-6">
                                     <div>
                                         <h3 className="text-xl font-semibold mb-2 flex items-center"><BookOpen className="mr-2 h-5 w-5" /> Description</h3>
                                         <p className="text-muted-foreground whitespace-pre-wrap">{event.description || 'No description provided.'}</p>
                                     </div>
                                      {event.requiredBadges && event.requiredBadges.length > 0 && (
                                        <div>
                                            <h3 className="text-lg font-semibold mb-2">Required Badges</h3>
                                             <div className="flex flex-wrap gap-2">
                                                  {event.requiredBadges.map(badgeId => {
                                                      const badge = getBadgeDetails(badgeId);
                                                      return <Badge key={badgeId} variant="outline">{badge.name}</Badge>
                                                  })}
                                             </div>
                                        </div>
                                      )}
                                      {/* Organizer Info - Placeholder */}
                                       <div>
                                            <h3 className="text-lg font-semibold mb-2">Organizer</h3>
                                            <p className="text-muted-foreground">{event.organizerName || `User ID: ${event.organizerId}`}</p>
                                            {/* Fetch and display organizer details */}
                                       </div>

                                 </div>
                                 <div className="md:col-span-1">
                                      {event.location && (
                                        <div className="h-64 rounded-lg overflow-hidden border shadow-sm">
                                           <Map
                                                mapId={`event-${eventId}-map`}
                                                style={{ width: '100%', height: '100%' }}
                                                defaultCenter={event.location}
                                                defaultZoom={14}
                                                gestureHandling={'greedy'}
                                                disableDefaultUI={true}
                                            >
                                               <AdvancedMarker position={event.location}>
                                                   <Pin />
                                               </AdvancedMarker>
                                            </Map>
                                         </div>
                                      )}
                                  </div>
                             </div>
                         </TabsContent>

                         <TabsContent value="participants">
                             <ParticipantList participantIds={event.participants || []} eventId={eventId} organizerId={event.organizerId}/>
                         </TabsContent>

                         <TabsContent value="tasks">
                             <TaskList tasks={event.tasks} eventId={eventId} />
                         </TabsContent>

                         <TabsContent value="chat">
                             <ChatWindow eventId={eventId} />
                         </TabsContent>

                         {event.gallery && event.gallery.length > 0 && (
                           <TabsContent value="gallery">
                                <h3 className="text-lg font-semibold mb-4 flex items-center"><ImageIcon className="mr-2 h-5 w-5" /> Gallery</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {event.gallery.map((imgUrl, index) => (
                                        <motion.div
                                            key={index}
                                            className="relative aspect-square rounded-lg overflow-hidden shadow-md neumorphism"
                                            whileHover={{ scale: 1.03 }}
                                        >
                                            <Image
                                                 src={imgUrl}
                                                 alt={`Event gallery image ${index + 1}`}
                                                 layout="fill"
                                                 objectFit="cover"
                                                 data-ai-hint="event photo community group"
                                            />
                                        </motion.div>
                                    ))}
                                </div>
                           </TabsContent>
                         )}
                    </Tabs>

                    {/* Event actions for organizers */}
                    {isOrganizer && (
                      <div className="mt-4 space-y-2">
                        <Button 
                          variant="outline" 
                          className="w-full justify-start" 
                          asChild
                        >
                          <Link href={`/events/${eventId}/edit`}>
                            <PencilSquare className="h-4 w-4 mr-2" /> 
                            Edit Event
                          </Link>
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full justify-start" 
                          asChild
                        >
                          <Link href={`/events/${eventId}/tasks`}>
                            <CheckSquare className="h-4 w-4 mr-2" /> 
                            Manage Tasks
                          </Link>
                        </Button>
                        <Button 
                          variant="default" 
                          className="w-full justify-start" 
                          asChild
                        >
                          <Link href={`/events/${eventId}/candidates`}>
                            <Sparkles className="h-4 w-4 mr-2" /> 
                            Smart Match
                          </Link>
                        </Button>
                      </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}
