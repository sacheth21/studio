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

export type Transaction = {
  id: string;
  schoolId: string;
  cardId: string;
  amount: number;
  type: 'add_money_to_card';
  timestamp: string; // ISO string for date and time
  schoolName: string;
};
