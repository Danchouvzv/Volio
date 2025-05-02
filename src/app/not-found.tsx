'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NotFoundPage() {
  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center text-center min-h-[calc(100vh-200px)]"> {/* Adjust min-height based on header/footer */}
       <motion.div
           initial={{ scale: 0.8, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           transition={{ type: 'spring', stiffness: 100 }}
       >
          <AlertTriangle className="h-24 w-24 text-destructive mb-6 mx-auto" />
       </motion.div>

      <motion.h1
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-4xl md:text-6xl font-bold mb-4"
      >
        404 - Page Not Found
      </motion.h1>

      <motion.p
         initial={{ y: 20, opacity: 0 }}
         animate={{ y: 0, opacity: 1 }}
         transition={{ delay: 0.4 }}
         className="text-lg text-muted-foreground mb-8 max-w-md"
      >
        Oops! The page you're looking for doesn't seem to exist. Maybe it was moved or deleted.
      </motion.p>

       <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6 }}
       >
          <Button asChild size="lg">
            <Link href="/">Go Back Home</Link>
          </Button>
       </motion.div>
    </div>
  );
}
