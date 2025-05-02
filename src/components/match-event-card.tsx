import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MatchScore } from '@/components/ui/match-score';
import { CalendarClock, MapPin, Users, Calendar } from 'lucide-react';
import { formatDistance } from 'date-fns';
import type { SmartMatchRecommendation } from '@/types';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface MatchEventCardProps {
  recommendation: SmartMatchRecommendation;
  onJoin: (eventId: string) => void;
  isJoining?: boolean;
  className?: string;
}

export function MatchEventCard({
  recommendation,
  onJoin,
  isJoining = false,
  className
}: MatchEventCardProps) {
  const { event, matchScore, matchFactors } = recommendation;
  
  // Format date for display
  const startDate = event.startDate.toDate();
  const timeFromNow = formatDistance(startDate, new Date(), { addSuffix: true });
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Card className="h-full overflow-hidden border-2 hover:border-primary/50 transition-colors">
        <div className="relative px-4 pt-4 pb-2">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-semibold text-lg line-clamp-1">{event.title}</h3>
              <div className="flex items-center text-muted-foreground text-sm mt-1">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{timeFromNow}</span>
              </div>
            </div>
            
            <MatchScore 
              score={matchScore} 
              size="sm" 
              matchFactors={matchFactors}
              className="ml-2"
            />
          </div>
          
          <div className="mt-3">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {event.description}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge variant="secondary" className="flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              {event.isOnline ? 'Online' : (event.location?.address || 'Unknown location')}
            </Badge>
            
            {event.category && (
              <Badge variant="outline" className="bg-background">
                {event.category}
              </Badge>
            )}
            
            {/* Display required badges if any */}
            {event.requiredBadges && event.requiredBadges.length > 0 && (
              <Badge variant="outline" className="bg-background flex items-center">
                <Users className="h-3 w-3 mr-1" />
                {event.requiredBadges.length} skills needed
              </Badge>
            )}
          </div>
          
          {/* Match details button and tooltip */}
          <div className="mt-4">
            <details className="text-sm">
              <summary className="cursor-pointer font-medium text-primary hover:text-primary/80">
                Why this match?
              </summary>
              <div className="mt-2 p-2 bg-muted/50 rounded-md text-xs">
                <p className="mb-1">Match score: <span className="font-semibold">{matchScore}%</span></p>
                <ul className="space-y-0.5">
                  <li>• Badge match: {Math.round(matchFactors.badgeMatch * 100)}%</li>
                  <li>• Skills match: {Math.round(matchFactors.skillsMatch * 100)}%</li>
                  <li>• Location match: {Math.round(matchFactors.locationMatch * 100)}%</li>
                  <li>• Social match: {Math.round(matchFactors.socialMatch * 100)}%</li>
                  <li>• Interests match: {Math.round(matchFactors.interestsMatch * 100)}%</li>
                </ul>
              </div>
            </details>
          </div>
        </div>
        
        <CardFooter className="p-3 bg-muted/20 border-t">
          <Button 
            className="w-full" 
            onClick={() => onJoin(event.id)}
            disabled={isJoining}
          >
            {isJoining ? 'Joining...' : 'Join Event'}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
} 