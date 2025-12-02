import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { uploadFileToS3 } from '@/lib/s3';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
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

    const imageUrl = await uploadFileToS3(file);
    
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