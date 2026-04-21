export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense' | 'subscription';
  category: string;
  date: Date;
}