'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DEMO_USERS, signInWithDemo } from '@/services/auth-helper';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, UserCog, Users, UserPlus } from 'lucide-react';
import Link from 'next/link';

export default function DemoLoginPage() {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (userType: keyof typeof DEMO_USERS) => {
    setIsLoading(userType);
    setError(null);

    try {
      await signInWithDemo(userType);
      router.push('/');
    } catch (error: any) {
      console.error('Error logging in:', error);
      setError(error.message || 'Ошибка входа');
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="container mx-auto flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Демо-Вход в Volio</h1>
          <p className="text-muted-foreground">
            Выберите тип пользователя для демонстрации возможностей платформы
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-md bg-destructive/10 text-destructive text-center">
            {error}
          </div>
        )}

        <div className="grid gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Роль Волонтера</CardTitle>
              <CardDescription>
                Доступ к участию в мероприятиях, поиск мероприятий, профиль с достижениями
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p><strong>Email:</strong> {DEMO_USERS.volunteer.email}</p>
              <p><strong>Имя:</strong> {DEMO_USERS.volunteer.name}</p>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={() => handleLogin('volunteer')}
                disabled={!!isLoading}
              >
                {isLoading === 'volunteer' ? 'Вход...' : 'Войти как Волонтер'}
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Роль Организатора</CardTitle>
              <CardDescription>
                Создание мероприятий, управление участниками, назначение задач
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p><strong>Email:</strong> {DEMO_USERS.organizer.email}</p>
              <p><strong>Имя:</strong> {DEMO_USERS.organizer.name}</p>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={() => handleLogin('organizer')}
                disabled={!!isLoading}
              >
                {isLoading === 'organizer' ? 'Вход...' : 'Войти как Организатор'}
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Роль Лидера Лиги</CardTitle>
              <CardDescription>
                Управление лигой, создание официальных мероприятий, модерация
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p><strong>Email:</strong> {DEMO_USERS.leagueLeader.email}</p>
              <p><strong>Имя:</strong> {DEMO_USERS.leagueLeader.name}</p>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={() => handleLogin('leagueLeader')}
                disabled={!!isLoading}
              >
                {isLoading === 'leagueLeader' ? 'Вход...' : 'Войти как Лидер Лиги'}
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Хотите вернуться на обычную страницу входа?
          </p>
          <Button variant="link" asChild>
            <Link href="/login">Обычный вход</Link>
          </Button>
        </div>
      </div>
    </div>
  );
} 