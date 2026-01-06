import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EnrolamientoService } from '../../services/enrolamiento.service'; // Asegúrate de tener este servicio
import { UtilsService } from '../../services/utils.service'; // Tu servicio de utilidades
import { ModalManagerService } from '../../components/shared/modal-manager.service'; // Tu servicio de modales
import { TipoToast } from '../../../api/entidades/enumeraciones'; // Tus enumeraciones
import { SessionService } from '../../services/session.service'; // Tu servicio de sesión

@Component({
  standalone: false,
  selector: 'app-registro-empleado',
  templateUrl: './registro-empleado.component.html',
  styleUrls: ['./registro-empleado.component.scss']
})
export class RegistroEmpleadoComponent implements OnInit {

  @ViewChild('confirmModal', { static: true }) confirmModal!: TemplateRef<any>;
  @ViewChild('respuestaRegistroModal', { static: true }) respuestaRegistroModal!: TemplateRef<any>;

  empleadoForm!: FormGroup;
  
  // Manejo de la Foto
  foto: { file: File; nombre: string; preview: string | ArrayBuffer | null } | null = null;
  
  usuario: any = null;

  constructor(
    private fb: FormBuilder,
    private enrolamientoApi: EnrolamientoService,
    private utils: UtilsService,
    private modalManager: ModalManagerService,
    private sessionS: SessionService
  ) { }

  ngOnInit(): void {
    this.usuario = this.sessionS.getUsuario();
    this.initFormEmpleado();
  }

  initFormEmpleado() {
    this.empleadoForm = this.fb.group({
      rfc: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(13)]],
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      paterno: ['', [Validators.required, Validators.maxLength(100)]],
      materno: ['', [Validators.maxLength(100)]],
      puesto: ['', [Validators.maxLength(100)]],
      adscripcion: ['', [Validators.maxLength(100)]],
      inicio_vig: [null], 
      fin_vig: [null],
      activo: [1]
    });
  }

  // --- Selección de Foto (Basado en tu onDocumentoSeleccionado) ---
  onFotoSeleccionada(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Validaciones de tipo y tamaño
      if (file.size > 5 * 1024 * 1024 || !['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        this.utils.MuestrasToast(
          TipoToast.Warning,
          'La fotografía debe ser JPG o PNG y no exceder los 5MB.'
        );
        return;
      }

      // Crear preview para mostrar la foto en pantalla
      const reader = new FileReader();
      reader.onload = () => {
        this.foto = {
          file: file,
          nombre: file.name,
          preview: reader.result
        };
      };
      reader.readAsDataURL(file);
    }
  }

  borrarFoto(): void {
    this.foto = null;
    const input = document.getElementById('fotoInput') as HTMLInputElement;
    if (input) input.value = '';
  }

  // --- Validaciones Visuales (Tu método exacto) ---
  getValidationStatus(controlName: string): 'valid' | 'invalid' | 'neutral' {
    const control = this.empleadoForm.get(controlName);
    if (!control || !control.touched) {
      return 'neutral';
    }
    if (control.errors && (control.errors['required'] || control.invalid)) {
      return 'invalid';
    }
    return 'valid';
  }

  // --- Modales ---
  openConfirmModal() {
    this.modalManager.openModal({
      title: 'Confirmar',
      template: this.confirmModal,
      showFooter: true,
      onAccept: () => this.registrarEmpleado(),
    });
  }

  openRespuestaModal() {
    this.modalManager.openModal({
      title: '<i class="fas fa-check m-2"></i> ¡Enrolamiento exitoso!',
      template: this.respuestaRegistroModal,
      showFooter: false
    });
  }

  // --- Lógica de Envío ---
  registrarEmpleado() {
    this.construirPayload().then((payload) => {
      this.enrolamientoApi.crearExpediente(payload).subscribe({
        next: (data) => {
           // Asumo que tu API Django regresa 201 Created
           this.openRespuestaModal();
           this.limpiarFormulario();
        },
        error: (ex) => {
          this.utils.MuestraErrorInterno(ex);
        }
      });
    });
  }

  limpiarFormulario() {
    this.empleadoForm.reset({ activo: 1 });
    this.borrarFoto();
  }

  // --- Construcción del JSON con Base64 ---
  async construirPayload(): Promise<any> {
    let fotoBase64 = null;

    if (this.foto && this.foto.file) {
      // Usamos tu función para limpiar el header del base64
      fotoBase64 = await this.fileToBase64(this.foto.file);
    }

    const payload = {
      ...this.empleadoForm.value,
      foto: fotoBase64, // Aquí va el string limpio que Django espera
      id_usuario_registra: this.usuario?.idUsuario || 1 // Fallback por si no hay sesión
    };

    return payload;
  }

  // Tu helper para convertir archivo a Base64 y limpiar headers
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1]; // quitar encabezado data:image...
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }
}