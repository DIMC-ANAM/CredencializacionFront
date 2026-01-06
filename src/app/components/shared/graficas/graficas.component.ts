import {
  Component,
  Input,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { Chart, ChartType, ChartConfiguration, registerables } from 'chart.js';

// ⚠️ Ajusta esta ruta según dónde tengas el archivo de modelos
import { MultiChartData } from '../../../entidades/chart-datasets.model';

Chart.register(...registerables); // Registro global de Chart.js

@Component({
  standalone: false,
  selector: 'app-graficas',
  templateUrl: './graficas.component.html',
  styleUrls: ['./graficas.component.scss'],
})
export class GraficasComponent implements OnInit, AfterViewInit {
  // Inputs personalizables desde el componente padre
  @Input() chartID: string = 'defaultChart';
  @Input() width: string = '100%';
  @Input() height: string = '800px';
  @Input() type: ChartType | 'multi' = 'bar'; // 'multi' para gráficas compuestas
  @Input() showLegend: boolean = true; // por defecto muestra las leyendas
  @Input() showXAxisLabels: boolean = true;
  @Input() showXAxis: boolean = true;
  @Input() showYAxisLabels: boolean = true;
  @Input() showYAxis: boolean = true;
  @Input() showTooltips: boolean = true;
  @Input() compact: boolean = false;
  @Input() indexAxis: 'x' | 'y' = 'x'; // Para barras horizontales usar 'y'
  @Input() stepSize: number = 1; // Incremento de las escalas
  @Input() customTooltip: boolean = false; // Para tooltips personalizados con porcentaje
  @Input() tooltipData: any[] = []; // Datos adicionales para tooltips
  @Input() max: number | undefined; // Valor máximo del eje X

 @Input()
	set datasets(data: any | undefined) {
	if (!data) return;
	this._datasets = data;
	this.refreshChartData();
	}

	private refreshChartData(): void {
  if (!this.chart || !this.chart.data) return;
  if (!this._datasets || !this._datasets.datasets || !this._datasets.labels) return;

  this.chart.data.labels = [...this._datasets.labels];
  this.chart.data.datasets = [...this._datasets.datasets];
  this.chart.update();
}

  get datasets(): MultiChartData {
    return this._datasets;
  }

  @ViewChild('chartCanvas', { static: true })
  chartCanvasRef!: ElementRef<HTMLCanvasElement>;
  private chart!: Chart;
  private _datasets!: MultiChartData;

  constructor() {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.renderChart();
  }

  private renderChart(): void {
	if (this.chart) return;

	const ctx = this.chartCanvasRef.nativeElement.getContext('2d');
	if (!ctx) return;

	const resolvedType: ChartType = this.type === 'multi' ? 'bar' : this.type;
    const isHorizontal = this.indexAxis === 'y';

    const config: ChartConfiguration = {
      type: resolvedType,
      data: this._datasets,
      options: {
        indexAxis: this.indexAxis,
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: this.compact ? 0 : 1000,
        },
        interaction: this.compact
          ? { mode: 'nearest', intersect: true }
          : { mode: 'index', intersect: false },
        plugins: {
          legend: {
            display: !this.compact && this.showLegend,
          },
          tooltip: {
            enabled: false // Disable tooltips
          },
        },
        scales: resolvedType === 'pie' || resolvedType === 'doughnut' ? undefined : {
          x: {
            beginAtZero: true,
            display: !this.compact && this.showXAxis,
            max: this.max !== undefined ? this.max : undefined,
            ticks: {
              display: !this.compact && this.showXAxisLabels,
              autoSkip: false,
              maxRotation: isHorizontal ? 0 : 90,
              minRotation: 0,
              stepSize: isHorizontal ? this.stepSize : undefined,
            },
            grid: {
              display: true
            }
          },
          y: {
            display: !this.compact && this.showYAxis,
            beginAtZero: true,
            ticks: {
              display: !this.compact && this.showYAxisLabels,
              autoSkip: false,
              stepSize: !isHorizontal ? this.stepSize : undefined,
              font: {
                size: 11
              }
            },
            grid: {
              display: true
            }
          },
        },
      },
    };

      this.chart = new Chart(ctx, config);
  }
}
