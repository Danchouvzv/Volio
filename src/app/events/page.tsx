'use client';

import React, { useState, useEffect } from 'react';
import { Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Filter, MapPin, Cloud, Flag, Star } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { getEvents } from '@/services/events'; // Assume this service exists
import type { Event } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useI18n } from '@/context/I18nContext';

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


export default function EventsPage() {
  const { t } = useI18n();
  const [filters, setFilters] = useState({
    category: 'all',
    location: '', // Will likely become more complex (bounds)
    date: '', // Needs date picker
    isOnline: false,
    isLeague: false,
    isUnofficial: false,
  });
  const [mapCenter, setMapCenter] = useState({ lat: 51.16, lng: 71.43 }); // Default to Astana
  const [mapZoom, setMapZoom] = useState(11);
  const [bounds, setBounds] = useState<google.maps.LatLngBounds | undefined>();

  // Fetch events using React Query
   const { data: events = [], isLoading, error } = useQuery<Event[]>({
       queryKey: ['events', filters], // Refetch when filters change
       queryFn: () => getEvents(filters), // Pass filters to fetch function
       staleTime: 5 * 60 * 1000, // 5 minutes
   });

    // Update map bounds when events data changes
    useEffect(() => {
        if (events.length > 0) {
            const newBounds = getMapBoundsFromEvents(events);
            setBounds(newBounds);
            // Optional: Center map based on bounds, but might cause jarring jumps
            // if (newBounds) {
            //     setMapCenter(newBounds.getCenter().toJSON());
            //     // Calculate zoom based on bounds? More complex logic needed
            // }
        } else {
             setBounds(undefined); // Clear bounds if no events match
             // Maybe reset to default view or keep last view?
        }
    }, [events]);


  const handleFilterChange = (key: keyof typeof filters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const renderMarkerIcon = (event: Event) => {
    if (event.isOnline) return <Cloud className="text-blue-500" />;
    if (event.isLeagueEvent) return <Flag className="text-red-600" />;
    if (event.isSmallOrgEvent) return <Star className="text-yellow-500" />; // Example for Small Org
    return <MapPin className="text-primary" />; // Default
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold mb-8"
      >
        {t('events.discover')}
      </motion.h1>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {/* Filters Section */}
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-1 space-y-6 p-4 border rounded-lg shadow-sm bg-card"
        >
          <h2 className="text-xl font-semibold flex items-center"><Filter className="mr-2 h-5 w-5"/> {t('events.filters')}</h2>
          {/* Category Filter */}
           <div>
             <Label htmlFor="category">{t('events.category')}</Label>
             <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
               <SelectTrigger id="category">
                 <SelectValue placeholder={t('events.allCategories')} />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="all">{t('events.allCategories')}</SelectItem>
                 <SelectItem value="environment">Environment</SelectItem>
                 <SelectItem value="social">Social</SelectItem>
                 <SelectItem value="animals">Animals</SelectItem>
                 <SelectItem value="education">Education</SelectItem>
                 {/* Add more categories */}
               </SelectContent>
             </Select>
           </div>

          {/* Location Filter (Simple Text for now) */}
          <div>
            <Label htmlFor="location">{t('events.location')}</Label>
            <Input
              id="location"
              placeholder={t('events.searchLocation')}
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
            />
             <p className="text-xs text-muted-foreground mt-1">{t('events.mapArea')}</p>
          </div>

           {/* Date Filter Placeholder */}
           <div>
               <Label htmlFor="date">{t('events.date')}</Label>
               {/* Replace with actual Date Picker component */}
               <Input id="date" type="date" placeholder={t('events.datePlaceholder')} onChange={(e) => handleFilterChange('date', e.target.value)} />
           </div>


          {/* Type Filters */}
          <div className="space-y-2">
             <div className="flex items-center space-x-2">
                <Checkbox id="online" checked={filters.isOnline} onCheckedChange={(checked) => handleFilterChange('isOnline', checked)} />
                <Label htmlFor="online">{t('events.online')}</Label>
             </div>
              <div className="flex items-center space-x-2">
                 <Checkbox id="league" checked={filters.isLeague} onCheckedChange={(checked) => handleFilterChange('isLeague', checked)} />
                 <Label htmlFor="league">{t('events.official')}</Label>
              </div>
               <div className="flex items-center space-x-2">
                  <Checkbox id="unofficial" checked={filters.isUnofficial} onCheckedChange={(checked) => handleFilterChange('isUnofficial', checked)} />
                  <Label htmlFor="unofficial">{t('events.unofficial')}</Label>
               </div>
           </div>

          <Button className="w-full" onClick={() => console.log('Applying filters:', filters)}>
            {t('events.applyFilters')}
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
                mapId={'volio-map'} // Optional: for custom styling in Google Cloud Console
                style={{ width: '100%', height: '100%' }}
                defaultCenter={mapCenter}
                defaultZoom={mapZoom}
                gestureHandling={'greedy'}
                disableDefaultUI={true}
                // Fit bounds if they exist
                bounds={bounds}
                onError={() => (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <p>{t('events.mapError')}</p>
                      <p>{t('events.mapErrorOwner')}</p>
                      <Button>{t('events.ok')}</Button>
                    </div>
                  </div>
                )}
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
                             {/* Using Pin for simplicity, replace with custom icons */}
                           <Pin background={event.isOnline ? '#3b82f6' : event.isLeagueEvent ? '#dc2626' : '#008080'} glyphColor={'#fff'} borderColor={'#fff'}>
                              {/* Icon within Pin or use glyph property */}
                              {/* {renderMarkerIcon(event)}  This might not render correctly inside Pin directly */}
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
                     <Skeleton className="h-32 w-full rounded-lg" />
                 </>
              )}
              {error && <p className="text-destructive">Error loading events: {error.message}</p>}
               {!isLoading && !error && events.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">{t('events.noEventsFound')}</p>
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
                        <CardTitle>{event.title}</CardTitle>
                        <CardDescription>
                          {event.isOnline ? t('events.online') : event.location?.address || 'Location TBD'}
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
