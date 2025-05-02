'use client';

import React from 'react';
import { FeatureCard } from './FeatureCard';
import { MapPin, Users, BadgeCheck, LucideProps } from 'lucide-react';

interface Feature {
  icon: React.ElementType<LucideProps>;
  title: string;
  copy: string;
  accentColor?: string;
}

const featuresData: Feature[] = [
  { icon: MapPin, title: 'Dynamic Map View', copy: 'Find events near you with our interactive map and powerful filters.', accentColor: 'text-primary' }, // Volio Green
  { icon: Users, title: 'Connect & Collaborate', copy: 'Build your network, chat with friends, and join event discussions.', accentColor: 'text-destructive' }, // Alert/Secondary Red
  { icon: BadgeCheck, title: 'Earn Badges', copy: 'Showcase your skills and contributions with unique QR-enabled badges.', accentColor: 'text-accent' }, // Accent Yellow
];

export function FeaturesGrid() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          {featuresData.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              copy={feature.copy}
              accentColor={feature.accentColor}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/*
Note: This component is created as per the roadmap, but for the current
landing page structure in page.tsx, the FeatureCard components are rendered
directly within the page for simplicity. This FeaturesGrid component
can be used if you prefer to encapsulate the grid logic.
*/
