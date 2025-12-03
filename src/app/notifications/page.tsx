import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowLeft, Bell } from 'lucide-react';
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
    <div className="flex min-h-screen w-full flex-col items-center bg-background p-4">
      <div className="w-full max-w-3xl">
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para o Painel
          </Link>
        </Button>
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
