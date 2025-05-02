'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Building, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from "@/hooks/use-toast";

const contactFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  organization: z.string().optional(),
  subject: z.string().min(1, { message: 'Please select a subject.'}),
  message: z.string().min(10, { message: 'Message must be at least 10 characters.' }),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function ContactPage() {
    const { toast } = useToast();
    const form = useForm<ContactFormValues>({
        resolver: zodResolver(contactFormSchema),
        defaultValues: {
        name: '',
        email: '',
        organization: '',
        subject: '',
        message: '',
        },
    });

     // Placeholder onSubmit function
     async function onSubmit(data: ContactFormValues) {
        console.log('Submitting contact form:', data);
        // TODO: Implement actual form submission logic (e.g., send email, save to DB)
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

        toast({
            title: "Message Sent!",
            description: "Thanks for reaching out. We'll get back to you soon.",
        });
        form.reset(); // Reset form after successful submission
     }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
        >
             <Mail className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h1 className="text-4xl font-bold mb-2">Contact Us</h1>
            <p className="text-lg text-muted-foreground">We'd love to hear from you. Fill out the form below.</p>
        </motion.div>

       <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Card className="neumorphism">
            <CardHeader>
              <CardTitle>Send us a message</CardTitle>
              <CardDescription>Our team will respond as soon as possible.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                             <div className="relative">
                                 <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                 <Input placeholder="Your Name" {...field} className="pl-10" />
                             </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                             <div className="relative">
                                 <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                 <Input type="email" placeholder="you@example.com" {...field} className="pl-10"/>
                             </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="organization"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Organization (Optional)</FormLabel>
                        <FormControl>
                            <div className="relative">
                                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Your Organization Name" {...field} className="pl-10"/>
                            </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                 <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger>
                            <SelectValue placeholder="Select a subject" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="partnership">Partnership Inquiry</SelectItem>
                            <SelectItem value="support">Support Request</SelectItem>
                            <SelectItem value="feedback">Feedback & Suggestions</SelectItem>
                            <SelectItem value="press">Press & Media</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Message</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us more about your inquiry..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                   <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                     {form.formState.isSubmitting ? 'Sending...' : 'Send Message'}
                   </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
       </motion.div>
    </div>
  );
}
