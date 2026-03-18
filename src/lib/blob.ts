import { put, del } from '@vercel/blob';

/**
 * Uploads a file to Vercel Blob storage.
 * @param file The file to upload.
 * @param path Optional sub-path for organization.
 * @returns The resulting URL of the uploaded file.
 */
export async function uploadFile(file: File, path: string = 'vault-images'): Promise<string> {
  console.log('🔗 [Blob Service] Iniciando upload:', { fileName: file.name, size: file.size });
  
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('❌ [Blob Service] BLOB_READ_WRITE_TOKEN não configurada.');
    throw new Error('Configuração do Vercel Blob ausente.');
  }

  try {
    const filename = `${path}/${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    
    // put() detecta automaticamente a BLOB_READ_WRITE_TOKEN
    const blob = await put(filename, file, {
      access: 'public',
      addRandomSuffix: true,
    });

    console.log('✅ [Blob Service] Upload concluído:', blob.url);
    return blob.url;
  } catch (error) {
    console.error('❌ [Blob Service] Erro no upload:', error);
    throw new Error('Falha ao enviar arquivo para o Vercel Blob.');
  }
}

/**
 * Deletes a file from Vercel Blob storage given its full URL.
 * @param url The full public URL of the blob.
 */
export async function deleteFile(url: string | null | undefined): Promise<void> {
  if (!url || !url.includes('vercel-storage.com')) {
    console.warn('⚠️ [Blob Service] URL inválida ou não pertence ao Vercel Blob:', url);
    return;
  }

  try {
    console.log('📤 [Blob Service] Apagando blob:', url);
    await del(url);
    console.log('✅ [Blob Service] Blob removido com sucesso.');
  } catch (error) {
    console.error('❌ [Blob Service] Erro ao remover blob:', error);
    // Não lançamos erro aqui para evitar travar o fluxo principal (ex: se o arquivo já foi removido)
  }
}
