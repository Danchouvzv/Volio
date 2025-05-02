'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, Users, Settings, BarChart2 } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminDashboard() {
  const { userProfile, loading } = useAuth();

  // Role check
  const isAdminOrModerator = userProfile?.role === 'Admin' || userProfile?.role === 'Moderator';

  if (loading) {
    return (
        <div className="container mx-auto px-4 py-8 space-y-6">
            <Skeleton className="h-8 w-1/4 mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Skeleton className="h-32 w-full rounded-lg" />
                <Skeleton className="h-32 w-full rounded-lg" />
                <Skeleton className="h-32 w-full rounded-lg" />
            </div>
        </div>
    );
  }

  if (!isAdminOrModerator) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-destructive">
        Access Denied. You do not have permission to view this page.
         <Button asChild variant="link" className="mt-4 block">
           <Link href="/">Go to Home</Link>
         </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 flex items-center"><ShieldCheck className="mr-3 h-8 w-8 text-primary"/> Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* User Management Card */}
        <Card className="neumorphism hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Management</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div> {/* Placeholder */}
            <p className="text-xs text-muted-foreground">Total registered users</p>
             <Button variant="outline" size="sm" className="mt-4" disabled>Manage Users</Button> {/* Placeholder */}
          </CardContent>
        </Card>

        {/* Content Moderation Card */}
        <Card className="neumorphism hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Content Moderation</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             <div className="text-2xl font-bold">15</div> {/* Placeholder */}
             <p className="text-xs text-muted-foreground">Items flagged for review</p>
             <Button variant="outline" size="sm" className="mt-4" disabled>Review Content</Button> {/* Placeholder */}
          </CardContent>
        </Card>

        {/* Analytics Card */}
        <Card className="neumorphism hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Analytics</CardTitle>
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             <div className="text-2xl font-bold">+5%</div> {/* Placeholder */}
             <p className="text-xs text-muted-foreground">Engagement this month</p>
             <Button variant="outline" size="sm" className="mt-4" disabled>View Analytics</Button> {/* Placeholder */}
          </CardContent>
        </Card>

         {/* Role Management (Admin Only potentially) */}
          {userProfile?.role === 'Admin' && (
            <Card className="neumorphism hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Role Management</CardTitle>
                 <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                 <p className="text-xs text-muted-foreground mb-2">Assign roles and permissions.</p>
                 <Button variant="outline" size="sm" disabled>Manage Roles</Button> {/* Placeholder */}
              </CardContent>
            </Card>
          )}
      </div>

       {/* More admin sections can be added here */}
       <div className="mt-12">
            <h2 className="text-xl font-semibold mb-4">System Settings</h2>
            <Card className="neumorphism">
                <CardContent className="pt-6">
                     <p className="text-muted-foreground">Placeholder for system-wide settings.</p>
                     {/* Add settings controls here */}
                 </CardContent>
             </Card>
       </div>
    </div>
  );
}
