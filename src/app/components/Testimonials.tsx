
'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
// Placeholder: You would likely use a library like Swiper.js or Keen-Slider here
// import { useKeenSlider } from "keen-slider/react" // Example import
// import "keen-slider/keen-slider.min.css" // Example import

// Placeholder data - replace with API call (e.g., fetch('/api/testimonials'))
const testimonialsData = [
  { id: 1, name: 'Aisha K.', quote: 'VolioLite made finding local volunteering so easy! I connected with a great cause.', avatar: 'https://picsum.photos/seed/aisha/80/80' },
  { id: 2, name: 'Timur B.', quote: 'Organizing events is much smoother now. The platform helps manage participants effectively.', avatar: 'https://picsum.photos/seed/timur/80/80' },
  { id: 3, name: 'Gulnara S.', quote: 'I love earning badges! It’s a fun way to see my contributions recognized.', avatar: 'https://picsum.photos/seed/gulnara/80/80' },
];

export function Testimonials() {
  // Placeholder for slider logic
  // const [sliderRef] = useKeenSlider<HTMLDivElement>({ slides: { perView: 1, spacing: 15 }, loop: true })

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-3xl font-bold text-center mb-12 text-foreground"
        >
          What Our Users Say
        </motion.h2>

        {/* Placeholder Slider - Replace with actual slider implementation */}
        <div className="relative overflow-hidden max-w-2xl mx-auto">
           {/* keen-slider ref={sliderRef} className="keen-slider" */}
           <div className="flex"> {/* Simple flexbox for placeholder */}
            {testimonialsData.map((testimonial, index) => (
              <motion.div
                 key={testimonial.id}
                 // keen-slider__slide number-slide{index + 1}
                 className="p-2 min-w-full" // Basic styling for placeholder
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 transition={{ duration: 0.5, delay: index * 0.1 }} // Simple fade-in
              >
                <Card className="neumorphism-inset p-6 bg-card">
                  <CardContent className="flex flex-col items-center text-center">
                    <Avatar className="w-20 h-20 mb-4 border-2 border-primary">
                      <AvatarImage src={testimonial.avatar} alt={testimonial.name} data-ai-hint="person avatar testimonial"/>
                      <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <p className="text-muted-foreground italic mb-4">"{testimonial.quote}"</p>
                    <p className="font-semibold text-foreground">- {testimonial.name}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
           {/* Add slider navigation/pagination controls here */}
        </div>
      </div>
    </section>
  );
}
