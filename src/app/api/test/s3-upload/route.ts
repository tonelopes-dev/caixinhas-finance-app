import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { uploadFile } from '@/lib/blob';

export async function POST(request: NextRequest) {
  try {
    const session = (await auth()) as any;
    
    // @ts-expect-error - pendencia estrutural a ser revisada
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    console.log('📁 Testando upload S3:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    });

    const imageUrl = await uploadFile(file, 'test-uploads');
    
    return NextResponse.json({
      success: true,
      imageUrl,
      message: 'Upload realizado com sucesso!'
    });
    
  } catch (error) {
    console.error('Erro no teste de upload S3:', error);
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor' 
    }, { status: 500 });
  }
}