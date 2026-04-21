import { Component, Input, OnChanges, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chart-placeholder">
      <canvas #canvas></canvas>
      <div class="legend">
        <div *ngFor="let s of legend" class="legend-item"><span class="swatch" [style.background]=s.color></span>{{ s.label }} — {{ s.value | number }}</div>
      </div>
    </div>
  `,
  styles: [
    `.chart-placeholder{display:flex;gap:1rem;align-items:center}`,
    `canvas{width:160px;height:160px}`,
    `.legend{color:var(--muted);font-size:0.9rem}`,
    `.legend-item{display:flex;align-items:center;gap:0.5rem;margin-bottom:0.35rem}`,
    `.swatch{width:12px;height:12px;border-radius:2px;display:inline-block}`
  ]
})
export class ChartComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input() transactions: any[] = [];

  legend: Array<{ label: string, value: number, color: string }> = [];
  total = 0;

  @ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;
  private chart: any = null;

  ngAfterViewInit() {
    this.createChart();
  }

  ngOnChanges() {
    this.updateChart();
  }

  ngOnDestroy() {
    try { if (this.chart) this.chart.destroy(); } catch (e) {}
  }

  private async createChart() {
    if (typeof window === 'undefined') return;
    const module: any = await import('chart.js/auto');
    const Chart = module?.default || module;
    const ctx = this.canvas.nativeElement.getContext('2d');
    this.chart = new Chart(ctx, {
      type: 'doughnut',
      data: { labels: [], datasets: [{ data: [], backgroundColor: [] }] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } }
      }
    });
    this.updateChart();
  }

  private updateChart() {
    // aggregate categories
    const categories: Record<string, number> = {};
    (this.transactions || []).forEach(t => {
      categories[t.category || 'Other'] = (categories[t.category || 'Other'] || 0) + (t.amount || 0);
    });
    const keys = Object.keys(categories);
    const values = keys.map(k => categories[k]);
    this.total = values.reduce((a, b) => a + b, 0);
    const palette = ['#d4a574', '#f87171', '#60a5fa', '#a78bfa', '#34d399', '#fbbf24'];
    this.legend = keys.map((k, i) => ({ label: k, value: categories[k], color: palette[i % palette.length] }));

    if (this.chart) {
      this.chart.data.labels = keys;
      this.chart.data.datasets[0].data = values;
      this.chart.data.datasets[0].backgroundColor = keys.map((_, i) => palette[i % palette.length]);
      this.chart.update();
    }
  }
}