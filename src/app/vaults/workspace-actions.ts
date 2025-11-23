"use server";

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Define o workspace atual e redireciona para o dashboard
 */
export async function setWorkspaceAction(formData: FormData) {
  const workspaceId = formData.get('workspaceId') as string;

  if (!workspaceId) {
    throw new Error('Workspace ID não fornecido');
  }

  const cookieStore = cookies();
  
  // Limpa o cookie do cofre, já que estamos no workspace pessoal
  if (cookieStore.has('CAIXINHAS_VAULT_ID')) {
    cookieStore.delete('CAIXINHAS_VAULT_ID');
  }

  redirect('/dashboard');
}

/**
 * Define o cofre atual como workspace e redireciona para a página do cofre
 */
export async function setVaultWorkspaceAction(formData: FormData) {
  const workspaceId = formData.get('workspaceId') as string;

  if (!workspaceId) {
    throw new Error('Workspace ID não fornecido');
  }

  const cookieStore = cookies();
  
  // Salva o workspace no cookie (expires em 7 dias)
  cookieStore.set('CAIXINHAS_VAULT_ID', workspaceId, {
    httpOnly: false, // Permite acesso via JavaScript para compatibilidade
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 dias
    path: '/',
  });

  redirect(`/vaults/${workspaceId}`);
}
