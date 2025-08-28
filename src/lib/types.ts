export type School = {
  id: string;
  name: string;
  password?: string;
  addedDate: string;
  walletBalance: number;
};

export type Card = {
  id: string; // The card ID
  schoolId: string;
  name: string;
  phoneNumbers: string[]; // up to 5
  balance: number;
};

// Transaction from School Wallet to Student Card
export type CardTransaction = {
  id: string;
  schoolId: string;
  cardId: string;
  amount: number;
  type: 'add_money_to_card';
  timestamp: string; // ISO string for date and time
  schoolName: string;
  balanceBefore: number;
  balanceAfter: number;
};

// Transaction from Admin to School Wallet
export type AdminTransaction = {
    id: string;
    schoolId: string;
    schoolName: string;
    amount: number;
    type: 'admin_top_up';
    timestamp: string; // ISO string for date and time
};

// A union type for all possible transactions
export type Transaction = CardTransaction | AdminTransaction;
