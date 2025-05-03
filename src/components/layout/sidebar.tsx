'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useT } from '@/context/I18nContext';

// Import icons
import { 
  Home, 
  CalendarDays, 
  User, 
  MessageSquare, 
  Settings, 
  LogOut,
  Sparkles
} from 'lucide-react';

// Define the type for sidebar items
type SidebarItem = {
  href: string;
  icon: React.ReactNode;
  label: string;
  notifications?: number;
};

type SidebarProps = {
  className?: string;
};

export function Sidebar({ className }: SidebarProps) {
  const t = useT();
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { signOut } = useAuth();

  // Check if mobile on mount and when window resizes
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
      // Auto-collapse on mobile
      if (window.innerWidth < 768) {
        setExpanded(false);
      } else {
        setExpanded(true);
      }
    };

    // Initial check
    checkIfMobile();

    // Add event listener
    window.addEventListener('resize', checkIfMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Toggle sidebar expanded state
  const toggleSidebar = () => {
    setExpanded(!expanded);
  };

  const navItems = [
    { href: '/', icon: <Home />, label: t('nav.home') },
    { href: '/events', icon: <CalendarDays />, label: t('nav.events') },
    { href: '/recommendations', icon: <Sparkles />, label: t('nav.smartMatch') },
    { href: '/profile', icon: <User />, label: t('nav.profile') },
    { href: '/chat', icon: <MessageSquare />, label: t('nav.chat') },
    { href: '/settings', icon: <Settings />, label: t('nav.settings') }
  ];

  return (
    <div
      className={cn(
        "fixed left-0 top-0 h-full z-40 flex",
        expanded ? "sidebar-slide-in" : "sidebar-slide-out"
      )}
      style={{
        width: expanded ? (isMobile ? '60px' : '100px') : '0px',
        transition: 'width 0.2s ease-out'
      }}
    >
      {/* Main sidebar */}
      <div 
        className="h-full flex flex-col" 
        style={{ 
          backgroundColor: 'var(--volio-background)',
          width: expanded ? (isMobile ? '60px' : '100px') : '0px',
          overflow: 'hidden',
          transition: 'width 0.2s ease-out',
          boxShadow: '1px 0 5px rgba(0,0,0,0.05)'
        }}
      >
        {/* Logo */}
        <div className="p-4 flex justify-center items-center h-16">
          <span 
            className="font-bold text-xl" 
            style={{ color: 'var(--volio-primary)' }}
          >
            {expanded ? 'V' : ''}
          </span>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 flex flex-col items-center py-4 space-y-6">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "relative flex flex-col items-center justify-center w-full px-2 py-3 group",
                  "transition-all duration-200 ease-out",
                  "hover:shadow-[0_2px_8px_rgba(0,0,0,0.1)]",
                  {
                    "hover:bg-opacity-20": !isActive
                  }
                )}
                style={{
                  backgroundColor: isActive ? 'var(--volio-hover)' : 'transparent',
                  opacity: isActive ? 1 : 0.9
                }}
              >
                {/* Active indicator */}
                {isActive && (
                  <span 
                    className="absolute left-0 top-0 bottom-0 w-1" 
                    style={{ backgroundColor: 'var(--volio-primary)' }}
                  />
                )}
                
                {/* Icon */}
                <span 
                  className="text-2xl mb-1 group-hover:scale-110 transition-transform duration-200"
                  style={{ 
                    color: isActive ? 'var(--volio-primary)' : 'var(--volio-text)',
                    transition: 'color 0.2s ease-out'
                  }}
                >
                  {React.cloneElement(item.icon as React.ReactElement, { 
                    size: 22,
                    className: "group-hover:text-[var(--volio-secondary)] transition-colors duration-200"
                  })}
                </span>
                
                {/* Label */}
                {expanded && (
                  <span 
                    className="text-xs font-medium text-center group-hover:text-[var(--volio-secondary)]" 
                    style={{ 
                      color: isActive ? 'var(--volio-primary)' : 'var(--volio-text)',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                      fontWeight: 500,
                      transition: 'color 0.2s ease-out'
                    }}
                  >
                    {item.label}
                  </span>
                )}
                
                {/* Notification badge */}
                {item.notifications && (
                  <div
                    className="absolute -top-1 -right-1 flex items-center justify-center min-w-5 h-5 text-xs font-semibold rounded-full px-1"
                    style={{ 
                      backgroundColor: 'var(--volio-notification)',
                      color: '#000000'
                    }}
                  >
                    {item.notifications}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
        
        {/* Bottom buttons */}
        <div className="p-4 flex flex-col items-center space-y-4 mt-auto">
          {/* Logout button */}
          <button
            onClick={signOut}
            className="flex flex-col items-center justify-center w-full px-2 py-3 group transition-all duration-200 ease-out hover:shadow-[0_2px_8px_rgba(0,0,0,0.1)] hover:bg-[var(--volio-hover)] hover:bg-opacity-20"
          >
            <span className="text-2xl mb-1 group-hover:scale-110 transition-transform duration-200 group-hover:text-[var(--volio-secondary)]">
              <LogOut size={22} style={{ color: 'var(--volio-text)' }} className="group-hover:text-[var(--volio-secondary)] transition-colors duration-200" />
            </span>
            
            {expanded && (
              <span 
                className="text-xs font-medium text-center group-hover:text-[var(--volio-secondary)]" 
                style={{ 
                  color: 'var(--volio-text)',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  fontWeight: 500,
                  transition: 'color 0.2s ease-out'
                }}
              >
                {t('auth.logout')}
              </span>
            )}
          </button>
          
          {/* Toggle button for mobile */}
          <button
            onClick={toggleSidebar}
            className="text-2xl rounded-full p-2 hover:bg-[var(--volio-hover)] hover:bg-opacity-20 transition-colors duration-200"
            style={{ color: 'var(--volio-text)' }}
          >
            {expanded ? '←' : '→'}
          </button>
        </div>
      </div>
    </div>
  );
} 