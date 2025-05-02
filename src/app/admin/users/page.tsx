'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/config/firebase';
import { collection, getDocs, doc, getDoc, updateDoc, setDoc, query, orderBy, Timestamp } from 'firebase/firestore';
import { UserRole, UserProfile, WithId } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Pencil, Trash2, AlertCircle, ShieldCheck, UserCheck, Mail, Shield, Clock, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function UsersAdminPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<WithId<UserProfile>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Форма создания пользователя
  const [newUser, setNewUser] = useState({
    displayName: '',
    email: '',
    role: 'Volunteer' as UserRole,
    sendInvite: true,
    password: '',
  });
  
  // Эффект для загрузки списка пользователей
  useEffect(() => {
    if (!loading && (!user || userProfile?.role !== 'Admin')) {
      router.push('/');
      return;
    }
    
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const usersRef = collection(db, 'users');
        const q = query(usersRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        
        const usersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data() as UserProfile
        }));
        
        setUsers(usersData);
      } catch (err: any) {
        console.error('Error fetching users:', err);
        setError(err.message || 'Не удалось загрузить список пользователей');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user && userProfile?.role === 'Admin') {
      fetchUsers();
    }
  }, [user, userProfile, loading, router]);
  
  // Обработчик изменения полей формы
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
  };
  
  // Обработчик изменения роли
  const handleRoleChange = (value: string) => {
    setNewUser(prev => ({ ...prev, role: value as UserRole }));
  };
  
  // Обработчик изменения чекбокса
  const handleCheckboxChange = (checked: boolean) => {
    setNewUser(prev => ({ ...prev, sendInvite: checked }));
  };
  
  // Получение цвета для бейджа роли
  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'Admin':
        return 'bg-red-500 hover:bg-red-600';
      case 'LeagueLeader':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'Organizer':
        return 'bg-green-500 hover:bg-green-600';
      case 'Moderator':
        return 'bg-purple-500 hover:bg-purple-600';
      default:
        return 'bg-blue-500 hover:bg-blue-600';
    }
  };
  
  // Обработчик создания пользователя
  const handleCreateUser = async () => {
    try {
      // Здесь будет код для вызова Cloud Function, который создаст пользователя
      // Для целей демонстрации, предположим что это работает
      
      alert(`Пользователь создан:
Имя: ${newUser.displayName}
Email: ${newUser.email}
Роль: ${newUser.role}
Приглашение: ${newUser.sendInvite ? 'Отправлено' : 'Не отправлено'}`);
      
      // Закрыть модальное окно и сбросить форму
      setIsCreateModalOpen(false);
      setNewUser({
        displayName: '',
        email: '',
        role: 'Volunteer',
        sendInvite: true,
        password: '',
      });
      
    } catch (err: any) {
      console.error('Error creating user:', err);
      setError(err.message || 'Не удалось создать пользователя');
    }
  };
  
  // Если идет загрузка данных
  if (loading || isLoading) {
    return (
      <div className="container mx-auto p-8 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <Clock className="h-16 w-16 animate-spin text-primary mb-4" />
          <p className="text-xl">Загрузка списка пользователей...</p>
        </div>
      </div>
    );
  }
  
  // Если пользователь не имеет прав администратора
  if (!loading && (!user || userProfile?.role !== 'Admin')) {
    return (
      <div className="container mx-auto p-8">
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader className="bg-red-500 text-white">
            <CardTitle className="flex items-center">
              <AlertCircle className="h-6 w-6 mr-2" />
              Доступ запрещен
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="mb-4">У вас нет прав для доступа к этой странице. Только администраторы могут управлять пользователями.</p>
            <Button onClick={() => router.push('/')}>
              Вернуться на главную
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Управление пользователями</h1>
          <p className="text-muted-foreground mt-1">Создание и управление привилегированными аккаунтами</p>
        </div>
        
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-yellow-500 hover:bg-yellow-600">
              <PlusCircle className="h-5 w-5 mr-2" />
              Создать пользователя
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Создать нового пользователя</DialogTitle>
              <DialogDescription>
                Создайте новый аккаунт с указанной ролью. После сохранения пользователь получит приглашение по email.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Имя и фамилия</Label>
                <Input
                  id="displayName"
                  name="displayName"
                  value={newUser.displayName}
                  onChange={handleInputChange}
                  placeholder="Введите имя и фамилию"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={newUser.email}
                  onChange={handleInputChange}
                  placeholder="email@example.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Роль</Label>
                <Select value={newUser.role} onValueChange={handleRoleChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите роль" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Volunteer">Волонтер</SelectItem>
                    <SelectItem value="Organizer">Организатор</SelectItem>
                    <SelectItem value="LeagueLeader">Лидер Лиги</SelectItem>
                    <SelectItem value="Moderator">Модератор</SelectItem>
                    <SelectItem value="Admin">Администратор</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="sendInvite" 
                  checked={newUser.sendInvite}
                  onCheckedChange={handleCheckboxChange}
                />
                <Label htmlFor="sendInvite">Отправить приглашение по email</Label>
              </div>
              
              {!newUser.sendInvite && (
                <div className="space-y-2">
                  <Label htmlFor="password">Временный пароль</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={newUser.password}
                    onChange={handleInputChange}
                    placeholder="Введите временный пароль"
                  />
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Отмена
              </Button>
              {newUser.sendInvite ? (
                <Button onClick={handleCreateUser} className="bg-yellow-500 hover:bg-yellow-600">
                  Сохранить и выслать приглашение
                </Button>
              ) : (
                <Button onClick={handleCreateUser}>
                  Сохранить без приглашения
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <p>{error}</p>
        </div>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Список пользователей ({users.length})</CardTitle>
          <CardDescription>
            Управляйте пользователями системы и их ролями
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">Все</TabsTrigger>
              <TabsTrigger value="admins">Администраторы</TabsTrigger>
              <TabsTrigger value="organizers">Организаторы</TabsTrigger>
              <TabsTrigger value="leagues">Лидеры Лиг</TabsTrigger>
              <TabsTrigger value="volunteers">Волонтеры</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              <UserTable 
                users={users} 
                getRoleBadgeColor={getRoleBadgeColor} 
              />
            </TabsContent>
            
            <TabsContent value="admins">
              <UserTable 
                users={users.filter(user => user.role === 'Admin')} 
                getRoleBadgeColor={getRoleBadgeColor} 
              />
            </TabsContent>
            
            <TabsContent value="organizers">
              <UserTable 
                users={users.filter(user => user.role === 'Organizer')} 
                getRoleBadgeColor={getRoleBadgeColor} 
              />
            </TabsContent>
            
            <TabsContent value="leagues">
              <UserTable 
                users={users.filter(user => user.role === 'LeagueLeader')} 
                getRoleBadgeColor={getRoleBadgeColor} 
              />
            </TabsContent>
            
            <TabsContent value="volunteers">
              <UserTable 
                users={users.filter(user => user.role === 'Volunteer')} 
                getRoleBadgeColor={getRoleBadgeColor} 
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

// Компонент таблицы пользователей
interface UserTableProps {
  users: WithId<UserProfile>[];
  getRoleBadgeColor: (role: UserRole) => string;
}

function UserTable({ users, getRoleBadgeColor }: UserTableProps) {
  return users.length > 0 ? (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Имя</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Роль</TableHead>
            <TableHead>Дата создания</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead className="text-right">Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map(user => (
            <TableRow key={user.id}>
              <TableCell className="font-medium flex items-center gap-2">
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName || ''} 
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                    {user.displayName?.charAt(0) || '?'}
                  </div>
                )}
                {user.displayName || 'Без имени'}
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge className={getRoleBadgeColor(user.role)}>
                  {user.role}
                </Badge>
              </TableCell>
              <TableCell>
                {user.createdAt ? (
                  formatDistanceToNow(user.createdAt.toDate(), { 
                    addSuffix: true,
                    locale: ru
                  })
                ) : (
                  'Неизвестно'
                )}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="bg-green-100">
                  <Check className="h-3 w-3 mr-1" />
                  Активен
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  ) : (
    <div className="text-center py-8 text-muted-foreground">
      <p>Пользователи не найдены</p>
    </div>
  );
} 