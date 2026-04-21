import { Component, Output, EventEmitter, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { v4 as uuid } from 'uuid';
import { Transaction } from './transaction.model';

@Component({
  selector: 'app-add-transaction',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-transaction.component.html'
})
export class AddTransactionComponent implements OnChanges {
  @Input() transaction?: Transaction | null;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<Transaction>();

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      title: [''],
      amount: [''],
      type: ['expense'],
      category: [''],
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['transaction'] && this.transaction) {
      // populate the form when editing an existing transaction
      this.form.patchValue({
        title: this.transaction.title,
        amount: this.transaction.amount,
        type: this.transaction.type,
        category: this.transaction.category
      });
    } else if (changes['transaction'] && !this.transaction) {
      this.form.reset({ type: 'expense' });
    }
  }

  submit() {
    const value = this.form.value as Partial<Transaction>;
    const tx: Transaction = {
      id: this.transaction?.id || ((uuid() as unknown) as string),
      title: value.title || '',
      amount: Number(value.amount) || 0,
      type: (value.type as Transaction['type']) || 'expense',
      category: value.category || '',
      date: this.transaction?.date || new Date()
    };
    this.saved.emit(tx);
    this.form.reset({ type: 'expense' });
    this.close.emit();
  }
}