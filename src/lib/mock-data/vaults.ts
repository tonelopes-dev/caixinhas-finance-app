import type { Vault, VaultInvitation } from '../definitions';
import { dev, nutri } from './users';

export const vaults: Vault[] = [
  {
    id: 'vault-family',
    name: 'Família DevNutri',
    ownerId: dev.id,
    members: [dev, nutri],
    imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1080'
  },
  {
    id: 'vault-agency',
    name: 'Agência de Software',
    ownerId: dev.id,
    members: [dev], // Apenas o Dev é membro
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1080'
  },
   {
    id: 'vault-office',
    name: 'Consultório Nutri',
    ownerId: nutri.id,
    members: [nutri], // Apenas a Nutri é membro
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1080'
  }
];

export const vaultInvitations: VaultInvitation[] = [
  // Exemplo: Dev convidou a Nutri para o cofre da família.
  // Em um app real, o status mudaria para 'accepted' e ela seria adicionada aos membros.
];
