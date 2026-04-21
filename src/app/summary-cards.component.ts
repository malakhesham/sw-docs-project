import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Transaction } from './transaction.model';

@Component({
  selector: 'app-summary-cards',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="summary-row">
      <div class="summary-card">
        <div class="meta">
          <div class="title">Total Balance</div>
          <div class="sub">As of today</div>
        </div>
        <div class="value balance">{{ total | currency }}</div>
      </div>

      <div class="summary-card">
        <div class="meta">
          <div class="title">Income</div>
          <div class="sub">This period</div>
        </div>
        <div class="value income">{{ totalIncome | currency }}</div>
      </div>

      <div class="summary-card">
        <div class="meta">
          <div class="title">Expenses</div>
          <div class="sub">This period</div>
        </div>
        <div class="value expense">{{ totalExpenses | currency }}</div>
      </div>
    </div>
  `,
  styles: [
    `:host{display:block}
    .summary-row{display:flex;gap:1rem;align-items:stretch;flex-wrap:wrap}
    .summary-card{flex:1 1 220px;padding:1rem;border-radius:12px;background:linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));border:1px solid rgba(255,255,255,0.03);display:flex;flex-direction:column;justify-content:space-between;min-height:100px}
    .meta{display:flex;flex-direction:row;gap:0.5rem;align-items:center}
    .title{color:#9ca3af;font-size:0.8rem;font-weight:600;text-transform:uppercase;letter-spacing:1px}
    .sub{color:#6b7280;font-size:0.78rem;margin-top:6px}
    .value{font-size:28px;font-weight:800;margin-top:10px}
    .value.balance{color:#22c55e}
    .value.income{color:#60a5fa}
    .value.expense{color:#ef4444}
    @media (max-width:720px){.summary-row{flex-direction:column}}
    `
  ]
})
export class SummaryCardsComponent {
  @Input() transactions: Transaction[] = [];

  get totalIncome(): number {
    return this.transactions
      .filter(t => t.type === 'income')
      .reduce((s, t) => s + (t.amount || 0), 0);
  }

  get totalExpenses(): number {
    return this.transactions
      .filter(t => t.type !== 'income')
      .reduce((s, t) => s + (t.amount || 0), 0);
  }

  get total(): number {
    return this.transactions.reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0);
  }
}
