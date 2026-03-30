
'use client';

import { deleteTransaction } from '@/app/(private)/transactions/actions';
import { useLoading } from '@/components/providers/loading-provider';
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Trash2 } from 'lucide-react';
import { useActionState, useEffect, useState } from 'react';


export function DeleteTransactionDialog({ transactionId, trigger }: { transactionId: string, trigger?: React.ReactNode }) {
  const { toast } = useToast();
  const { showLoading, hideLoading } = useLoading();
  const [open, setOpen] = useState(false);
  const [state, dispatch] = useActionState(deleteTransaction, { message: null, success: false });

  useEffect(() => {
    if (state?.message) {
      hideLoading();
      toast({
        title: state.success ? "Sucesso" : "Erro",
        description: state.message,
        variant: state.success ? "default" : "destructive",
      });
      if (state.success) {
        setOpen(false);
      }
    }
  }, [state, toast, hideLoading]);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" className="h-8 w-8 text-[#2D241E]/40 hover:text-[#ff6b7b] hover:bg-[#ff6b7b]/10 rounded-xl transition-all">
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-white/95 backdrop-blur-2xl border-none rounded-[40px] shadow-2xl p-0 overflow-hidden max-w-[400px]">
        <div className="p-8 space-y-6">
          <form 
            action={dispatch}
            onSubmit={(_e) => {
              showLoading('Excluindo transação...');
            }}
          >
            <input type="hidden" name="id" value={transactionId} />
            
            <div className="space-y-4 text-center">
              <div className="mx-auto w-16 h-16 bg-[#ff6b7b]/10 rounded-full flex items-center justify-center mb-6">
                <Trash2 className="h-8 w-8 text-[#ff6b7b]" />
              </div>
              
              <AlertDialogHeader>
                <AlertDialogTitle className="text-2xl font-black text-[#2D241E] tracking-tighter leading-tight">
                  Confirmar <span className="text-[#ff6b7b]">Exclusão</span>?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-base font-bold text-[#2D241E]/40 leading-relaxed px-4">
                  Esta ação é irreversível _e removerá permanentemente o registro desta transação.
                </AlertDialogDescription>
              </AlertDialogHeader>
            </div>

            <div className="flex flex-col gap-3 mt-8">
              <button
                type="submit"
                className="w-full h-14 rounded-2xl font-black uppercase tracking-[0.2em] bg-[#ff6b7b] text-white hover:bg-[#fa8292] transition-all shadow-[0_10px_30px_rgba(255,107,123,0.3)] border-none text-xs"
              >
                Sim, Excluir Registro
              </button>
              
              <AlertDialogCancel asChild>
                <button className="w-full h-14 rounded-2xl font-black uppercase tracking-[0.2em] bg-[#2D241E]/5 text-[#2D241E]/40 hover:bg-[#2D241E]/10 transition-all border-none text-xs">
                  Manter Transação
                </button>
              </AlertDialogCancel>
            </div>
          </form>
        </div>
      </AlertDialogContent>
      </AlertDialog>
  );
}
