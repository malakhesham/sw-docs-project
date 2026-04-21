import { Component, signal, computed } from '@angular/core';
import { DashboardComponent } from './dashboard.component';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FinanceService } from './finance.service';
import { Transaction } from './transaction.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, DashboardComponent, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  transactions = signal<Transaction[]>([]);

  constructor(private finance: FinanceService) {
    this.finance.transactions$.subscribe(t => this.transactions.set(t || []));
  }

  totalBalance = computed(() => this.transactions().reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0));
}
