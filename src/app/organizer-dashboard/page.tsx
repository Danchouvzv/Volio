'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getUserEvents } from '@/services/events';
import { WithId, Event } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarPlus, BarChart2, Users, Calendar, Clock, MapPin, Trash2, Edit, MessageSquare, User, AlertCircle, Download } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

export default function OrganizerDashboardPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<WithId<Event>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Проверка прав доступа
  const isOrganizer = 
    userProfile?.role === 'Organizer' || 
    userProfile?.role === 'LeagueLeader' ||
    userProfile?.role === 'Admin';
    
  // При монтировании компонента
  useEffect(() => {
    // Если аутентификация еще не завершена, выходим из эффекта
    if (loading) return;
    
    // Если пользователь не имеет прав, перенаправляем на главную
    if (!isOrganizer) {
      router.push('/');
      return;
    }
    
    const fetchEvents = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const fetchedEvents = await getUserEvents(user.uid);
        setEvents(fetchedEvents);
      } catch (err: any) {
        console.error('Error fetching events:', err);
        setError(err.message || 'Ошибка при загрузке мероприятий');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEvents();
  }, [user, userProfile, loading, router, isOrganizer]);
  
  // Если идет загрузка
  if (loading || isLoading) {
    return (
      <div className="container mx-auto max-w-7xl p-4 md:p-8 flex items-center justify-center min-h-[80vh]">
        <div className="flex flex-col items-center">
          <Clock className="h-16 w-16 animate-spin text-primary mb-4" />
          <p className="text-xl">Загрузка дашборда...</p>
        </div>
      </div>
    );
  }
  
  // Если пользователь не авторизован или не имеет прав
  if (!loading && (!user || !isOrganizer)) {
    return (
      <div className="container mx-auto max-w-7xl p-4 md:p-8">
        <Card className="w-full max-w-3xl mx-auto">
          <CardHeader className="bg-red-500 text-white">
            <CardTitle className="flex items-center">
              <AlertCircle className="h-6 w-6 mr-2" />
              Доступ запрещен
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="mb-4">Для доступа к этой странице требуется роль Организатора или Лидера Лиги.</p>
            <Button onClick={() => router.push('/')}>
              Вернуться на главную
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto max-w-7xl p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Панель организатора</h1>
          <p className="text-muted-foreground">
            Управляйте вашими мероприятиями и отслеживайте статистику
          </p>
        </div>
        
        <Button 
          size="lg" 
          onClick={() => router.push('/create-event')}
          className="bg-red-500 hover:bg-red-600 text-white"
        >
          <CalendarPlus className="h-5 w-5 mr-2" />
          Создать мероприятие
        </Button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <p>{error}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Статистическая карточка 1 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-primary" />
              Мероприятия
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{events.length}</div>
            <p className="text-muted-foreground text-sm">Всего мероприятий</p>
          </CardContent>
        </Card>
        
        {/* Статистическая карточка 2 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center">
              <Users className="h-5 w-5 mr-2 text-indigo-500" />
              Участники
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {events.reduce((total, event) => total + (event.participants?.length || 0), 0)}
            </div>
            <p className="text-muted-foreground text-sm">Всего участников</p>
          </CardContent>
        </Card>
        
        {/* Статистическая карточка 3 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center">
              <BarChart2 className="h-5 w-5 mr-2 text-green-500" />
              Активность
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {events.filter(event => 
                event.endDate.toDate() > new Date()
              ).length}
            </div>
            <p className="text-muted-foreground text-sm">Активных мероприятий</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Мои мероприятия</h2>
        
        <Tabs defaultValue="upcoming">
          <TabsList className="mb-6">
            <TabsTrigger value="upcoming">Предстоящие</TabsTrigger>
            <TabsTrigger value="past">Прошедшие</TabsTrigger>
            <TabsTrigger value="all">Все</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming">
            <EventsList 
              events={events.filter(event => event.endDate.toDate() > new Date())}
              router={router}
            />
          </TabsContent>
          
          <TabsContent value="past">
            <EventsList 
              events={events.filter(event => event.endDate.toDate() <= new Date())}
              router={router}
            />
          </TabsContent>
          
          <TabsContent value="all">
            <EventsList 
              events={events}
              router={router}
            />
          </TabsContent>
        </Tabs>
      </div>
      
      {userProfile?.role === 'LeagueLeader' && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Лига и Управление</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Управление Организаторами</CardTitle>
                <CardDescription>
                  Добавляйте новых организаторов в вашу лигу
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Как Лидер Лиги, вы можете приглашать и управлять организаторами в вашей экосистеме.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" onClick={() => router.push('/league/organizers')}>
                  <User className="h-4 w-4 mr-2" />
                  Управление Организаторами
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Статистика Лиги</CardTitle>
                <CardDescription>
                  Аналитика и статистика по всей лиге
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Просматривайте детальную статистику и аналитику по всем мероприятиям вашей лиги.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" onClick={() => router.push('/league/analytics')}>
                  <BarChart2 className="h-4 w-4 mr-2" />
                  Открыть Аналитику
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
      
      <div>
        <h2 className="text-2xl font-bold mb-4">Статистика и Отчеты</h2>
        <Card>
          <CardHeader>
            <CardTitle>Активность Волонтеров</CardTitle>
            <CardDescription>
              График регистраций и участия волонтеров за последнее время
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {/* Здесь будет график, реализованный через Recharts или другую библиотеку */}
            <div className="h-full flex items-center justify-center bg-muted/20 rounded-md">
              <p className="text-muted-foreground">График загружается...</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => router.push('/analytics')}>
              Подробная статистика
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Скачать отчет CSV
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

interface EventsListProps {
  events: WithId<Event>[];
  router: ReturnType<typeof useRouter>;
}

// Компонент списка мероприятий
function EventsList({ events, router }: EventsListProps) {
  if (events.length === 0) {
    return (
      <div className="text-center p-10 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <Calendar className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
        <h3 className="text-lg font-medium mb-1">Нет мероприятий</h3>
        <p className="text-muted-foreground">
          У вас еще нет мероприятий в этой категории
        </p>
        <Button 
          className="mt-4" 
          onClick={() => router.push('/create-event')}
        >
          Создать мероприятие
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {events.map(event => (
        <Card key={event.id} className="overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-1/4 bg-gray-100 dark:bg-gray-800 p-6 flex flex-col justify-center items-center">
              <div className="text-center">
                <h3 className="text-xl font-bold mb-1">
                  {format(event.startDate.toDate(), 'd MMM', { locale: ru })}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {format(event.startDate.toDate(), 'HH:mm', { locale: ru })}
                </p>
                
                {event.isLeagueEvent && (
                  <Badge className="mt-2 bg-yellow-500">Лига</Badge>
                )}
                
                {event.isSmallOrgEvent && (
                  <Badge className="mt-2 bg-purple-500">Малая Организация</Badge>
                )}
                
                {event.isOnline ? (
                  <Badge variant="outline" className="mt-2">Онлайн</Badge>
                ) : (
                  <div className="flex items-center mt-2 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3 mr-1" />
                    {event.location?.address ? 
                      event.location.address.substring(0, 20) + '...' : 
                      'Адрес не указан'
                    }
                  </div>
                )}
              </div>
            </div>
            
            <div className="w-full md:w-2/4 p-6">
              <h3 className="text-xl font-bold mb-2">{event.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {event.description?.substring(0, 150)}
                {event.description && event.description.length > 150 ? '...' : ''}
              </p>
              
              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="h-4 w-4 mr-1" />
                <span>{event.participants?.length || 0} участников</span>
              </div>
            </div>
            
            <div className="w-full md:w-1/4 p-6 bg-gray-50 dark:bg-gray-900 flex flex-col justify-center">
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push(`/events/${event.id}`)}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Просмотр
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push(`/events/${event.id}/edit`)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Редактировать
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push(`/events/${event.id}/candidates`)}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Кандидаты
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push(`/events/${event.id}/chat`)}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Чат
                </Button>
                
                <Separator />
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-red-500 hover:text-red-700"
                  onClick={() => {
                    if (confirm('Вы уверены, что хотите удалить это мероприятие?')) {
                      // Функция удаления мероприятия
                      console.log('Delete event:', event.id);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Удалить
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
} 