'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { useMenu } from '@/context/MenuContext';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import type { MenuItem } from '@/context/MenuContext';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuLink,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubLink,
  SidebarProvider,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';

import { Sun, Moon, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Функция для группировки элементов меню по категориям
const groupMenuItems = (items: MenuItem[]) => {
  const groups: Record<string, MenuItem[]> = {
    main: [],
    communication: [],
    organization: [],
    tools: [],
    dashboard: [],
    admin: [],
    other: []
  };

  items.forEach(item => {
    const group = item.group || 'other';
    if (groups[group]) {
      groups[group].push(item);
    } else {
      groups.other.push(item);
    }
  });

  return groups;
};

// Получаем количество уведомлений для элемента меню (заглушка, в реальном приложении должно приходить из API)
const getNotificationCount = (itemLabel: string): number | null => {
  if (itemLabel === 'Notifications') return 3;
  if (itemLabel === 'Messages') return 5;
  if (itemLabel === 'Friends') return 2;
  return null;
};

export function SidebarNav() {
  const { getFilteredMenuItems } = useMenu();
  const { user, userProfile, loading, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  
  const allMenuItems = getFilteredMenuItems();
  const primaryNavItems = allMenuItems.filter(item => item.section === 'primary' && !item.isAction);
  const logoutAction = allMenuItems.find(item => item.label === 'Logout');
  
  // Группируем элементы меню по категориям
  const groupedItems = groupMenuItems(primaryNavItems);
  
  // Создаем пункты меню
  const renderMenuGroup = (title: string, items: MenuItem[]) => {
    if (!items.length) return null;
    
    return (
      <SidebarGroup>
        <SidebarGroupLabel>{title}</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {items.map(item => {
              const isActive = pathname === item.href;
              const notifCount = getNotificationCount(item.label);
              
              return (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuLink
                    href={item.href}
                    active={isActive}
                    icon={item.icon}
                    notifications={notifCount}
                    subtitle={notifCount ? `${notifCount} новых` : undefined}
                  >
                    {item.label}
                  </SidebarMenuLink>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar>
        <SidebarHeader className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 px-4 py-2">
            <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-primary to-destructive">
              Volio
            </span>
          </Link>
          <SidebarTrigger />
        </SidebarHeader>
        
        <SidebarContent>
          {!loading && (
            <>
              {renderMenuGroup('Главное', groupedItems.main)}
              {renderMenuGroup('Коммуникация', groupedItems.communication)}
              {renderMenuGroup('Организации', groupedItems.organization)}
              {renderMenuGroup('Инструменты', groupedItems.tools)}
              {renderMenuGroup('Управление', groupedItems.dashboard)}
              
              {userProfile && (userProfile.role === 'Admin' || userProfile.role === 'Moderator') && (
                renderMenuGroup('Администрирование', groupedItems.admin)
              )}
            </>
          )}
        </SidebarContent>
        
        <SidebarFooter>
          <div className="flex items-center justify-between p-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              aria-label="Toggle theme"
              className="h-8 w-8"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
            
            {!loading && user && logoutAction && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => signOut()}
                aria-label="Logout"
                className="h-8 w-8 text-destructive"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
        </SidebarFooter>
      </Sidebar>
    </SidebarProvider>
  );
} 