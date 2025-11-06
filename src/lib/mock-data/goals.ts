import type { Goal, GoalParticipant } from '../definitions';
import { users, dev, nutri } from './users';

// --- PARTICIPANTES DE METAS ---
const devParticipant: GoalParticipant = { id: dev.id, name: dev.name, avatarUrl: dev.avatarUrl, role: 'owner' };
const nutriParticipant: GoalParticipant = { id: nutri.id, name: nutri.name, avatarUrl: nutri.avatarUrl, role: 'member' };
const familyParticipants: GoalParticipant[] = [devParticipant, nutriParticipant];
const friendsParticipants: GoalParticipant[] = [
    { ...nutriParticipant, role: 'owner' }, // Nutri is the owner of this goal
    ...users.slice(2, 5).map(u => ({ id: u.id, name: u.name, avatarUrl: u.avatarUrl, role: 'member' as const }))
];

// --- METAS (CAIXINHAS / GOALS) ---
export const goals: Goal[] = [
  // -- Metas Pessoais do Dev --
  {
    id: 'goal-dev-1',
    ownerId: 'user1',
    ownerType: 'user',
    name: 'Setup Novo',
    targetAmount: 15000,
    currentAmount: 7500, // This is now calculated dynamically
    emoji: '🖥️',
    visibility: 'private', 
    participants: [devParticipant],
    isFeatured: true,
  },

  // -- Metas Pessoais da Nutri --
  {
    id: 'goal-nutri-1',
    ownerId: 'user2',
    ownerType: 'user',
    name: 'Viagem com Amigos',
    targetAmount: 5000,
    currentAmount: 1200, // This is now calculated dynamically
    emoji: '🏖️',
    visibility: 'shared',
    participants: friendsParticipants, 
    isFeatured: true,
  },
  {
    id: 'goal-nutri-2',
    ownerId: 'user2',
    ownerType: 'user',
    name: 'Consultório dos Sonhos',
    targetAmount: 25000,
    currentAmount: 3500,
    emoji: '🛋️',
    visibility: 'private',
    participants: [{ ...nutriParticipant, role: 'owner' }],
  },
    {
    id: 'goal-nutri-3',
    ownerId: 'user2',
    ownerType: 'user',
    name: 'Presente para o Dev',
    targetAmount: 1000,
    currentAmount: 980,
    emoji: '🎁',
    visibility: 'private',
    participants: [{ ...nutriParticipant, role: 'owner' }],
  },
  
  // -- Metas do Cofre da Agência (Apenas o Dev vê) --
  {
    id: 'goal-agency-1',
    ownerId: 'vault-agency',
    ownerType: 'vault',
    name: 'Macbook M4 Pro',
    targetAmount: 25000,
    currentAmount: 18000, // This is now calculated dynamically
    emoji: '💻',
    visibility: 'shared',
    participants: [devParticipant],
  },

  // -- Metas do Cofre do Consultório (Apenas a Nutri vê) --
  {
    id: 'goal-office-1',
    ownerId: 'vault-office',
    ownerType: 'vault',
    name: 'Bioimpedância Nova',
    targetAmount: 40000,
    currentAmount: 11000, // This is now calculated dynamically
    emoji: '🔬',
    visibility: 'shared',
    participants: [{ ...nutriParticipant, role: 'owner' }],
  },
    {
    id: 'goal-office-2',
    ownerId: 'vault-office',
    ownerType: 'vault',
    name: 'Decoração da Recepção',
    targetAmount: 7500,
    currentAmount: 0,
    emoji: '🖼️',
    visibility: 'shared',
    participants: [{ ...nutriParticipant, role: 'owner' }],
  },
  
  // -- Metas do Cofre da Família --
  {
    id: 'goal-family-1',
    ownerId: 'vault-family',
    ownerType: 'vault',
    name: 'Reforma da Cozinha',
    targetAmount: 35000,
    currentAmount: 8000, // This is now calculated dynamically
    emoji: '🛠️',
    visibility: 'shared', // Todos no cofre podem ver
    participants: familyParticipants,
    isFeatured: true,
  },
   {
    id: 'goal-family-2',
    ownerId: 'vault-family',
    ownerType: 'vault',
    name: 'Fundo de Emergência',
    targetAmount: 50000,
    currentAmount: 32000, // This is now calculated dynamically
    emoji: '🛡️',
    visibility: 'shared',
    participants: familyParticipants,
  },
  {
    id: 'goal-family-priv-dev',
    ownerId: 'vault-family',
    ownerType: 'vault',
    name: 'Presente Surpresa Nutri',
    targetAmount: 2000,
    currentAmount: 1500, // This is now calculated dynamically
    emoji: '🎁',
    visibility: 'private', // Só o Dev pode ver
    participants: [devParticipant],
  },
  {
    id: 'goal-family-priv-nutri',
    ownerId: 'vault-family',
    ownerType: 'vault',
    name: 'Curso de Culinária',
    targetAmount: 1500,
    currentAmount: 950, // This is now calculated dynamically
    emoji: '🍳',
    visibility: 'private', // Só a Nutri pode ver
    participants: [nutriParticipant],
  },
];
