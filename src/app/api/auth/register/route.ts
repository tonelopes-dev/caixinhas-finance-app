import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/services/prisma";
import { z } from "zod";
import { CategoryService } from "@/services/category.service";
import { VaultService } from "@/services/vault.service";

const registerSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar dados
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { name, email, password } = validation.data;

    // Verificar se usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Este email já está cadastrado" },
        { status: 409 }
      );
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 12);

    // Definir data de expiração do trial (30 dias)
    const trialExpiresAt = new Date();
    trialExpiresAt.setDate(trialExpiresAt.getDate() + 30);

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        avatarUrl: `https://caixinhas-finance-app.s3.us-east-1.amazonaws.com/logo-caixinhas.png`,
        subscriptionStatus: "trial",
        trialExpiresAt,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        subscriptionStatus: true,
        trialExpiresAt: true,
        createdAt: true,
      }
    });

    // Criar categorias padrão para o novo usuário
    const defaultCategories = [
      { name: 'Alimentação', ownerId: user.id },
      { name: 'Transporte', ownerId: user.id },
      { name: 'Lazer', ownerId: user.id },
      { name: 'Saúde', ownerId: user.id },
      { name: 'Educação', ownerId: user.id },
      { name: 'Casa', ownerId: user.id },
      { name: 'Roupas', ownerId: user.id },
      { name: 'Outros', ownerId: user.id },
    ];

    try {
      // Criar todas as categorias em paralelo
      await Promise.all(
        defaultCategories.map(category => 
          CategoryService.createCategory(category.name, category.ownerId)
        )
      );
      console.log(`✅ Categorias padrão criadas para usuário ${user.id}`);
    } catch (error) {
      console.error('Erro ao criar categorias padrão:', error);
      // Não falha o registro se as categorias falharem
    }

    try {
      // Vincular convites pendentes baseados no email
      await VaultService.linkInvitationsByEmail(email, user.id);
      console.log(`✅ Convites vinculados para usuário ${user.id} com email ${email}`);
    } catch (error) {
      console.error('Erro ao vincular convites:', error);
      // Não falha o registro se a vinculação de convites falhar
    }

    return NextResponse.json(
      { 
        message: "Usuário criado com sucesso", 
        user 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Erro ao registrar usuário:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}