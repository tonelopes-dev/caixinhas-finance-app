import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { AuthService } from '@/services/auth.service';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Buscar dados atualizados do usuário
    const user = await AuthService.getUserById(session.user.id);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        workspaceImageUrl: user.workspaceImageUrl,
      },
      session: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        image: session.user.image,
        avatarUrl: session.user.avatarUrl,
        workspaceImageUrl: session.user.workspaceImageUrl,
      }
    });
    
  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}