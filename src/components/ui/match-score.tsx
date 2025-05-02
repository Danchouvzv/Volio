import React from 'react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { useMatchScoreColor } from '@/hooks/useSmartMatch';
import { Badge } from '@/components/ui/badge';
import { 
  Award, 
  Brain, 
  MapPin, 
  Users, 
  Tag,
  InfoIcon
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface MatchScoreProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showFactors?: boolean;
  matchFactors?: {
    badgeMatch: number;
    skillsMatch: number;
    locationMatch: number;
    socialMatch: number;
    interestsMatch: number;
  };
  className?: string;
}

export function MatchScore({
  score,
  size = 'md',
  showFactors = false,
  matchFactors,
  className
}: MatchScoreProps) {
  const gradientColor = useMatchScoreColor(score);
  
  // Size-based styling
  const sizingClasses = {
    sm: 'h-16 w-16 text-sm',
    md: 'h-20 w-20 text-base',
    lg: 'h-24 w-24 text-lg'
  };
  
  // Score label based on value
  const getScoreLabel = () => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Great';
    if (score >= 40) return 'Good';
    if (score >= 20) return 'Fair';
    return 'Low';
  };
  
  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className={cn(
        "relative rounded-full flex items-center justify-center bg-gradient-to-br", 
        gradientColor,
        sizingClasses[size]
      )}>
        <div className="absolute inset-1 rounded-full bg-background flex items-center justify-center">
          <div className="flex flex-col items-center text-center">
            <span className={cn("font-bold", {
              "text-lg": size === 'sm',
              "text-xl": size === 'md',
              "text-2xl": size === 'lg',
            })}>{score}</span>
            <span className="text-xs text-muted-foreground">match</span>
          </div>
        </div>
      </div>
      
      {showFactors && matchFactors && (
        <div className="mt-3 w-full">
          <div className="grid grid-cols-5 gap-1 mb-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="px-1 flex items-center justify-center">
                    <Award className="h-3 w-3 mr-1" />
                    <span className="text-xs">{Math.round(matchFactors.badgeMatch * 100)}%</span>
                  </Badge>
                </TooltipTrigger>
                <TooltipContent><p>Badge Match</p></TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="px-1 flex items-center justify-center">
                    <Brain className="h-3 w-3 mr-1" />
                    <span className="text-xs">{Math.round(matchFactors.skillsMatch * 100)}%</span>
                  </Badge>
                </TooltipTrigger>
                <TooltipContent><p>Skills Match</p></TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="px-1 flex items-center justify-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span className="text-xs">{Math.round(matchFactors.locationMatch * 100)}%</span>
                  </Badge>
                </TooltipTrigger>
                <TooltipContent><p>Location Match</p></TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="px-1 flex items-center justify-center">
                    <Users className="h-3 w-3 mr-1" />
                    <span className="text-xs">{Math.round(matchFactors.socialMatch * 100)}%</span>
                  </Badge>
                </TooltipTrigger>
                <TooltipContent><p>Social Match</p></TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="px-1 flex items-center justify-center">
                    <Tag className="h-3 w-3 mr-1" />
                    <span className="text-xs">{Math.round(matchFactors.interestsMatch * 100)}%</span>
                  </Badge>
                </TooltipTrigger>
                <TooltipContent><p>Interests Match</p></TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <Progress value={score} className={cn("h-1.5 bg-muted", gradientColor)} />
        </div>
      )}
      
      {!showFactors && (
        <p className={cn(
          "mt-1 font-medium",
          {
            "text-green-600 dark:text-green-400": score >= 80,
            "text-teal-600 dark:text-teal-400": score >= 60 && score < 80,
            "text-blue-600 dark:text-blue-400": score >= 40 && score < 60,
            "text-yellow-600 dark:text-yellow-400": score >= 20 && score < 40,
            "text-red-600 dark:text-red-400": score < 20
          }
        )}>
          {getScoreLabel()}
        </p>
      )}
    </div>
  );
} 