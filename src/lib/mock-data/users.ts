import type { User } from '../definitions';

export const users: User[] = [
  {
    id: 'user1',
    name: 'Dev',
    email: 'email01@conta.com',
    avatarUrl: 'https://images.unsplash.com/photo-1557862921-37829c790f19?w=1080',
  },
  {
    id: 'user2',
    name: 'Nutri',
    email: 'email02@conta.com',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=1080',
  },
   { id: 'user3', name: 'Carlos', email: 'carlos@example.com', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1080' },
   { id: 'user4', name: 'Daniela', email: 'daniela@example.com', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=1080' },
   { id: 'user5', name: 'Eduardo', email: 'eduardo@example.com', avatarUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=1080' },
   { id: 'user6', name: 'Fernanda', email: 'fernanda@example.com', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1080' },
   { id: 'user7', name: 'Gabriel', email: 'gabriel@example.com', avatarUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=1080' },
   { id: 'user8', name: 'Helena', email: 'helena@example.com', avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1080' },
];

export const user: User = users.find(u => u.id === 'user1')!;
export const partner: User = users.find(u => u.id === 'user2')!;

export const dev = users.find(u => u.id === 'user1')!;
export const nutri = users.find(u => u.id === 'user2')!;
