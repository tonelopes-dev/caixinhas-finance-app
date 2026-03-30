import { auth } from '@/auth';
import { AuthService } from '@/services/auth.service';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(_request: NextRequest) {
  try {
    const session = (await auth()) as any;
    
    // @ts-expect-error - pendencia estrutural a ser revisada
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Buscar dados atualizados do usuário
    // @ts-expect-error - pendencia estrutural a ser revisada
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
        // @ts-expect-error - pendencia estrutural a ser revisada
        id: session.user.id,
        // @ts-expect-error - pendencia estrutural a ser revisada
        email: session.user.email,
        // @ts-expect-error - pendencia estrutural a ser revisada
        name: session.user.name,
        // @ts-expect-error - pendencia estrutural a ser revisada
        image: session.user.image,
        // @ts-expect-error - pendencia estrutural a ser revisada
        avatarUrl: session.user.avatarUrl,
        // @ts-expect-error - pendencia estrutural a ser revisada
        workspaceImageUrl: session.user.workspaceImageUrl,
      }
    });
    
  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}