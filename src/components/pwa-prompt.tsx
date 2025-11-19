'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { ArrowDownToLine, BellRing } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function PwaPrompt() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  const [showInstall, setShowInstall] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
       if (!getCookie('pwa_install_prompt_shown')) {
        setShowInstall(true);
      }
    };

    const checkInstallation = () => {
        if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
            setIsAppInstalled(true);
            setShowInstall(false);
        }
    }
    
    checkInstallation();
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => {
        setIsAppInstalled(true);
        setShowInstall(false);
        toast({
            title: "App Instalado!",
            description: "O Caixinhas agora está disponível na sua área de trabalho ou tela inicial."
        })
    });

    if (!isAppInstalled && 'Notification' in window && Notification.permission === 'default') {
      const timer = setTimeout(() => {
         if (!getCookie('pwa_notification_prompt_shown')) {
            setShowNotifications(true);
         }
      }, 5000); // Show notification prompt after 5 seconds
      return () => clearTimeout(timer);
    }


    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, [toast, isAppInstalled]);

  const handleInstallClick = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstallPrompt(null);
      }
    }
    setShowInstall(false);
    setCookie('pwa_install_prompt_shown', 'true', 7);
  };

  const handleNotificationsClick = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
         toast({
            title: "Notificações Ativadas!",
            description: "Vamos te avisar sobre o progresso das suas metas."
        })
      } else {
         toast({
            title: "Notificações Bloqueadas",
            description: "Você pode alterar isso nas configurações do seu navegador.",
            variant: "destructive"
        })
      }
    }
    setShowNotifications(false);
     setCookie('pwa_notification_prompt_shown', 'true', 7);
  };

  const setCookie = (name: string, value: string, days: number) => {
    let expires = "";
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
  }

  const getCookie = (name: string) => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for(let i=0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
  }

  if (isAppInstalled && !showNotifications) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
        {showInstall && !isAppInstalled && (
            <div className="bg-background border rounded-lg shadow-lg p-4 max-w-sm animate-in fade-in-50 slide-in-from-bottom-10">
                <p className="text-sm font-medium">Instale o Caixinhas no seu dispositivo para uma experiência melhor!</p>
                <div className="flex gap-2 mt-4">
                    <Button onClick={handleInstallClick} className="flex-1">
                        <ArrowDownToLine className="mr-2 h-4 w-4" />
                        Instalar
                    </Button>
                    <Button variant="ghost" onClick={() => {
                        setShowInstall(false)
                        setCookie('pwa_install_prompt_shown', 'true', 7);
                    }}>Agora não</Button>
                </div>
            </div>
        )}
         {showNotifications && (
            <div className="bg-background border rounded-lg shadow-lg p-4 mt-4 max-w-sm animate-in fade-in-50 slide-in-from-bottom-10">
                <p className="text-sm font-medium text-center sm:text-left">Gostaria de receber notificações sobre o progresso das suas metas?</p>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-4">
                    <Button onClick={handleNotificationsClick} className="flex-1">
                        <BellRing className="mr-2 h-4 w-4" />
                        Ativar Notificações
                    </Button>
                    <Button variant="ghost" onClick={() => {
                        setShowNotifications(false);
                         setCookie('pwa_notification_prompt_shown', 'true', 7);
                    }}>Depois</Button>
                </div>
            </div>
        )}
    </div>
  );
}
