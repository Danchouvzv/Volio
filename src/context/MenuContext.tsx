'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import type { UserRole, UserProfile } from '@/types';
import {
  Home,
  CalendarDays,
  Settings,
  User,
  LayoutDashboard,
  MessagesSquare,
  UserPlus,
  LogOut,
  Users,
  Building,
  Bell,
  MessageSquare,
  Store,
  Sparkles,
  KeyRound,
  CalendarPlus,
  LogIn,
  ShieldCheck,
  BarChartHorizontal
} from 'lucide-react';
import { signOut } from 'firebase/auth'; // Import signOut
import { auth } from '@/config/firebase'; // Import auth

export type RouteDefinition = {
  path: string;
  i18nKey: string;
  icon: any;
  section?: 'primary' | 'utility' | 'footer' | 'admin';
  group?: 'main' | 'communication' | 'organization' | 'tools' | 'dashboard' | 'admin' | 'utility' | 'auth' | 'other';
  mobile?: boolean;
  isAction?: boolean;
};

export type MenuItem = RouteDefinition & {
  id: string;
};

// Define menu structure based on review - single source of truth
export const ROUTE_DEFINITIONS: Record<string, RouteDefinition> = {
  // ОСНОВНЫЕ
  home: { 
    path: '/', 
    i18nKey: 'nav.home', 
    icon: Home, 
    section: 'primary',
    group: 'main'
  },
  events: { 
    path: '/events', 
    i18nKey: 'nav.events', 
    icon: CalendarDays, 
    section: 'primary',
    group: 'main'
  },
  profile: { 
    path: '/profile', 
    i18nKey: 'nav.profile', 
    icon: User, 
    section: 'primary',
    group: 'main'
  },
  // КОММУНИКАЦИЯ
  friends: {
    path: '/friends',
    i18nKey: 'nav.friends',
    icon: Users,
    section: 'primary',
    group: 'communication'
  },
  messages: {
    path: '/messages',
    i18nKey: 'nav.messages',
    icon: MessageSquare,
    section: 'primary',
    group: 'communication'
  },
  chat: { 
    path: '/chat', 
    i18nKey: 'nav.chat', 
    icon: MessagesSquare, 
    section: 'primary',
    group: 'communication'
  },
  notifications: {
    path: '/notifications',
    i18nKey: 'nav.notifications',
    icon: Bell,
    section: 'primary',
    group: 'communication'
  },
  // ОРГАНИЗАЦИИ И МЕРОПРИЯТИЯ
  organizations: {
    path: '/organizations',
    i18nKey: 'nav.organizations',
    icon: Building,
    section: 'primary',
    group: 'organization'
  },
  smallOrgs: {
    path: '/small-organizations',
    i18nKey: 'nav.smallOrgs',
    icon: Store,
    section: 'primary',
    group: 'organization'
  },
  smartMatch: {
    path: '/recommendations',
    i18nKey: 'nav.smartMatch',
    icon: Sparkles,
    section: 'primary',
    group: 'tools'
  },
  createEvent: {
    path: '/create-event',
    i18nKey: 'nav.createEvent',
    icon: CalendarPlus,
    section: 'primary',
    group: 'organization'
  },
  organize: { 
    path: '/organize', 
    i18nKey: 'nav.organize', 
    icon: CalendarDays, 
    section: 'primary',
    group: 'organization'
  },
  league: { 
    path: '/league', 
    i18nKey: 'nav.league', 
    icon: Store, 
    section: 'primary',
    group: 'organization'
  },
  organizerDashboard: {
    path: '/organizer-dashboard',
    i18nKey: 'nav.organizerDashboard',
    icon: LayoutDashboard,
    section: 'primary',
    group: 'dashboard'
  },
  // АДМИНИСТРИРОВАНИЕ
  dashboard: { 
    path: '/dashboard', 
    i18nKey: 'nav.dashboard', 
    icon: LayoutDashboard, 
    section: 'primary',
    group: 'dashboard'
  },
  adminPanel: { 
    path: '/admin', 
    i18nKey: 'nav.adminPanel', 
    icon: LayoutDashboard, 
    section: 'primary',
    group: 'admin' 
  },
  moderation: { 
    path: '/moderation', 
    i18nKey: 'nav.moderation', 
    icon: ShieldCheck, 
    section: 'primary',
    group: 'admin'
  },
  adminUsers: {
    path: '/admin/users',
    i18nKey: 'nav.adminUsers',
    icon: Users,
    section: 'admin',
    group: 'admin'
  },
  // СЛУЖЕБНЫЕ
  settings: { 
    path: '/settings', 
    i18nKey: 'nav.settings', 
    icon: Settings, 
    section: 'utility',
    group: 'utility'
  },
  demoLogin: {
    path: '/demo-login',
    i18nKey: 'nav.demoLogin',
    icon: KeyRound,
    section: 'utility',
    group: 'utility'
  },
  login: { 
    path: '/login', 
    i18nKey: 'auth.login', 
    icon: LogIn,
    section: 'utility',
    group: 'auth'
  },
  signup: { 
    path: '/signup', 
    i18nKey: 'auth.signup', 
    icon: UserPlus, 
    section: 'utility',
    group: 'auth'
  },
  logout: { 
    path: '#', 
    i18nKey: 'auth.logout', 
    icon: LogOut, 
    section: 'utility',
    group: 'auth',
    isAction: true 
  },
};

// Define role access based on review
const ROLE_ACCESS: Record<UserRole, ReadonlySet<string>> = {
  Volunteer:     new Set(['home', 'events', 'smartMatch', 'profile', 'settings', 'chat', 'smallOrgs', 'friends', 'organizations', 'notifications', 'messages', 'demoLogin']),
  Organizer:     new Set(['home', 'events', 'smartMatch', 'organize', 'profile', 'settings', 'chat', 'smallOrgs', 'friends', 'notifications', 'messages', 'createEvent', 'demoLogin', 'organizerDashboard']),
  SmallOrg:      new Set(['home', 'events', 'smartMatch', 'organize', 'profile', 'settings', 'chat', 'smallOrgs', 'friends', 'notifications', 'messages', 'createEvent', 'demoLogin', 'organizerDashboard']),
  LeagueLeader:  new Set(['home', 'events', 'smartMatch', 'organize', 'league', 'profile', 'settings', 'chat', 'friends', 'organizations', 'notifications', 'messages', 'createEvent', 'demoLogin', 'organizerDashboard']),
  Moderator:     new Set(['home', 'events', 'smartMatch', 'adminPanel', 'moderation', 'profile', 'settings', 'friends', 'organizations', 'notifications', 'messages', 'createEvent', 'demoLogin']),
  Analyst:       new Set(['home', 'dashboard', 'events', 'smartMatch', 'profile', 'settings', 'friends', 'organizations', 'notifications', 'messages', 'createEvent', 'demoLogin']),
  Admin:         new Set(['home', 'events', 'smartMatch', 'organize', 'dashboard', 'adminPanel', 'profile', 'settings', 'chat', 'smallOrgs', 'league', 'moderation', 'friends', 'organizations', 'notifications', 'messages', 'createEvent', 'demoLogin', 'organizerDashboard', 'adminUsers']),
  Coordinator:   new Set(['home', 'events', 'smartMatch', 'profile', 'settings', 'chat', 'friends', 'organizations', 'notifications', 'messages', 'createEvent', 'demoLogin']),
};

interface MenuContextType {
  menuItems: MenuItem[];
  getFilteredMenuItems: () => MenuItem[];
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export const MenuProvider = ({ children }: { children: ReactNode }) => {
  const { user, userProfile, loading } = useAuth();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/'; // Get pathname safely

  useEffect(() => {
    const buildMenu = () => {
        const currentRole = !loading && userProfile ? userProfile.role : 'Volunteer';
        const allowedSlugs = ROLE_ACCESS[currentRole] || ROLE_ACCESS['Volunteer'];
        // Placeholder i18n function - replace with actual implementation
        const i18n = { t: (key: string) => key.split('.').pop()?.replace(/([A-Z])/g, ' $1').trim().replace('Small Orgs', 'Orgs') || key };

        const generatedItems: MenuItem[] = [];

        // Generate items based on role access and route definitions
        Object.entries(ROUTE_DEFINITIONS).forEach(([slug, meta]) => {
            // Check role access first
            if (!allowedSlugs.has(slug)) return;

             // Skip auth actions here, handled separately
            if (meta.isAction || slug === 'login' || slug === 'signup') return;

            // Add the menu item if role has access
            generatedItems.push({
                href: meta.path,
                label: i18n.t(meta.i18nKey),
                icon: meta.icon,
                section: meta.section,
                mobile: meta.mobile ?? true,
                isActive: pathname === meta.path, // Set isActive based on current path
            });
        });

       // Add auth actions dynamically
       if (user) {
         const logoutMeta = ROUTE_DEFINITIONS['logout'];
         if (logoutMeta) {
             generatedItems.push({
               href: logoutMeta.path,
               label: i18n.t(logoutMeta.i18nKey),
               icon: logoutMeta.icon,
               section: logoutMeta.section,
               isAction: true,
               action: () => signOut(auth).catch(console.error), // Use imported signOut
               mobile: logoutMeta.mobile ?? true,
             });
         }
       } else {
          const loginMeta = ROUTE_DEFINITIONS['login'];
          const signupMeta = ROUTE_DEFINITIONS['signup'];
          if (loginMeta) {
               generatedItems.push({
                 href: loginMeta.path,
                 label: i18n.t(loginMeta.i18nKey),
                 icon: loginMeta.icon,
                 section: loginMeta.section,
                 isAction: loginMeta.isAction ?? false,
                 mobile: loginMeta.mobile ?? true,
               });
          }
           if (signupMeta) {
               generatedItems.push({
                 href: signupMeta.path,
                 label: i18n.t(signupMeta.i18nKey),
                 icon: signupMeta.icon,
                 section: signupMeta.section,
                 isAction: signupMeta.isAction ?? false,
                 mobile: signupMeta.mobile ?? true,
               });
           }
       }

       setMenuItems(generatedItems);
    };

    buildMenu();

    // Rebuild menu if pathname changes (for isActive state)
     const handleRouteChange = () => buildMenu();
     window.addEventListener('popstate', handleRouteChange); // Listen for browser navigation
     // Add listener for Next.js router events if using Link component extensively for internal nav

     return () => {
       window.removeEventListener('popstate', handleRouteChange);
     };

  }, [user, userProfile, loading, pathname]); // Add pathname dependency

  const getFilteredMenuItems = (): MenuItem[] => {
     return menuItems;
  };

  return (
    <MenuContext.Provider value={{ menuItems, getFilteredMenuItems }}>
      {children}
    </MenuContext.Provider>
  );
};

export const useMenu = () => {
  const context = useContext(MenuContext);
  if (context === undefined) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return { menuItems: context.menuItems, getFilteredMenuItems: context.getFilteredMenuItems };
};

// Доступные разделы для основной навигации
const MAIN_NAV_SECTIONS = [
  // Основные
  'home',
  'events',
  'profile',
  
  // Коммуникация
  'messages',
  'friends',
  'notifications',
  
  // Организации
  'organizations',
  'smallOrgs', 
  'smartMatch',
  
  // Организаторское
  'createEvent',
  'organizerDashboard',
];

// Доступные разделы для утилит
const UTILITY_SECTIONS = [
  'settings',
  'changeLanguage',
  'toggleTheme',
  'demoLogin',
];
