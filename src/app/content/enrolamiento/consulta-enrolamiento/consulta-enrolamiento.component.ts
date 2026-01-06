import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { EnrolamientoService } from '../../../services/enrolamiento.service';
import { UtilsService } from '../../../services/utils.service';
import { TipoToast } from '../../../../api/entidades/enumeraciones';

@Component({
  standalone: false,
  selector: 'app-consulta-enrolamiento',
  templateUrl: './consulta-enrolamiento.component.html',
  styleUrls: ['./consulta-enrolamiento.component.scss']
})
export class ConsultaEnrolamientoComponent implements OnInit {

  terminoBusqueda: string = '';
  cargando: boolean = false;
  
  listaEmpleados: any[] = []; 
  listaFiltrada: any[] = [];

  @Output() empleadoEncontrado = new EventEmitter<any>();

  constructor(
    private enrolamientoApi: EnrolamientoService,
    private utils: UtilsService
  ) {}

  ngOnInit(): void {
    this.cargarEmpleados();
  }

  cargarEmpleados() {
    this.cargando = true;
    
    // --- CAMBIO CLAVE: Usamos getPendientes() ---
    this.enrolamientoApi.getPendientes().subscribe({
      next: (data) => {
        // Ajuste por si Django manda paginación o lista directa
        const registros = Array.isArray(data) ? data : (data as any).results || [];
        
        this.listaEmpleados = registros;
        this.listaFiltrada = [...registros]; // Inicializamos la tabla
        this.cargando = false;
        
        // Mensaje opcional si no hay pendientes
        if (registros.length === 0) {
            // this.utils.MuestrasToast(TipoToast.Info, 'No hay empleados pendientes de enrolar');
        }
      },
      error: (err) => {
        this.cargando = false;
        console.error('Error al cargar pendientes', err);
        this.utils.MuestrasToast(TipoToast.Error, 'Error al cargar la lista de pendientes');
      }
    });
  }

  buscar() {
    const termino = this.terminoBusqueda.trim();
    
    // Si borran el texto, restauramos la lista completa de PENDIENTES
    if (!termino) {
        this.listaFiltrada = [...this.listaEmpleados];
        return;
    }

    // --- FILTRADO LOCAL (Recomendado) ---
    // Filtramos sobre la lista de pendientes que ya descargamos.
    // Esto es instantáneo y evita llamar al backend que podría devolver registros "completos" si usas el buscador general.
    const terminoMin = termino.toLowerCase();
    
    this.listaFiltrada = this.listaEmpleados.filter(emp => 
        (emp.nombre && emp.nombre.toLowerCase().includes(terminoMin)) ||
        (emp.paterno && emp.paterno.toLowerCase().includes(terminoMin)) ||
        (emp.rfc && emp.rfc.toLowerCase().includes(terminoMin)) ||
        (emp.num_empleado && emp.num_empleado.toLowerCase().includes(terminoMin))
    );
  }

  consultar() {
    this.buscar(); // Aseguramos que la lista esté filtrada

    if (this.listaFiltrada.length === 1) {
        this.seleccionarEmpleado(this.listaFiltrada[0]);
    } else if (this.listaFiltrada.length === 0) {
        this.utils.MuestrasToast(TipoToast.Info, 'No se encontraron expedientes con ese criterio.');
    }
  }

  seleccionarEmpleado(empleado: any) {
    // Preparamos los apellidos por si vienen separados o juntos
    const apellidosComb = empleado.apellidos || `${empleado.paterno || ''} ${empleado.materno || ''}`.trim();

    const datosParaPlantilla = {
        ...empleado, 
        apellidos: apellidosComb
    };

    this.empleadoEncontrado.emit(datosParaPlantilla);
    // this.utils.MuestrasToast(TipoToast.Success, 'Plantilla cargada exitosamente');
  }
}