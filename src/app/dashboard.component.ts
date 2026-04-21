import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinanceService } from './finance.service';
import { Transaction } from './transaction.model';
import { AddTransactionComponent } from './add-transaction.component';
import { ExpenseListComponent } from './expense-list.component';
import { ChartComponent } from './chart.component';
import { SummaryCardsComponent } from './summary-cards.component';
import { FilterChipsComponent } from './filter-chips.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, AddTransactionComponent, ExpenseListComponent, ChartComponent, SummaryCardsComponent, FilterChipsComponent],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent {

  transactions = signal<Transaction[]>([]);
  showModal = false;
  // transaction being edited (null = create new)
  editingTransaction = signal<Transaction | null>(null);
  activeFilters = signal<string[]>([]);

  filteredTransactions = computed(() => {
    const tx = this.transactions();
    const filters = this.activeFilters();
    if (!filters || filters.length === 0) return tx;
    return tx.filter(t => filters.includes(t.type) || filters.includes(t.category));
  });

  // computed unique categories for filter chips (avoid complex template expressions)
  uniqueCategories = computed(() => {
    const cats = this.transactions().map(t => t.category || 'Uncategorized');
    // de-duplicate preserving order
    const seen = new Set<string>();
    const out: string[] = [];
    for (const c of cats) {
      if (!seen.has(c)) {
        seen.add(c);
        out.push(c);
      }
    }
    return out;
  });

  constructor(private finance: FinanceService) {
    this.finance.transactions$.subscribe((data: Transaction[]) => {
      this.transactions.set(data);
    });
  }

  setFilters(filters: string[]) {
    this.activeFilters.set(filters || []);
  }

  openAddModal(tx?: Transaction | null) {
    this.editingTransaction.set(tx || null);
    this.showModal = true;
  }

  handleSave(tx: Transaction) {
    if (this.editingTransaction()) {
      // editing existing
      this.finance.updateTransaction(tx);
    } else {
      this.finance.addTransaction(tx);
    }
  }

  totalBalance = computed(() =>
    this.transactions().reduce((acc, t) =>
      t.type === 'income' ? acc + t.amount : acc - t.amount, 0)
  );

  // budget signal for two-way UI
  
}
