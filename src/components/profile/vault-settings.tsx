'use client';

import { deleteVaultAction } from '@/app/(private)/profile/actions';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import { useState, useTransition } from 'react';

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
    <div className="relative overflow-hidden rounded-[40px] bg-[#fff5f5]/60 backdrop-blur-3xl border border-destructive/20 shadow-[0_20px_50px_rgba(220,38,38,0.04)] transition-all duration-500">
      <div className="p-8 md:p-10 space-y-2 border-b border-destructive/10 bg-white/40">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-destructive/10 p-3 shadow-inner">
            <Trash2 className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <h2 className="text-3xl font-headline font-bold text-destructive italic">Zona de <span className="uppercase tracking-tighter">Perigo</span></h2>
            <p className="text-xs font-medium text-destructive/60 italic">Ações irreversíveis para o seu cofre e dados financeiros.</p>
          </div>
        </div>
      </div>
      <div className="p-8 md:p-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 rounded-3xl border border-destructive/10 bg-white/50 p-6 shadow-sm">
          <div className="space-y-1 flex-1">
            <h4 className="text-lg font-bold text-[#2D241E]">Excluir este cofre</h4>
            <p className="text-sm font-medium text-[#2D241E]/40 italic">
              Isso excluirá permanentemente o cofre e removerá todos os membros e registros.
            </p>
          </div>
          
          <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-destructive/20 active:scale-[0.98] transition-all">Excluir Cofre</Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-[#fdfcf7] border-none rounded-[32px] shadow-2xl overflow-hidden p-0 max-w-[500px]">
              <div className="p-8 space-y-6">
                <AlertDialogHeader className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center">
                      <AlertTriangle className="h-6 w-6 text-destructive" />
                    </div>
                    <div>
                      <AlertDialogTitle className="font-headline text-2xl font-bold text-destructive italic">
                        Confirmar <span className="uppercase tracking-tighter">Exclusão</span>
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-sm font-medium text-[#2D241E]/50 italic">
                        Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </div>
                  </div>
                </AlertDialogHeader>
                
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-destructive/5 border border-destructive/10">
                    <p className="text-sm font-bold text-[#2D241E]">
                      Você está prestes a excluir o cofre <span className="text-destructive">"{vaultName}"</span>.
                    </p>
                    <p className="text-xs font-medium text-destructive/60 mt-2 italic">
                      Todas as transações, contas e metas associadas serão permanentemente removidas para todos os membros.
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="confirm-name" className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2D241E]/40 ml-1">
                      Digite <span className="font-mono text-destructive select-all">{vaultName}</span> para confirmar:
                    </Label>
                    <Input
                      id="confirm-name"
                      value={confirmName}
                      onChange={(e) => setConfirmName(e.target.value)}
                      placeholder={vaultName}
                      className="h-14 rounded-2xl border-2 border-destructive/10 bg-white text-lg font-bold text-destructive focus:border-destructive focus:ring-0 transition-all shadow-sm"
                    />
                  </div>
                </div>

                <AlertDialogFooter className="flex flex-col sm:flex-row gap-3">
                  <AlertDialogCancel 
                    disabled={isPending} 
                    onClick={() => setConfirmName('')}
                    className="h-14 flex-1 rounded-2xl font-black uppercase tracking-widest text-[10px] border-[#2D241E]/10 text-[#2D241E]/60 hover:bg-[#2D241E]/5 transition-all"
                  >
                    Não, manter cofre
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={(e) => {
                      e.preventDefault();
                      handleDelete();
                    }}
                    disabled={confirmName !== vaultName || isPending}
                    className="h-14 flex-1 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-destructive text-white shadow-xl shadow-destructive/20 border-none hover:bg-destructive/90 transition-all active:scale-[0.98]"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Excluindo...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Sim, Excluir
                      </>
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </div>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
