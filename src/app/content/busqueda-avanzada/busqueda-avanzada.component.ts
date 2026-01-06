import { Component, OnInit, OnDestroy, ViewChild, TemplateRef } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ColDef, GridApi, GridReadyEvent, ValueFormatterParams } from 'ag-grid-community';
import { CatalogoService } from '../../../api/catalogo/catalogo.service';
import { UtilsService } from '../../services/utils.service';
import { TipoToast } from '../../../api/entidades/enumeraciones';
import { FechaMexicoPipe } from '../../../app/pipes/date-mx-format'; 
import { AsuntoService } from '../../../api/asunto/asunto.service';
import { ModalManagerService } from '../../components/shared/modal-manager.service';

@Component({
  selector: 'app-busqueda-avanzada',
  standalone: false,
  templateUrl: './busqueda-avanzada.component.html',
  styleUrl: './busqueda-avanzada.component.scss',
  providers: [FechaMexicoPipe] 
})
export class BusquedaAvanzadaComponent implements OnInit, OnDestroy {
  // Configuración de AG-Grid
  private gridApi!: GridApi;
  
  // Datos
  rowData: any[] = [];
  columnDefs: ColDef[] = []; 
  paginacion: any = null;
  resumenGeneral: any = null;
  
  // Filtros
  startDate: string = '';
  endDate: string = '';
  folio: string = '';
  
  // Paginación y Estado
  currentPage: number = 1;
  paginationPageSize: number = 50;
  totalRecords: number = 0;
  isLoading: boolean = false;
  isRefreshing: boolean = false;
  
  showColumnPanel: boolean = false;
  
  // Configuración por defecto
  defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    floatingFilter: true,
    minWidth: 100,
    suppressHeaderMenuButton: false,
    headerClass: 'text-center',
    cellStyle: { display: 'flex', alignItems: 'center' } 
  };
  
  paginationPageSizeSelector = [10, 25, 50, 100, 200];

  @ViewChild('verDocumentoModal') verDocumentoModal!: TemplateRef<any>;
  documentoStringURL: string = '';
  documentVisorURL: SafeResourceUrl | null = null;
  documentoVisor: any = null;
  documentosDisponibles: any[] = [];
  documentoActual: any = null;
  // Agrupación de documentos por categoría
  documentosAgrupados: any = {
    documentos: [],
    anexos: [],
    respuestas: []
  };
  currentAsuntoFolio: string = '';

  constructor(
    private catalogoService: CatalogoService,
    private fechaMexicoPipe: FechaMexicoPipe,
    private utils: UtilsService,
    private sanitizer: DomSanitizer,
    private modalManager: ModalManagerService,
    private asuntoService: AsuntoService
  ) {}

  ngOnInit(): void {
    this.initColumnDefs(); 
    this.loadInitialData();
  }

  ngOnDestroy(): void {}

  // formateador para celdas vacías
  emptyCellFormatter(params: ValueFormatterParams): string {
    if (params.value === null || params.value === undefined || params.value === '') {
      return '---'; 
    }
    return params.value;
  }
    getEmptyCellStyle(params: any) {
    if (params.value === null || params.value === undefined || params.value === '') {
      return { color: '#adb5bd', fontStyle: 'italic', fontSize: '0.85rem' }; 
    }
    return null; 
  }

  initColumnDefs(): void {
    const textCol = (props: ColDef): ColDef => ({
      ...props,
      valueFormatter: (p) => this.emptyCellFormatter(p),
      cellStyle: (p) => {
        const emptyStyle = this.getEmptyCellStyle(p);
        return emptyStyle ? { ...emptyStyle, display: 'flex', alignItems: 'center' } : { display: 'flex', alignItems: 'center' };
      }
    });

    this.columnDefs = [
      { 
        headerName: 'Acciones', 
        field: 'actions', 
        pinned: 'right', 
        width: 90,
        minWidth: 90,
        maxWidth: 90,
        hide: false,
        lockVisible: true,
        sortable: false, 
        filter: false,
        cellRenderer: (params: any) => this.actionsRenderer(params)
      },
      { headerName: 'Folio Asunto', field: 'asuntoFolio', width: 150, hide: false, lockVisible: true, pinned: 'left', tooltipField: 'asuntoFolio', filter: false },
      { 
        headerName: 'Estatus', 
        field: 'statusTurnado', 
        width: 130, 
        hide: false,
        lockVisible: true,
        cellStyle: params => {
          const baseStyle = { display: 'flex', alignItems: 'center', fontWeight: 'bold' };
          if (params.value === 'Recibido') return { ...baseStyle, color: '#273c6bff' }; 
          if (params.value === 'Rechazado') return { ...baseStyle, color: '#6d2626ff' }; 
          if (params.value === 'En trámite') return { ...baseStyle, color: '#80518eff' }; 
          if (params.value === 'Atendido') return { ...baseStyle, color: '#1c5f3fff' }; 
          return baseStyle;
        }
      },
            // columnas de fechas formateadas 
      { 
        headerName: 'Fecha Registro', 
        field: 'fechaRegistro', 
        width: 160, 
        hide: false,
        lockVisible: true,
        valueFormatter: (params) => this.dateFormatter(params, true),
        filterValueGetter: (params: any) => this.dateFormatter({ value: params.data.fechaRegistro } as any, true)
      },
      
      textCol({ headerName: 'Unidad Responsable', field: 'unidadArea', width: 220, hide: false, lockVisible: true, tooltipField: 'unidadResonsable' }),
      textCol({ headerName: 'Tema', field: 'asuntoTema', width: 180, hide: false, lockVisible: true, tooltipField: 'asuntoTema' }),
      { 
        headerName: 'Fecha Modificación', 
        field: 'fechaModificacion', 
        width: 180, 
        hide: false, 
        lockVisible: true, 
        valueFormatter: (params) => this.dateFormatter(params, true),
        filterValueGetter: (params: any) => this.dateFormatter({ value: params.data.fechaModificacion } as any, true)
      },
      { 
        headerName: 'Fecha Recepción', 
        field: 'asuntoFechaRecepcion', 
        width: 160, 
        hide: false, 
        lockVisible: true, 
        valueFormatter: (params) => this.dateFormatter(params, true),
        filterValueGetter: (params: any) => this.dateFormatter({ value: params.data.asuntoFechaRecepcion } as any, true)
      },
      { 
        headerName: 'Fecha Documento', 
        field: 'asuntoFechaDocumento', 
        width: 140, 
        hide: true, 
        valueFormatter: (params) => this.dateFormatter(params, false),
        filterValueGetter: (params: any) => this.dateFormatter({ value: params.data.asuntoFechaDocumento } as any, false)
      },
      { 
        headerName: 'Fecha Cumplimiento', 
        field: 'asuntoFechaCumplimiento', 
        width: 160, 
        hide: true, 
        valueFormatter: (params) => this.dateFormatter(params, false),
        filterValueGetter: (params: any) => this.dateFormatter({ value: params.data.asuntoFechaCumplimiento } as any, false)
      },
      // columnas ocultas
      textCol({ headerName: 'Tiempo de Atención', field: 'tiempoAtencionFormateado', width: 180, hide: true }),
      textCol({ headerName: 'Instrucción', field: 'nombreInstruccion', width: 200, hide: true }),
      textCol({ headerName: 'Respuesta', field: 'respuesta', width: 250, hide: true, tooltipField: 'respuesta' }),
      textCol({ headerName: 'Motivo Rechazo', field: 'motivoRechazo', width: 250, hide: true, tooltipField: 'motivoRechazo' }),
      
      textCol({ headerName: 'No. Oficio', field: 'asuntoNoOficio', width: 150, hide: true }),
      textCol({ headerName: 'Tipo Documento', field: 'asuntoTipoDocumento', width: 130, hide: true }),
      textCol({ headerName: 'Remitente', field: 'asuntoRemitente', width: 180, hide: true }),
      textCol({ headerName: 'Cargo Remitente', field: 'asuntoRemitenteCargo', width: 150, hide: true }),
      textCol({ headerName: 'Dependencia Rem.', field: 'asuntoRemitenteDependencia', width: 180, hide: true }),
      textCol({ headerName: 'Dirigido A', field: 'asuntoDirigidoA', width: 180, hide: true }),
      textCol({ headerName: 'Descripción', field: 'asuntoDescripcion', width: 300, hide: true, tooltipField: 'asuntoDescripcion' }),
      textCol({ headerName: 'Prioridad', field: 'asuntoPrioridad', width: 110, hide: true }),
      textCol({ headerName: 'Medio', field: 'asuntoMedio', width: 120, hide: true }),
      textCol({ headerName: 'Observaciones', field: 'asuntoObservaciones', width: 250, hide: true }),

      { headerName: 'Última Operación', field: 'ultimaOperacion', width: 160, hide: true }
    ];
  }

  dateFormatter(params: ValueFormatterParams, mostrarHora: boolean): string {
    if (!params.value) return '---'; 
    return this.fechaMexicoPipe.transform(params.value, mostrarHora, false);
  }

  toggleColumnPanel(): void {
    this.showColumnPanel = !this.showColumnPanel;
  }

  closeColumnPanel(): void {
    this.showColumnPanel = false;
  }

  toggleColumn(field: string): void {
    if (this.gridApi) {
      const colState = this.gridApi.getColumnState();
      const col = colState.find(c => c.colId === field);
      if (col) {
        this.gridApi.setColumnsVisible([field], !col.hide ? false : true);
      }
    }
  }

  isColumnVisible(field: string): boolean {
    if (!this.columnDefs || this.columnDefs.length === 0) return false;
    if (!this.gridApi) {
      const col = this.columnDefs.find(c => c.field === field);
      return col ? !col.hide : false;
    }

    try {
      const colState = this.gridApi.getColumnState();
      if (!colState) { 
          const col = this.columnDefs.find(c => c.field === field);
          return col ? !col.hide : false;
      }
      const col = colState.find(c => c.colId === field);
      return col ? !col.hide : false;
    } catch (error) {
      return true; 
    }
  }

  actionsRenderer(params: any) {
    return `
      <div class="d-flex gap-3 justify-content-center align-items-center w-100 h-100">
        <i class="fas fa-eye text-secondary action-icon" data-action="view" data-id="${params.data.idTurnado}" title="Ver documentos"></i>
        <i class="fa solid fa-download text-secondary action-icon" data-action="download" data-id="${params.data.idAsunto}" title="Descargar Zip"></i>
      </div>`;
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
  }
  loadInitialData(): void { this.buscarTurnados(); }
  applyFilter(): void { this.currentPage = 1; this.buscarTurnados(); }
  clearFilter(): void {
    this.startDate = ''; this.endDate = ''; this.folio = '';
    this.currentPage = 1; this.buscarTurnados();
  }
  
  buscarTurnados(): void {
    this.isLoading = true;
    const postData = {
      fechaInicio: this.startDate || null,
      fechaFin: this.endDate || null,
      folio: this.folio || null,
      ordenamiento: 'fecha', direccion: 'DESC', limite: 10000, offset: 0
    };

    this.catalogoService.busquedaAvanzadaTurnados(postData).subscribe({
      next: (response: any) => {
        if (response.status === 200 && response.model) {
          this.rowData = response.model.detalleTurnados || [];
          this.resumenGeneral = response.model.resumenGeneral;
          this.paginacion = response.model.paginacion;
        } else {
            this.utils.MuestrasToast(TipoToast.Warning, response.message || 'No se encontraron resultados.');
            this.rowData = [];
            this.resumenGeneral = null;
            this.paginacion = null;
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        this.utils.MuestraErrorInterno(error);
        this.isLoading = false;
      }
    });
  }

  onCellClicked(event: any): void {
    const target = event.event.target;
    if (target.dataset.action) this.handleAction(target.dataset.action, target.dataset.id, event.data);
  }

  handleAction(action: string, id: string, rowData: any): void {
    if (action === 'view') {
      this.verOficio(rowData);
    } else if (action === 'download') {
      this.descargarOficio(rowData);
    }
  }

  verOficio(data: any) {
    this.currentAsuntoFolio = data.asuntoFolio;
    this.documentosDisponibles = [];
    this.documentoActual = null;
    this.documentVisorURL = null;

    // 1. Consultar expediente del asunto
    this.asuntoService.consultarExpedienteAsunto({ idAsunto: data.idAsunto }).subscribe({
        next: (response: any) => {
            if (response.status === 200 && response.model) {
                this.documentosAgrupados = response.model;
                
                // 2. Cargar el primer documento por defecto
                const preferred = (this.documentosAgrupados.documentos?.[0] || this.documentosAgrupados.anexos?.[0] || this.documentosAgrupados.respuestas?.[0]);
                if (preferred) this.cargarDocumentoEnVisor(preferred);
                
                // 3. Abrir modal
                this.modalManager.openModal({
                    title: 'Visor de Documentos',
                    template: this.verDocumentoModal,
                    showFooter: false,
                    onAccept: () => {},
                    onCancel: () => {
                        this.documentVisorURL = null;
                        this.documentosDisponibles = [];
                    },
                    width: '400px',
                });
            } else {
                this.utils.MuestrasToast(TipoToast.Error, 'No se encontraron documentos asignados al asunto.');
            }
        },
        error: (error) => {
            this.utils.MuestrasToast(TipoToast.Error, 'Error al consultar el expediente.');
        }
    });
  }

  cargarDocumentoEnVisor(doc: any) {
      this.documentoActual = doc;
      this.documentVisorURL = null;
      
      this.asuntoService.verDocumento({ id: this.currentAsuntoFolio, relativePath: doc.ruta }).subscribe({
        next: (blob: Blob) => {
            if (blob.size > 0) {
                const url = URL.createObjectURL(blob) + '#view=FitH';
                this.documentVisorURL = this.sanitizer.bypassSecurityTrustResourceUrl(url);
                this.documentoVisor = { 
                    nombre: doc.nombre, 
                    size: blob.size, 
                    fechaRegistro: new Date(), 
                    type: blob.type 
                };
            } else {
                this.utils.MuestrasToast(TipoToast.Error, 'El documento está vacío.');
            }
        },
        error: (error) => {
            this.utils.MuestrasToast(TipoToast.Error, 'Error al cargar el contenido del documento.');
        }
      });
  }

  // Helper para obtener llaves en orden
  get documentGroupKeys(): string[] {
    return ['documentos', 'anexos', 'respuestas'];
  }

  // Etiqueta legible para la llave
  keyLabel(key: string): string {
    switch (key) {
      case 'documentos': return 'Documento(s) principal(es)';
      case 'anexos': return 'Anexos';
      case 'respuestas': return 'Respuestas / Turnados';
      default: return 'Otros';
    }
  }

  // Mostrar tamaño legible
  humanFileSize(size: number): string {
    if (!size && size !== 0) return '';
    const i = size === 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
    const sizes = ['B','KB','MB','GB','TB'];
    return (size / Math.pow(1024, i)).toFixed(i ? 1 : 0) + ' ' + sizes[i];
  }

  descargarOficio(data: any) {
    this.asuntoService.descargarExpediente({ id: data.asuntoFolio }).subscribe({
      next: (blob: Blob) => {
        if (blob.size > 0) {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Asunto-${data.asuntoFolio}.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            this.utils.MuestrasToast(TipoToast.Info, 'Generando zip.');
        } else {
            this.utils.MuestrasToast(TipoToast.Warning, 'No se encontró el expediente para descargar.');
        }
      },
      error: (error) => {
        this.utils.MuestrasToast(TipoToast.Error, 'Error al descargar el expediente.');
      },
      
      
    });
  }

  refreshGrid(): void {
    if (this.gridApi) {
      this.isRefreshing = true;
      this.gridApi.resetColumnState();
      this.gridApi.setFilterModel(null);
      this.gridApi.onFilterChanged();
      this.loadInitialData();    
      setTimeout(() => {
        this.isRefreshing = false;
      }, 1000);
    }
  }

  generarExcel(): void {
    this.utils.MuestrasToast(TipoToast.Info, 'Generando archivo excel.');
    if (this.gridApi) {
      const date = new Date();
      const dateStr = `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
      
      // Obtener solo las columnas visibles actualmente
      const visibleColumns = this.gridApi.getAllDisplayedColumns();
      
      // Filtrar la columna de acciones si es que está visible
      const columnKeys = visibleColumns
        ?.filter((col: any) => col.getColId() !== 'actions')
        .map((col: any) => col.getColId());

      this.gridApi.exportDataAsCsv({
        fileName: `reporte_turnados_${dateStr}.csv`,
        columnKeys: columnKeys
      });
    }
  }

  openDocumentoVisor(file: any) {}

}