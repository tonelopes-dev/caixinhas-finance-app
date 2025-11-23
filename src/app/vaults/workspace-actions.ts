"use server";

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Define o workspace atual e redireciona para o dashboard
 */
export async function setWorkspaceAction(formData: FormData) {
  const workspaceId = formData.get('workspaceId') as string;
  const userId = (await cookies().get('CAIXINHAS_USER_ID')?.value) || '';

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

  // Também salva o userId se ainda não estiver salvo
  if (!cookieStore.get('CAIXINHAS_USER_ID')?.value && userId) {
    cookieStore.set('CAIXINHAS_USER_ID', userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      path: '/',
    });
  }

  redirect('/dashboard');
}
