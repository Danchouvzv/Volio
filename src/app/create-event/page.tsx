'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon, MapPin, ChevronRight, AlertTriangle, Check, LucideLoader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createEvent } from '@/services/events';
import { UserRole } from '@/types';
import { ru } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Timestamp } from 'firebase/firestore';

// Типы событий
const eventCategories = [
  'Environment',
  'Education',
  'Health',
  'Animals',
  'Community',
  'Technology',
  'Social',
  'Culture',
  'Sports'
];

// Доступные бейджи
const availableBadges = [
  'team-player',
  'eco-warrior',
  'first-event',
  'leadership',
  'tech-savvy',
  'community-builder',
  'animal-welfare',
  'education',
  'healthcare',
  'cultural-ambassador',
  'sports-enthusiast'
];

export default function CreateEventPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Состояние формы
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>('Community');
  const [isOnline, setIsOnline] = useState(false);
  const [address, setAddress] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(
    new Date(new Date().setHours(new Date().getHours() + 3))
  );
  const [requiredBadges, setRequiredBadges] = useState<string[]>([]);
  const [isLeagueEvent, setIsLeagueEvent] = useState(false);
  const [maxParticipants, setMaxParticipants] = useState<number>(20);

  // Проверяем, является ли пользователь лидером лиги
  const isLeagueLeader = userProfile?.role === 'LeagueLeader' || userProfile?.role === 'Admin';

  // Проверка прав доступа
  const canCreateEvents = 
    userProfile?.role === 'Organizer' || 
    userProfile?.role === 'LeagueLeader' || 
    userProfile?.role === 'Admin' ||
    userProfile?.role === 'SmallOrg';

  if (!loading && !canCreateEvents) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <AlertTriangle className="h-12 w-12 mx-auto text-amber-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Недостаточно прав</h1>
        <p className="text-muted-foreground mb-4">
          Для создания мероприятий требуется роль Организатора или Лидера Лиги.
        </p>
        <Button asChild>
          <a href="/">Вернуться на главную</a>
        </Button>
      </div>
    );
  }

  // Обработка отправки формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    // Валидация
    if (!title || !description || !startDate || !endDate) {
      setFormError('Пожалуйста, заполните все обязательные поля');
      return;
    }

    if (!isOnline && !address) {
      setFormError('Для офлайн-мероприятия необходимо указать адрес');
      return;
    }

    if (startDate >= endDate) {
      setFormError('Дата начала должна быть раньше даты окончания');
      return;
    }

    setIsSubmitting(true);

    try {
      // Мок-координаты для демонстрации
      const location = !isOnline
        ? {
            lat: 43.25, // Алматы
            lng: 76.95,
            address
          }
        : null;

      // Создаем событие
      await createEvent({
        title,
        description,
        category,
        isOnline,
        location,
        startDate: Timestamp.fromDate(startDate),
        endDate: Timestamp.fromDate(endDate),
        organizerId: user?.uid || '',
        organizerName: userProfile?.displayName || '',
        requiredBadges,
        isLeagueEvent: isLeagueLeader ? isLeagueEvent : false,
        maxParticipants
      });

      setFormSuccess('Мероприятие успешно создано!');
      
      // Перенаправление на страницу списка событий через 2 секунды
      setTimeout(() => {
        router.push('/events');
      }, 2000);
    } catch (error: any) {
      console.error('Error creating event:', error);
      setFormError(error.message || 'Ошибка при создании мероприятия');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Обработка выбора бейджа
  const toggleBadge = (badge: string) => {
    if (requiredBadges.includes(badge)) {
      setRequiredBadges(requiredBadges.filter(b => b !== badge));
    } else {
      setRequiredBadges([...requiredBadges, badge]);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center mb-6">
          <h1 className="text-3xl font-bold">Создание нового мероприятия</h1>
        </div>

        {formError && (
          <div className="bg-destructive/10 p-3 rounded-md text-destructive mb-6 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
            <p>{formError}</p>
          </div>
        )}

        {formSuccess && (
          <div className="bg-green-500/10 p-3 rounded-md text-green-500 mb-6 flex items-center">
            <Check className="h-5 w-5 mr-2 flex-shrink-0" />
            <p>{formSuccess}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Основная информация</CardTitle>
              <CardDescription>
                Заполните основную информацию о вашем мероприятии
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Название мероприятия *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Введите название мероприятия"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Описание *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Подробно опишите мероприятие"
                  className="min-h-32"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Категория *</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Выберите категорию" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="isOnline">Онлайн-мероприятие</Label>
                  <Switch
                    id="isOnline"
                    checked={isOnline}
                    onCheckedChange={setIsOnline}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  {isOnline
                    ? 'Мероприятие будет проводиться онлайн'
                    : 'Мероприятие будет проводиться офлайн'}
                </p>
              </div>

              {!isOnline && (
                <div className="space-y-2">
                  <Label htmlFor="address">Адрес проведения *</Label>
                  <div className="flex">
                    <MapPin className="mr-2 h-4 w-4 text-muted-foreground self-center" />
                    <Input
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Введите физический адрес проведения мероприятия"
                      required={!isOnline}
                    />
                  </div>
                </div>
              )}

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Дата и время начала *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !startDate && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? (
                          format(startDate, 'PPP p', { locale: ru })
                        ) : (
                          <span>Выберите дату и время</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                      />
                      <div className="p-3 border-t">
                        <Label htmlFor="startTime">Время начала</Label>
                        <Input
                          id="startTime"
                          type="time"
                          className="mt-2"
                          value={startDate ? format(startDate, 'HH:mm') : ''}
                          onChange={(e) => {
                            if (startDate && e.target.value) {
                              const [hours, minutes] = e.target.value.split(':');
                              const newDate = new Date(startDate);
                              newDate.setHours(parseInt(hours, 10));
                              newDate.setMinutes(parseInt(minutes, 10));
                              setStartDate(newDate);
                            }
                          }}
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">Дата и время окончания *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !endDate && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? (
                          format(endDate, 'PPP p', { locale: ru })
                        ) : (
                          <span>Выберите дату и время</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                      />
                      <div className="p-3 border-t">
                        <Label htmlFor="endTime">Время окончания</Label>
                        <Input
                          id="endTime"
                          type="time"
                          className="mt-2"
                          value={endDate ? format(endDate, 'HH:mm') : ''}
                          onChange={(e) => {
                            if (endDate && e.target.value) {
                              const [hours, minutes] = e.target.value.split(':');
                              const newDate = new Date(endDate);
                              newDate.setHours(parseInt(hours, 10));
                              newDate.setMinutes(parseInt(minutes, 10));
                              setEndDate(newDate);
                            }
                          }}
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxParticipants">Максимальное количество участников</Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  min="1"
                  max="1000"
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(parseInt(e.target.value))}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Требования к участникам</CardTitle>
              <CardDescription>
                Укажите, какие навыки и достижения необходимы для участия
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Необходимые навыки и бейджи</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Выберите бейджи, которые должны быть у волонтеров для участия
                </p>

                <ScrollArea className="h-48 border rounded-md p-4">
                  <div className="flex flex-wrap gap-2">
                    {availableBadges.map((badge) => (
                      <Badge 
                        key={badge}
                        variant={requiredBadges.includes(badge) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleBadge(badge)}
                      >
                        {badge}
                      </Badge>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {isLeagueLeader && (
                <div className="space-y-2 mt-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="isLeagueEvent">Мероприятие от имени Лиги</Label>
                    <Switch
                      id="isLeagueEvent"
                      checked={isLeagueEvent}
                      onCheckedChange={setIsLeagueEvent}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Официальное мероприятие от имени Лиги с особым статусом
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="mt-6 flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/events')}
              disabled={isSubmitting}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <LucideLoader2 className="mr-2 h-4 w-4 animate-spin" />
                  Создание...
                </>
              ) : (
                <>
                  Создать мероприятие
                  <ChevronRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
