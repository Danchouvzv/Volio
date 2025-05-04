'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { UserRole } from '@/types';
import { useI18n } from '@/context/I18nContext';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, CalendarDays, LayoutDashboard, CalendarPlus, User, Settings, MessagesSquare } from 'lucide-react';

interface NavItem {
  href: string;
  icon: string; // Имя иконки из Lucide Icons
  label: string;
  notifications?: number;
}

interface RoleInfo {
  name: string; // Отображаемое имя роли
  permissions: string[]; // Список прав
  navItems: NavItem[]; // Навигационные элементы доступные для роли
}

interface RoleContextType {
  role: UserRole;
  roleInfo: RoleInfo;
  hasPermission: (permission: string) => boolean;
  devSwitchRole?: (role: UserRole) => void; // Только для разработки
}

// Define permissions for each role
export const ROLE_ACCESS: Record<string, string[]> = {
  Admin: [
    'view:admin',
    'edit:events',
    'delete:events',
    'create:events',
    'view:events',
    'approve:events',
    'reject:events',
    'edit:users',
    'delete:users',
    'create:users',
    'view:users',
    'approve:users',
    'reject:users',
    'view:dashboard',
    'edit:settings',
    'view:settings',
    'create:feedback',
    'view:statistics',
  ],
  Organizer: [
    'create:events',
    'edit:events',
    'delete:events',
    'view:events',
    'manage:participants',
    'invite:users',
    'generate:qr',
    'view:dashboard',
    'create:feedback',
    'view:statistics',
    'manage:volunteers',
  ],
  Coordinator: [
    'view:events',
    'view:dashboard',
    'view:team',
    'view:participants',
    'view:details',
    'view:statistics',
    'write:messages',
    'pin:messages',
    'write:announcements',
    'create:tasks',
    'edit:tasks',
    'delete:tasks',
    'assign:tasks',
    'manage:tasks',
    'manage:volunteers',
  ],
  Volunteer: [
    'view:events',
    'view:team',
    'view:details',
    'view:tasks',
    'edit:assigned-tasks',
    'create:feedback',
  ],
  Participant: [
    'view:events',
    'register:events',
    'create:feedback',
    'view:details',
  ],
  User: [
    'view:events',
    'register:events',
    'create:profile',
    'edit:profile',
    'view:profile',
  ],
  Guest: ['view:events', 'register', 'login'],
}

// Define types for roles with multi-language support
export interface RoleTitle {
  en: string
  ru: string
  kk: string
}

export interface MenuItem {
  label: RoleTitle
  href: string
  icon: string
}

export interface RoleDetails {
  title: RoleTitle
  icon: string
  menuItems: MenuItem[]
}

// Define menu items for each role
export const ROLE_DETAILS: Record<string, RoleDetails> = {
  Admin: {
    title: {
      en: 'Administrator',
      ru: 'Администратор',
      kk: 'Әкімші',
    },
    icon: 'ShieldCheck',
    menuItems: [
      {
        label: {
          en: 'Dashboard',
          ru: 'Дашборд',
          kk: 'Басқару тақтасы',
        },
        href: '/',
        icon: 'LayoutDashboard',
      },
      {
        label: {
          en: 'User Management',
          ru: 'Управление пользователями',
          kk: 'Пайдаланушыларды басқару',
        },
        href: '/admin/users',
        icon: 'Users',
      },
      {
        label: {
          en: 'Event Management',
          ru: 'Управление событиями',
          kk: 'Оқиғаларды басқару',
        },
        href: '/admin/events',
        icon: 'Calendar',
      },
      {
        label: {
          en: 'Settings',
          ru: 'Настройки',
          kk: 'Параметрлер',
        },
        href: '/admin/settings',
        icon: 'Settings',
      },
    ],
  },
  Organizer: {
    title: {
      en: 'Organizer',
      ru: 'Организатор',
      kk: 'Ұйымдастырушы',
    },
    icon: 'CalendarDays',
    menuItems: [
      {
        label: {
          en: 'Dashboard',
          ru: 'Дашборд',
          kk: 'Басқару тақтасы',
        },
        href: '/',
        icon: 'LayoutDashboard',
      },
      {
        label: {
          en: 'My Events',
          ru: 'Мои события',
          kk: 'Менің оқиғаларым',
        },
        href: '/events',
        icon: 'Calendar',
      },
      {
        label: {
          en: 'Event Management',
          ru: 'Управление событиями',
          kk: 'Оқиғаларды басқару',
        },
        href: '/manage-events',
        icon: 'LayoutList',
      },
    ],
  },
  Coordinator: {
    title: {
      en: 'Coordinator',
      ru: 'Координатор',
      kk: 'Үйлестіруші',
    },
    icon: 'Clipboard',
    menuItems: [
      {
        label: {
          en: 'Dashboard',
          ru: 'Дашборд',
          kk: 'Басқару тақтасы',
        },
        href: '/',
        icon: 'LayoutDashboard',
      },
      {
        label: {
          en: 'Events',
          ru: 'Мероприятия',
          kk: 'Шаралар',
        },
        href: '/events',
        icon: 'Calendar',
      },
      {
        label: {
          en: 'Coordinator Dashboard',
          ru: 'Панель координатора',
          kk: 'Үйлестіруші тақтасы',
        },
        href: '/coordinator',
        icon: 'Clipboard',
      },
    ],
  },
  Volunteer: {
    title: {
      en: 'Volunteer',
      ru: 'Волонтер',
      kk: 'Еріктілер',
    },
    icon: 'HeartHandshake',
    menuItems: [
      {
        label: {
          en: 'Dashboard',
          ru: 'Дашборд',
          kk: 'Басқару тақтасы',
        },
        href: '/',
        icon: 'LayoutDashboard',
      },
      {
        label: {
          en: 'Events',
          ru: 'Мероприятия',
          kk: 'Шаралар',
        },
        href: '/events',
        icon: 'Calendar',
      },
      {
        label: {
          en: 'Profile',
          ru: 'Профиль',
          kk: 'Профиль',
        },
        href: '/profile',
        icon: 'User',
      },
      {
        label: {
          en: 'Settings',
          ru: 'Настройки',
          kk: 'Параметрлер',
        },
        href: '/settings',
        icon: 'Settings',
      }
    ],
  },
  Participant: {
    title: {
      en: 'Participant',
      ru: 'Участник',
      kk: 'Қатысушы',
    },
    icon: 'UserCheck',
    menuItems: [
      {
        label: {
          en: 'Dashboard',
          ru: 'Дашборд',
          kk: 'Басқару тақтасы',
        },
        href: '/',
        icon: 'LayoutDashboard',
      },
      {
        label: {
          en: 'Events',
          ru: 'Мероприятия',
          kk: 'Шаралар',
        },
        href: '/events',
        icon: 'Calendar',
      },
      {
        label: {
          en: 'My Tickets',
          ru: 'Мои билеты',
          kk: 'Менің билеттерім',
        },
        href: '/tickets',
        icon: 'Ticket',
      },
    ],
  },
  User: {
    title: {
      en: 'User',
      ru: 'Пользователь',
      kk: 'Пайдаланушы',
    },
    icon: 'User',
    menuItems: [
      {
        label: {
          en: 'Dashboard',
          ru: 'Дашборд',
          kk: 'Басқару тақтасы',
        },
        href: '/',
        icon: 'LayoutDashboard',
      },
      {
        label: {
          en: 'Events',
          ru: 'Мероприятия',
          kk: 'Шаралар',
        },
        href: '/events',
        icon: 'Calendar',
      },
      {
        label: {
          en: 'Profile',
          ru: 'Профиль',
          kk: 'Профиль',
        },
        href: '/profile',
        icon: 'User',
      },
    ],
  },
  Guest: {
    title: {
      en: 'Guest',
      ru: 'Гость',
      kk: 'Қонақ',
    },
    icon: 'User',
    menuItems: [
      {
        label: {
          en: 'Home',
          ru: 'Главная',
          kk: 'Басты бет',
        },
        href: '/',
        icon: 'Home',
      },
      {
        label: {
          en: 'Events',
          ru: 'Мероприятия',
          kk: 'Шаралар',
        },
        href: '/events',
        icon: 'Calendar',
      },
      {
        label: {
          en: 'Login',
          ru: 'Вход',
          kk: 'Кіру',
        },
        href: '/auth/login',
        icon: 'LogIn',
      },
    ],
  },
}

// Создаем контекст
const RoleContext = createContext<RoleContextType | undefined>(undefined);

// Провайдер для контекста ролей
export function RoleProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole>('Volunteer'); // По умолчанию Volunteer

  // Обновляем роль при изменении пользователя
  useEffect(() => {
    if (user?.role) {
      setRole(user.role);
    } else {
      setRole('Volunteer'); // Если нет роли, устанавливаем Volunteer
    }
  }, [user]);

  // Функция для проверки наличия права у текущей роли
  const hasPermission = (permission: string) => {
    return ROLE_ACCESS[role]?.includes(permission) || false;
  };

  // Функция для переключения роли (только в режиме разработки)
  const devSwitchRole = process.env.NODE_ENV === 'development'
    ? (newRole: UserRole) => setRole(newRole)
    : undefined;

  // Формируем roleInfo с правильной структурой
  const getRoleInfo = (): RoleInfo => {
    const details = ROLE_DETAILS[role];
    const permissions = ROLE_ACCESS[role] || [];
    
    return {
      name: details?.title?.ru || role,
      permissions: permissions,
      navItems: details?.menuItems?.map(item => ({
        href: item.href,
        icon: item.icon,
        label: item.label.ru
      })) || []
    };
  };

  // Предоставляем контекст с текущей ролью, информацией о роли и функциями
  return (
    <RoleContext.Provider value={{ 
      role, 
      roleInfo: getRoleInfo(), 
      hasPermission,
      devSwitchRole
    }}>
      {children}
    </RoleContext.Provider>
  );
}

// Хук для использования контекста ролей
export function useRole(): RoleContextType {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}

// Модифицируем HOC для защиты компонентов на основе разрешений
export function withRoleGuard(requiredPermissions: string | string[]) {
  return function <P extends object>(Component: React.ComponentType<P>) {
    const WithRoleGuard = (props: P) => {
      const { hasPermission, role, roleInfo } = useRole();
      const { t } = useI18n();
      
      // Преобразуем строку в массив для единообразной обработки
      const permissions = Array.isArray(requiredPermissions) 
        ? requiredPermissions 
        : [requiredPermissions];
      
      // Проверяем наличие хотя бы одного разрешения
      const isAuthorized = permissions.some(perm => hasPermission(perm));
      
      if (!isAuthorized) {
        return (
          <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">{t('auth.accessDenied') || 'Доступ ограничен'}</h2>
            <p className="text-muted-foreground mb-6">
              {t('auth.noPermission', { 
                permissions: permissions.join(', '), 
                role: roleInfo.name 
              }) || `У вас нет необходимых прав для доступа к этой странице. Текущая роль: ${roleInfo.name}`}
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              {t('auth.contactAdmin') || 'Свяжитесь с администратором для получения необходимого доступа.'}
            </p>
            
            <Button 
              variant="outline"
              className="mt-6"
              asChild
            >
              <Link href="/">{t('common.backToHome') || 'Вернуться на главную'}</Link>
            </Button>
          </div>
        );
      }
      
      return <Component {...props} />;
    };
    
    // Устанавливаем displayName для React DevTools
    const componentName = Component.displayName || Component.name || 'Component';
    WithRoleGuard.displayName = `WithRoleGuard(${componentName})`;
    
    return WithRoleGuard;
  };
} 