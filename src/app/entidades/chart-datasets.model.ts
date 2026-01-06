import { ChartDataset } from 'chart.js';

export type SupportedChartType =
  | 'line'
  | 'bar'
  | 'pie'
  | 'doughnut'
  | 'radar'
  | 'polarArea';

export interface MultiChartData {
  labels: string[];
  datasets: any[];
}