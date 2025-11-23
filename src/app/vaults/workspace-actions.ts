"use server";

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Define o workspace atual (pessoal ou cofre) e redireciona para o dashboard.
 * A página de dashboard será responsável por carregar os dados corretos
 * com base na presença ou ausência do cookie 'CAIXINHAS_VAULT_ID'.
 */
export async function setWorkspaceAction(formData: FormData) {
  const workspaceId = formData.get('workspaceId') as string;
  const isPersonal = formData.get('isPersonal') === 'true';

  if (!workspaceId) {
    throw new Error('Workspace ID não fornecido');
  }

  const cookieStore = cookies();

  if (isPersonal) {
    // Para o workspace pessoal, garantimos que o cookie do cofre seja removido.
    // A ausência deste cookie sinaliza que o contexto é a conta do usuário.
    cookieStore.delete('CAIXINHAS_VAULT_ID');
  } else {
    // Para um cofre, definimos o cookie com o ID do cofre.
    cookieStore.set('CAIXINHAS_VAULT_ID', workspaceId, {
      httpOnly: false, // Permitir acesso no client-side se necessário
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      path: '/',
    });
  }

  // Redireciona SEMPRE para o dashboard, que irá interpretar o contexto.
  redirect('/dashboard');
}
