'use client';

import { useState, useEffect } from 'react';
import { ArrowDownToLine, BellRing, X, Sparkles } from 'lucide-react';
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
    };

    checkInstallation();
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => {
      setIsAppInstalled(true);
      setShowInstall(false);
      toast({
        title: '✨ App Instalado!',
        description: 'O Caixinhas agora está na sua tela inicial.',
      });
    });

    if (!isAppInstalled && 'Notification' in window && Notification.permission === 'default') {
      const timer = setTimeout(() => {
        if (!getCookie('pwa_notification_prompt_shown')) {
          setShowNotifications(true);
        }
      }, 5000);
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
      if (outcome === 'accepted') setInstallPrompt(null);
    }
    setShowInstall(false);
    setCookie('pwa_install_prompt_shown', 'true', 7);
  };

  const handleNotificationsClick = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toast({ title: '🔔 Notificações Ativadas!', description: 'Vamos te avisar sobre o progresso das suas metas.' });
      } else {
        toast({ title: 'Notificações Bloqueadas', description: 'Você pode alterar isso nas configurações do navegador.', variant: 'destructive' });
      }
    }
    setShowNotifications(false);
    setCookie('pwa_notification_prompt_shown', 'true', 7);
  };

  const setCookie = (name: string, value: string, days: number) => {
    let expires = '';
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = '; expires=' + date.toUTCString();
    }
    document.cookie = name + '=' + (value || '') + expires + '; path=/';
  };

  const getCookie = (name: string) => {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  };

  if (isAppInstalled && !showNotifications) return null;
  if (!showInstall && !showNotifications) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 flex flex-col gap-3 sm:left-auto sm:right-5 sm:w-80">

      {/* ── Install Prompt ── */}
      {showInstall && !isAppInstalled && (
        <div
          className="relative rounded-2xl p-4 animate-in fade-in slide-in-from-bottom-4 duration-300"
          style={{
            background: 'hsl(60,50%,97%)',
            border: '1.5px solid hsl(60,30%,82%)',
            boxShadow: '0 8px 32px hsla(26,29%,20%,0.12)',
          }}
        >
          {/* Close */}
          <button
            onClick={() => { setShowInstall(false); setCookie('pwa_install_prompt_shown', 'true', 7); }}
            className="absolute top-3 right-3 rounded-full p-1 transition-colors hover:bg-black/5"
            style={{ color: 'hsl(26,29%,55%)' }}
          >
            <X className="h-3.5 w-3.5" />
          </button>

          {/* Icon + text */}
          <div className="flex items-start gap-3 pr-5">
            <div
              className="flex-shrink-0 h-10 w-10 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, hsl(43,74%,52%) 0%, hsl(43,74%,40%) 100%)',
                boxShadow: '0 4px 12px hsla(43,74%,49%,0.3)',
              }}
            >
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-snug" style={{ color: 'hsl(26,29%,18%)', fontFamily: 'var(--font-alegreya, serif)' }}>
                Instale o Caixinhas
              </p>
              <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'hsl(26,29%,45%)' }}>
                Adicione à tela inicial para uma experiência muito melhor!
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleInstallClick}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all duration-200 active:scale-[0.97]"
              style={{
                background: 'linear-gradient(135deg, hsl(43,74%,52%) 0%, hsl(43,74%,40%) 100%)',
                color: 'hsl(43,74%,5%)',
                boxShadow: '0 3px 12px hsla(43,74%,49%,0.3)',
              }}
            >
              <ArrowDownToLine className="h-3.5 w-3.5" />
              Instalar
            </button>
            <button
              onClick={() => { setShowInstall(false); setCookie('pwa_install_prompt_shown', 'true', 7); }}
              className="rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
              style={{ color: 'hsl(26,29%,45%)', background: 'transparent' }}
            >
              Agora não
            </button>
          </div>
        </div>
      )}

      {/* ── Notifications Prompt ── */}
      {showNotifications && (
        <div
          className="relative rounded-2xl p-4 animate-in fade-in slide-in-from-bottom-4 duration-300"
          style={{
            background: 'hsl(60,50%,97%)',
            border: '1.5px solid hsl(60,30%,82%)',
            boxShadow: '0 8px 32px hsla(26,29%,20%,0.12)',
          }}
        >
          {/* Close */}
          <button
            onClick={() => { setShowNotifications(false); setCookie('pwa_notification_prompt_shown', 'true', 7); }}
            className="absolute top-3 right-3 rounded-full p-1 transition-colors hover:bg-black/5"
            style={{ color: 'hsl(26,29%,55%)' }}
          >
            <X className="h-3.5 w-3.5" />
          </button>

          {/* Icon + text */}
          <div className="flex items-start gap-3 pr-5">
            <div
              className="flex-shrink-0 h-10 w-10 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, hsl(24,16%,50%) 0%, hsl(24,16%,38%) 100%)',
                boxShadow: '0 4px 12px hsla(24,16%,45%,0.3)',
              }}
            >
              <BellRing className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-snug" style={{ color: 'hsl(26,29%,18%)', fontFamily: 'var(--font-alegreya, serif)' }}>
                Receba Atualizações
              </p>
              <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'hsl(26,29%,45%)' }}>
                Notificações sobre o progresso das suas metas e caixinhas.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleNotificationsClick}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all duration-200 active:scale-[0.97]"
              style={{
                background: 'linear-gradient(135deg, hsl(43,74%,52%) 0%, hsl(43,74%,40%) 100%)',
                color: 'hsl(43,74%,5%)',
                boxShadow: '0 3px 12px hsla(43,74%,49%,0.3)',
              }}
            >
              <BellRing className="h-3.5 w-3.5" />
              Ativar Notificações
            </button>
            <button
              onClick={() => { setShowNotifications(false); setCookie('pwa_notification_prompt_shown', 'true', 7); }}
              className="rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
              style={{ color: 'hsl(26,29%,45%)', background: 'transparent' }}
            >
              Depois
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
