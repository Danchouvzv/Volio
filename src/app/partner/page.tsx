'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Handshake, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function PartnerPage() {
  return (
    <div className="container mx-auto px-4 py-12">
       <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center py-16 md:py-24 rounded-lg bg-gradient-to-b from-primary/10 to-transparent mb-16"
      >
        <Handshake className="h-16 w-16 mx-auto mb-6 text-primary" />
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-primary">Partner with Volio</h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
          Amplify your impact, reach dedicated volunteers, and manage your events seamlessly.
        </p>
         <Button size="lg" asChild>
            <Link href="/signup?role=organizer"> {/* Example: Link to signup with role prefill */}
                Get Started
            </Link>
        </Button>
      </motion.section>

       <section className="py-16">
         <h2 className="text-3xl font-bold text-center mb-12">Why Partner with Volio?</h2>
         <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} viewport={{ once: true }}>
                <Card className="text-center p-6 neumorphism h-full">
                    <CheckCircle className="h-10 w-10 mx-auto mb-4 text-accent"/>
                    <CardTitle className="text-xl mb-2">Reach Volunteers</CardTitle>
                    <CardDescription>Connect with thousands of passionate individuals ready to contribute.</CardDescription>
                </Card>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} viewport={{ once: true }}>
                 <Card className="text-center p-6 neumorphism h-full">
                    <Handshake className="h-10 w-10 mx-auto mb-4 text-primary"/>
                    <CardTitle className="text-xl mb-2">Simplify Management</CardTitle>
                    <CardDescription>Easily create events, manage participants, and track impact.</CardDescription>
                </Card>
            </motion.div>
             <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} viewport={{ once: true }}>
                 <Card className="text-center p-6 neumorphism h-full">
                    <TrendingUp className="h-10 w-10 mx-auto mb-4 text-destructive"/>
                    <CardTitle className="text-xl mb-2">Grow Your Impact</CardTitle>
                    <CardDescription>Utilize our tools and network to enhance your organization's reach.</CardDescription>
                </Card>
            </motion.div>
         </div>
       </section>

       {/* Placeholder for Pricing/Contact Form */}
        <section className="py-16 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Elevate Your Mission?</h2>
            <p className="text-lg text-muted-foreground mb-8">Explore our partnership options or contact us for more information.</p>
             <Button size="lg" asChild>
                <Link href="/contact">Contact Sales</Link> {/* Link to contact page */}
            </Button>
       </section>
    </div>
  );
}
