import type { Config } from "tailwindcss";

export default {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Add Inter and Clash Display if used
        // sans: ['Inter var', 'sans-serif'],
        // heading: ['Clash Display', 'sans-serif'],
      },
      colors: {
          background: 'hsl(var(--background))',
          foreground: 'hsl(var(--foreground))',
          card: {
              DEFAULT: 'hsl(var(--card))',
              foreground: 'hsl(var(--card-foreground))'
          },
          popover: {
              DEFAULT: 'hsl(var(--popover))',
              foreground: 'hsl(var(--popover-foreground))'
          },
          primary: {
              DEFAULT: 'hsl(var(--primary))', // Volio Green
              foreground: 'hsl(var(--primary-foreground))'
          },
          secondary: {
              DEFAULT: 'hsl(var(--secondary))',
              foreground: 'hsl(var(--secondary-foreground))'
          },
          muted: {
              DEFAULT: 'hsl(var(--muted))',
              foreground: 'hsl(var(--muted-foreground))'
          },
          accent: { // Now Accent Yellow
              DEFAULT: 'hsl(var(--accent))',
              foreground: 'hsl(var(--accent-foreground))'
          },
          // Removed accent-2, destructive is now Alert/Secondary Red
          destructive: {
              DEFAULT: 'hsl(var(--destructive))',
              foreground: 'hsl(var(--destructive-foreground))'
          },
          border: 'hsl(var(--border))',
          input: 'hsl(var(--input))',
          ring: 'hsl(var(--ring))',
          chart: {
              '1': 'hsl(var(--chart-1))', // Alert/Secondary Red
              '2': 'hsl(var(--chart-2))', // Accent Yellow
              '3': 'hsl(var(--chart-3))', // Purple (or update)
              '4': 'hsl(var(--chart-4))', // Darker Volio Green
              '5': 'hsl(var(--chart-5))'  // Light Neutral
          },
          sidebar: {
              DEFAULT: 'hsl(var(--sidebar-background))',
              foreground: 'hsl(var(--sidebar-foreground))',
              primary: 'hsl(var(--sidebar-primary))',
              'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
              accent: 'hsl(var(--sidebar-accent))',
              'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
              border: 'hsl(var(--sidebar-border))',
              ring: 'hsl(var(--sidebar-ring))'
          }
      },
      borderRadius: {
          lg: 'var(--radius)',
          md: 'calc(var(--radius) - 2px)',
          sm: 'calc(var(--radius) - 4px)'
      },
      keyframes: {
          'accordion-down': {
              from: { height: '0' },
              to: { height: 'var(--radix-accordion-content-height)' }
          },
          'accordion-up': {
              from: { height: 'var(--radix-accordion-content-height)' },
              to: { height: '0' }
          },
          'float': {
             '0%, 100%': { transform: 'translateY(0px)' },
             '50%': { transform: 'translateY(-8px)' },
          },
           'radial-burst': { // Added keyframe
              from: { transform: 'scale(0)', opacity: '0.5' },
              to: { transform: 'scale(1.5)', opacity: '0' }
           },
           'fill-wave': { // Added keyframe (adjust stroke-dashoffset value)
             from: { 'stroke-dashoffset': '1000' },
             to: { 'stroke-dashoffset': '0' },
           }
      },
      animation: {
          'accordion-down': 'accordion-down 0.2s ease-out',
          'accordion-up': 'accordion-up 0.2s ease-out',
          'float': 'float 6s ease-in-out infinite',
          'radial-burst': 'radial-burst 0.4s ease-out forwards', // Added animation
          'fill-wave': 'fill-wave 2s ease-out forwards', // Added animation
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
