import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format distance in kilometers or meters
 * @param distance Distance in kilometers
 * @param locale Language code (en, ru, kz)
 * @returns Formatted distance string
 */
export function formatDistance(distance: number, locale = 'en'): string {
  if (distance < 0.1) {
    // Convert to meters for very small distances
    const meters = Math.round(distance * 1000);
    
    switch (locale) {
      case 'ru':
        return `${meters} м`;
      case 'kz':
        return `${meters} м`;
      default: // en
        return `${meters} m`;
    }
  } else if (distance < 1) {
    // Use one decimal place for distances less than 1 km
    const formattedDistance = distance.toFixed(1);
    
    switch (locale) {
      case 'ru':
        return `${formattedDistance} км`;
      case 'kz':
        return `${formattedDistance} км`;
      default: // en
        return `${formattedDistance} km`;
    }
  } else {
    // Round to nearest integer for distances >= 1 km
    const formattedDistance = Math.round(distance);
    
    switch (locale) {
      case 'ru':
        return `${formattedDistance} км`;
      case 'kz':
        return `${formattedDistance} км`;
      default: // en
        return `${formattedDistance} km`;
    }
  }
}
