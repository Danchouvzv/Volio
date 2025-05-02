'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Linkedin, FileText, Mail, CheckCircle, UserPlus, CalendarCheck, Users, MapPin, BadgeCheck, Handshake } from 'lucide-react'; // Added required icons
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { StatsBar } from '@/app/components/StatsBar';
import { HowItWorks } from '@/app/components/HowItWorks'; // Reuse HowItWorks section

// Placeholder data - replace with actual content
const teamMembers = [
  { name: 'Alice Doe', role: 'Founder & CEO', img: 'https://picsum.photos/seed/alice_doe/100/100', linkedin: '#' },
  { name: 'Bob Smith', role: 'Head of Technology', img: 'https://picsum.photos/seed/bob_smith/100/100', linkedin: '#' },
  { name: 'Charlie Brown', role: 'Community Lead', img: 'https://picsum.photos/seed/charlie_b/100/100', linkedin: '#' },
  // Add more team members
];

const partners = [
  { name: 'Green Future Foundation', logo: 'https://picsum.photos/seed/partner1/150/60?grayscale', url: '#' },
  { name: 'Helping Hands Org', logo: 'https://picsum.photos/seed/partner2/150/60?grayscale', url: '#' },
  { name: 'EduConnect Initiative', logo: 'https://picsum.photos/seed/partner3/150/60?grayscale', url: '#' },
  // Add more partners
];

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center py-16 md:py-24 rounded-lg bg-gradient-to-b from-primary/10 to-transparent mb-16"
      >
         <HeartHandshake className="h-16 w-16 mx-auto mb-6 text-primary" /> {/* Volio Icon */}
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">About Volio</h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
           Volio ― a platform uniting people eager to help with organizations making a difference. We simplify volunteering.
        </p>
        <div className="space-x-4">
          <Button size="lg" asChild>
            <Link href="/signup">Join as Volunteer</Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="border-destructive text-destructive hover:bg-destructive/10">
            <Link href="/partner">Become a Partner</Link>
          </Button>
        </div>
      </motion.section>

      {/* Numbers Section */}
      <StatsBar /> {/* Reuse the stats bar component */}

      {/* How It Works Section */}
      <HowItWorks /> {/* Reuse the How It Works component */}


       {/* Team Section */}
        <section className="py-16">
            <h2 className="text-3xl font-bold text-center mb-12">Our Team</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                {teamMembers.map((member, index) => (
                <motion.div
                    key={member.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    viewport={{ once: true }}
                >
                    <Card className="text-center neumorphism overflow-hidden h-full">
                    <CardHeader className="p-0">
                         <Avatar className="w-24 h-24 mx-auto mt-6 mb-4 border-2 border-primary">
                             <AvatarImage src={member.img} alt={member.name} data-ai-hint="person team member"/>
                             <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                         </Avatar>
                    </CardHeader>
                    <CardContent className="pb-4">
                        <CardTitle className="text-lg mb-1">{member.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mb-3">{member.role}</p>
                        <Button variant="ghost" size="icon" asChild>
                            <a href={member.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${member.name} LinkedIn`}>
                                <Linkedin className="h-5 w-5 text-muted-foreground hover:text-primary"/>
                            </a>
                        </Button>
                    </CardContent>
                    </Card>
                </motion.div>
                ))}
            </div>
       </section>

      {/* Partners Section */}
        <section className="py-16 bg-secondary/50">
            <h2 className="text-3xl font-bold text-center mb-12 text-foreground">Our Partners</h2>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
                {partners.map((partner, index) => (
                <motion.a
                    key={partner.name}
                    href={partner.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="block" // Make the link the container
                >
                    <Image
                        src={partner.logo}
                        alt={partner.name}
                        width={150}
                        height={60}
                        className="opacity-60 hover:opacity-100 transition-opacity"
                        data-ai-hint="organization logo partner"
                    />
                 </motion.a>
                ))}
            </div>
        </section>


       {/* Press Kit & Docs Section */}
        <section className="py-16">
            <h2 className="text-3xl font-bold text-center mb-12">Resources</h2>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto text-center">
                 <Card className="neumorphism p-6 h-full">
                     <FileText className="h-10 w-10 mx-auto mb-4 text-primary"/>
                     <h3 className="text-lg font-semibold mb-2">Press Kit</h3>
                     <p className="text-sm text-muted-foreground mb-4">Download logos, brand guidelines, and media assets.</p>
                     {/* Replace with actual link when available */}
                     <Button variant="outline" asChild><a href="/volio-press-kit.zip" download>Download Kit</a></Button>
                 </Card>
                 <Card className="neumorphism p-6 h-full">
                     <FileText className="h-10 w-10 mx-auto mb-4 text-primary"/>
                     <h3 className="text-lg font-semibold mb-2">Privacy Policy</h3>
                     <p className="text-sm text-muted-foreground mb-4">Understand how we handle your data.</p>
                     <Button variant="outline" asChild><Link href="/privacy">Read Policy</Link></Button>
                 </Card>
                 <Card className="neumorphism p-6 h-full">
                     <FileText className="h-10 w-10 mx-auto mb-4 text-primary"/>
                     <h3 className="text-lg font-semibold mb-2">Terms of Service</h3>
                     <p className="text-sm text-muted-foreground mb-4">Our terms for using the Volio platform.</p>
                      <Button variant="outline" asChild><Link href="/terms">Read Terms</Link></Button>
                 </Card>
             </div>
       </section>


      {/* CTA Section */}
      <section className="py-16 text-center rounded-lg bg-gradient-to-br from-primary to-destructive text-primary-foreground mt-10"> {/* Updated gradient */}
        <h2 className="text-3xl font-bold mb-4">Have an Idea or Question?</h2>
        <p className="text-lg mb-8 max-w-xl mx-auto opacity-90">
          We're always looking to improve and collaborate. Get in touch!
        </p>
        <Button variant="secondary" size="lg" asChild>
          <Link href="/contact">
            <Mail className="mr-2 h-5 w-5" /> Contact Us
          </Link>
        </Button>
      </section>
    </div>
  );
}
