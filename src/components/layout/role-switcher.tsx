'use client';

import React from 'react';
import { useRole } from '@/context/RoleContext';
import { UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CheckCircle } from 'lucide-react';

// Все доступные роли
const AVAILABLE_ROLES: UserRole[] = [
  'Volunteer',
  'Organizer',
  'SmallOrg',
  'Coordinator',
  'Analyst',
  'LeagueLeader',
  'Moderator',
  'Admin',
];

export function RoleSwitcher() {
  const { role, devSwitchRole, roleInfo } = useRole();
  
  // Если это не режим разработки или нет функции переключения, не отображаем компонент
  if (!devSwitchRole || process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="border-primary/30 bg-primary/5 text-primary">
            🧪 Роль: {roleInfo.name}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Переключение роли (DEV)</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {AVAILABLE_ROLES.map((r) => (
            <DropdownMenuItem
              key={r}
              onClick={() => devSwitchRole(r)}
              className="flex items-center justify-between cursor-pointer"
            >
              <span>{r}</span>
              {role === r && <CheckCircle className="h-4 w-4 text-primary" />}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Права: {roleInfo?.permissions ? roleInfo.permissions.slice(0, 3).join(', ') : 'Н/Д'}
            {roleInfo?.permissions && roleInfo.permissions.length > 3 ? '...' : ''}
          </DropdownMenuLabel>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
} 