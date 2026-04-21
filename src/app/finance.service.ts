import { Injectable, Optional } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Transaction } from './transaction.model';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FinanceService {

  private transactions = new BehaviorSubject<Transaction[]>([]);
  transactions$ = this.transactions.asObservable();

  private budget = new BehaviorSubject<number>(0);
  budget$ = this.budget.asObservable();

  // toggle to true to use remote JSON backend at /api/transactions
  private useBackend = false;
  private backendUrl = '/api/transactions';

  constructor(@Optional() private http?: HttpClient) {
    // Allow a runtime toggle stored in localStorage (useful for development)
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        this.useBackend = window.localStorage.getItem('useBackend') === 'true';
      }
    } catch (e) {
      this.useBackend = false;
    }

    if (this.useBackend && this.http) {
      this.loadFromServer();
    } else {
      this.loadFromLocalStorage();
    }
  }

  setBudget(amount: number) {
    this.budget.next(amount);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('budget', String(amount));
      }
    } catch (e) {
      // ignore
    }
  }

  getBudget(): number {
    return this.budget.value;
  }

  addTransaction(tx: Transaction) {
    const updated = [...this.transactions.value, tx];
    this.transactions.next(updated);
    this.persist(updated);
  }

  deleteTransaction(id: string) {
    const updated = this.transactions.value.filter(t => t.id !== id);
    this.transactions.next(updated);
    this.persist(updated);
  }

  updateTransaction(tx: Transaction) {
    const updated = this.transactions.value.map(t => t.id === tx.id ? tx : t);
    this.transactions.next(updated);
    this.persist(updated);
  }

  getTotalBalance() {
    return this.transactions.value.reduce((acc, t) =>
      t.type === 'income' ? acc + t.amount : acc - t.amount, 0);
  }

  // --- persistence helpers ---
  private loadFromLocalStorage() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const data = window.localStorage.getItem('transactions');
        if (data) this.transactions.next(JSON.parse(data));
        const b = window.localStorage.getItem('budget');
        if (b) this.budget.next(Number(b) || 0);
      }
    } catch (e) {
      // ignore
    }
  }

  private loadFromServer() {
    if (!this.http) return;

    this.http.get<Transaction[]>(this.backendUrl).pipe(
      catchError(err => {
        console.warn('Failed to load transactions from server, falling back to localStorage', err);
        this.loadFromLocalStorage();
        return of([] as Transaction[]);
      })
    ).subscribe(list => {
      if (list && list.length) this.transactions.next(list);
    });
  }

  private persist(updated: Transaction[]) {
    if (this.useBackend) {
      // replace entire collection on server
      if (!this.http) {
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem('transactions', JSON.stringify(updated));
          }
        } catch (e) {
          // ignore
        }
        return;
      }

      this.http.put(this.backendUrl, updated).pipe(
        catchError(err => {
          console.warn('Failed to persist to server, saving locally instead', err);
          try {
            if (typeof window !== 'undefined' && window.localStorage) {
              window.localStorage.setItem('transactions', JSON.stringify(updated));
            }
          } catch (e) {
            // ignore
          }
          return of(null);
        })
      ).subscribe();
    } else {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('transactions', JSON.stringify(updated));
        }
      } catch (e) {
        // ignore storage errors
      }
    }
  }
}