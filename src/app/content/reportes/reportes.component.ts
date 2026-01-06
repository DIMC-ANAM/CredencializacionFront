import { Component, OnInit } from '@angular/core';
import { ChartDataset } from 'chart.js';
import { MultiChartData } from '../../entidades/chart-datasets.model';
import { CatalogoService } from '../../../api/catalogo/catalogo.service';
import { UtilsService } from '../../services/utils.service';
import { TipoToast } from '../../../api/entidades/enumeraciones';

@Component({
  selector: 'app-reportes',
  standalone: false,
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.scss'
})
export class ReportesComponent implements OnInit {
  startDate: string = '';
  endDate: string = '';
  
  totalAsuntos: number = 0;
  asuntosPorStatus: any[] = [];
  tiempoPromedioAtencion: any = null;
  asuntosConcluidos: any[] = [];
  tiempoPorTema: any[] = [];
  asuntosPorTema: any[] = [];
  turnosPorUnidad: any[] = [];
  listaAsuntosPorUnidad: any[] = [];
  asuntosConUnidades: any[] = [];
  asuntosPorUnidadRespTotalTurnados: any[] = [];
  asuntosPorUnidadRespTotalUnidades: any[] = [];
  
  // Datasets para gráficas de Chart.js
  graficaAsuntosPorTema: MultiChartData = { labels: [], datasets: [] };
  graficaTurnosPorUnidad: MultiChartData = { labels: [], datasets: [] };
  
  // Datos para tooltips personalizados
  tooltipAsuntosPorTema: any[] = [];
  tooltipTurnosPorUnidad: any[] = [];
  
  cargando: boolean = false;
  reporteCargado: boolean = false;

  constructor(
    private catalogoService: CatalogoService,
    private utils: UtilsService
  ) {}

  ngOnInit(): void {
    this.cargarReporte();
  }

  applyFilter(): void {
    if (this.startDate && this.endDate) {
      if (new Date(this.startDate) > new Date(this.endDate)) {
        this.utils.MuestrasToast(TipoToast.Warning, 'La fecha de inicio debe ser menor a la fecha fin');
        return;
      }
    }
    this.cargarReporte();
  }

  clearFilter(): void {
    this.startDate = '';
    this.endDate = '';
    this.cargarReporte();
  }

  cargarReporte(): void {
    this.cargando = true;
    const data = {
      fechaInicio: this.startDate || null,
      fechaFin: this.endDate || null
    };

    this.catalogoService.verReporte(data).subscribe({
      next: (response: any) => {
        if (response.status === 200) {
          this.totalAsuntos = response.model.totalAsuntos[0]?.totalAsuntos || 0;
          this.asuntosPorStatus = response.model.asuntosPorStatus || [];
          this.tiempoPromedioAtencion = response.model.tiempoPromedioAtencion[0] || null;
          this.asuntosConcluidos = response.model.asuntosConcluidos || [];
          this.tiempoPorTema = response.model.tiempoPorTema || [];
          this.asuntosPorTema = response.model.asuntosPorTema || [];
          this.turnosPorUnidad = response.model.turnosPorUnidad || [];
          this.listaAsuntosPorUnidad = response.model.listaAsuntosPorUnidad || [];
          this.asuntosConUnidades = response.model.asuntosConUnidades || [];
          this.asuntosPorUnidadRespTotalTurnados = response.model.asuntosPorUnidadRespTotalTurnados || [];
          this.asuntosPorUnidadRespTotalUnidades = response.model.asuntosPorUnidadRespTotalUnidades || [];
          
          // Preparar datasets para las gráficas de pastel
          this.prepararGraficaAsuntosPorTema();
          this.prepararGraficaTurnosPorUnidad();
          
          this.reporteCargado = true;
        }
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar reporte:', error);
        this.utils.MuestrasToast(TipoToast.Error, 'No se pudo cargar el reporte');
        this.cargando = false;
      }
    });
  }

  getStatusColor(idStatus: number): string {
    const colors: { [key: number]: string } = {
      1: 'primary',
      2: 'warning',
      3: 'success'
    };
    return colors[idStatus] || 'secondary';
  }

  // Helper para calcular porcentaje máximo en gráficas
  getPercentage(value: number, dataset: any[]): number {
    if (!dataset || dataset.length === 0) return 0;
    const max = Math.max(...dataset.map((item: any) => 
      item.totalTurnados || item.totalAsuntosPorTema || item.totalAsuntosAtendidos || 0
    ));
    return max > 0 ? (value / max) * 100 : 0;
  }

  // Preparar gráfica de barras horizontales para asuntos por tema
  prepararGraficaAsuntosPorTema(): void {
    if (!this.asuntosPorTema || this.asuntosPorTema.length === 0) return;

    const gradientColors = this.asuntosPorTema.map((_, index) => {
      const colorStart = [139, 40, 40]; // RGB for #8b2828ff
      const colorEnd = [201, 169, 119]; // RGB for #c3b531ff
      const factor = index / this.asuntosPorTema.length;
      const r = Math.round(colorStart[0] + factor * (colorEnd[0] - colorStart[0]));
      const g = Math.round(colorStart[1] + factor * (colorEnd[1] - colorStart[1]));
      const b = Math.round(colorStart[2] + factor * (colorEnd[2] - colorStart[2]));
      return `rgb(${r}, ${g}, ${b})`;
    });

    this.graficaAsuntosPorTema = {
      labels: this.asuntosPorTema.map(tema => tema.Tema),
      datasets: [{
        type: 'bar',
        label: 'Total de Asuntos',
        data: this.asuntosPorTema.map(tema => tema.totalAsuntosPorTema),
        backgroundColor: gradientColors,
        borderColor: '#ffffffff',
        borderWidth: 1,
        barThickness: 25
      }] as ChartDataset<'bar', number[]>[]
    } as MultiChartData;
  }

  // Preparar gráfica de barras horizontales para turnos por unidad
  prepararGraficaTurnosPorUnidad(): void {
    if (!this.turnosPorUnidad || this.turnosPorUnidad.length === 0) return;

    const gradientColors = this.turnosPorUnidad.map((_, index) => {
      const colorStart = [201, 169, 119]; // RGB for #C9A977
      const colorEnd = [139, 40, 40]; // RGB for #B89867
      const factor = index / this.turnosPorUnidad.length;
      const r = Math.round(colorStart[0] + factor * (colorEnd[0] - colorStart[0]));
      const g = Math.round(colorStart[1] + factor * (colorEnd[1] - colorStart[1]));
      const b = Math.round(colorStart[2] + factor * (colorEnd[2] - colorStart[2]));
      return `rgb(${r}, ${g}, ${b})`;
    });

    this.graficaTurnosPorUnidad = {
      labels: this.turnosPorUnidad.map(unidad => unidad.area),
      datasets: [{
        type: 'bar',
        label: 'Total de Turnados',
        data: this.turnosPorUnidad.map(unidad => unidad.totalTurnados),
        backgroundColor: gradientColors,
        borderColor: '#ffffffff',
        borderWidth: 1,
        barThickness: 30
      }] as ChartDataset<'bar', number[]>[]
    } as MultiChartData;
  }
}
