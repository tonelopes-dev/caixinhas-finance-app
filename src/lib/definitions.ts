
export type Account = {
  id: string;
  ownerId: string; // The user who created and can delete the account.
  scope: 'personal' | string; // 'personal' or a vaultId for joint accounts.
  name: string;
  bank: string;
  type: 'checking' | 'savings' | 'investment' | 'credit_card' | 'other';
  balance: number;
  creditLimit?: number;
  logoUrl?: string;
  visibleIn?: string[]; // Array of vaultIds where a personal account is visible.
  allowFullAccess?: boolean; // If true, all members of the vault can edit/delete.
};

export type Vault = {
  id: string;
  name: string;
  ownerId: string;
  members: User[];
  imageUrl: string;
}

export type VaultInvitation = {
  id: string;
  vaultId: string;
  vaultName: string;
  invitedBy: string;
  status: 'pending' | 'accepted' | 'declined';
}


export type Transaction = {
  id: string;
  ownerId: string; 
  ownerType: 'user' | 'vault';
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  category: string;
  paymentMethod?: 'pix' | 'credit_card' | 'debit_card' | 'transfer' | 'boleto' | 'cash';
  sourceAccountId?: string;
  destinationAccountId?: string; 
  actorId?: string;
  isRecurring?: boolean;
};

export type GoalParticipant = {
  id: string;
  name: string;
  avatarUrl: string;
  role: 'owner' | 'member';
  // Opcional: Especifica de qual cofre/conta o dinheiro deste participante virá.
  // Isso prepara o app para colaboração entre diferentes cofres no futuro.
  contributionContextId?: string; 
}

export type Goal = {
  id:string;
  ownerId: string;
  ownerType: 'user' | 'vault';
  name: string;
  targetAmount: number;
  currentAmount: number;
  emoji: string;
  visibility: 'private' | 'shared'; 
  participants?: GoalParticipant[];
  isFeatured?: boolean;
};

export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
};

export type Partner = {
  id: string;
  name: string;
  avatarUrl: string;
};

export type Invitation = {
  id: string;
  goalName: string;
  invitedBy: string;
  status: 'pending' | 'accepted' | 'declined';
  type?: 'goal' | 'vault';
};

export type Guest = {
    id: string;
    name: string;
    email: string;
    avatarUrl: string;
}

export type Notification = {
  id: string;
  type: 'vault_invite' | 'goal_invite' | 'transaction_added' | 'goal_progress' | 'report_ready';
  actor?: {
    name: string;
    avatarUrl: string;
  };
  text: string;
  timestamp: string;
  read: boolean;
  link?: string;
  relatedId?: string; // e.g., the ID of the invitation or transaction
}

export type SavedReport = {
  id: string; // Composite key like `${ownerId}-${year}-${month}`
  ownerId: string;
  monthYear: string;
  analysisHtml: string;
};
