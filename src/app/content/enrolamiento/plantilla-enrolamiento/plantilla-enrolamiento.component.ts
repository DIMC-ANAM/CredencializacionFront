import { Component, Input, ViewChild, ElementRef, TemplateRef, AfterViewInit, Output, EventEmitter, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ModalManagerService } from '../../../components/shared/modal-manager.service';
import { EnrolamientoService } from '../../../services/enrolamiento.service';
import { UtilsService } from '../../../services/utils.service';
import { TipoToast } from '../../../../api/entidades/enumeraciones';
import { Router } from '@angular/router';
import { WacomService } from '../../../services/wacom.service';
import { Subscription } from 'rxjs';

@Component({
  standalone: false,
  selector: 'app-plantilla-enrolamiento',
  templateUrl: './plantilla-enrolamiento.component.html',
  styleUrls: ['./plantilla-enrolamiento.component.scss']
})
export class PlantillaEnrolamientoComponent implements AfterViewInit, OnChanges, OnDestroy {

  @Input() empleado: any = null;
  @Input() editable: boolean = false;
  @Input() isPrintMode: boolean = false;
  @Output() enrolamientoCompletado = new EventEmitter<void>();

  // Modales y Elementos
  @ViewChild('modalCamara', { static: true }) modalCamara!: TemplateRef<any>;
  @ViewChild('modalFirma', { static: true }) modalFirma!: TemplateRef<any>;
  @ViewChild('videoElement') videoElement!: ElementRef;
  @ViewChild('canvasElement') canvasElement!: ElementRef;
  
  // Referencia al Canvas de Firma (dentro del modal)
  @ViewChild('firmaCanvas') firmaCanvas!: ElementRef<HTMLCanvasElement>;

  modalCamaraRef: NgbModalRef | undefined;
  modalFirmaRef: NgbModalRef | undefined;

  stream: MediaStream | null = null;
  fotoCapturada: string | null = null;
  guardando: boolean = false;
  vistaCredencial: 'frente' | 'reverso' = 'frente';
  fechaActual: Date = new Date();

  // Variables Camara
  dispositivosVideo: MediaDeviceInfo[] = []; 
  camaraSeleccionadaId: string = '';
  
  // Variables para la Firma
  private cx!: CanvasRenderingContext2D | null;
  private isDrawing = false;
  
  // Variables Wacom
  private wacomSub: Subscription | null = null;
  public isWacomSupported = false;
  public wacomConnected = false;
  public debugInfo: string = 'Wacom: Desconectado';
  
  // Suavizado
  private lastX = 0;
  private lastY = 0;

  constructor(
    private modalManager: ModalManagerService,
    private enrolamientoApi: EnrolamientoService,
    private utils: UtilsService,
    private router: Router,
    private wacomService: WacomService
  ) {
    this.isWacomSupported = this.wacomService.isBrowserSupported();
  }

  ngOnDestroy(): void {
      if(this.wacomSub) this.wacomSub.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['empleado'] && this.empleado) {
        this.corregirUrls();
    }
  }

  corregirUrls() {
    const baseUrl = 'http://127.0.0.1:8000';
    
    const procesar = (str: string) => {
        if (!str) return null;
        // 1. Si ya tiene formato correcto (http o data URI), lo dejamos tal cual
        if (str.startsWith('http') || str.startsWith('data:')) return str;
        
        // 2. Si tiene extensión de imagen (.jpg, .png, etc), asumimos que es una RUTA relativa
        if (/\.(jpeg|jpg|png|gif|bmp|webp)$/i.test(str)) {
            return `${baseUrl}${str}`;
        }
        
        // 3. Si NO tiene extensión, asumimos que es contenido Base64 crudo
        return `data:image/jpeg;base64,${str}`;
    };

    this.empleado.foto = procesar(this.empleado.foto);11
    this.empleado.firma = procesar(this.empleado.firma);
  }

  ngAfterViewInit(): void {
    // No inicializamos el canvas aquí porque está dentro de un <ng-template> (Modal)
    // Se inicializa cuando se abre el modal.
  }

  // ==========================================
  // HELPER: Separar apellidos desde un solo input
  // ==========================================
  separarApellidos(valor: string) {
    if (!this.empleado) return;
    const partes = (valor || '').trim().split(/\s+/);
    if (partes.length >= 2) {
      this.empleado.paterno = partes[0];
      this.empleado.materno = partes.slice(1).join(' ');
    } else {
      this.empleado.paterno = valor;
      this.empleado.materno = '';
    }
  }

  // ==========================================
  // LÓGICA DE FOTO (CÁMARA EXT. O WEBCAM)
  // ==========================================
  abrirCamara() {
    this.fotoCapturada = null;
    this.modalCamaraRef = this.modalManager.openModal({
      title: 'Captura de Fotografía',
      template: this.modalCamara,
      width: '600px',
      showFooter: false
    });
    // Intentamos iniciar webcam por si acaso, pero daremos opción de subir archivo
    this.iniciarCamara();
  }

  async iniciarCamara(deviceId?: string) {
    this.detenerCamara();

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const constraints = { 
            video: deviceId ? { deviceId: { exact: deviceId } } : true 
        };

        this.stream = await navigator.mediaDevices.getUserMedia(constraints);
        
        setTimeout(() => {
          if(this.videoElement) this.videoElement.nativeElement.srcObject = this.stream;
        }, 100);

        // Listar dispositivos (ahora que tenemos permisos)
        const devices = await navigator.mediaDevices.enumerateDevices();
        this.dispositivosVideo = devices.filter(d => d.kind === 'videoinput');
        
        // Actualizar el ID seleccionado
        const track = this.stream?.getVideoTracks()[0];
        if (track) {
            const settings = track.getSettings();
            if (settings.deviceId) this.camaraSeleccionadaId = settings.deviceId;
        }

      } catch (err) {
        console.warn('Error al iniciar cámara:', err);
        this.utils.MuestrasToast(TipoToast.Warning, 'No se pudo acceder a la cámara. Verifique los permisos.');
      }
    }
  }

  cambiarCamara(event: any) {
     this.iniciarCamara(event.target.value);
  }

  // Opción A: Captura desde Webcam
  capturarFoto() {
    if (!this.videoElement) return;
    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    this.fotoCapturada = canvas.toDataURL('image/jpeg');
    this.detenerCamara();
  }

  // Opción B: Subir archivo (Para Cámara Profesional Externa)
  onArchivoSeleccionado(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB límite
        this.utils.MuestrasToast(TipoToast.Warning, 'La imagen es muy pesada. Máximo 5MB.');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = () => {
        this.fotoCapturada = reader.result as string;
        this.detenerCamara(); // Ya no necesitamos el video si subieron foto
      };
      reader.readAsDataURL(file);
    }
  }

  confirmarFoto() {
    if (this.fotoCapturada && this.empleado) {
      this.empleado.foto = this.fotoCapturada;
      if (this.modalCamaraRef) {
        this.modalCamaraRef.close();
      } else {
        this.modalManager.closeModal();
      }
    }
  }

  detenerCamara() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }


  // ==========================================
  // LÓGICA DE FIRMA (CANVAS + TOUCH + WACOM)
  // ==========================================
  
  async conectarWacom() {
    this.wacomConnected = await this.wacomService.conectar();
    
    if (this.wacomConnected) {
      if (this.wacomSub) this.wacomSub.unsubscribe();
      
      this.wacomSub = this.wacomService.getPenData().subscribe((data) => {
        this.procesarTrazoWacom(data);
      });
      
      this.utils.MuestrasToast(TipoToast.Success, 'Tableta Wacom Conectada');
    } else {
       this.utils.MuestrasToast(TipoToast.Error, 'No se pudo conectar la tableta. Verifique conexión USB y permisos.');
    }
  }

  procesarTrazoWacom(data: any) {
    if (!this.cx || !data) return;
    
    // Si la presión es 0, forzamos isDown a false para evitar trazos fantasma
    const isPenDown = data.pressure > 0;

    const info = this.wacomService.getTabletInfo();
    
    // CALIBRACION WACOM STU-430
    // Ignoramos los valores reportados por getTabletInfo() si son enormes (ej 32000)
    // Usamos los máximos observados por el usuario como referencia (9727 x 6016)
    const tabletW = 9750; // Ajustado un poco arriba de 9727
    const tabletH = 6100; // Ajustado un poco arriba de 6016

    const canvasEl = this.firmaCanvas.nativeElement;
    
    // Mapeo de coordenadas
    const x = (data.x / tabletW) * canvasEl.width;
    const y = (data.y / tabletH) * canvasEl.height;

    // Logica de dibujo con Interpolación Cuadrática para suavizado
    if (data.isDown) {
       if (!this.isDrawing) {
           this.isDrawing = true;
           this.cx.beginPath();
           this.cx.moveTo(x, y);
           this.lastX = x;
           this.lastY = y;
       } else {
           // Calcular punto medio
           const midX = (this.lastX + x) / 2;
           const midY = (this.lastY + y) / 2;
           
           // Curva quadratica hacia el punto medio usando lastX/lastY como control
           // Esto suaviza los vertices agudos
           this.cx.quadraticCurveTo(this.lastX, this.lastY, midX, midY);
           this.cx.stroke();
           
           // Actualizar ultimo punto conocido
           this.lastX = x;
           this.lastY = y;
       }
    } else {
       if (this.isDrawing) {
           // Trazar el último segmento que faltó
           this.cx.lineTo(this.lastX, this.lastY); 
           this.cx.stroke();
           
           this.isDrawing = false;
           this.cx.closePath();
       }
    }
  }

  abrirFirma() {
    this.modalFirmaRef = this.modalManager.openModal({
      title: 'Captura de Firma',
      template: this.modalFirma,
      width: '500px',
      showFooter: true,
      onAccept: () => this.confirmarFirma()
    });

    // Esperamos un poco a que el modal se renderice para obtener el contexto del canvas
    setTimeout(() => {
      this.inicializarCanvasFirma();
      // Si la tableta ya estaba conectada, limpiamos el pad físico
      if (this.wacomConnected) {
          this.wacomService.limpiarPantalla();
      }
    }, 200);
  }

  inicializarCanvasFirma() {
    const canvasEl = this.firmaCanvas.nativeElement;
    
    // Configuración de Alta Resolución
    const scale = 2; // Multiplicador de densidad de píxeles (2x o 3x)
    
    // Desynchronized hint para menor latencia en Chrome
    this.cx = canvasEl.getContext('2d', { desynchronized: true });

    // Ajustamos tamaño interno del canvas al doble del visual (Retina/HiDPI support)
    // Esto aumenta la resolución de dibujo y elimina el pixelado
    canvasEl.width = canvasEl.offsetWidth * scale;
    canvasEl.height = canvasEl.offsetHeight * scale;

    if (this.cx) {
      // Escalamos el grosor del pincel proporcionalmente
      this.cx.lineWidth = 3 * scale; 
      this.cx.lineCap = 'round';
      this.cx.lineJoin = 'round'; // Uniones suavizadas
      this.cx.strokeStyle = '#000000';
    }
  }

  // --- Eventos de Dibujo (Soporte Mouse y Touch) ---
  
  startDrawing(event: MouseEvent | TouchEvent): void {
    // Si estamos recibiendo datos de Wacom, ignorar mouse para evitar conflictos
    if(this.wacomConnected && this.isDrawing) return; 

    this.isDrawing = true;
    const { x, y } = this.getCoordinates(event);
    this.draw(x, y);
  }

  moveDrawing(event: MouseEvent | TouchEvent): void {
    if(this.wacomConnected) return; // Prioridad Wacom si está conectada
    
    if (!this.isDrawing) return;
    const { x, y } = this.getCoordinates(event);
    this.draw(x, y);
    event.preventDefault(); // Evita scroll en tabletas al firmar
  }

  stopDrawing(): void {
    if(this.wacomConnected) return; // Wacom maneja su propio isDrawing via isDown

    if (!this.isDrawing) return;
    this.isDrawing = false;
    this.cx?.beginPath(); // Resetea el path para no unir líneas separadas
  }

  draw(x: number, y: number): void {
    if (!this.cx) return;
    this.cx.lineTo(x, y);
    this.cx.stroke();
    this.cx.beginPath();
    this.cx.moveTo(x, y);
  }

  // Helper para obtener coordenadas (normaliza Mouse vs Touch)
  private getCoordinates(event: MouseEvent | TouchEvent): { x: number, y: number } {
    const canvasEl = this.firmaCanvas.nativeElement;
    const rect = canvasEl.getBoundingClientRect();
    
    let clientX, clientY;

    if (event instanceof TouchEvent) {
      // Es toque
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      // Es mouse
      clientX = event.clientX;
      clientY = event.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }

  limpiarFirma() {
    const canvasEl = this.firmaCanvas.nativeElement;
    this.cx?.clearRect(0, 0, canvasEl.width, canvasEl.height);
    // Limpiar también tableta física
    this.wacomService.limpiarPantalla();
  }

  confirmarFirma() {
    const canvasEl = this.firmaCanvas.nativeElement;
    // Guardamos la firma en base64 (PNG para transparencia)
    const dataUrl = canvasEl.toDataURL('image/png');
    
    // Validamos que no esté vacía (un canvas vacío tiene poco peso, pero mejor validar si se dibujó algo)
    // Una validación simple es ver si dataUrl es muy corta, pero asumiremos que firmaron.
    if (this.empleado) {
      this.empleado.firma = dataUrl;
      if (this.modalFirmaRef) {
        this.modalFirmaRef.close();
      } else {
        this.modalManager.closeModal();
      }
    }
  }

guardarEnrolamiento() {
    // Validaciones básicas
    if (!this.empleado) return;
    
    if(!this.empleado.foto || !this.empleado.firma) {
      this.utils.MuestrasToast(TipoToast.Warning, 'Falta capturar foto o firma');
      return;
    }

    this.guardando = true;

    // Preparamos los datos a enviar (Payload)
    // Solo mandamos lo que queremos actualizar para ahorrar ancho de banda
    const payload = {
        foto: this.empleado.foto,
        firma: this.empleado.firma,
        num_empleado: this.empleado.num_empleado,
        rfc: this.empleado.rfc,
        curp: this.empleado.curp,
        nombre: this.empleado.nombre,
        paterno: this.empleado.paterno,
        materno: this.empleado.materno,
        puesto: this.empleado.puesto,
        adscripcion: this.empleado.adscripcion,
        inicio_vig: this.empleado.inicio_vig,
        fin_vig: this.empleado.fin_vig,
        eladia: this.empleado.eladia
    };

    // Detectamos si es una CREACIÓN o una ACTUALIZACIÓN
    const id = this.empleado.id_enrolamiento;

    if (id) {
        // CASO ACTUALIZAR (PATCH)
        this.enrolamientoApi.actualizarExpediente(id, payload).subscribe({
            next: (resp) => {
                this.guardando = false;
                this.utils.MuestrasToast(TipoToast.Success, 'Enrolamiento completado exitosamente');
                this.enrolamientoCompletado.emit();
                this.empleado = null;
            },
            error: (err) => {
                this.guardando = false;
                this.utils.MuestraErrorInterno(err);
            }
        });
    } else {
        this.guardando = false;
        this.utils.MuestrasToast(TipoToast.Error, 'Error: No se encontró el ID del expediente para actualizar');
    }
  }
}