import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MatchScore } from '@/components/ui/match-score';
import { MapPin, Award, Calendar, UserCheck, MailCheck } from 'lucide-react';
import type { SmartMatchCandidate } from '@/types';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface MatchCandidateCardProps {
  candidate: SmartMatchCandidate;
  onInvite: (userId: string) => void;
  isInviting?: boolean;
  className?: string;
}

export function MatchCandidateCard({
  candidate,
  onInvite,
  isInviting = false,
  className
}: MatchCandidateCardProps) {
  const { user, userProfile, matchScore, matchFactors } = candidate;
  
  // Get user initials for avatar fallback
  const getInitials = () => {
    if (!userProfile.displayName) return 'U';
    return userProfile.displayName
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
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
            <div className="flex items-center">
              <Avatar className="h-10 w-10 mr-3">
                <AvatarImage src={userProfile.photoURL || ''} />
                <AvatarFallback>{getInitials()}</AvatarFallback>
              </Avatar>
              
              <div>
                <h3 className="font-semibold line-clamp-1">{userProfile.displayName}</h3>
                <div className="flex items-center text-muted-foreground text-sm">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span>{userProfile.location?.city || 'Unknown location'}</span>
                </div>
              </div>
            </div>
            
            <MatchScore 
              score={matchScore} 
              size="sm" 
              matchFactors={matchFactors}
              className="ml-2"
            />
          </div>
          
          {/* User stats and badges */}
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center">
              <UserCheck className="h-4 w-4 mr-1 text-muted-foreground" />
              <span>{userProfile.completedEvents || 0} events</span>
            </div>
            
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
              <span>Joined {new Date(user.metadata.creationTime).getFullYear()}</span>
            </div>
          </div>
          
          {/* User badges */}
          <div className="mt-3">
            <p className="text-sm font-medium mb-1">Skills & Badges:</p>
            <div className="flex flex-wrap gap-1.5">
              {userProfile.badges && userProfile.badges.map((badge, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  <Award className="h-3 w-3 mr-1" />
                  {badge}
                </Badge>
              ))}
              
              {(!userProfile.badges || userProfile.badges.length === 0) && (
                <span className="text-sm text-muted-foreground">No badges yet</span>
              )}
            </div>
          </div>
          
          {/* Match details */}
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
            variant="default" 
            onClick={() => onInvite(user.uid)}
            disabled={isInviting}
          >
            <MailCheck className="h-4 w-4 mr-2" />
            {isInviting ? 'Sending Invite...' : 'Invite to Event'}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
} 