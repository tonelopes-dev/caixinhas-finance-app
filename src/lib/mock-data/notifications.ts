import type { Notification, Invitation } from '../definitions';
import { users, nutri } from './users';

export const invitations: Invitation[] = [
  {
    id: 'inv1',
    goalName: 'Viagem para a Praia',
    invitedBy: 'Amigo do Dev',
    status: 'pending' as const,
    type: 'goal' as const,
  },
   {
    id: 'inv2',
    goalName: 'Cofre dos Formandos',
    invitedBy: 'Colega da Nutri',
    status: 'pending' as const,
    type: 'vault' as const,
  },
];


export const notifications: Notification[] = [
    {
      id: 'n1',
      type: 'goal_invite',
      relatedId: 'inv1',
      actor: users.find(u => u.id === 'user4'),
      text: '<b>Daniela</b> te convidou para a caixinha "Viagem de Fim de Ano".',
      timestamp: '2024-07-29T10:00:00Z',
      read: false,
      link: '/invitations'
    },
     {
      id: 'n2',
      type: 'transaction_added',
      relatedId: 't-fam-1',
      actor: nutri,
      text: '<b>Nutri</b> adicionou uma nova despesa de <b>R$ 1.800,00</b> em "Família DevNutri".',
      timestamp: '2024-07-27T15:30:00Z',
      read: false,
      link: '/transactions'
    },
    {
      id: 'n3',
      type: 'goal_progress',
      relatedId: 'goal-family-priv-dev',
      text: 'Parabéns! Vocês alcançaram <b>90%</b> da meta "Presente Surpresa Nutri".',
      timestamp: '2024-07-26T11:00:00Z',
      read: true,
      link: '/goals/goal-family-priv-dev'
    },
     {
      id: 'n4',
      type: 'vault_invite',
      relatedId: 'inv2',
      actor: users.find(u => u.id === 'user5'),
      text: '<b>Eduardo</b> te convidou para o cofre "Futebol de Quinta".',
      timestamp: '2024-07-25T09:00:00Z',
      read: true,
      link: '/invitations'
    },
    {
      id: 'n5',
      type: 'report_ready',
      text: 'Seu <b>relatório financeiro</b> de Julho está pronto para visualização!',
      timestamp: '2024-08-01T09:00:00Z',
      read: false,
      link: '/reports'
    },
];
