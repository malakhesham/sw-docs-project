import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-filter-chips',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="filter-chips">

      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px">
        <button (click)="selectAll()" class="pill" [class.active]="active.length===0">All</button>
        <button (click)="selectQuick('income')" class="pill" [class.active]="active.includes('income')">Income</button>
        <button (click)="selectQuick('expense')" class="pill" [class.active]="active.includes('expense')">Expenses</button>
        <button (click)="selectQuick('subscription')" class="pill" [class.active]="active.includes('subscription')">Subscriptions</button>
      </div>

      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button *ngFor="let c of categories" (click)="toggle(c)" [class.active]="active.includes(c)" class="pill">{{ c }}</button>
      </div>
    </div>
  `
  ,
  styles: [
    `.filter-chips{display:flex;flex-direction:column;gap:4px}`,
    `.pill{padding:4px 12px;border-radius:9999px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.05);color:#cbd5e1;cursor:pointer;transition:all 0.2s}`,
    `.pill.active{background:rgba(255,255,255,0.15);border-color:rgba(255,255,255,0.2);color:#fff}`,
    `.pill:hover{background:rgba(255,255,255,0.1)}`
  ]
})
export class FilterChipsComponent {
  @Input() categories: string[] = [];
  @Output() selected = new EventEmitter<string[]>();

  active: string[] = [];

  toggle(cat: string) {
    if (this.active.includes(cat)) {
      this.active = this.active.filter(c => c !== cat);
    } else {
      this.active = [...this.active, cat];
    }
    this.selected.emit(this.active);
  }

  selectAll() {
    this.active = [];
    this.selected.emit(this.active);
  }

  selectQuick(key: string) {
    // toggle quick filter
    if (this.active.includes(key) && this.active.length === 1) {
      // already selected as only filter -> clear
      this.selectAll();
      return;
    }
    // replace active with the quick key
    this.active = [key];
    this.selected.emit(this.active);
  }
}
