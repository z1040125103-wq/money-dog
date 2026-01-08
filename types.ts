export interface Allocation {
  dream: number; // 0.0 to 1.0
  goose: number;
  pocket: number;
}

export interface AppSettings {
  admin_password: string;
  admin_initialized: boolean; // New flag for first-time setup
  default_allocation: Allocation;
  assumed_interest_rate: number;
}

export interface Dream {
  id: number;
  title: string;
  target_amount: number;
  current_amount: number;
  image_url?: string;
}

export type AccountType = 'bank' | 'fund' | 'gold' | 'education' | 'other';

export interface CustomAccount {
  id: number;
  name: string;
  type: AccountType;
  balance: number;
  note?: string;
}

export interface Assets {
  goose_balance: number;
  pocket_balance: number;
  dreams: Dream[];
  custom_accounts: CustomAccount[]; // New field for user added accounts
}

export type TransactionCategory = '零食' | '玩具' | '文具' | '娱乐' | '其他' | '收入';

export interface Transaction {
  id: string;
  date: string; // ISO string
  type: 'deposit' | 'withdraw';
  amount: number;
  category: TransactionCategory; 
  distribution?: {
    goose: number;
    dream: number;
    pocket: number;
  };
  sourceAccount?: 'goose' | 'pocket' | 'dream';
  note: string;
}

export interface User {
  id: number;
  name: string;
  password: string; // Added password field
  securityQuestion?: string; // New: Security Question
  securityAnswer?: string;   // New: Security Answer
  assets: Assets;
  transactions: Transaction[];
}

export interface AppState {
  app_settings: AppSettings;
  users: User[];
  activeUserId: number;
}