'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface DeleteNotificationDialogProps {
    notificationId: string;
    notificationText: string;
    onDelete: (id: string) => void;
}

export function DeleteNotificationDialog({ notificationId, notificationText, onDelete }: DeleteNotificationDialogProps) {

  const handleDelete = () => {
    // Em uma aplicação real, aqui você despacharia uma server action para apagar a notificação.
    // Por agora, usamos a função passada por prop para atualizar o estado local.
    onDelete(notificationId);
    console.log(`Notificação "${notificationId}" apagada.`);
  }

  // A simple function to strip HTML for the description
  const cleanText = (html: string) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" title="Apagar notificação">
            <Trash2 className="h-5 w-5 text-muted-foreground hover:text-destructive" />
            <span className="sr-only">Apagar notificação</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza que deseja apagar?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A notificação abaixo será permanentemente apagada:
              <blockquote className="mt-2 pl-6 italic border-l-2">
                {cleanText(notificationText)}
              </blockquote>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className='mt-4'>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} variant="destructive">Apagar</AlertDialogAction>
          </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
