import { NotificationsManager } from '@/components/notifications/notifications-manager';
import { NotificationsPageHandler } from '@/components/notifications/notifications-page-handler';
import { StandardBackButton } from '@/components/ui/standard-back-button';
import { withPageAccess } from '@/lib/page-access';
import { getNotifications } from './actions';

export default async function NotificationsPage() {
  // @ts-expect-error - pendencia estrutural a ser revisada
  await withPageAccess({ requireFullAccess: true });

  const notifications = await getNotifications();

  return (
    <div className="pb-32 px-4 md:px-8 pt-8 text-[#2D241E]">
      <NotificationsPageHandler />
      
      <div className="mx-auto w-full max-w-4xl">
        <StandardBackButton href="/dashboard" label="Voltar para o Dashboard" />

        <div className="relative overflow-hidden rounded-[40px] bg-white/40 backdrop-blur-3xl border border-white/60 shadow-[0_20px_50px_rgba(45,36,30,0.06)] transition-all duration-500">
          <div className="p-8 md:p-10 space-y-2 border-b border-[#2D241E]/5 bg-white/30">
            <div className="flex flex-col gap-1">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#ff6b7b] ml-1">Central de Alertas</p>
              <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight text-[#2D241E] italic">
                Notificações & <span className="text-[#ff6b7b]">Avisos</span>
              </h1>
              <p className="text-xs font-medium text-[#2D241E]/40 italic">
                Gerencie seus alertas e fique por dentro das atualizações do sistema.
              </p>
            </div>
          </div>
          <div className="p-8 md:p-10">
            <NotificationsManager 
              initialNotifications={notifications} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
