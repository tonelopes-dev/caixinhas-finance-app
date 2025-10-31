export type Transaction = {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
};

export type Goal = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  emoji: string;
};

export type User = {
  name: string;
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
