import { Component, OnInit, ViewChild, TemplateRef, ElementRef } from '@angular/core';
import { EnrolamientoService } from '../../services/enrolamiento.service';
import { UtilsService } from '../../services/utils.service';
import { TipoToast } from '../../../api/entidades/enumeraciones';
import { ModalManagerService } from '../../components/shared/modal-manager.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { PlantillaEnrolamientoComponent } from '../enrolamiento/plantilla-enrolamiento/plantilla-enrolamiento.component';

@Component({
  standalone: false,
  selector: 'app-credencializacion',
  templateUrl: './credencializacion.component.html',
  styleUrls: ['./credencializacion.component.scss']
})
export class CredencializacionComponent implements OnInit {
  Math = Math;
  personal: any = [];
  paginaPersonal: any[] = []; // Lista que se muestra por página
  searchTerm: string = '';
  filteredPersonal: any[] = []; // Lista filtrada

  pageSize: number = 10; // Elementos por página
  currentPage: number = 0;
  totalPages: number = 0;
  visiblePages: number[] = [];

  @ViewChild('modalVisualizar') modalVisualizar!: TemplateRef<any>;
  empleadoSeleccionado: any = null;
  esEditable: boolean = false;

  // Variables para impresión
  empleadoImprimir: any = null;
  @ViewChild('plantillaImprimir') plantillaImprimir!: PlantillaEnrolamientoComponent;
  @ViewChild('printContainer') printContainer!: ElementRef;

  constructor(
    private enrolamientoService: EnrolamientoService,
    private utils: UtilsService,
    private modalManager: ModalManagerService
  ) {}

  ngOnInit(): void {
    this.obtenerCredenciales();
  }

  obtenerCredenciales() {
    this.enrolamientoService.getDataTableImprimir().subscribe(
      (data: any) => {
        this.personal = data;
        this.filteredPersonal = [...this.personal];
        this.totalPages = Math.ceil(this.filteredPersonal.length / this.pageSize);
        this.currentPage = 0;
        this.updateVisiblePages();
        this.updatePaginaPersonal();
      },
      (error) => {
        this.utils.MuestraErrorInterno(error);
      }
    );
  }

  updatePaginaPersonal() {
    const start = this.currentPage * this.pageSize;
    const end = start + this.pageSize;
    this.paginaPersonal = this.filteredPersonal.slice(start, end);
  }

  prevPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.updatePaginaPersonal();
      this.updateVisiblePages();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.updatePaginaPersonal();
      this.updateVisiblePages();
    }
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.updatePaginaPersonal();
    this.updateVisiblePages();
  }

  updateVisiblePages() {
    const total = this.totalPages;
    const current = this.currentPage;
    const visibleCount = 5;

    let start = Math.max(current - Math.floor(visibleCount / 2), 0);
    let end = start + visibleCount;

    if (end > total) {
      end = total;
      start = Math.max(end - visibleCount, 0);
    }

    this.visiblePages = [];
    for (let i = start; i < end; i++) {
      this.visiblePages.push(i);
    }
  }

  applyFilter() {
    const term = this.searchTerm.toLowerCase();

    this.filteredPersonal = this.personal.filter((persona: any) => {
      const nombreCompleto = `${persona.nombre} ${persona.paterno} ${persona.materno}`.toLowerCase();
      return (
        (persona.num_empleado && persona.num_empleado.toString().toLowerCase().includes(term)) ||
        (persona.rfc && persona.rfc.toLowerCase().includes(term)) ||
        (persona.curp && persona.curp.toLowerCase().includes(term)) ||
        nombreCompleto.includes(term) ||
        (persona.adscripcion && persona.adscripcion.toLowerCase().includes(term)) ||
        (persona.puesto && persona.puesto.toLowerCase().includes(term))
      );
    });

    this.totalPages = Math.ceil(this.filteredPersonal.length / this.pageSize);
    this.currentPage = 0;
    this.updateVisiblePages();
    this.updatePaginaPersonal();
  }

  visualizarCredencial(persona: any) {
    this.empleadoSeleccionado = { ...persona };
    this.esEditable = false;
    this.modalManager.openModal({
      title: 'Visualizar Credencial',
      template: this.modalVisualizar,
      width: '400px',
      showFooter: false
    });
  }

  guardarCambios(plantilla: any) {
    if (plantilla) {
      plantilla.guardarEnrolamiento();
    }
  }

  onEnrolamientoCompletado() {
    this.modalManager.closeModal();
    this.obtenerCredenciales(); // Recargar la tabla
  }

  async imprimirCredencial(persona: any) {
    if (!persona.num_empleado) {
      this.utils.MuestrasToast(TipoToast.Warning, 'No se puede imprimir: El registro no cuenta con número de empleado.');
      return;
    }

    this.utils.MuestrasToast(TipoToast.Info, 'Generando PDF, por favor espere...');
    this.empleadoImprimir = { ...persona };
    
    // Esperar a que Angular actualice la vista y cargue las imágenes
    setTimeout(async () => {
        try {
            const pdf = new jsPDF('p', 'mm', 'a4');
            const options = { scale: 4, useCORS: true, logging: false };

            // 1. Capturar Frente
            if (this.plantillaImprimir) {
                this.plantillaImprimir.vistaCredencial = 'frente';
                // Esperar renderizado
                await new Promise(resolve => setTimeout(resolve, 500)); 
                
                const element = this.printContainer.nativeElement;
                const canvasFront = await html2canvas(element, options);
                const imgDataFront = canvasFront.toDataURL('image/png');
                
                // Calcular dimensiones - ambas tarjetas deben caber en A4 (297mm alto)
                const cardWidth = 120; // Ancho fijo para las tarjetas
                const aspectRatioFront = canvasFront.height / canvasFront.width;
                const cardHeightFront = cardWidth * aspectRatioFront;
                
                // Centrar en A4 (210 x 297 mm)
                const x = (210 - cardWidth) / 2;
                let y = 12;

                pdf.setFontSize(12);
                pdf.text('Frente', 105, y, { align: 'center' });
                y += 3;
                pdf.addImage(imgDataFront, 'PNG', x, y, cardWidth, cardHeightFront);

                // 2. Capturar Reverso
                this.plantillaImprimir.vistaCredencial = 'reverso';
                await new Promise(resolve => setTimeout(resolve, 500));

                const canvasBack = await html2canvas(element, options);
                const imgDataBack = canvasBack.toDataURL('image/png');
                
                const aspectRatioBack = canvasBack.height / canvasBack.width;
                const cardHeightBack = cardWidth * aspectRatioBack;

                y += cardHeightFront + 8; // Espacio entre tarjetas
                pdf.setFontSize(12);
                pdf.text('Reverso', 105, y, { align: 'center' });
                y += 3;
                pdf.addImage(imgDataBack, 'PNG', x, y, cardWidth, cardHeightBack);

                pdf.save(`Credencial_${persona.num_empleado}.pdf`);
                
                this.utils.MuestrasToast(TipoToast.Success, 'PDF generado correctamente');
            }
        } catch (error) {
            console.error(error);
            this.utils.MuestrasToast(TipoToast.Error, 'Error al generar PDF');
        } finally {
            this.empleadoImprimir = null; // Limpiar
        }
    }, 100);
  }
}
