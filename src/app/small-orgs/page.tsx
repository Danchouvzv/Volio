'use client';

import React, { useState, useEffect } from 'react';
import { Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Filter, MapPin, Handshake, Info } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { getEvents } from '@/services/events'; // Reuse or create specific service
import type { Event } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from '@/context/AuthContext'; // To check if user is SmallOrg

// Placeholder for map bounds logic
const getMapBoundsFromEvents = (events: Event[]): google.maps.LatLngBounds | undefined => {
    if (!events || events.length === 0) return undefined;
    const bounds = new google.maps.LatLngBounds();
    events.forEach(event => {
        if (event.location) {
            bounds.extend(new google.maps.LatLng(event.location.lat, event.location.lng));
        }
    });
    return bounds;
};

export default function SmallOrgsPage() {
  const { userProfile } = useAuth();
  const [filters, setFilters] = useState({
    category: 'all',
    location: '',
    date: '',
    isOnline: false,
    // Specific filter for this page:
    isSmallOrgEvent: true, // Always true for this page
  });
  const [mapCenter, setMapCenter] = useState({ lat: 51.16, lng: 71.43 }); // Default to Astana
  const [mapZoom, setMapZoom] = useState(11);
   const [bounds, setBounds] = useState<google.maps.LatLngBounds | undefined>();


  // Fetch events using React Query, filtering for SmallOrg events
   const { data: events = [], isLoading, error } = useQuery<Event[]>({
       queryKey: ['smallOrgEvents', filters], // Unique query key
       queryFn: () => getEvents({ ...filters, isSmallOrgEvent: true }), // Ensure filter is passed
       staleTime: 5 * 60 * 1000, // 5 minutes
   });

    // Update map bounds when events data changes
    useEffect(() => {
        if (events.length > 0) {
            setBounds(getMapBoundsFromEvents(events));
        } else {
            setBounds(undefined);
        }
    }, [events]);

  const handleFilterChange = (key: keyof typeof filters, value: any) => {
     // Prevent changing the isSmallOrgEvent filter
     if (key === 'isSmallOrgEvent') return;
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Placeholder: Check subscription status (replace with actual logic)
   const hasActiveSubscription = userProfile?.role === 'SmallOrg'; // Simplified check

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
      >
        <h1 className="text-3xl font-bold flex items-center"><Handshake className="mr-3 h-8 w-8 text-primary"/> Small Organization Events</h1>
         {userProfile?.role === 'SmallOrg' && (
             <Button asChild>
                 <Link href="/create-event">Create New Event</Link>
             </Button>
         )}
      </motion.div>

       {/* Subscription Info Banner for Small Orgs */}
       {userProfile?.role === 'SmallOrg' && !hasActiveSubscription && (
            <Alert variant="destructive" className="mb-6">
               <Info className="h-4 w-4" />
                <AlertTitle>Subscription Required</AlertTitle>
                 <AlertDescription>
                   Your organization needs an active subscription to publish events in this section.
                   <Button variant="link" className="p-0 h-auto ml-2" asChild>
                       <Link href="/settings/subscription">Manage Subscription</Link>
                   </Button>
                 </AlertDescription>
            </Alert>
       )}
        {userProfile?.role === 'SmallOrg' && hasActiveSubscription && (
            <Alert variant="default" className="mb-6 border-primary">
                <Info className="h-4 w-4 text-primary" />
                <AlertTitle className="text-primary">Subscription Active</AlertTitle>
                <AlertDescription>
                    Your organization can publish events.
                    <Button variant="link" className="p-0 h-auto ml-2" asChild>
                        <Link href="/settings/subscription">Manage Subscription</Link>
                    </Button>
                </AlertDescription>
            </Alert>
        )}


      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {/* Filters Section */}
         <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="md:col-span-1 space-y-6 p-4 border rounded-lg shadow-sm bg-card"
          >
           <h2 className="text-xl font-semibold flex items-center"><Filter className="mr-2 h-5 w-5"/> Filters</h2>
           {/* Category Filter */}
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="environment">Environment</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                   <SelectItem value="health">Health</SelectItem>
                  <SelectItem value="animals">Animals</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                   <SelectItem value="arts">Arts & Culture</SelectItem>
                  {/* Add more relevant categories */}
                </SelectContent>
              </Select>
            </div>

           {/* Location Filter */}
           <div>
             <Label htmlFor="location">Location</Label>
             <Input
               id="location"
               placeholder="Search by city or address"
               value={filters.location}
               onChange={(e) => handleFilterChange('location', e.target.value)}
             />
              <p className="text-xs text-muted-foreground mt-1">Map area filter applied automatically.</p>
           </div>

            {/* Date Filter Placeholder */}
            <div>
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" onChange={(e) => handleFilterChange('date', e.target.value)} />
            </div>

           {/* Online Filter */}
           <div className="flex items-center space-x-2">
              <Checkbox id="online" checked={filters.isOnline} onCheckedChange={(checked) => handleFilterChange('isOnline', checked)} />
              <Label htmlFor="online">Online Events Only</Label>
           </div>

           <Button className="w-full" onClick={() => console.log('Applying filters:', filters)}>
             Apply Filters
           </Button>
         </motion.div>

        {/* Events List & Map Section */}
        <div className="md:col-span-2 lg:col-span-3">
            {/* Map View */}
             <motion.div
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="mb-8 h-[400px] md:h-[500px] rounded-lg overflow-hidden shadow-lg border"
             >
              <Map
                 mapId={'volio-smallorg-map'}
                 style={{ width: '100%', height: '100%' }}
                 defaultCenter={mapCenter}
                 defaultZoom={mapZoom}
                 gestureHandling={'greedy'}
                 disableDefaultUI={true}
                 bounds={bounds}
               >
                 <AnimatePresence>
                   {events.map((event) => event.location && (
                      <motion.div
                         key={event.id}
                         initial={{ opacity: 0, scale: 0.5 }}
                         animate={{ opacity: 1, scale: 1 }}
                         exit={{ opacity: 0, scale: 0.5 }}
                         transition={{ duration: 0.3 }}
                      >
                         <AdvancedMarker
                            position={event.location}
                            title={event.title}
                          >
                            <Pin background={'#a855f7'} glyphColor={'#fff'} borderColor={'#fff'}> {/* Purple for Small Orgs */}
                                {/* Custom icon logic here if needed */}
                            </Pin>
                          </AdvancedMarker>
                      </motion.div>
                   ))}
                 </AnimatePresence>
               </Map>
             </motion.div>

          {/* Event List */}
           <div className="space-y-4">
               {isLoading && (
                  <>
                      <Skeleton className="h-32 w-full rounded-lg" />
                      <Skeleton className="h-32 w-full rounded-lg" />
                  </>
               )}
               {error && <p className="text-destructive">Error loading events: {error.message}</p>}
                {!isLoading && !error && events.length === 0 && (
                   <p className="text-center text-muted-foreground py-8">No events found from small organizations matching your criteria.</p>
                )}
               <AnimatePresence>
                 {!isLoading && events.map((event) => (
                   <motion.div
                     key={event.id}
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -20 }}
                     transition={{ duration: 0.3 }}
                   >
                     <Card className="hover:shadow-md transition-shadow neumorphism-inset">
                       <CardHeader>
                          <CardTitle className="flex items-center">
                             {/* Optional: Custom Icon based on event.customIcon */}
                              <Handshake className="mr-2 h-5 w-5 text-purple-500"/> {/* Default Small Org Icon */}
                             {event.title}
                          </CardTitle>
                         <CardDescription>
                            {event.organizerName || 'Small Organization'} {/* Show Org Name */}
                            {' - '}
                           {event.isOnline ? 'Online' : event.location?.address || 'Location TBD'}
                            {' - '} {new Date(event.startDate.seconds * 1000).toLocaleDateString()}
                         </CardDescription>
                       </CardHeader>
                       <CardContent>
                         <p className="text-sm line-clamp-2">{event.description}</p>
                       </CardContent>
                       <CardFooter>
                         <Button asChild variant="link" className="p-0 h-auto">
                            <Link href={`/events/${event.id}`}>View Details</Link>
                         </Button>
                       </CardFooter>
                     </Card>
                   </motion.div>
                 ))}
               </AnimatePresence>
           </div>
        </div>
      </div>
    </div>
  );
}
