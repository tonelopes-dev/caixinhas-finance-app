import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Bell } from 'lucide-react';
import { BackToDashboard } from '@/components/ui/back-to-dashboard';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getNotifications } from './actions';
import { NotificationsManager } from '@/components/notifications/notifications-manager';


export default async function NotificationsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  const notifications = await getNotifications();

  return (
    <div className="flex min-h-[calc(100vh-theme(spacing.16))] flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10">
      <div className="mx-auto w-full max-w-3xl">
        <BackToDashboard className="mb-4" />
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <Bell className="h-6 w-6 text-primary" />
              Central de Notificações
            </CardTitle>
            <CardDescription>
              Gerencie seus alertas e notificações do sistema.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NotificationsManager 
              initialNotifications={notifications} 
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
