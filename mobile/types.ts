export type TransactionType = 'DEBIT' | 'CREDIT';

export interface Transaction {
  id: string;
  hash: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: string;
  firewallDecision?: string;
  firewallReason?: string;
}

export interface AppConfig {
  apiUrl: string;
  userId: string;
  secret: string;
  isActive: boolean;
}
