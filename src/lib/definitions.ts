export type Transaction = {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
};

export type GoalParticipant = {
  id: string;
  name: string;
  avatarUrl: string;
  role: 'owner' | 'member';
}

export type Goal = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  emoji: string;
  visibility: 'shared' | 'private';
  participants?: GoalParticipant[];
};

export type User = {
  name: string;
  email: string;
  avatarUrl: string;
};

export type Partner = {
  name: string;
  avatarUrl: string;
};

export type Invitation = {
  id: string;
  goalName: string;
  invitedBy: string;
  status: 'pending' | 'accepted' | 'declined';
};

export type Guest = {
    id: string;
    name: string;
    email: string;
    avatarUrl: string;
}
