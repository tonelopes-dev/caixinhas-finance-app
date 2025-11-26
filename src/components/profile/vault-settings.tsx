'use client';

import React, { useActionState, useState, useTransition } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { deleteVaultAction } from '@/app/profile/actions';

interface VaultSettingsProps {
  vaultId: string;
  vaultName: string;
  isOwner: boolean;
}

export function VaultSettings({ vaultId, vaultName, isOwner }: VaultSettingsProps) {
  const [open, setOpen] = useState(false);
  const [confirmName, setConfirmName] = useState('');
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  if (!isOwner) {
    return null;
  }

  const handleDelete = async () => {
    if (confirmName !== vaultName) {
      return;
    }

    startTransition(async () => {
      try {
        const result = await deleteVaultAction(vaultId);
        if (result.message) {
          toast({
            title: result.success ? 'Sucesso' : 'Erro',
            description: result.message,
            variant: result.success ? 'default' : 'destructive',
          });
        }
      } catch (error) {
        toast({
          title: 'Erro',
          description: 'Ocorreu um erro ao excluir o cofre.',
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <Card className="border-destructive/50 border-dashed bg-destructive/5">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-destructive/10 p-2">
            <Trash2 className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-destructive">Zona de Perigo</CardTitle>
            <CardDescription className="text-destructive/80">
              Ações irreversíveis para o seu cofre
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between rounded-lg border border-destructive/20 bg-background p-4">
          <div className="space-y-1">
            <p className="font-medium">Excluir este cofre</p>
            <p className="text-sm text-muted-foreground">
              Isso excluirá permanentemente o cofre e removerá todos os membros.
            </p>
          </div>
          
          <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Excluir Cofre</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  Excluir Cofre Permanentemente?
                </AlertDialogTitle>
                <AlertDialogDescription className="space-y-3">
                  <p>
                    Esta ação <strong>não pode ser desfeita</strong>. Isso excluirá permanentemente o cofre 
                    <span className="font-semibold text-foreground"> {vaultName} </span>
                    e removerá o acesso de todos os membros.
                  </p>
                  <p>
                    Todas as transações, contas e metas associadas a este cofre também serão excluídas.
                  </p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              
              <div className="py-4 space-y-3">
                <Label htmlFor="confirm-name">
                  Digite <span className="font-mono font-bold select-all">{vaultName}</span> para confirmar:
                </Label>
                <Input
                  id="confirm-name"
                  value={confirmName}
                  onChange={(e) => setConfirmName(e.target.value)}
                  placeholder={vaultName}
                  className="border-destructive/30 focus-visible:ring-destructive/30"
                />
              </div>

              <AlertDialogFooter>
                <AlertDialogCancel disabled={isPending} onClick={() => setConfirmName('')}>
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault();
                    handleDelete();
                  }}
                  disabled={confirmName !== vaultName || isPending}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Excluindo...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Excluir Cofre
                    </>
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
