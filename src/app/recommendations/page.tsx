'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRecommendedEvents } from '@/hooks/useSmartMatch';
import { MatchEventCard } from '@/components/match-event-card';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { 
  Award, 
  Calendar, 
  Filter, 
  MapPin, 
  Search,
  SlidersHorizontal, 
  X,
  Sparkles 
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
  SheetFooter
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import { useI18n } from '@/context/I18nContext';

export default function RecommendationsPage() {
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('match');
  
  // Filters state
  const [filters, setFilters] = useState({
    minMatchScore: 0,
    maxDistance: 50,
    categories: [] as string[],
    skillsRequired: [] as string[],
    dateRange: 'all' as 'today' | 'week' | 'month' | 'all'
  });
  
  // Get recommended events using the hook
  const { 
    recommendedEvents, 
    isLoading, 
    error, 
    joinEvent, 
    isJoining,
    refetch 
  } = useRecommendedEvents(20);
  
  // Apply filters and search
  const filteredEvents = recommendedEvents
    ? recommendedEvents
        .filter(rec => {
          // Filter by search query
          if (searchQuery && !rec.event.title.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
          }
          
          // Filter by match score
          if (rec.matchScore < filters.minMatchScore) {
            return false;
          }
          
          // Filter by category
          if (activeFilter !== 'all' && rec.event.category !== activeFilter) {
            return false;
          }
          
          return true;
        })
        .sort((a, b) => {
          // Sort events
          if (sortBy === 'match') {
            return b.matchScore - a.matchScore;
          } else if (sortBy === 'date') {
            return a.event.startDate.toDate().getTime() - b.event.startDate.toDate().getTime();
          }
          return 0;
        })
    : [];
  
  // Handle joining an event
  const handleJoinEvent = (eventId: string) => {
    joinEvent(eventId);
    toast.success('Successfully joined the event!');
  };
  
  // Get unique categories for filtering
  const categories = recommendedEvents
    ? [...new Set(recommendedEvents.map(rec => rec.event.category).filter(Boolean))]
    : [];
  
  return (
    <main className="container max-w-7xl mx-auto px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Sparkles className="h-6 w-6 mr-2 text-primary" />
              {t('smartMatch.title')}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t('smartMatch.subtitle')}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('smartMatch.bestMatch')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="match">{t('smartMatch.bestMatch')}</SelectItem>
                <SelectItem value="date">Earliest Date</SelectItem>
              </SelectContent>
            </Select>
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  {t('smartMatch.filters')}
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>{t('smartMatch.filters')}</SheetTitle>
                  <SheetDescription>
                    Customize your event recommendations
                  </SheetDescription>
                </SheetHeader>
                
                <div className="py-6 space-y-6">
                  <div className="space-y-2">
                    <Label>Minimum Match Score: {filters.minMatchScore}%</Label>
                    <Slider 
                      value={[filters.minMatchScore]} 
                      min={0} 
                      max={100} 
                      step={5}
                      onValueChange={(values) => setFilters({...filters, minMatchScore: values[0]})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Maximum Distance: {filters.maxDistance} km</Label>
                    <Slider 
                      value={[filters.maxDistance]} 
                      min={1} 
                      max={100} 
                      step={1}
                      onValueChange={(values) => setFilters({...filters, maxDistance: values[0]})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Date Range</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {(['today', 'week', 'month', 'all'] as const).map((range) => (
                        <Button 
                          key={range} 
                          variant={filters.dateRange === range ? "default" : "outline"} 
                          size="sm"
                          onClick={() => setFilters({...filters, dateRange: range})}
                        >
                          {range.charAt(0).toUpperCase() + range.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
                
                <SheetFooter>
                  <SheetClose asChild>
                    <Button onClick={() => refetch()}>{t('events.applyFilters')}</Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder={t('smartMatch.searchPlaceholder')} 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
              {searchQuery && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" 
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-2 w-full sm:w-auto">
              <Button
                variant={activeFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter('all')}
              >
                {t('smartMatch.all')}
              </Button>
              
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={activeFilter === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveFilter(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[380px] w-full" />
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-500">Error loading recommendations</p>
            <Button onClick={() => refetch()} className="mt-4">Retry</Button>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-medium">No matching events found</h3>
            <p className="text-muted-foreground mt-2">
              Try adjusting your filters or check back later for new opportunities
            </p>
            <Button onClick={() => {
              setSearchQuery('');
              setActiveFilter('all');
              setFilters({...filters, minMatchScore: 0});
            }} variant="outline" className="mt-6">
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((recommendation) => (
              <MatchEventCard
                key={recommendation.event.id}
                recommendation={recommendation}
                onJoin={handleJoinEvent}
                isJoining={isJoining === recommendation.event.id}
              />
            ))}
          </div>
        )}
      </motion.div>
    </main>
  );
} 