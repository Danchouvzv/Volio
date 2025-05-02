'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation'; // Import usePathname
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { useMenu } from '@/context/MenuContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Sun, Moon, X, User, Settings, LogOut, LogIn, UserPlus, MessageSquare, Users as FriendsIcon, HeartHandshake } from 'lucide-react'; // Changed Cog to Settings, added HeartHandshake
import { cn } from '@/lib/utils';
import type { MenuItem as MenuItemType } from '@/context/MenuContext';
import { useAuth } from '@/context/AuthContext';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator'; // Import Separator
import { ShieldCheck } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton

const MotionLink = motion(Link);

// Custom Logo Icon Component
const VolioLogoIcon = (props: React.ComponentProps<'svg'>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("h-6 w-6", props.className)} // Default size, can be overridden
    {...props}
  >
    {/* Gradient Definition */}
    <defs>
      <linearGradient id="volioGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: 'hsl(var(--destructive))', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    {/* Icon Path - HeartHandshake equivalent */}
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    <path d="M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08v0c.82.82 2.13.85 3 .07l2.07-1.9a2.82 2.82 0 0 1 3.79 0l2.83 2.83" />
    <path d="m18 15-2-2" />
    <path d="m15 18-2-2" />
    {/* Apply gradient stroke */}
    <style>{`path { stroke: url(#volioGradient); }`}</style>
  </svg>
);


export function Header() {
  const { theme, setTheme } = useTheme();
  const { getFilteredMenuItems } = useMenu();
  const { user, userProfile, loading, signOut } = useAuth(); // Get signOut from context
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const pathname = usePathname(); // Get current path

  // Фейковые данные для индикаторов (в реальном приложении должны быть получены из API)
  const notificationCount = 3;
  const messageCount = 5;
  const friendRequestCount = 2;

  const allMenuItems = getFilteredMenuItems();

  // Separate menu items based on review
  const primaryNavItems = allMenuItems.filter(item => item.section === 'primary' && !item.isAction);
  const utilityNavItems = allMenuItems.filter(item => item.section === 'utility' && !item.isAction && item.label !== 'Login' && item.label !== 'Sign Up');
  const logoutAction = allMenuItems.find(item => item.label === 'Logout');
  const loginItem = allMenuItems.find(item => item.label === 'Login');
  const signupItem = allMenuItems.find(item => item.label === 'Sign Up');

  // Получаем количество уведомлений для элемента меню
  const getNotificationCount = (itemLabel: string): number | null => {
    if (itemLabel === 'Notifications') return notificationCount;
    if (itemLabel === 'Messages') return messageCount;
    if (itemLabel === 'Friends') return friendRequestCount;
    return null;
  };

  // Получаем общее количество уведомлений
  const getTotalNotifications = (): number => {
    return notificationCount + messageCount + friendRequestCount;
  };

  const renderPrimaryMenuItem = (item: MenuItemType, isMobile: boolean = false) => {
    const isActive = pathname === item.href;
    const notifCount = getNotificationCount(item.label);
    
    const commonClasses = cn(
      // Updated typography and spacing per review
      "font-mono uppercase tracking-wide text-sm font-semibold transition-all hover:text-primary relative py-1",
      isActive 
        ? "text-primary nav-link-active after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-gradient-to-r after:from-primary after:to-destructive" 
        : "text-muted-foreground hover:translate-y-[1px]",
      isMobile ? "block py-2 px-4 hover:bg-accent w-full text-left" : "hidden md:block" // Adjust mobile styles
    );

    return (
      <MotionLink
        key={item.label}
        href={item.href}
        className={cn(commonClasses, isMobile ? "flex items-center gap-2" : "flex items-center")}
        whileHover={{ scale: isActive ? 1 : 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => isMobile && setMobileMenuOpen(false)}
      >
        {isMobile && item.icon && React.createElement(item.icon, { className: "h-4 w-4" })}
        <span>{item.label}</span>
        
        {/* Индикатор количества уведомлений */}
        {notifCount !== null && notifCount > 0 && (
          <span className={cn(
            "ml-1.5 px-1.5 py-0.5 text-xs rounded-full font-semibold bg-primary text-primary-foreground min-w-5 h-5 flex items-center justify-center",
            isMobile ? "" : "absolute -top-1 -right-3"
          )}>
            {notifCount}
          </span>
        )}
      </MotionLink>
    );
  };

   const renderUtilityMenuItem = (item: MenuItemType) => (
     <Link
       key={item.label}
       href={item.href}
       className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground"
       onClick={() => setPopoverOpen(false)}
     >
       {item.icon && React.createElement(item.icon, { className: "h-4 w-4" })}
       {item.label}
     </Link>
   );

  // Функция для группировки элементов меню по категориям
  const groupMenuItems = (items: MenuItemType[]) => {
    const groups: Record<string, MenuItemType[]> = {
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

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        {/* Logo/Brand Name */}
        <Link href="/" className="mr-6 flex items-center space-x-2">
           {/* Use variable font gradient text per review */}
          <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-primary to-destructive">
             Volio
          </span>
        </Link>

        {/* Desktop Primary Navigation - Increased gap per review */}
        <nav className="hidden md:flex flex-1 items-center space-x-6 md:space-x-10 text-sm font-medium">
          {!loading && primaryNavItems.length > 0 && (
            <>
              {/* Основные элементы всегда отображаются */}
              <div className="flex items-center space-x-6 md:space-x-8">
                {groupMenuItems(primaryNavItems).main.map(item => renderPrimaryMenuItem(item))}
              </div>
              
              {/* Показываем выпадающее меню для остальных групп */}
              {user && (
                <Popover open={moreMenuOpen} onOpenChange={setMoreMenuOpen}>
                  <PopoverTrigger asChild>
                    <motion.div 
                      animate={{ 
                        scale: moreMenuOpen ? 1.05 : 1, 
                        backgroundColor: moreMenuOpen ? 'hsl(var(--accent)/0.3)' : 'transparent' 
                      }}
                      className="rounded-md overflow-hidden relative"
                      whileHover={{ backgroundColor: 'hsl(var(--accent)/0.2)' }}
                    >
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={cn(
                          "px-3 py-1.5 font-mono uppercase tracking-wide text-sm font-semibold transition-colors relative flex items-center gap-1",
                          moreMenuOpen ? "text-primary" : "text-muted-foreground hover:text-primary"
                        )}
                      >
                        Еще <span className="transition-transform duration-300 ml-1" style={{ transform: moreMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>↓</span>
                        
                        {/* Индикатор общего числа уведомлений для кнопки "Еще" */}
                        {getTotalNotifications() > 0 && (
                          <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs rounded-full font-semibold bg-primary text-primary-foreground min-w-5 h-5 flex items-center justify-center">
                            {getTotalNotifications()}
                          </span>
                        )}
                      </Button>
                    </motion.div>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-0 shadow-lg animate-in fade-in-50 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 duration-100 bg-background border rounded-lg overflow-hidden">
                    {/* Группа Коммуникация */}
                    {groupMenuItems(primaryNavItems).communication.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                      >
                        <div className="px-3 py-2 text-xs font-semibold text-muted-foreground bg-muted/50">Коммуникация</div>
                        {groupMenuItems(primaryNavItems).communication.map((item, index) => {
                          const notifCount = getNotificationCount(item.label);
                          
                          return (
                            <motion.div
                              key={item.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.05 + index * 0.05 }}
                            >
                              <Link 
                                href={item.href}
                                className="flex items-center justify-between px-4 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground group"
                                onClick={() => setMoreMenuOpen(false)}
                              >
                                <div className="flex items-center">
                                  {item.icon && React.createElement(item.icon, { className: "h-4 w-4 mr-3 text-muted-foreground group-hover:text-primary transition-colors" })}
                                  <span>{item.label}</span>
                                </div>
                                
                                {/* Индикатор количества */}
                                {notifCount !== null && notifCount > 0 && (
                                  <span className="px-1.5 py-0.5 text-xs rounded-full font-semibold bg-primary text-primary-foreground min-w-5 h-5 flex items-center justify-center">
                                    {notifCount}
                                  </span>
                                )}
                              </Link>
                            </motion.div>
                          );
                        })}
                        <Separator className="my-0" />
                      </motion.div>
                    )}
                    
                    {/* Группа Организации */}
                    {groupMenuItems(primaryNavItems).organization.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <div className="px-3 py-2 text-xs font-semibold text-muted-foreground bg-muted/50">Организации</div>
                        {groupMenuItems(primaryNavItems).organization.map((item, index) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 + index * 0.05 }}
                          >
                            <Link 
                              href={item.href}
                              className="flex items-center px-4 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground group"
                              onClick={() => setMoreMenuOpen(false)}
                            >
                              {item.icon && React.createElement(item.icon, { className: "h-4 w-4 mr-3 text-muted-foreground group-hover:text-primary transition-colors" })}
                              <span>{item.label}</span>
                            </Link>
                          </motion.div>
                        ))}
                        <Separator className="my-0" />
                      </motion.div>
                    )}
                    
                    {/* Прочие элементы */}
                    {groupMenuItems(primaryNavItems).tools.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                      >
                        <div className="px-3 py-2 text-xs font-semibold text-muted-foreground bg-muted/50">Инструменты</div>
                        {groupMenuItems(primaryNavItems).tools.map((item, index) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.15 + index * 0.05 }}
                          >
                            <Link 
                              href={item.href}
                              className="flex items-center px-4 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground group"
                              onClick={() => setMoreMenuOpen(false)}
                            >
                              {item.icon && React.createElement(item.icon, { className: "h-4 w-4 mr-3 text-muted-foreground group-hover:text-primary transition-colors" })}
                              <span>{item.label}</span>
                            </Link>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                    
                    {/* Показываем дополнительные группы, если они есть */}
                    {groupMenuItems(primaryNavItems).dashboard?.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <Separator className="my-0" />
                        <div className="px-3 py-2 text-xs font-semibold text-muted-foreground bg-muted/50">Управление</div>
                        {groupMenuItems(primaryNavItems).dashboard.map((item, index) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + index * 0.05 }}
                          >
                            <Link 
                              href={item.href}
                              className="flex items-center px-4 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground group"
                              onClick={() => setMoreMenuOpen(false)}
                            >
                              {item.icon && React.createElement(item.icon, { className: "h-4 w-4 mr-3 text-muted-foreground group-hover:text-primary transition-colors" })}
                              <span>{item.label}</span>
                            </Link>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </PopoverContent>
                </Popover>
              )}
            </>
          )}
        </nav>

        {/* Right side items */}
        <div className="flex flex-1 items-center justify-end space-x-2 md:space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            aria-label="Toggle theme"
            className="h-8 w-8 md:h-9 md:w-9" // Slightly smaller icon buttons
          >
            <Sun className="h-[1.1rem] w-[1.1rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.1rem] w-[1.1rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {/* Auth State: Loading */}
          {loading && <Skeleton className="h-8 w-8 rounded-full" />}

           {/* Auth State: Logged Out */}
           {!loading && !user && (
              <div className="hidden md:flex items-center space-x-2">
                 {loginItem && <Button variant="ghost" size="sm" asChild><Link href={loginItem.href}>{loginItem.label}</Link></Button>}
                 {signupItem && <Button size="sm" asChild><Link href={signupItem.href}>{signupItem.label}</Link></Button>}
              </div>
           )}

           {/* Auth State: Logged In - User Popover with Icon Logo */}
           {!loading && user && userProfile && (
             <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
               <PopoverTrigger asChild>
                  {/* Use the custom icon logo per review */}
                 <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
                    <div className="flex items-center justify-center h-full w-full rounded-full bg-gradient-to-br from-primary to-destructive">
                       <VolioLogoIcon className="h-4 w-4 text-white" />
                    </div>
                 </Button>
               </PopoverTrigger>
               <PopoverContent className="w-56 p-1" align="end" forceMount>
                 <div className="px-3 py-2">
                   <p className="text-sm font-medium leading-none truncate">{userProfile.displayName || 'User'}</p>
                   <p className="text-xs leading-none text-muted-foreground truncate">{userProfile.email}</p>
                 </div>
                 <Separator className="my-1" />
                 <nav className="flex flex-col space-y-1">
                     {/* Render utility items from context */}
                     {utilityNavItems.map(item => renderUtilityMenuItem(item))}
                     {/* Admin Panel Link (Conditional) */}
                     {(userProfile.role === 'Admin' || userProfile.role === 'Moderator') && (
                          <Link
                            href="/admin"
                            className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground"
                            onClick={() => setPopoverOpen(false)}
                          >
                            <ShieldCheck className="h-4 w-4" /> Admin Panel
                          </Link>
                     )}
                     {/* Logout Button */}
                     {logoutAction && (
                       <Button
                         variant="ghost"
                         onClick={async () => {
                             await signOut(); // Use signOut from context
                             setPopoverOpen(false);
                             // Optional: Redirect or handle post-logout logic here
                         }}
                         className="flex items-center gap-2 w-full justify-start px-3 py-2 text-sm text-destructive hover:bg-destructive/10 hover:text-destructive rounded-md"
                       >
                         {logoutAction.icon && React.createElement(logoutAction.icon, { className: "h-4 w-4" })}
                         {logoutAction.label}
                       </Button>
                     )}
                 </nav>
               </PopoverContent>
             </Popover>
           )}

          {/* Mobile Menu Trigger */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
             <SheetTrigger asChild>
               <Button variant="ghost" size="icon" className="md:hidden h-8 w-8">
                 <Menu className="h-5 w-5" />
                 <span className="sr-only">Toggle Menu</span>
               </Button>
             </SheetTrigger>
             <SheetContent side="left" className="pr-0 w-full max-w-xs">
                 <div className="flex justify-between items-center p-4 border-b">
                      <Link href="/" className="flex items-center space-x-2" onClick={() => setMobileMenuOpen(false)}>
                         <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-primary to-destructive">
                           Volio
                         </span>
                      </Link>
                      <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                          <X className="h-5 w-5" />
                          <span className="sr-only">Close Menu</span>
                      </Button>
                 </div>
               <nav className="flex flex-col space-y-1 mt-4 px-2">
                 {!loading && primaryNavItems.length > 0 && (
                   <>
                     {/* Основная группа */}
                     <div className="px-2 py-1 text-xs font-semibold text-muted-foreground mb-2">Главное</div>
                     {groupMenuItems(primaryNavItems).main.map(item => renderPrimaryMenuItem(item, true))}
                     
                     {/* Группа Коммуникация */}
                     {groupMenuItems(primaryNavItems).communication.length > 0 && (
                       <>
                         <Separator className="my-3" />
                         <div className="px-2 py-1 text-xs font-semibold text-muted-foreground mb-2">Коммуникация</div>
                         {groupMenuItems(primaryNavItems).communication.map(item => renderPrimaryMenuItem(item, true))}
                       </>
                     )}
                     
                     {/* Группа Организации */}
                     {groupMenuItems(primaryNavItems).organization.length > 0 && (
                       <>
                         <Separator className="my-3" />
                         <div className="px-2 py-1 text-xs font-semibold text-muted-foreground mb-2">Организации</div>
                         {groupMenuItems(primaryNavItems).organization.map(item => renderPrimaryMenuItem(item, true))}
                       </>
                     )}
                     
                     {/* Группа Инструменты */}
                     {groupMenuItems(primaryNavItems).tools.length > 0 && (
                       <>
                         <Separator className="my-3" />
                         <div className="px-2 py-1 text-xs font-semibold text-muted-foreground mb-2">Инструменты</div>
                         {groupMenuItems(primaryNavItems).tools.map(item => renderPrimaryMenuItem(item, true))}
                       </>
                     )}
                     
                     {/* Группа Управление */}
                     {groupMenuItems(primaryNavItems).dashboard?.length > 0 && (
                       <>
                         <Separator className="my-3" />
                         <div className="px-2 py-1 text-xs font-semibold text-muted-foreground mb-2">Управление</div>
                         {groupMenuItems(primaryNavItems).dashboard.map(item => renderPrimaryMenuItem(item, true))}
                       </>
                     )}
                     
                     {/* Админ-панель */}
                     {!loading && userProfile && (userProfile.role === 'Admin' || userProfile.role === 'Moderator') && (
                       <>
                         <Separator className="my-3" />
                         <div className="px-2 py-1 text-xs font-semibold text-muted-foreground mb-2">Администрирование</div>
                         <Link
                           href="/admin"
                           className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent transition-colors"
                           onClick={() => setMobileMenuOpen(false)}
                         >
                           <ShieldCheck className="h-4 w-4" /> Панель администратора
                         </Link>
                       </>
                     )}
                     
                     {/* Auth Actions (Mobile) */}
                     {!loading && user && logoutAction && (
                       <Button
                         variant="ghost"
                         onClick={async () => {
                           await signOut();
                           setMobileMenuOpen(false);
                         }}
                         className="flex items-center gap-2 w-full justify-start px-4 py-2 text-sm text-destructive hover:bg-destructive/10 hover:text-destructive"
                       >
                         {logoutAction.icon && React.createElement(logoutAction.icon, { className: "h-4 w-4" })}
                         {logoutAction.label}
                       </Button>
                     )}
                     {!loading && !user && loginItem && renderPrimaryMenuItem(loginItem, true)}
                     {!loading && !user && signupItem && (
                       <Button asChild size="sm" className="w-full mt-2" onClick={() => setMobileMenuOpen(false)}>
                         <Link href={signupItem.href}>{signupItem.label}</Link>
                       </Button>
                     )}
                   </>
                 )}
               </nav>
             </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
