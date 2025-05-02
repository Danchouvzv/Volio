'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
// Placeholder: You might use react-countup or implement a simple counter
// import CountUp from 'react-countup'; // Example import

interface Stat {
  label: string;
  value: number;
  suffix?: string;
}

const statsData: Stat[] = [
  { label: 'Events Hosted', value: 150, suffix: '+' },
  { label: 'Active Volunteers', value: 2500, suffix: '+' },
  { label: 'Hours Contributed', value: 10000, suffix: '+' },
];

// Simple counter component (replace with react-countup if desired)
const AnimatedNumber = ({ value }: { value: number }) => {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.5 }); // Trigger when 50% visible

    useEffect(() => {
        if (isInView) {
            let start = 0;
            const end = value;
            // If start === end, return early
            if (start === end) return;

            // Find duration per increment
            let duration = 1500; // Total duration in ms (increased slightly)
            let incrementTime = Math.max(16, duration / end); // Minimum ~60fps interval

            const timer = setInterval(() => {
                start += Math.ceil(end / (duration / incrementTime)); // Increment proportionally
                if (start >= end) {
                    start = end;
                    clearInterval(timer);
                }
                setCount(start);
            }, incrementTime);

            return () => clearInterval(timer); // Cleanup on unmount or re-trigger
        }
    }, [isInView, value]);

    return <span ref={ref}>{count.toLocaleString()}</span>;
};


export function StatsBar() {
  return (
    <section className="py-12 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {statsData.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="flex flex-col items-center"
            >
              <div className="text-4xl md:text-5xl font-bold mb-2 text-accent"> {/* Use Accent Yellow */}
                <AnimatedNumber value={stat.value} />{stat.suffix}
                {/* Or use react-countup: <CountUp end={stat.value} duration={2.5} suffix={stat.suffix} enableScrollSpy scrollSpyOnce/> */}
              </div>
              <p className="text-lg font-medium text-primary-foreground/80">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
