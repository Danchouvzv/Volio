'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { User, Bell, Lock, Globe, CreditCard, Code, Upload, Mail, Phone, Sun, Moon } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useI18n } from '@/context/I18nContext';
// TODO: Import necessary services (e.g., updateProfile, updateUserSettings)

// Placeholder components for each settings section
const ProfileSettings = ({ userProfile }: { userProfile: any }) => {
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        displayName: userProfile?.displayName || '',
        pronouns: userProfile?.pronouns || '',
        bio: userProfile?.bio || '',
        phoneNumber: userProfile?.phoneNumber || ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const handleSave = () => {
        // Здесь в реальном приложении будет сохранение данных в Firebase
        // Имитируем успешное сохранение
        localStorage.setItem('userProfile', JSON.stringify({
            ...userProfile,
            ...formData
        }));
        
        toast({
            title: "Профиль обновлен",
            description: "Ваши данные успешно сохранены.",
            variant: "default"
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Profile & Security</CardTitle>
                <CardDescription>Update your personal information and security settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                        <AvatarImage src={userProfile?.photoURL} alt={userProfile?.displayName || 'User'} />
                        <AvatarFallback>{userProfile?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <Button variant="outline" size="sm"><Upload className="mr-2 h-4 w-4" /> Upload Photo</Button>
                     <Button variant="ghost" size="sm" className="text-destructive">Remove</Button>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="displayName">Display Name</Label>
                        <Input id="displayName" value={formData.displayName} onChange={handleChange} />
                    </div>
                    <div>
                        <Label htmlFor="pronouns">Pronouns (Optional)</Label>
                        <Input id="pronouns" placeholder="e.g., she/her, they/them" value={formData.pronouns} onChange={handleChange} />
                    </div>
                </div>
                <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea id="bio" placeholder="Tell us a bit about yourself" value={formData.bio} onChange={handleChange} className="min-h-[80px]"/>
                </div>
                <div className="space-y-2">
                    <Label>Email</Label>
                    <div className="flex items-center gap-2">
                        <Input value={userProfile?.email || ''} readOnly className="bg-muted/50"/>
                        {/* TODO: Add verification status badge */}
                        <Button variant="outline" size="sm" disabled>Change Email</Button>
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <div className="flex items-center gap-2">
                         <Input id="phoneNumber" placeholder="+1 234 567 8900" value={formData.phoneNumber} onChange={handleChange} />
                         <Button variant="outline" size="sm">Verify</Button>
                         {/* TODO: Add MFA toggle */}
                    </div>
                 </div>
                 {/* TODO: Add Password Change Section */}
                 <Button onClick={handleSave}>Save Profile</Button>
            </CardContent>
        </Card>
    );
};

const LocalizationSettings = () => {
    const { toast } = useToast();
    const { theme, setTheme } = useTheme();
    const { locale, setLocale, t } = useI18n();
    const [language, setLanguage] = useState(() => {
        // Initialize from locale context
        return locale;
    });
    const [timezone, setTimezone] = useState(() => {
        // Check localStorage on initialization
        if (typeof window !== 'undefined') {
            return localStorage.getItem('timezone') || 'UTC';
        }
        return 'UTC';
    });

    // Update language state when locale changes
    useEffect(() => {
        setLanguage(locale);
    }, [locale]);

    // Handler for saving localization settings
    const handleSaveLocalization = () => {
        // Update context locale (which will update localStorage)
        setLocale(language);
        localStorage.setItem('timezone', timezone);
        toast({
            title: t('settings.localizationSaved'),
            description: `${t('settings.language')}: ${language}, ${t('settings.timezone')}: ${timezone}`,
            variant: "default"
        });
    };

    return (
         <Card>
            <CardHeader>
                <CardTitle>{t('settings.localization')}</CardTitle>
                <CardDescription>{t('settings.localizationDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <Label htmlFor="language">{t('settings.language')}</Label>
                     <Select value={language} onValueChange={setLanguage}>
                       <SelectTrigger id="language">
                         <SelectValue placeholder={t('settings.selectLanguage')} />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="en">English</SelectItem>
                         <SelectItem value="ru">Русский</SelectItem>
                         <SelectItem value="kz">Қазақша</SelectItem>
                       </SelectContent>
                     </Select>
                </div>
                 <div>
                     <Label htmlFor="timezone">{t('settings.timezone')}</Label>
                      <Select value={timezone} onValueChange={setTimezone}>
                        <SelectTrigger id="timezone">
                          <SelectValue placeholder={t('settings.selectTimezone')} />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                           <SelectItem value="UTC">UTC</SelectItem>
                           <SelectItem value="Europe/London">Europe/London</SelectItem>
                           <SelectItem value="America/New_York">America/New York</SelectItem>
                           <SelectItem value="Asia/Almaty">Asia/Almaty</SelectItem>
                           <SelectItem value="Europe/Moscow">Europe/Moscow</SelectItem>
                           <SelectItem value="Asia/Tokyo">Asia/Tokyo</SelectItem>
                        </SelectContent>
                      </Select>
                 </div>

                {/* Theme switcher */}
                <div className="space-y-2 pt-4">
                    <Label>{t('settings.theme')}</Label>
                    <div className="theme-selector">
                        <button 
                            type="button"
                            onClick={() => setTheme('light')}
                            className={cn(
                                "theme-option",
                                theme === 'light' && "theme-option-active"
                            )}
                            aria-selected={theme === 'light'}
                        >
                            <Sun className="h-4 w-4" />
                            <span>{t('settings.light')}</span>
                        </button>
                        <button 
                            type="button"
                            onClick={() => setTheme('dark')}
                            className={cn(
                                "theme-option",
                                theme === 'dark' && "theme-option-active"
                            )}
                            aria-selected={theme === 'dark'}
                        >
                            <Moon className="h-4 w-4" />
                            <span>{t('settings.dark')}</span>
                        </button>
                        <button 
                            type="button"
                            onClick={() => setTheme('system')}
                            className={cn(
                                "theme-option",
                                theme === 'system' && "theme-option-active"
                            )}
                            aria-selected={theme === 'system'}
                        >
                            <Globe className="h-4 w-4" />
                            <span>{t('settings.system')}</span>
                        </button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {t('settings.themeDescription')}
                    </p>
                </div>
                  
                <Button onClick={handleSaveLocalization} className="mt-4">{t('settings.saveLocalization')}</Button>
            </CardContent>
        </Card>
    );
}

const NotificationSettings = () => {
    const { toast } = useToast();
    const [pushSettings, setPushSettings] = useState(() => {
        // Загружаем настройки из localStorage при инициализации
        if (typeof window !== 'undefined') {
            const savedSettings = localStorage.getItem('pushNotifications');
            return savedSettings ? JSON.parse(savedSettings) : {
                chat: true,
                events: true,
                friends: true
            };
        }
        return {
            chat: true,
            events: true,
            friends: true
        };
    });
    
    const [emailDigest, setEmailDigest] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('emailDigest') || 'weekly';
        }
        return 'weekly';
    });

    const handlePushToggle = (setting: string) => {
        setPushSettings(prev => ({
            ...prev,
            [setting]: !prev[setting]
        }));
    };

    const saveNotificationSettings = () => {
        localStorage.setItem('pushNotifications', JSON.stringify(pushSettings));
        localStorage.setItem('emailDigest', emailDigest);
        toast({
            title: "Настройки уведомлений сохранены",
            description: "Ваши предпочтения по уведомлениям успешно обновлены.",
            variant: "default"
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Manage how you receive updates from Volio.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <h4 className="font-medium text-sm">Push Notifications (Mobile/Web)</h4>
                 <div className="flex items-center justify-between rounded-lg border p-3">
                    <Label htmlFor="push-chat">New Chat Messages</Label>
                    <Switch 
                        id="push-chat" 
                        checked={pushSettings.chat}
                        onCheckedChange={() => handlePushToggle('chat')}
                    />
                 </div>
                  <div className="flex items-center justify-between rounded-lg border p-3">
                     <Label htmlFor="push-events">Event Updates & Reminders</Label>
                     <Switch 
                        id="push-events" 
                        checked={pushSettings.events}
                        onCheckedChange={() => handlePushToggle('events')}
                     />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-3">
                      <Label htmlFor="push-friends">Friend Requests</Label>
                      <Switch 
                        id="push-friends" 
                        checked={pushSettings.friends}
                        onCheckedChange={() => handlePushToggle('friends')}
                      />
                  </div>

                  <h4 className="font-medium text-sm pt-4">Email Notifications</h4>
                  <div className="flex items-center justify-between rounded-lg border p-3">
                      <Label htmlFor="email-digest">Email Digest Schedule</Label>
                       <Select value={emailDigest} onValueChange={setEmailDigest}>
                         <SelectTrigger id="email-digest" className="w-[180px]">
                           <SelectValue placeholder="Select schedule" />
                         </SelectTrigger>
                         <SelectContent>
                           <SelectItem value="daily">Daily</SelectItem>
                           <SelectItem value="weekly">Weekly</SelectItem>
                           <SelectItem value="off">Off</SelectItem>
                         </SelectContent>
                       </Select>
                  </div>
                 <Button onClick={saveNotificationSettings}>Save Notifications</Button>
            </CardContent>
        </Card>
    );
};

const PrivacySettings = () => {
    const { toast } = useToast();
    const [profileVisibility, setProfileVisibility] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('profileVisibility') || 'public';
        }
        return 'public';
    });
    
    const [hideActivity, setHideActivity] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('hideActivity') === 'true';
        }
        return false;
    });

    const savePrivacySettings = () => {
        localStorage.setItem('profileVisibility', profileVisibility);
        localStorage.setItem('hideActivity', hideActivity.toString());
        toast({
            title: "Настройки приватности обновлены",
            description: "Ваши предпочтения конфиденциальности успешно сохранены.",
            variant: "default"
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Privacy</CardTitle>
                <CardDescription>Control who can see your profile and activity.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <Label htmlFor="profile-visibility">Profile Visibility</Label>
                    <Select value={profileVisibility} onValueChange={setProfileVisibility}>
                       <SelectTrigger id="profile-visibility">
                         <SelectValue placeholder="Select visibility" />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="public">Public</SelectItem>
                         <SelectItem value="friends">Friends Only</SelectItem>
                         <SelectItem value="private">Only Me</SelectItem>
                       </SelectContent>
                     </Select>
                     <p className="text-xs text-muted-foreground mt-1">Who can view your full profile details.</p>
                </div>
                 <div className="flex items-center justify-between rounded-lg border p-3">
                     <Label htmlFor="hide-activity">Hide My Activity from Feed</Label>
                     <Switch 
                        id="hide-activity" 
                        checked={hideActivity}
                        onCheckedChange={setHideActivity}
                     />
                 </div>
                  {/* TODO: Add Blocked Users List */}
                 <Button onClick={savePrivacySettings}>Save Privacy Settings</Button>
            </CardContent>
        </Card>
    );
};

const BillingSettings = ({ userProfile }: { userProfile: any }) => {
    // Visible only to SmallOrg, Organizer roles etc.
    if (!['SmallOrg', 'Organizer', 'Admin'].includes(userProfile?.role)) {
        return null;
    }

    // TODO: Fetch subscription details from backend/Stripe
    const subscription = { status: 'active', renews: 'July 30, 2024', plan: 'Pro Monthly' }; // Placeholder

    return (
        <Card>
            <CardHeader>
                <CardTitle>Subscription & Billing</CardTitle>
                <CardDescription>Manage your Volio organization subscription.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 {subscription ? (
                     <>
                         <p><strong>Current Plan:</strong> {subscription.plan}</p>
                         <p><strong>Status:</strong> <Badge variant={subscription.status === 'active' ? 'default' : 'destructive'}>{subscription.status}</Badge></p>
                         <p><strong>Renews On:</strong> {subscription.renews}</p>
                         <div className="flex gap-2 pt-2">
                              <Button variant="outline">View Invoices</Button>
                              <Button>Manage Subscription (Stripe)</Button> {/* Links to Stripe Portal */}
                         </div>
                     </>
                 ) : (
                     <>
                         <p className="text-muted-foreground">You do not have an active subscription.</p>
                         <Button>Upgrade to Pro</Button>
                     </>
                 )}
            </CardContent>
        </Card>
    );
};

const DeveloperSettings = ({ userProfile }: { userProfile: any }) => {
     // TODO: Check feature flag or specific role for visibility
     if (userProfile?.role !== 'Admin') return null; // Example: Admin only

     // TODO: Implement API key generation/management and webhook testing
    return (
        <Card>
            <CardHeader>
                <CardTitle>Developer Settings</CardTitle>
                <CardDescription>Manage API keys and webhooks for integrations.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="font-medium">API Keys</p>
                <div className="border rounded p-3 text-muted-foreground">No API keys generated yet.</div>
                 <Button>Generate New API Key</Button>
                 <p className="font-medium pt-4">Webhooks</p>
                 <Input placeholder="Webhook URL for event notifications" />
                 <Button variant="outline">Test Webhook</Button>
            </CardContent>
        </Card>
    );
};


export default function SettingsPage() {
    const { user, userProfile, loading } = useAuth();
    const { toast } = useToast();

    // Загрузка настроек пользователя из localStorage после первого рендера
    useEffect(() => {
        if (!loading && user) {
            // Здесь можно загрузить сохраненные настройки из Firebase/API
            // или использовать local storage, как сейчас для демонстрации
            const savedProfile = localStorage.getItem('userProfile');
            if (savedProfile) {
                // В реальном приложении здесь будет обновление состояния через 
                // соответствующие сервисы или context
                console.log('Loaded saved profile:', JSON.parse(savedProfile));
            }
        }
    }, [loading, user]);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Skeleton className="h-8 w-1/4 mb-6" />
                <div className="flex gap-8">
                    <Skeleton className="h-16 w-48 rounded-lg" /> {/* Tabs Skeleton */}
                    <div className="flex-1 space-y-4">
                         <Skeleton className="h-64 w-full rounded-lg" />
                         <Skeleton className="h-32 w-full rounded-lg" />
                    </div>
                </div>
            </div>
        );
    }

    if (!user || !userProfile) {
        // Should be protected by middleware or redirect in AuthProvider ideally
        return <div className="container mx-auto px-4 py-8 text-center">Please log in to access settings.</div>;
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-5xl">
            <h1 className="text-3xl font-bold mb-8">Settings</h1>
            <Tabs defaultValue="profile" orientation="vertical" className="flex gap-8">
                <TabsList className="flex flex-col h-auto justify-start items-stretch min-w-[180px] bg-transparent p-0 border-r">
                    <TabsTrigger value="profile" className="justify-start px-4 py-2"><User className="mr-2 h-4 w-4"/> Profile & Security</TabsTrigger>
                    <TabsTrigger value="localization" className="justify-start px-4 py-2"><Globe className="mr-2 h-4 w-4"/> Localization</TabsTrigger>
                    <TabsTrigger value="notifications" className="justify-start px-4 py-2"><Bell className="mr-2 h-4 w-4"/> Notifications</TabsTrigger>
                    <TabsTrigger value="privacy" className="justify-start px-4 py-2"><Lock className="mr-2 h-4 w-4"/> Privacy</TabsTrigger>
                    {['SmallOrg', 'Organizer', 'Admin'].includes(userProfile.role) && (
                        <TabsTrigger value="billing" className="justify-start px-4 py-2"><CreditCard className="mr-2 h-4 w-4"/> Subscription</TabsTrigger>
                    )}
                     {/* Conditionally render Developer tab */}
                      {userProfile.role === 'Admin' && (
                           <TabsTrigger value="developer" className="justify-start px-4 py-2"><Code className="mr-2 h-4 w-4"/> Developer</TabsTrigger>
                      )}
                </TabsList>

                <div className="flex-1">
                    <TabsContent value="profile">
                        <ProfileSettings userProfile={userProfile} />
                    </TabsContent>
                    <TabsContent value="localization">
                        <LocalizationSettings />
                    </TabsContent>
                    <TabsContent value="notifications">
                        <NotificationSettings />
                    </TabsContent>
                    <TabsContent value="privacy">
                        <PrivacySettings />
                    </TabsContent>
                    {['SmallOrg', 'Organizer', 'Admin'].includes(userProfile.role) && (
                         <TabsContent value="billing">
                             <BillingSettings userProfile={userProfile} />
                         </TabsContent>
                     )}
                      {userProfile.role === 'Admin' && (
                           <TabsContent value="developer">
                               <DeveloperSettings userProfile={userProfile} />
                           </TabsContent>
                      )}
                </div>
            </Tabs>
        </div>
    );
}
