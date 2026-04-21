import { Component, Output, EventEmitter, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinanceService } from './finance.service';
import { Transaction } from './transaction.model';

@Component({
  selector: 'app-expense-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './expense-list.component.html'
})
export class ExpenseListComponent {

  @Input() transactionsIn?: Transaction[] | null = null;
  transactions$ = this.finance.transactions$;
  transactions: Transaction[] = [];
  search = '';
  @Output() edit = new EventEmitter<Transaction>();

  constructor(private finance: FinanceService) {
    this.finance.transactions$.subscribe((t: Transaction[]) => {
      if (!this.transactionsIn) this.transactions = t || [];
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['transactionsIn'] && this.transactionsIn) {
      this.transactions = this.transactionsIn.slice();
    }
  }

  get filteredTransactions(): Transaction[] {
    if (!this.search) return this.transactions;
    const s = this.search.toLowerCase();
    return this.transactions.filter(tx => (tx.title || '').toLowerCase().includes(s) || (tx.category || '').toLowerCase().includes(s));
  }

  delete(id: string) {
    this.finance.deleteTransaction(id);
  }

  startEdit(tx: Transaction) {
    this.edit.emit(tx);
  }
}